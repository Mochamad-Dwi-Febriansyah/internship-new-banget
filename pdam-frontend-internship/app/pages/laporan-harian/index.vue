<script setup lang="ts">
definePageMeta({
    layout: "dashboard",
    middleware: ["permission", "auth"],
    permission: "pdamintern.daily-reports.view", // <-- contoh penggunaan permission
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
        label: "Laporan Harian",
        icon: "material-symbols:add-notes-outline",
        to: "/laporan-harian",
    },
];

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const selectedSort = ref('')
const { can, permissions } = useAuth()
const { getList, destroy, create, update, getById, loading, errorsValBack } = useAttendance()
const { getById: getByIdDayliReport,exportDayliReport, create: createDayliReport, update: updateDayliReport,  loading: loadDayliReport} = useDayliReport()

const viewMode = ref("table")

// list
const attendances = ref<ApiResponse<Attendance> | null>(null)

const fetchAttendance = async () => {
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

        attendances.value = response ?? null

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
        fetchAttendance()
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
    if (page < 1 || page > (attendances.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
}

// detail 

const dayliReportDetail = ref<DayliReport>()

const showDetailModal = ref(false)
const modalDetailTitle = 'Detail Laporan Harian'

const openDetail = async (id: string, date: any) => {
    showDetailModal.value = true

    const response = await getByIdDayliReport(id, date)

    dayliReportDetail.value = response?.data

}

// export log
const exportLogBookBtn = async () => {
    try {
        const response = await exportDayliReport()
        addNotification('success', 'Berhasil di download')
    } catch (error: any) {
        addNotification('error', error.message)
    }
}

// create edit
const showFormModal = ref(false)
const isEdit = ref(false)
const form = ref<{ id?: string, attendance_id?: string  }>({})

const modalFormTitle = computed(() =>
  isEdit.value ? 'Ubah Penelitian' : 'Tambah Penelitian'
)
const SubmitSchema = toTypedSchema(object({
    title: string().required('Kegiatan wajib diisi'),
  report: string().required('Deskripsi kegiatan wajib diisi'),
  result: string().required('Hasil yang dicapai wajib diisi'),
}))

const { handleSubmit, resetForm, errors } = useForm({
  validationSchema: SubmitSchema,
})

const { value: titleField } = useField<string>('title')
const { value: reportField } = useField<string>('report')
const { value: resultField } = useField<string>('result')

const openCreateForm = (attendance: Attendance) => {
  isEdit.value = false 
  form.value = {}
  form.value.attendance_id = attendance.id 
//   console.log(form.value.id)
  showFormModal.value = true 
} 
const openEditForm = (dayliReport: DayliReport) => {
  isEdit.value = true
  titleField.value = dayliReport.title ?? '',
  reportField.value = dayliReport.report ?? '' ,
  resultField.value = dayliReport.result ?? '' ,  
form.value.id = dayliReport.id
  showFormModal.value = true
}

const submitForm = async (values: any, { resetForm }: { resetForm: () => void }) => {
  const formData = new FormData()
  if (!isEdit.value) { 
    formData.append('attendance_id', form.value.attendance_id || '')
  }
  formData.append('title', values.title)
  formData.append('report', values.report)
  formData.append('result', values.result)
  // for (const [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value)
  // }
  try {
    const response = isEdit.value && form.value.id
      ? await updateDayliReport(form.value.id, formData)
      : await createDayliReport(formData)

    addNotification('success', response.message)

    await fetchAttendance()
    showFormModal.value = false
  } catch (error: any) {
    addNotification('error', error.message)
    // console.error('Submit error:', error)
  }
}

</script>

<template>
    <NuxtLayout>
        <Breadcrumb :items="breadcrumb" />
        <section class="mb-3">
            <LoadingBar v-if="pending" />
            <div v-else class="p-3">
                <div class="flex flex-row justify-between items-center mb-2">
                    <div class="flex bg-gray-100 dark:bg-gray-700 rounded-full items-center border ">
                        <button @click="viewMode = 'grid'"
                            :class="viewMode === 'grid' ? 'bg-green-100   text-green-800' : 'text-gray-600 dark:text-gray-300'"
                            class="px-3 py-1 text-xs font-semibold rounded-l-full transition-all flex items-center">
                            <Icon name="material-symbols:grid-view" class="w-4 h-4 inline-block" />
                        </button>

                        <div class="h-6 w-[1px] bg-green-200 dark:bg-gray-500"></div>

                        <button @click="viewMode = 'table'"
                            :class="viewMode === 'table' ? 'bg-green-100   text-green-800' : 'text-gray-600 dark:text-gray-300'"
                            class="px-3 py-1 text-xs font-semibold rounded-r-full transition-all flex items-center">
                            <Icon name="material-symbols:table-rows" class="w-4 h-4 inline-block" />
                        </button>

                    </div>
                    <button @click="exportLogBookBtn"
                                class="px-3 py-1   text-xs w-fit font-medium rounded-full flex items-center gap-2 bg-green-100 border border-green-200 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
                                <Icon
                                    :name="loadDayliReport ? 'codex:loader' : 'material-symbols:file-export-sharp'"
                                    class="w-4 h-4 inline-block align-middle" />
                                Cetak buku catatan
                            </button>
                </div>
                <div v-if="!attendances?.data.data || attendances?.data.data.length === 0"
                    class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg">
                    Tidak ada data.
                </div>
                <div v-else>
                    <div v-if="viewMode === 'grid'"
                        class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div v-for="data in attendances.data.data" :key="data.id"
                            class="rounded-lg shadow-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                            <h4 class="text-sm text-center font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {{ formatDateID(data.date) }}
                            </h4>

                            <div class="flex flex-col gap-3">
                                <div class="flex flex-row gap-3 justify-center">
                                    <!-- Check-in -->
                                    <div class="flex flex-col items-center">
                                        <NuxtImg
                                            :src="data.check_in_photo ? `${config.public.storage}/storage/${data.check_in_photo}` : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                                            class="w-24 h-24 object-cover rounded-lg border mb-1" alt="Foto Check-in"
                                            format="webp" loading="lazy" />
                                        <div class="text-center">
                                            <p class="text-gray-500 dark:text-gray-300 text-sm">Masuk</p>
                                            <p class="font-medium text-sm text-gray-700 dark:text-white">{{
                                                data.check_in_time ? data.check_in_time : '--:--:--' }}</p>
                                        </div>
                                    </div>

                                    <!-- Check-out -->
                                    <div class="flex flex-col  items-center">
                                        <NuxtImg
                                            :src="data.check_out_photo ? `${config.public.storage}/storage/${data.check_out_photo}` : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                                            class="w-24 h-24 object-cover rounded-lg border  mb-1" alt="Foto Check-out"
                                            format="webp" loading="lazy" />
                                        <div class="text-center">
                                            <p class="text-gray-500 dark:text-gray-300 text-sm">Keluar</p>
                                            <p class="font-medium text-sm text-gray-700 dark:text-white">{{
                                                data.check_out_time ? data.check_out_time : '--:--:--' }}</p>
                                        </div>
                                    </div>
                                </div>


                                <div class="flex flex-row space-x-2 items-center justify-center">


                                    <Button v-if="data.daily_report" size="noP" variant="custom"
                                            class="px-3 py-1  text-xs w-fit  whitespace-nowrap rounded-full flex items-center gap-2 bg-green-100 border border-green-200 text-green-600 dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                                            :tooltip="true" tooltipText="Detail"
                                            @click="openDetail(data.daily_report.id, data.date)">
                                            <Icon name="material-symbols:visibility-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button> 

                                        <Button v-if="data.daily_report" size="noP" variant="custom"
                                            class="px-3 py-1  text-xs w-fit  whitespace-nowrap rounded-full flex items-center gap-2 bg-green-100 border border-green-200 text-green-600 dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                                            :tooltip="true" tooltipText="Edit"
                                            @click="openEditForm(data.daily_report)">
                                            <Icon name="material-symbols:edit-square-outline"
                                                class="text-xl align-middle" />
                                        </Button>

                                        <Button v-if="!data.daily_report"  size="noP" variant="custom"
                                            class="px-3 py-1  text-xs w-fit  whitespace-nowrap rounded-full flex items-center gap-2 bg-green-100 border border-green-200 text-green-600 dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                                            :tooltip="true" tooltipText="Tambah"
                                            @click="openCreateForm(data)">
                                            <Icon name="material-symbols:add-to-photos-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button> 



                                        <Button
                                            v-if="data.daily_report"
                                            :variant="getStatusVariant(data.daily_report.status)"
                                            size="noP"
                                            :tooltip="true"
                                            :tooltipText="getStatusLabel(data.daily_report.status)"
                                            class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1"
                                        >
                                            <Icon :name="getIconName(data.daily_report.status)" class="w-4 h-4" />
                                        </Button>

                                        <Button
                                            v-else
                                            variant="red"
                                            size="noP"
                                            :tooltip="true"
                                            tooltipText="Belum mengisi laporan harian"
                                            class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1"
                                        >
                                            <Icon name="material-symbols:question-mark-rounded" class="w-4 h-4" />
                                        </Button>


                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else
                        class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        <BaseTable :headers="[
                            { label: 'Tanggal' },
                            { label: 'Kehadiran Datang' },
                            { label: 'Kehadiran Pulang' },
                            { label: 'Laporan Harian', center: true },
                        ]">
                            <tr v-if="attendances" v-for="(item, index) in attendances.data.data" :key="index"
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td class="px-6 py-2">
                                    {{ formatDateID(item.date) }}
                                </td>
                                <td class="px-6 py-2">
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
                                </td>
                                <td class="px-6 py-2">
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
                                    <div class="flex flex-row space-x-2  justify-center items-center">

                                        <Button v-if="item.daily_report" size="noP" variant="custom"
                                            class="px-3 py-1  text-xs w-fit  whitespace-nowrap rounded-full flex items-center gap-2 bg-green-100 border border-green-200 text-green-600 dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                                            :tooltip="true" tooltipText="Detail"
                                            @click="openDetail(item.daily_report.id, item.date)">
                                            <Icon name="material-symbols:visibility-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button> 

                                        <Button v-if="item.daily_report" size="noP" variant="custom"
                                            class="px-3 py-1  text-xs w-fit  whitespace-nowrap rounded-full flex items-center gap-2 bg-green-100 border border-green-200 text-green-600 dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                                            :tooltip="true" tooltipText="Edit"
                                            @click="openEditForm(item.daily_report)">
                                            <Icon name="material-symbols:edit-square-outline"
                                                class="text-xl align-middle" />
                                        </Button>

                                        <Button v-if="!item.daily_report"  size="noP" variant="custom"
                                            class="px-3 py-1  text-xs w-fit  whitespace-nowrap rounded-full flex items-center gap-2 bg-green-100 border border-green-200 text-green-600 dark:bg-green-900 dark:text-green-300 hover:bg-green-200"
                                            :tooltip="true" tooltipText="Tambah"
                                            @click="openCreateForm(item)">
                                            <Icon name="material-symbols:add-to-photos-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button> 



                                        <Button
                                            v-if="item.daily_report"
                                            :variant="getStatusVariant(item.daily_report.status)"
                                            size="noP"
                                            :tooltip="true"
                                            :tooltipText="getStatusLabel(item.daily_report.status)"
                                            class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1"
                                        >
                                            <Icon :name="getIconName(item.daily_report.status)" class="w-4 h-4" />
                                        </Button>

                                        <Button
                                            v-else
                                            variant="red"
                                            size="noP"
                                            :tooltip="true"
                                            tooltipText="Belum mengisi laporan harian"
                                            class="text-xs rounded-xl py-1 px-2 whitespace-nowrap flex items-center gap-1"
                                        >
                                            <Icon name="material-symbols:question-mark-rounded" class="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                                
                            </tr>
                        </BaseTable>
                    </div>
                    <BaseModal v-model="showDetailModal" :title="modalDetailTitle">
                        <SkeletonsDetailSkeleton v-if="loadDayliReport" :repeat="3" />

                        <div v-else class="space-y-4" v-if="dayliReportDetail">
                            <DetailRow label="Tanggal presensi">{{ formatDateID(dayliReportDetail.attendance?.date) }}
                            </DetailRow>
                            <DetailRow label="Judul">{{ dayliReportDetail.title }}</DetailRow>
                            <DetailRow label="Deskripsi kegiatan">{{ dayliReportDetail.report }}</DetailRow>
                            <DetailRow label="Hasil yang dicapai">{{ dayliReportDetail.result }}</DetailRow>
                            <DetailRow label="Status laporan">{{ getStatusLabel(dayliReportDetail.status) }}</DetailRow>

                        </div>
                    </BaseModal>
                </div>
                 <!-- create & update -->
                 <BaseModal v-model="showFormModal" :title="modalFormTitle"  classBody="scrollbar-hide">
            <Form :submit="handleSubmit(submitForm)" class="space-y-3" >
              <div class="grid gap-6 mb-6 md:grid-cols-1 dark:text-gray-900">
                <BaseInput label="Nama kegiatan" name="title" type="text" v-model="titleField" required :errors="errors"
                  :errorsValBack="errorsValBack" />
                <BaseTextarea label="Deskripsi kegiatan" name="report" type="text" v-model="reportField" required :errors="errors"
                  :errorsValBack="errorsValBack" />
                <BaseTextarea label="Hal yang didapat" name="result" type="text" v-model="resultField" required :errors="errors"
                  :errorsValBack="errorsValBack" />
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
            </div>
        </section>
    </NuxtLayout>
</template>



<style scoped></style>