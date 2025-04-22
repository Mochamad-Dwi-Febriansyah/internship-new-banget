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
        label: "Verifikasi Laporan Harian",
        icon: "material-symbols:verified-outline-rounded",
        to: "/verifikasi-laporan-harian",
    },
];

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const selectedSort = ref('')
const { can, permissions } = useAuth()
const { getById, getDayliReportsByMentor, mentorVerification, loading, errorsValBack } = useDayliReport()

// list
const dayliReportsByMentor = ref()

const fetchDayliReportsByMentor = async () => {
    try {
        pending.value = true

        let sort_by = undefined
        let sort_order = undefined

        if (selectedSort.value) {
            const parts = selectedSort.value.split('_')
            sort_order = parts.pop()
            sort_by = parts.join('_')
        }

        const response = await getDayliReportsByMentor({
            page: currentPage.value,
            ...(sort_by && { sort_by }),
            ...(sort_order && { sort_order }),
        })

        dayliReportsByMentor.value = response ?? null

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
        fetchDayliReportsByMentor()
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
    if (page < 1 || page > (dayliReportsByMentor.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
}

// 
const activeAccordion = ref(null);

// Fungsi untuk mengontrol buka/tutup accordion
const toggleAccordion = (index: any) => {
    activeAccordion.value = activeAccordion.value === index ? null : index;
};

// 
const pendingUpdateId = ref(null)
const validasiLaporanSchema = yup.object({
    // status: yup.string().required('Status  wajib diisi'),
})
const updateValidasiLaporan = async (value:any, { resetForm }: { resetForm: () => void }) => {
    const payload = {
        status: value.status, // Menggunakan status dari form
        ids: Array.isArray(value.id) ? value.id : [value.id], // Menggunakan ID laporan yang dipilih //tetap parsing ke ids karena regulasi backend
    };
    try {
        // console.log(value)
        pendingUpdateId.value = value.id
        const response = await mentorVerification(payload)
        resetForm();
        addNotification('success', response.message) 
        pendingUpdateId.value = null
        fetchDayliReportsByMentor()
    } catch (error: any) {
        addNotification('error', error.data.message)
        pendingUpdateId.value = null
    }
}

//  all
const selectedReports = ref<number[]>([]);
const selectAll = ref<Record<string, boolean>>({});

const toggleSelectAll = ($userId: any) => {
    // console.log($userId)
    if (!$userId) return; // Hindari error jika user ID tidak ada

    if (!selectAll.value[$userId]) {
        selectAll.value[$userId] = false; // Inisialisasi jika belum ada
    }
    // console.log("IDsr:", $userId);
    // console.log("Data laporan sebelum filter:", laporanHarianByMentor.value.data.data);
    if (selectAll.value) {
        selectedReports.value = dayliReportsByMentor.value.data // Ambil array data laporan
            .filter((item: any) => item.user?.id === $userId) // Filter berdasarkan user ID
            .flatMap((item: any) => item.reports?.map((lap: any) => lap.id) || []); // Ambil semua ID laporan
    } else {
        selectedReports.value = [];
    }
    // console.log(dayliReportsByMentor.value.data)
    // console.log(selectedReports.value)
};
const validasiLaporanAllSchema = yup.object({
    // status: yup.string().required('Status  wajib diisi'),
})
const pendingUpdateAll = ref(false)
const updateValidasiLaporanAll = async (value:any, { resetForm }: { resetForm: () => void }) => {
    if (selectedReports.value.length === 0) {
        addNotification('error', "Tidak ada laporan yang dipilih!") 
        return;
    }
    const payload = {
        status: value.status, // Menggunakan status dari form
        ids: selectedReports.value, // Menggunakan ID laporan yang dipilih
    };
 

    try {
        pendingUpdateAll.value = true
        const response = await mentorVerification(payload);
        // console.log("Response API:", response); 
        resetForm();
        addNotification('success', response.message) 
        selectAll.value = {}
        selectedReports.value = []; 
        fetchDayliReportsByMentor()
    } catch (error: any) { 
        addNotification('error', error.data.message) 
    } finally {
        pendingUpdateAll.value = false
    }
}; 
</script>

<template>
    <NuxtLayout>
        <Breadcrumb :items="breadcrumb" />
        <section class="mb-3">
            <LoadingBar v-if="pending" />
            <div v-else class="p-3">
                <div v-if="!dayliReportsByMentor?.data || dayliReportsByMentor.data.length === 0"
                    class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg">
                    Tidak ada data.
                </div>
                <div v-else>
                    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <div id="accordion">
                            <div v-for="userData in dayliReportsByMentor.data" :key="userData.id">
                                <h2 :id="`accordion-heading-${userData.user?.id}`">
                                    <button type="button"
                                        class="flex items-center justify-between w-full p-4 font-medium text-gray-500 border border-gray-200 rounded-lg focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                                        @click="toggleAccordion(userData.user?.id)">
                                        <span>{{ userData.user?.name }}</span>
                                        <svg :class="{ 'rotate-180': activeAccordion === userData.user?.id }"
                                            class="w-3 h-3 transition-transform" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                                stroke-width="2" d="M9 5 5 1 1 5" />
                                        </svg>
                                    </button>
                                </h2>
                                <div v-show="activeAccordion === userData.user?.id"
                                    class="p-4 border overflow-x-auto border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                                    <div class="flex flex-row space-x-2 justify-end mb-2">
                                            <div class="flex flex-row border items-center border-gray-200 py-1 px-2 space-x-2"> 
                                                <input type="checkbox" v-model="selectAll[userData.user?.id || 'default']"
                                                    @change="toggleSelectAll(userData.user?.id)"
                                                    :disabled="!userData.user?.id" />
                                                <span class="text-xs font-medium whispace-nowrap">Pilih Semua</span>
                                                <Form @submit="updateValidasiLaporanAll"
                                                    :validation-schema="validasiLaporanAllSchema"
                                                    class="flex flex-row flex-nowrap space-x-2 ">
                                                    <div>
                                                        <Field as="select" name="status" id="status"
                                                            class="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200">
                                                            >
                                                            <option disabled value="">Pilih Status</option>
                                                            <option value="pending">Tunggu</option>
                                                            <option value="approved">Terima</option>
                                                            <option value="rejected">Tolak</option>
                                                        </Field>
                                                        <ErrorMessage name="status" class="text-red-500 text-xs" /> 
                                                        <p v-if="errorsValBack.status" class="text-red-500 text-sm">{{ errorsValBack.status[0] }}</p>
                                                    </div> 
                                                    <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs w-full sm:w-auto px-3 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                                        <Icon v-if="pendingUpdateAll"
                                                            name="codex:loader" class="text-xl align-middle" />
                                                        <span v-else>Simpan</span>
                                                    </button>
                                                </Form>
                                            </div>
                                        </div>
                                    <BaseTable :headers="[
                                        { label: 'Tanggal Presensi' },
                                        { label: 'Nama Kegiatan' },
                                        { label: 'Deskripsi Kegiatan' },
                                        { label: 'Hasil yang dicapai' },
                                        { label: 'Aksi', center: true }
                                    ]">
                                        <tr v-if="userData.reports" v-for="(item, index) in userData.reports"
                                            :key="index"
                                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td class="px-6 py-2">
                                                {{ formatDateID(item.attendance.date) }}
                                            </td>
                                            <td class="px-6 py-2">
                                                {{ item.title }}
                                            </td>
                                            <td class="px-6 py-2">
                                                {{ item.report }}
                                            </td>
                                            <td class="px-6 py-2">
                                                {{ item.result }}
                                            </td>
                                            <td class="px-6 py-2">
                                                <div class="flex flex-col flex-nowrap space-x-2 gap-3 items-center">
                                                    <span
                                                        class="px-3 py-1 text-xs  rounded-full flex items-center w-fit cursor-default"
                                                        :class="{
                                                            'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300': item.status === 'approved',
                                                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300': item.status === 'pending',
                                                            'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300': item.status === 'rejected',
                                                        }">
                                                        <Icon :name="getIconName(item.status)"
                                                            class="w-4 h-4 align-middle" />
                                                        {{ getStatusLabel(item.status) }}
                                                    </span>
                                                    <Form @submit="updateValidasiLaporan"
                                                        :validation-schema="validasiLaporanSchema"
                                                        class="flex flex-row flex-nowrap space-x-2 border border-gray-200 py-1 px-2">
                                                        <div>
                                                            <Field as="select" name="status" id="status"
                                                                class="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200">
                                                                >
                                                                <option disabled value="">Pilih Status</option>
                                                                <option value="pending"
                                                                    :selected="item.status === 'pending'">
                                                                    Tunggu</option>
                                                                <option value="approved"
                                                                    :selected="item.status === 'approved'">
                                                                    Terima</option>
                                                                <option value="rejected"
                                                                    :selected="item.status === 'rejected'">
                                                                    Tolak</option>
                                                            </Field>
                                                            <ErrorMessage name="status" class="text-red-500 text-xs" />
                                                            <p v-if="errorsValBack.status" class="text-red-500 text-sm">{{
                                                                errorsValBack.status[0] }}</p>
                                                        </div>
                                                        <Field name="id" type="hidden" id="id" :value="item.id" />
                                                        <button
                                                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs w-full sm:w-auto px-3 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                                            <Icon v-if="pendingUpdateId === item.id" name="codex:loader"
                                                                class="text-xl align-middle" />
                                                            <span v-else>Simpan</span>
                                                        </button>
                                                    </Form>

                                                    <!-- <Field  name="selectedReports" 
                                                                        type="checkbox" 
                                                                        :value="data.id" 
                                                                        v-model="selectedReports"
                                                                        @change="logSelectedReports"/>   -->
                                                </div>
                                            </td>
                                        </tr>
                                    </BaseTable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </NuxtLayout>
</template>

<style scoped></style>