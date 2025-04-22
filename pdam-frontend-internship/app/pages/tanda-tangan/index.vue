<script setup lang="ts">
definePageMeta({
    layout: "dashboard",
    middleware: ["auth"],
    // middleware: ["permission","auth"],
    // permission: "pdamintern.final-reports.view-mentor", 
});
import type { ApiResponse, ApiResponseNoPagination, ApiResponseSingle, PaginationMeta } from '~~/types/types'
import { useNotification } from '~~/stores/notification'
import { formatDateID } from '~~/utils/date';
import { purposeLabel, statusLabel } from '~~/utils/statusLabel'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'
import { object, string } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { useEmployee, type Employee } from '~/composables/sso/useEmployee';
import Multiselect from 'vue-multiselect';

const { addNotification } = useNotification()

const breadcrumb = [
    {
        label: "Tanda Tangan",
        icon: "material-symbols:signature-rounded",
        to: "/tanda-tangan",
    },
];

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const selectedSort = ref('')
const { can, permissions } = useAuth()
const { getById, getList, update, create, destroy, loading, errorsValBack } = useSignature()
const { getList: getListEmployee } = useEmployee()

// list
const signatures = ref<ApiResponse<Signature> | null>(null)

const fetchSignatures = async () => {
    try {
        pending.value = true

        let sort_by = undefined
        let sort_order = undefined

        if (selectedSort.value) {
            const parts = selectedSort.value.split('_')
            sort_order = parts.pop()
            sort_by = parts.join('_')
        }

        const response = await getList({
            page: currentPage.value,
            ...(sort_by && { sort_by }),
            ...(sort_order && { sort_order }),
        })

        signatures.value = response ?? null

    } catch (error) {
        console.error('Gagal mengambil data aplikasi:', error)
    } finally {
        pending.value = false
    }
}

watch(
    [() => route.query.page, () => route.query.sort_by, () => route.query.sort_order],
    () => {
        currentPage.value = Number(route.query.page) || 1
        const sort_by = route.query.sort_by as string
        const sort_order = route.query.sort_order as string
        if (sort_by && sort_order) {
            selectedSort.value = `${sort_by}_${sort_order}`
        }
        fetchSignatures()
    },
    { immediate: true }
)

// Update URL ketika sort berubah
watch(selectedSort, (val) => {
    let sort_by = ''
    let sort_order = ''
    if (val) {
        const parts = val.split('_')
        sort_order = parts.pop()!
        sort_by = parts.join('_')
    }

    router.push({
        query: {
            ...route.query,
            page: 1,
            sort_by,
            sort_order,
        },
    })
})

