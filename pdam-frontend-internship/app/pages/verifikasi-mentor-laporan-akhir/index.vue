<script setup lang="ts">
definePageMeta({
    layout: "dashboard",
    middleware: ["auth"],
    // permission: "pdamintern.final-reports.view-mentor", 
});
import type { ApiResponse, ApiResponseSingle, PaginationMeta } from '~~/types/types'
import { useNotification } from '~~/stores/notification'
import { formatDateID } from '~~/utils/date';
import { getStatusVariant, statusLabel } from '~~/utils/statusLabel'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'
import { object, string } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { getIconName, getStatusLabel } from '~~/utils/formatStatus';


const { addNotification } = useNotification()

const breadcrumb = [
    {
        label: "Verifikasi Mentor Laporan Akhir",
        icon: "material-symbols:verified-outline-rounded",
        to: "/verifikasi-mentor-laporan-akhir",
    },
];

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const selectedSort = ref('')
const { can, permissions } = useAuth()
const { getById, getFinalReportsByMentor, mentorVerification, loading, errorsValBack } = useFinalReport()

// list
const finalReportsByMentor = ref<ApiResponse<FinalReportListItem> | null>(null)

const fetchFinalReportsByMentor = async () => {
    try {
        pending.value = true

        let sort_by = undefined
        let sort_order = undefined

        if (selectedSort.value) {
            const parts = selectedSort.value.split('_')
            sort_order = parts.pop()
            sort_by = parts.join('_')
        }

        const response = await getFinalReportsByMentor({
            page: currentPage.value,
            ...(sort_by && { sort_by }),
            ...(sort_order && { sort_order }),
        })

        finalReportsByMentor.value = response ?? null

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
        fetchFinalReportsByMentor()
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
    if (page < 1 || page > (finalReportsByMentor.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
}

// detail 
const finalReportByMentorDetail = ref<FinalReportDetail>()

const showDetailModal = ref(false)
const modalDetailTitle = 'Detail laporan akhir'

const openDetail = async (id: string) => {
    showDetailModal.value = true

    const response = await getById(id)

    finalReportByMentorDetail.value = response?.data

}

// update status verifikasi
const pendingUpdateId = ref(null)
const modalFormTitle = 'Alasan Penolakan'

const { value: idField } = useField<string>('id')
const { value: emailField } = useField<string>('email')
const { value: selectedStatus } = useField<string>('mentor_verification_status')
const { value: rejectionNoteField } = useField<string>('mentor_rejection_note')


const rejectionNote = ref('');
const showRejectionModal = ref(false);

watch(selectedStatus, (newStatus) => {
    if (newStatus === 'rejected') {
        showRejectionModal.value = true;
        console.log(showRejectionModal.value)
    } else {
        showRejectionModal.value = false;
    }
});
const cancelRejectionModal = () => {
    showRejectionModal.value = false;
    selectedStatus.value = ''; // Reset status jika batal
    rejectionNote.value = ''; // Kosongkan rejection note
}

const SubmitSchema = toTypedSchema(object({
}))

const { handleSubmit, resetForm, errors } = useForm({
    validationSchema: SubmitSchema,
})

const submitForm = async (values: any, { resetForm }: { resetForm: () => void }) => {
    // console.log(selectedStatus.value)
    // console.log(values)
    pendingUpdateId.value = values.id
    const formData = new FormData()
    formData.append('_method', 'PUT');
    formData.append('mentor_verification_status', values.mentor_verification_status);
    formData.append('mentor_rejection_note', values.mentor_rejection_note);
    try {
        const response = await mentorVerification(values.id, formData)

        addNotification('success', response.message)

        await fetchFinalReportsByMentor()
        showRejectionModal.value = false
    } catch (error: any) {
        addNotification('error', error.message)
        // console.error('Submit error:', error)
    } finally {
        pendingUpdateId.value = null
    }
}
</script>

<template>
    <NuxtLayout>
        <Breadcrumb :items="breadcrumb" />
        <section class="mb-3">
            <LoadingBar v-if="pending" />
            <div v-else class="p-3">
                <div v-if="!finalReportsByMentor?.data.data || finalReportsByMentor?.data.data.length === 0"
                    class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg">
                    Tidak ada data.
                </div>
                <div v-else>
                    <div
                        class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        <BaseTable :headers="[
                            { label: 'Tanggal pengajuan' },
                            { label: 'Identitas' },
                            { label: 'Deskripsi Laporan Kegiatan' },
                            { label: 'Aksi', center: true }
                        ]">
                            <tr v-if="finalReportsByMentor" v-for="(item, index) in finalReportsByMentor.data.data"
                                :key="index"
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td class="px-6 py-2">
                                    {{ formatDateID(item.created_at) }}
                                </td>

                                <td class="px-6 py-2">
                                    <div class="flex flex-col">
                                        <p class="text-sm text-gray-700 dark:text-white">{{ item.user.name }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.user.email }}</p>
                                    </div>
                                </td>
                                <td class="px-6 py-2">
                                    {{ item.report }}
                                </td>
                                <td class="px-6 py-2">
                                    <div class="flex flex-row items-center justify-center gap-2">

                                        <Button size="noP" variant="custom"
                                            class="text-yellow-600 hover:text-yellow-800" :tooltip="true"
                                            tooltipText="Detail" @click="openDetail(item.id)">
                                            <Icon name="material-symbols:visibility-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button>

                                        <Button v-if="item.mentor_verification_status != 'pending'"
                                            :variant="getStatusVariant(item.mentor_verification_status)" size="noP"
                                            :tooltip="true"
                                            :tooltipText="getStatusLabel(item.mentor_verification_status)"
                                            class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1">
                                            <Icon :name="getIconName(item.mentor_verification_status)"
                                                class="w-4 h-4" />
                                        </Button>

                                        <Form v-else @submit="submitForm"
                                            class="flex flex-row flex-nowrap space-x-2 border border-gray-200 dark:border-gray-700 py-1 px-2">

                                            <BaseSelect name="mentor_verification_status" v-model="selectedStatus"
                                                :options="[
                                                    { value: 'pending', text: 'Tunggu' },
                                                    { value: 'approved', text: 'Terima' },
                                                    { value: 'rejected', text: 'Tolak' }
                                                ]" :errors="errors" :errorsValBack="errorsValBack" />


                                            <Field name="id" type="hidden" id="id" :value="item.id" />

                                            <Field name="mentor_rejection_note" type="hidden" id="mentor_rejection_note"
                                                :value="rejectionNote" v-if="selectedStatus === 'rejected'" />

                                            <BaseModal v-model="showRejectionModal" :title="modalFormTitle">
                                                <BaseTextarea label="Alasan penolakan" name="mentor_rejection_note"
                                                    type="text" v-model="rejectionNoteField" :errors="errors"
                                                    :errorsValBack="errorsValBack" />
                                                <div class="flex justify-end gap-2 w-full">
                                                    <Button type="button" variant="red"
                                                        @click="showRejectionModal = false">
                                                        Batal
                                                    </Button>
                                                    <Button type="submit" :disabled="loading">
                                                        <Icon v-if="loading || pendingUpdateId === item.id"
                                                            name="codex:loader" class="text-xl align-middle" />
                                                        <span v-else>Simpan</span>
                                                    </Button>
                                                </div>
                                            </BaseModal>

                                            <button
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs w-full sm:w-auto px-3 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                                <Icon v-if="pendingUpdateId === item.id" name="codex:loader"
                                                    class="text-xl align-middle" />
                                                <span v-else>Simpan</span>
                                            </button>
                                        </Form>

                                    </div>
                                </td>
                            </tr>
                        </BaseTable>
                    </div>

                    <Pagination v-if="finalReportsByMentor?.data" :currentPage="finalReportsByMentor.data.current_page"
                        :lastPage="finalReportsByMentor.data.last_page" :from="finalReportsByMentor.data.from"
                        :to="finalReportsByMentor.data.to" :total="finalReportsByMentor.data.total"
                        :links="finalReportsByMentor.data.links" @change="goToPage" />


                    <!-- Detail -->
                    <BaseModal v-model="showDetailModal" :title="modalDetailTitle" size="lg" :scrollbar="false">
                        <SkeletonsDetailSkeleton v-if="loading" :repeat="3" />

                        <div v-else class="flex flex-col gap-4 md:flex-row " v-if="finalReportByMentorDetail">
                            <div class=" md:w-72 w-full">
                                <!-- <p class="font-medium text-sm mb-4 text-gray-700 dark:text-gray-200">Riwayat Pengajuan</p> -->

                                <!-- Wrapper utama -->
                                <div class="relative p-2 border rounded-lg dark:bg-gray-800">
                                    <!-- Scrollable area -->
                                    <div class="max-h-[600px] overflow-y-auto pl-2 space-y-6 relative">

                                        <!-- Jika ada data -->
                                        <div v-if="finalReportByMentorDetail.histories && finalReportByMentorDetail.histories.length > 0"
                                            class="border-l-2 border-blue-500 relative pl-2">

                                            <!-- Loop data -->
                                            <div v-for="(item, index) in finalReportByMentorDetail.histories"
                                                :key="item.id" class="relative mb-2">

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
                                        <p v-else class="text-gray-500 dark:text-gray-400 py-2">Belum ada riwayat
                                            pengajuan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <DetailRow label="Nama">{{ finalReportByMentorDetail.user.name }}</DetailRow>
                                <DetailRow label="Email">{{ finalReportByMentorDetail.user.email }}</DetailRow>

                                <DetailRow label="Tanggal Pengajuan">{{
                                    formatDateID(finalReportByMentorDetail?.created_at)
                                    }}</DetailRow>

                                <DetailRow label="Judul">{{ finalReportByMentorDetail.title }}</DetailRow>
                                <DetailRow label="Laporan">{{ finalReportByMentorDetail.report }}</DetailRow>
                                <DetailRow v-if="finalReportByMentorDetail.assessment_report_file"
                                    label="Penilaian mentor">
                                    <a :href="`${config.public.storage}/storage/${finalReportByMentorDetail.assessment_report_file}`"
                                        target="_blank" class="text-blue-600 underline">
                                        Lihat penilaian mentor
                                    </a>
                                </DetailRow>
                                <DetailRow v-if="finalReportByMentorDetail.final_report_file" label="Laporan akhir">
                                    <a :href="`${config.public.storage}/storage/${finalReportByMentorDetail.final_report_file}`"
                                        target="_blank" class="text-blue-600 underline">
                                        Lihat laporan akhir
                                    </a>
                                </DetailRow>
                                <DetailRow v-if="finalReportByMentorDetail.photo" label="Photo">
                                    <a :href="`${config.public.storage}/storage/${finalReportByMentorDetail.photo}`"
                                        target="_blank" class="text-blue-600 underline">
                                        Lihat photo
                                    </a>
                                </DetailRow>
                                <DetailRow v-if="finalReportByMentorDetail.video" label="Video">
                                    <a :href="`${finalReportByMentorDetail.video}`" target="_blank"
                                        class="text-blue-600 underline">
                                        Lihat video
                                    </a>
                                </DetailRow>
                                <DetailRow label="Status verifikasi mentor">
                                    <span class="block">
                                        {{ getStatusLabel(finalReportByMentorDetail.mentor_verification_status) }}
                                    </span>
                                    <p v-if="finalReportByMentorDetail.mentor_rejection_note">
                                        <span class="font-medium">Keterangan:</span>
                                        {{ finalReportByMentorDetail.mentor_rejection_note }}
                                    </p>
                                </DetailRow>
                                <DetailRow label="Status verifikasi kepegawaian">
                                    <span class="block">
                                        {{ getStatusLabel(finalReportByMentorDetail.hr_verification_status) }}
                                    </span>
                                    <p v-if="finalReportByMentorDetail.hr_rejection_note">
                                        <span class="font-medium">Keterangan:</span>
                                        {{ finalReportByMentorDetail.hr_rejection_note }}
                                    </p>
                                </DetailRow>
                                <DetailRow label="Tanggal pengajuan">{{
                                    formatDateID(finalReportByMentorDetail.updated_at) }}
                                </DetailRow>

                            </div>
                        </div>
                    </BaseModal>

                </div>
            </div>
        </section>
    </NuxtLayout>
</template>


<style scoped></style>