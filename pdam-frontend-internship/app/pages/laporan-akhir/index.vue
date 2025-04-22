<script setup lang="ts">
definePageMeta({
    layout: "dashboard",
    middleware: ["permission", "auth"],
    permission: "pdamintern.final-reports.view", // <-- contoh penggunaan permission
});
import type { ApiResponse, ApiResponseSingle, PaginationMeta } from '~~/types/types'
import { useNotification } from '~~/stores/notification'
import { useForm, useField, Field, Form, ErrorMessage } from 'vee-validate'
import { object, string, mixed } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { formatDateID } from '~~/utils/date'
import { getIconName, getStatusLabel } from '~~/utils/formatStatus';
import { getStatusVariant } from '~~/utils/statusLabel';

const { addNotification } = useNotification()

const breadcrumb = [
    {
        label: "Laporan Akhir",
        icon: "material-symbols:add-notes-outline",
        to: "/laporan-akhir",
    },
];

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const selectedSort = ref('')
const { can, permissions } = useAuth()
const { getList, destroy, create, update, getById, loading, errorsValBack } = useFinalReport()

// list
const finalReports = ref<ApiResponse<FinalReportListItem> | null>(null)

const fetchFinalReports = async () => {
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

        finalReports.value = response ?? null

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
        fetchFinalReports()
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
    if (page < 1 || page > (finalReports.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
}

// detail 
const finalReportDetail = ref<FinalReportDetail>()

const showDetailModal = ref(false)
const modalDetailTitle = 'Detail laporan akhir'

const openDetail = async (id: string) => {
    showDetailModal.value = true

    const response = await getById(id)

    finalReportDetail.value = response?.data

}
// create and update
const showFormModal = ref(false)
const isEdit = ref(false)
const form = ref<{ id?: string }>({})
const checkAssessmentReportFileField = ref<string>()
const checkFinalReportFileField = ref<string>()
const checkPhotoField = ref<string>()

const modalFormTitle = computed(() =>
    isEdit.value ? 'Ubah laporan akhir' : 'Tambah laporan akhir'
)

const openCreateForm = () => {
    isEdit.value = false
    form.value = {}
    resetForm()
    titleField.value = defaultTitleFinalReport.value
    showFormModal.value = true
}
const openEditForm = (finalReport: FinalReportListItem) => {
    isEdit.value = true
    titleField.value = finalReport.title,
    reportField.value = finalReport.report,
    videoField.value = finalReport.video,

    checkAssessmentReportFileField.value = finalReport.assessment_report_file,
    checkFinalReportFileField.value = finalReport.final_report_file,
    checkPhotoField.value = finalReport.photo,

    form.value.id = finalReport.id
    showFormModal.value = true
}

const handleFileUpload = (event: Event, handleChange: (value: File | null) => void): void => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    handleChange(file);
};

const SubmitSchema = (hasOldFiles: {
  assessment: boolean
  final: boolean
  photo: boolean
}) =>
  toTypedSchema(
    object({
      title: string().required('Judul wajib diisi'),
      report: string().required('Laporan wajib diisi'),
      video: string().required('Video wajib diisi'),

      assessment_report_file: mixed()
        .test(
          "fileRequired",
          "File penilaian mentor wajib diunggah",
          (value: any) => {
            return hasOldFiles.assessment || value instanceof File;
          }
        )
        .test("fileFormat", "Format file harus JPG, PNG, atau PDF", (value: any) => {
          if (!(value instanceof File)) return true;
          return ["image/jpeg", "image/png", "application/pdf"].includes(value.type);
        })
        .test("fileSize", "Ukuran file maksimal 2MB", (value: any) => {
          if (!(value instanceof File)) return true;
          return value.size <= 2 * 1024 * 1024;
        }),

      final_report_file: mixed()
        .test(
          "fileRequired",
          "File laporan akhir wajib diunggah",
          (value: any) => {
            return hasOldFiles.final || value instanceof File;
          }
        )
        .test("fileFormat", "Format file harus JPG, PNG, atau PDF", (value: any) => {
          if (!(value instanceof File)) return true;
          return ["image/jpeg", "image/png", "application/pdf"].includes(value.type);
        })
        .test("fileSize", "Ukuran file maksimal 2MB", (value: any) => {
          if (!(value instanceof File)) return true;
          return value.size <= 2 * 1024 * 1024;
        }),

      photo: mixed()
        .test(
          "fileRequired",
          "Foto bersama wajib diunggah",
          (value: any) => {
            return hasOldFiles.photo || value instanceof File;
          }
        )
        .test("fileFormat", "Format file harus JPG, PNG, atau PDF", (value: any) => {
          if (!(value instanceof File)) return true;
          return ["image/jpeg", "image/png", "application/pdf"].includes(value.type);
        })
        .test("fileSize", "Ukuran file maksimal 2MB", (value: any) => {
          if (!(value instanceof File)) return true;
          return value.size <= 2 * 1024 * 1024;
        }),
    })
  )

  const schema = computed(() =>
  SubmitSchema({
    assessment: !!checkAssessmentReportFileField.value,
    final: !!checkFinalReportFileField.value,
    photo: !!checkPhotoField.value,
  })
)


const { handleSubmit, resetForm, errors } = useForm({
    validationSchema: schema,
    //   validateOnMount: true, 
})

const currentYear = new Date().getFullYear();
const defaultTitleFinalReport = ref<string>(`Laporan Akhir Magang PDAM Tirta Moedal Kota Semarang ${currentYear}`)

const { value: titleField } = useField<string>('title')
const { value: reportField } = useField<string>('report')
const { value: videoField } = useField<string>('video')
const { value: assessmentReportFileField } = useField<string>('assessment_report_file')
const { value: finalReportFileField } = useField<string>('final_report_file')
const { value: photoField } = useField<string>('photo')


const submitForm = async (values: any, { resetForm }: { resetForm: () => void }) => {
    const formData = new FormData()
    // console.log(values.title)
    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value as string | Blob); // Handle file upload jika ada
        }
    });
    for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
    }
    try {
        const response = isEdit.value && form.value.id
            ? await update(form.value.id, formData)
            : await create(formData)

        addNotification('success', response.message)

        await fetchFinalReports()
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

        await fetchFinalReports()

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
                    <Button  v-if="can('pdamintern.final-reports.create') && (!finalReports?.data?.data || finalReports?.data?.data.length === 0)" size="sm" variant="custom"
                        class="text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 text-xs px-4 py-1 rounded-md flex justify-center"
                        @click="openCreateForm">
                        <Icon name="material-symbols:add-to-photos-outline-rounded" class="me-1 text-lg align-middle" />
                        Tambah laporan akhir
                    </Button>
                    <!-- <div class="flex flex-row items-center gap-2 ms-auto">
                        <Icon name="material-symbols:sort" class="text-xl align-middle" />
                        <Field name="sort_by" v-model="selectedSort" as="select"
              class="block py-1 px-2 border text-xs rounded-lg border-gray-300  dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
              <option value="">Urutkan</option> 
              <option value="status_asc">&#8593; Status </option>
              <option value="status_desc">&#8595; Status </option>
              <option value="created_at_asc">&#8593; Created </option>
              <option value="created_at_desc">&#8595; Created </option>
            </Field>
                    </div> -->
                </div>
                <div v-if="!finalReports?.data.data || finalReports?.data.data.length === 0"
                    class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg">
                    Tidak ada data.
                </div>
                <div v-else>
                    <div
                        class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        <BaseTable :headers="[
                            { label: 'Judul' },
                            { label: 'Deskripsi Laporan Kegiatan' },
                            { label: 'Status verifikasi' },
                            { label: 'Aksi', center: true }
                        ]">
                            <tr v-if="finalReports" v-for="(item, index) in finalReports.data.data" :key="index"
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td class="px-6 py-2">
                                    {{ item.title }}
                                </td>
                                <td class="px-6 py-2">
                                    {{ item.report }}
                                </td>
                                <td class="px-6 py-2">
                                    <div class="flex flex-row items-center justify-center gap-2">
                                        <Button :variant="getStatusVariant(item.mentor_verification_status)" size="sm"
                                            class="flex items-center text-nowrap" :tooltip="true"
                                            :tooltipText="getStatusLabel(item.mentor_verification_status)">
                                            Mentor :
                                            <Icon :name="getIconName(item.mentor_verification_status)"
                                                class="text-xl align-middle ml-1" />
                                        </Button>

                                        <Button :variant="getStatusVariant(item.hr_verification_status)" size="sm"
                                            class="flex items-center text-nowrap" :tooltip="true"
                                            :tooltipText="getStatusLabel(item.hr_verification_status)">
                                            Kepegawaian :
                                            <Icon :name="getIconName(item.hr_verification_status)"
                                                class="text-xl align-middle ml-1" />
                                        </Button>
                                    </div>
                                </td>
                                <td class="px-6 py-2">
                                    <div class="flex flex-row items-center justify-center gap-2">

                                        <Button size="noP" variant="custom"
                                            class="text-yellow-600 hover:text-yellow-800" :tooltip="true"
                                            tooltipText="Detail" @click="openDetail(item.id)">
                                            <Icon name="material-symbols:visibility-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button>

                                        <Button size="noP" variant="custom" class="text-blue-600 hover:text-blue-800"
                                            :tooltip="true" tooltipText="Edit" @click="openEditForm(item)">
                                            <Icon name="material-symbols:edit-square-outline"
                                                class="text-xl align-middle" />
                                        </Button>

                                        <Button size="noP" variant="custom" class="text-red-600 hover:text-red-800"
                                            :tooltip="true" tooltipText="Hapus" @click="confirmDelete(item.id)">
                                            <Icon name="material-symbols:delete-outline" class="text-xl align-middle" />
                                        </Button>

                                    </div>
                                </td>
                            </tr>
                        </BaseTable>
                    </div>

                    <Pagination v-if="finalReports?.data" :currentPage="finalReports.data.current_page"
                        :lastPage="finalReports.data.last_page" :from="finalReports.data.from"
                        :to="finalReports.data.to" :total="finalReports.data.total" :links="finalReports.data.links"
                        @change="goToPage" />


                    <!-- Detail -->
                    <BaseModal v-model="showDetailModal" :title="modalDetailTitle" size="lg">
                        <SkeletonsDetailSkeleton v-if="loading" :repeat="3" />

                        <div v-else class="flex flex-col gap-4 md:flex-row" v-if="finalReportDetail">
                            <div class=" md:w-72 w-full">
                                <!-- <p class="font-medium text-sm mb-4 text-gray-700 dark:text-gray-200">Riwayat Pengajuan</p> -->
    
                                <!-- Wrapper utama -->
                                <div class="relative p-2 border rounded-lg dark:bg-gray-800">
                                    <!-- Scrollable area -->
                                    <div class="max-h-[600px] overflow-y-auto pl-2 space-y-6 relative">
    
                                        <!-- Jika ada data -->
                                        <div v-if="finalReportDetail.histories && finalReportDetail.histories.length > 0"
                                            class="border-l-2 border-blue-500 relative pl-2">
    
                                            <!-- Loop data -->
                                            <div v-for="(item, index) in finalReportDetail.histories" :key="item.id"
                                                class="relative mb-2">
    
                                                <!-- Bullet -->
                                                <div
                                                    class="absolute w-3 h-3  bg-blue-500 rounded-full top-1 left-[-15px] border-2 border-white dark:border-gray-800">
                                                </div>
    
                                                <!-- Header -->
                                                <div class="flex justify-between items-center">
                                                    <p class="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                        Versi ke-{{ item.version_number }}
                                                    </p>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                                        {{ formatDateID(item.created_at) }}
                                                    </p>
                                                </div>
    
                                                <!-- Deskripsi -->
                                                <p class="text-xs text-gray-600 dark:text-gray-300">
                                                    Pengajuan versi ke-{{ item.version_number }} telah dikirim.
                                                </p>
    
                                                <!-- Catatan jika ada -->
                                                <p v-if="item.rejection_note" class="text-xs italic text-red-500 mt-1">
                                                    Catatan: {{ item.rejection_note }}
                                                </p>
                                            </div>
                                        </div>
    
                                        <!-- Jika kosong -->
                                        <p v-else class="text-gray-500 dark:text-gray-400 py-2">Belum ada riwayat pengajuan.
                                        </p>
                                    </div>
                                </div>
                            </div> 
                            <div class="space-y-4 ">
                            <DetailRow label="Judul">{{ finalReportDetail.title }}</DetailRow>
                            <DetailRow label="Laporan">{{ finalReportDetail.report }}</DetailRow>
                            <DetailRow v-if="finalReportDetail.assessment_report_file" label="Penilaian mentor">
                                <a :href="`${config.public.storage}/storage/${finalReportDetail.assessment_report_file}`"
                                    target="_blank" class="text-blue-600 underline">
                                    Lihat penilaian mentor
                                </a>
                            </DetailRow>
                            <DetailRow v-if="finalReportDetail.final_report_file" label="Laporan akhir">
                                <a :href="`${config.public.storage}/storage/${finalReportDetail.final_report_file}`"
                                    target="_blank" class="text-blue-600 underline">
                                    Lihat laporan akhir
                                </a>
                            </DetailRow>
                            <DetailRow v-if="finalReportDetail.photo" label="Photo">
                                <a :href="`${config.public.storage}/storage/${finalReportDetail.photo}`" target="_blank"
                                    class="text-blue-600 underline">
                                    Lihat photo
                                </a>
                            </DetailRow>
                            <DetailRow v-if="finalReportDetail.video" label="Video">
                                <a :href="`${finalReportDetail.video}`" target="_blank" class="text-blue-600 underline">
                                    Lihat video
                                </a>
                            </DetailRow>
                            <DetailRow label="Status verifikasi mentor">
                                <span class="block">{{ getStatusLabel(finalReportDetail.mentor_verification_status)  }} </span>
                                <p><span class="font-medium">Keterangan</span> {{ finalReportDetail.mentor_rejection_note }} </p> 
                                </DetailRow>
                            <DetailRow label="Status verifikasi kepegawaian">
                                <span class="block">{{getStatusLabel(finalReportDetail.hr_verification_status) }}  </span>
                                <p><span class="font-medium">Keterangan</span> {{ finalReportDetail.hr_rejection_note }} </p>  
                            </DetailRow>
                            <DetailRow label="Tanggal pengajuan">{{ formatDateID(finalReportDetail.updated_at) }}
                            </DetailRow>