function goToPage(page: number) {
    if (page < 1 || page > (signatures.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
}

// fetch employee
const selectedMentors = ref<Record<string, { value: string; text: string } | null>>({})
const employee = ref<ApiResponseNoPagination<Employee> | null>(null)
const employeeOptions = computed(() => {
    return (employee?.value?.data || []).map(e => ({
        value: e.npp,
        text: `${e.nama} ${e.pangkat_golongan}`
    }))
})

const pendingFetchEmployee = ref(false)
const fetchEmployee = async () => {
    try {
        pendingFetchEmployee.value = true
        const result = await getListEmployee()
        employee.value = result ?? null

    } catch (error) {
        console.error('Gagal mengambil data aplikasi:', error)
    } finally {
        pendingFetchEmployee.value = false
    }
}


// create and update
const showFormModal = ref(false)
const isEdit = ref(false)
const form = ref<{ id?: string }>({})

const { value: statusField } = useField<string>('status')
const { value: purposeField } = useField<string>('purpose')

const modalFormTitle = computed(() =>
    isEdit.value ? 'Ubah tanda tangan' : 'Tambah tanda tangan'
)

const openCreateForm = () => {
    isEdit.value = false
    form.value = {}
    resetForm()
    fetchEmployee()
    showFormModal.value = true
}

const schema = toTypedSchema(object({
    // mentor_npp: string().required('Mentor wajib diisi'),
}))

const { handleSubmit, resetForm, errors } = useForm({
    validationSchema: schema,
    //   validateOnMount: true, 
})

const submitForm = async (values: any, { resetForm }: { resetForm: () => void }) => {
    const formData = new FormData()
    // console.log("Sa",values.status)
    // Object.entries(values).forEach(([key, value]) => {
    //     if (value !== undefined && value !== null) {
    //         formData.append(key, value as string | Blob); // Handle file upload jika ada
    //     }
    // });
    formData.append('purposes[]', purposeField.value);
    formData.append('status', statusField.value);
    if (selectedMentors) {
        const mentorId = selectedMentors.value.value
        if (mentorId && employee.value) {
            // console.log(employee.value.data[0]?.npp)
            // console.log("mentor", String(mentorId))
            const foundEmployee = employee.value.data.find(emp => emp.npp === String(mentorId))
            if (foundEmployee) {
                formData.append('user_id', foundEmployee.npp);
                formData.append('name_snapshot', foundEmployee.nama);
                formData.append('rank_group', foundEmployee.jabatan);
                formData.append('position', foundEmployee.pangkat_golongan);

            } else {
                addNotification('error', 'Mentor tidak ditemukan di daftar employee')
            }
        }
    }
    for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
    }
    try {
        const response = isEdit.value && form.value.id
            ? await update(form.value.id, formData)
            : await create(formData)

        addNotification('success', response.message)

        await fetchSignatures()
        showFormModal.value = false
    } catch (error: any) {
        addNotification('error', error.message)
        // console.error('Submit error:', error)
    }
}

// delete date
const showDeleteModal = ref(false);
const pendingDeleteId = ref<string | null>(null);
const idToDelete = ref<string | null>(null);

const confirmDelete = (id: string) => {
    idToDelete.value = id;
    showDeleteModal.value = true;
};

const deleteClick = async () => {
    if (!idToDelete.value) return;
    pendingDeleteId.value = idToDelete.value;
    try {
        const response = await destroy(idToDelete.value) as { message: string };

        addNotification('success', response.message);

        showDeleteModal.value = false;

        await fetchSignatures()

    } catch (error: any) {
        addNotification('error', error.data.message);
    } finally {
        showDeleteModal.value = false;
        idToDelete.value = null;
        pendingDeleteId.value = null
    }
};
</script>

<template>
    <NuxtLayout>
        <Breadcrumb :items="breadcrumb" />
        <section class="mb-3">
            <LoadingBar v-if="pending" />
            <div v-else class="p-3">
                <div class="flex flex-row justify-between items-center mb-2">
                    <!-- <Button v-if="can('pdamintern.final-reports.create')" size="sm" variant="custom"></Button> -->
                    <Button size="sm" variant="custom"
                        class="text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 text-xs px-4 py-1 rounded-md flex justify-center"
                        @click="openCreateForm">
                        <Icon name="material-symbols:add-to-photos-outline-rounded" class="me-1 text-lg align-middle" />
                        Tambah tanda tangan
                    </Button>
                </div>
                <div v-if="!signatures?.data.data || signatures?.data.data.length === 0"
                    class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg">
                    Tidak ada data.
                </div>
                <div v-else>
                    <div
                        class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        <BaseTable :headers="[
                            { label: 'Identitas' },
                            { label: 'Untuk' },
                            { label: 'Aksi', center: true }
                        ]">
                            <tr v-if="signatures" v-for="(item, index) in signatures.data.data" :key="index"
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td class="px-6 py-2">
                                    <div class="flex flex-col">
                                        <p class="text-sm text-gray-700 dark:text-white">{{ item.user_id }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.name_snapshot }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.rank_group }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.position }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.nik }}</p>
                                    </div>
                                </td>
                                <td class="px-6 py-2">
                                    <ul>
                                        <li v-for="(purpose, i) in item.purposes" :key="i">
                                            {{ purposeLabel(purpose) }}
                                        </li>
                                    </ul>
                                </td>
                                <td class="px-6 py-2">
                                    <div class="flex flex-row items-center justify-center gap-2">

                                        <!-- <Button size="noP" variant="custom"
                                            class="text-yellow-600 hover:text-yellow-800" :tooltip="true"
                                            tooltipText="Detail" @click="openDetail(item.id)">
                                            <Icon name="material-symbols:visibility-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button> -->
                                        <!-- 
                                        <Button size="noP" variant="custom" class="text-blue-600 hover:text-blue-800"
                                            :tooltip="true" tooltipText="Edit" @click="openEditForm(item)">
                                            <Icon name="material-symbols:edit-square-outline"
                                                class="text-xl align-middle" />
                                        </Button>-->

                                        <Button size="noP" variant="custom" class="text-red-600 hover:text-red-800"
                                            :tooltip="true" tooltipText="Hapus" @click="confirmDelete(item.id)">
                                            <Icon name="material-symbols:delete-outline" class="text-xl align-middle" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        </BaseTable>
                    </div>
                </div>
            </div>
            <!-- create & update -->
            <BaseModal v-model="showFormModal" :title="modalFormTitle" :overlap=false>
                <!-- {{ pendingFetchEmployee }} -->
                <SkeletonsDetailSkeleton v-if="pendingFetchEmployee" :repeat="3" />
                <Form v-else :submit="handleSubmit(submitForm)" class="space-y-3">
                    <div class="grid gap-6 mb-6 md:grid-cols-1 dark:text-gray-900">

                        <Field name="mentor_npp" v-slot="{ field }">
                            <client-only>
                                <Multiselect v-model="selectedMentors" :options="employeeOptions"
                                    placeholder="Pilih Mentor" label="text" track-by="value" value-prop="value"
                                    :searchable="true" :close-on-select="true" :clear-on-select="false"
                                    :selectLabel="''" :selectedLabel="''" :deselectLabel="''" tag-placeholder=""
                                    class="text-sm w-full" @update:modelValue="field.value = $event?.value" />
                            </client-only>
                        </Field>
                        <ErrorMessage name="mentor_npp" class="text-red-500 text-sm" />
                    </div>

                    <BaseSelect label="Untuk" name="purpose" v-model="purposeField" :options="[
                        { value: 'receipt_letter', text: 'Surat Balasan' },
                        { value: 'division_letter', text: 'Surat Bagian' },
                        { value: 'certificate', text: 'Sertifikat' },
                        { value: 'work_certificate', text: 'Surat Keterangan' },
                        { value: 'daily_report', text: 'Laporan Harian' }
                    ]" required :errors="errors" :errorsValBack="errorsValBack" />
                    <BaseSelect label="Status" name="status" v-model="statusField" :options="[
                        { value: 'active', text: 'Aktif' },
                        { value: 'inactive', text: 'Tidak Aktif' }
                    ]" required :errors="errors" :errorsValBack="errorsValBack" />
                    <div class="flex justify-end gap-2 w-full">
                        <Button type="button" variant="red" @click="showFormModal = false">
                            Batal
                        </Button>
                        <Button type="submit" :disabled="loading">
                            <Icon v-if="loading" name="codex:loader" class="text-xl align-middle" />
                            <span v-else>{{ isEdit ? 'Ubah' : 'Tambah' }}</span>
                        </Button>
                    </div>
                </Form>
            </BaseModal>

            <ConfirmationModal :show="showDeleteModal" :loading="pendingDeleteId !== null"
                message="Apakah Anda yakin ingin data ini?" @confirm="deleteClick" @cancel="showDeleteModal = false" />
        </section>
    </NuxtLayout>
</template>


<style scoped></style>