<script setup lang="ts">
import type { ApiResponse, ApiResponseSingle } from '~~/types/types'
import { FormatDate, formatDateID } from '~~/utils/date'
import { getIconName, getStatusLabel } from '~~/utils/formatStatus'
import { getStatusVariant } from '~~/utils/statusLabel'

definePageMeta({
    layout: false,
    middleware: ['permission', 'auth'],
    permission: 'pdamintern.assessment-aspects.show',
})
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const { getList, loading } = useFinalReport()
const { getList: getListAttendanceReport, loading: loadingAttendanceReport } = useAttendance()
const id = String(route.params.id)

const finalReportDetail = ref<FinalReportListItem[]>()
const attendanceReportDetail = ref<Attendance[]>()

onMounted(async () => {
    const [response, responseDayliReport] = await Promise.all([
        getList({ user_id: id }),
        getListAttendanceReport({ user_id: id })
    ])

    finalReportDetail.value = response.data.data

    attendanceReportDetail.value = responseDayliReport.data.data
})

</script>

<template>
    <NuxtLayout>
        <div class="min-h-screen flex justify-center items-start bg-gray-50 dark:bg-gray-800 px-4 py-6">
            <div class="w-full md:w-3/4 space-y-4">
                <div class="flex flex-row gap-3">
                    <div class="flex items-center space-x-2 cursor-pointer text-gray-600 dark:text-gray-400 hover:underline"
                        @click="router.back()">
                        <Icon name="material-symbols:arrow-back-rounded" class="text-lg align-middle" />
                    </div>
                    <h1 class="text-md font-medium text-gray-800 dark:text-white">
                        Detail Magang
                    </h1>
                </div>

                <h2 v-if="finalReportDetail" class="text-md font-medium text-gray-800 dark:text-white">
                        Laporan Akhir
                    </h2>
                <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md ">
                    <!-- Skeleton saat loading -->
                    <div class="p-6" v-if="loading">
                        <SkeletonsDetailSkeleton :repeat="3" />
                    </div>

                    <!-- Konten saat data siap -->
                    <div v-else class="space-y-4" v-if="finalReportDetail">
                   
                        <div
                            class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                            <BaseTable :headers="[
                                { label: 'Judul' },
                                { label: 'Deskripsi' },
                                { label: 'Document', },
                                { label: 'Status verifikasi' },
                            ]">
                                <tr v-if="finalReportDetail" v-for="(item, index) in finalReportDetail" :key="index"
                                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td class="px-6 py-2">
                                        {{ item.title }}
                                    </td>
                                    <td class="px-6 py-2">
                                        {{ item.report }}
                                    </td>
                                    <td class="px-6 py-2">
                                        <a :href="`${config.public.storage}/storage/${item.assessment_report_file}`"
                                            target="_blank" class="text-blue-600 underline whitespace-nowrap">
                                            Lihat file penilaian mentor
                                        </a> <br>

                                        <a :href="`${config.public.storage}/storage/${item.final_report_file}`"
                                            target="_blank" class="text-blue-600 underline whitespace-nowrap">
                                            Lihat laporan akhir
                                        </a> <br>
                                        <a :href="`${config.public.storage}/storage/${item.photo}`" target="_blank"
                                            class="text-blue-600 underline whitespace-nowrap">
                                            Lihat photo
                                        </a> <br>
                                        <a :href="`${item.video}`" target="_blank"
                                            class="text-blue-600 underline  whitespace-nowrap">
                                            Lihat video
                                        </a>
                                    </td>
                                    <td class="px-6 py-2 space-y-2">
                                        <div class="font-medium flex flex-row flex-nowrap gap-2">Mentor  <Button
                                            v-if="item.mentor_verification_status"
                                            :variant="getStatusVariant(item.mentor_verification_status)" size="noP"
                                            class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1">
                                            <Icon :name="getIconName(item.mentor_verification_status)"
                                                class="w-4 h-4" />
                                            {{ getStatusLabel(item.mentor_verification_status) }}
                                        </Button></div>

                                        <div class="font-medium flex flex-row flex-nowrap gap-2">Pegawai 
                                        <Button v-if="item.hr_verification_status"
                                            :variant="getStatusVariant(item.hr_verification_status)" size="noP"
                                            class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1">
                                            <Icon :name="getIconName(item.hr_verification_status)" class="w-4 h-4" />
                                            {{ getStatusLabel(item.hr_verification_status) }}
                                        </Button></div>

                                    </td>

                                </tr>
                            </BaseTable>
                        </div>

                    </div>
                </div>


                <h2 v-if="attendanceReportDetail" class="text-md font-medium text-gray-800 dark:text-white">
                        Laporan Harian
                    </h2>
                <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md  ">
                    <!-- Skeleton saat loading -->

                    <div class="p-6" v-if="loadingAttendanceReport">
                        <SkeletonsDetailSkeleton :repeat="3" />
                    </div>
                    <!-- Konten saat data siap -->
                    <div v-else class="space-y-4" v-if="attendanceReportDetail">
                        
                        <div
                            class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                            <BaseTable :headers="[
                                { label: 'Tanggal' }, 
                                { label: 'Kegiatan' },
                                { label: 'Deskripsi Kegiatan' },
                                { label: 'Hasil yang dicapai' },
                                { label: 'Laporan Harian', center: true },
                            ]">
                                <tr v-if="attendanceReportDetail" v-for="(item, index) in attendanceReportDetail"
                                    :key="index"
                                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td class="px-6 py-2">
                                        <div class="whitespace-nowrap">{{ FormatDate(item.date) }}</div>
                                  
                                        <div class="flex flex-row space-x-2 items-center">
                                            <NuxtImg
                                                :src="item.check_in_photo
                                                    ? `${config.public.storage}/storage/${item.check_in_photo}`
                                                    : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                                                class="rounded-full w-10 h-10 object-cover border-2 border-white"
                                                alt="Foto Identitas" format="webp" loading="lazy" />
                                            <div class="flex flex-col text-xs">
                                                <p>{{ item.check_in_time ? item.check_in_time : '--:--:--' }}</p>
                                            </div>
                                        </div>
                                        <div class=" flex flex-row space-x-2 items-center">
                                            <NuxtImg
                                                :src="item.check_out_photo
                                                    ? `${config.public.storage}/storage/${item.check_out_photo}`
                                                    : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                                                class="rounded-full w-10 h-10 object-cover border-2 border-white"
                                                alt="Foto Identitas" format="webp" loading="lazy" />
                                            <div class="flex flex-col text-xs">
                                                <p>{{ item.check_out_time ? item.check_out_time : '--:--:--' }}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-2">
                                         {{ item.daily_report?.title }}
                                    </td>
                                    <td class="px-6 py-2">
                                         {{ item.daily_report?.report }}
                                    </td>
                                    <td class="px-6 py-2">
                                         {{ item.daily_report?.result }}
                                    </td>
                                    <td class="px-6 py-2">
                                        <div class="flex flex-row space-x-2  justify-center items-center"> 

                                            <Button v-if="item.daily_report"
                                                :variant="getStatusVariant(item.daily_report.status)" size="noP"
                                                :tooltip="true" :tooltipText="getStatusLabel(item.daily_report.status)"
                                                class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1">
                                                <Icon :name="getIconName(item.daily_report.status)" class="w-4 h-4" />
                                            </Button>

                                            <Button v-else variant="red" size="noP" :tooltip="true"
                                                tooltipText="Belum mengisi laporan harian"
                                                class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1">
                                                <Icon name="material-symbols:question-mark-rounded" class="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>

                                </tr>
                            </BaseTable>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>


<style scoped></style>