</div>
                        </div>
                    </BaseModal>

                </div>
                <!-- create & update -->
                <BaseModal v-model="showFormModal" :title="modalFormTitle" classBody="scrollbar-hide">
                    <Form :submit="handleSubmit(submitForm)" class="space-y-3">
                        <div class="grid gap-6 mb-6 md:grid-cols-1 dark:text-gray-900">
                            <BaseInput label="Judul" name="title" type="text" :disabled="true"
                                v-model="defaultTitleFinalReport" required :errors="errors"
                                :errorsValBack="errorsValBack" />
                            <BaseTextarea label="Deskripsi Laporan Kegiatan" name="report" type="text"
                                v-model="reportField" required :errors="errors" :errorsValBack="errorsValBack" />
                            <BaseInput label="Video" name="video" type="text" v-model="videoField" required
                                :errors="errors" :errorsValBack="errorsValBack" />
                            <div>
                                <div class="flex justify-between items-center">
                                    <label for="assessment_report_file"
                                        class="text-sm font-medium text-gray-700 dark:text-white">
                                        File penilaian mentor
                                    </label> 
                                    <a v-if="isEdit" :href="`${config.public.storage}/storage/${checkAssessmentReportFileField}`"
                                        target="_blank" class="text-blue-600 underline text-sm">
                                        Lihat file lama
                                    </a>
                                </div>
                                <Field name="assessment_report_file" v-model="assessmentReportFileField"
                                    v-slot="{ handleChange }">
                                    <input type="file" id="assessment_report_file"
                                        @change="handleFileUpload($event, handleChange)"
                                        class="mt-1 p-2 w-full border rounded-md" />
                                    <p v-if="errors.assessment_report_file" class="text-red-500 text-sm">{{
                                        errors.assessment_report_file }}</p>
                                </Field>
                            </div>

                            <div>
                                <div class="flex justify-between items-center">
                                    <label for="final_report_file"
                                        class="text-sm font-medium text-gray-700 dark:text-white">
                                        File laporan akhir

                                    </label>
                                    <a v-if="isEdit" :href="`${config.public.storage}/storage/${checkFinalReportFileField}`"
                                    target="_blank" class="text-blue-600 underline text-sm">
                                        Lihat file lama
                                    </a> 
                                </div>
                                <Field name="final_report_file" v-model="finalReportFileField"
                                    v-slot="{ handleChange }">
                                    <input type="file" id="final_report_file"
                                        @change="handleFileUpload($event, handleChange)"
                                        class="mt-1 p-2 w-full border rounded-md" />
                                    <p v-if="errors.final_report_file" class="text-red-500 text-sm">{{
                                        errors.final_report_file }}</p>
                                </Field>
                            </div>
                            <div>
                                <div class="flex justify-between items-center">
                                    <label for="photo" class="text-sm font-medium text-gray-700 dark:text-white">
                                        Photo bersama
                                    </label>
                                    <a v-if="isEdit" :href="`${config.public.storage}/storage/${checkPhotoField}`" 
                                        target="_blank" class="text-blue-600 underline text-sm">
                                        Lihat file lama
                                    </a> 
                                </div>
                                <Field name="photo" v-model="photoField" v-slot="{ handleChange }">
                                    <input type="file" id="photo" @change="handleFileUpload($event, handleChange)"
                                        class="mt-1 p-2 w-full border rounded-md" />
                                    <p v-if="errors.photo" class="text-red-500 text-sm">{{ errors.photo }}</p>
                                </Field>
                            </div>
                        </div>
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

                <!-- delete -->
                <ConfirmationModal :show="showDeleteModal" :loading="pendingDeleteId !== null"
                    message="Apakah Anda yakin ingin data ini?" @confirm="deleteClick"
                    @cancel="showDeleteModal = false" />
            </div>
        </section>
    </NuxtLayout>
</template>

<style scoped></style>
