<script setup lang="ts">
import { useNotification } from '~~/stores/notification'
import type { ApiResponse, ApiResponseSingle } from '~~/types/types'
import { FormatDate, formatDateID } from '~~/utils/date'
import { useField, useForm } from 'vee-validate'
import { object, string, date } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { getStatusLabel } from '~~/utils/formatStatus'

definePageMeta({
    layout: 'dashboard',
    middleware: ['permission', 'auth'],
    permission: 'pdamintern.attendances.view', // <-- contoh penggunaan permission
})

const breadcrumb = [
    { label: "Kehadiran", icon: "material-symbols:co-present-outline-rounded", to: "/kehadiran" }
]


const { addNotification } = useNotification()

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)

const { can, fetchUser, permissions } = useAuth()
const { getList, getListToday, destroy, create, update, getById, loading, errorsValBack } = useAttendance()
const { create: createDayliReport, errorsValBack: errorsValBackDayliReport, loading: pendingDayliReport } = useDayliReport()

// fetch today
const attendanceToday = ref<ApiResponseSingle<Attendance> | null>(null)
const attendanceList = ref<ApiResponse<Attendance> | null>(null)

const me = ref()

const fetchUsr = async () => {
    try {
        pending.value = true
        const response = await fetchUser()

        me.value = response ?? null

    } catch (error) {
        console.error('Gagal mengambil data aplikassi:', error)
    } finally {
        pending.value = false
    }
}
const fetchAttendance = async () => {
    try {
        pending.value = true
        const responseList = await getList()
        const response = await getListToday()
        console.log(responseList)
        attendanceList.value = responseList ?? null
        attendanceToday.value = response ?? null

    } catch (error) {
        console.error('Gagal mengambil data aplikasi:', error)
    } finally {
        pending.value = false
    }
}


watch(
    [() => route.query.page, () => route.query.sort_by, () => route.query.sort_order],
    () => {
        fetchUsr()
        fetchAttendance()
    },
    { immediate: true }
)

// presensi
const videoElement = ref<HTMLVideoElement | null>(null)
const capturedImage = ref<string | null>(null)
const stream = ref<MediaStream | null>(null)
const step = ref(1)
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const locationEnabled = ref(false);

const startCamera = async () => {
    try {
        stream.value = await navigator.mediaDevices.getUserMedia({ video: true })
        step.value = 2
        if (videoElement.value) {
            videoElement.value.srcObject = stream.value;
        }
    } catch (error) {
        console.error("Gagal mengakses kamera:", error)
    }
}

const stopCamera = () => {
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop()); // Hentikan semua track video
        stream.value = null;
    }
};

const captureImage = async () => {
    if (!videoElement.value) {
        addNotification('error', 'Kamera belum diaktifkan. Silakan nyalakan kamera terlebih dahulu.');
        return;
    }

    const video = videoElement.value
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        capturedImage.value = canvas.toDataURL("image/png")
    }
    stopCamera();
    step.value = 3
    // const location = await getLocation() as { latitude: number, longitude: number };
    // latitude.value = location.latitude
    // longitude.value = location.longitude
    // console.log("Lokasi pengguna:", location);
    // console.log(capturedImage.value)
    try {
        const location = await getLocation() as { latitude: number, longitude: number };
        latitude.value = location.latitude
        longitude.value = location.longitude
        locationEnabled.value = true;
        // console.log("Lokasi pengguna:", location);
    } catch (error) {
        // console.error("Gagal mendapatkan lokasi:", error);
        addNotification('error', 'Gagal mendapatkan lokasi. Pastikan GPS diaktifkan.');
    }
}
const reset = () => {
    capturedImage.value = null;
    step.value = 2; // Kembali ke awal
};

// 🔹 Pantau perubahan step agar kamera hanya aktif di step 2
watch(step, async (newStep) => {
    if (newStep === 2) {
        await startCamera();
    }
});

const getLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation tidak didukung di browser ini"));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        }
    });
};

const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(",");
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    const mime = mimeMatch && mimeMatch[1] ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

const getFormattedDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Tambah 1 karena bulan mulai dari 0
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getFormattedTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
};

const kirim = async () => {
    const formData = new FormData()
    formData.append('latitude', latitude.value?.toString() || '')
    formData.append('longitude', longitude.value?.toString() || '')
    formData.append("tanggal", getFormattedDate()); // Tambahkan tanggal
    formData.append("waktu", getFormattedTime()); // Tambahkan waktu
    if (capturedImage.value) {
        const blob = dataURLtoBlob(capturedImage.value);
        formData.append("foto", blob, "capture.png"); // Nama file opsional
    }
    // for (const pair of formData.entries()) {
    //   console.log(`${pair[0]}:`, pair[1]);
    // }
    // console.log(formData)
    try {
        const response = await create(formData);
        stopCamera();
        step.value = 1;
        fetchAttendance()
        addNotification('success', response.message)
    } catch (error: any) {
        addNotification('error', error.data.message)
    }
    // Debug: Cek isi FormData
}

// add dayli report
const tanggalPresensi = ref("");
const idPresensi = ref("");

const addLaporanHarian = async (id: string, tanggal: string) => {
  idPresensi.value = id
  const date = new Date(tanggal).toISOString().slice(0, 10)

tanggalPresensi.value = date
}
const { value: tanggalField } = useField<string>('tanggal')
const { value: titleField } = useField<string>('title')
const { value: reportField } = useField<string>('report')
const { value: resultField } = useField<string>('result')

const schema = toTypedSchema(object({ 
//     tanggal: date().typeError('Tanggal presensi tidak valid').required('Tanggal presensi wajib diisi'),
//   title: string().required('Kegiatan wajib diisi'),
//   report: string().required('Deskripsi kegiatan wajib diisi'),
//   result: string().required('Hasil yang dicapai wajib diisi'),
}))
const addLaporanSchema =  object({
  tanggal: date().typeError('Tanggal presensi tidak valid').required('Tanggal presensi wajib diisi'),
  title: string().required('Kegiatan wajib diisi'),
  report: string().required('Deskripsi kegiatan wajib diisi'),
  result: string().required('Hasil yang dicapai wajib diisi'),
})
const { handleSubmit, resetForm, errors } = useForm({
    validationSchema: schema,
      validateOnMount: true, 
}) 
 
const handleCreateLaporan = async (values: any, { resetForm }: { resetForm: () => void }) => {
    // console.log(values)
  const formData = new FormData()
  formData.append('attendance_id', idPresensi.value ?? '')
  formData.append('title', values.title ?? '')
  formData.append('report', values.report ?? '') 
  formData.append('result', values.result ?? '')
  // for (const pair of formData.entries()) {
  //   console.log(`${pair[0]}:`, pair[1]);
  // }
  try {
    const response = await createDayliReport(formData);
    resetForm();
    tanggalPresensi.value = ""
    fetchAttendance()
    addNotification('success', response.message)
  } catch (error: any) {
    addNotification('error', error.data.message)
  }

} 
</script>

<template>
    <NuxtLayout>
        <Breadcrumb :items="breadcrumb" />
        <section class="mb-3">
            <LoadingBar v-if="pending" />
            <div v-else class="p-3">
                <div class="flex flex-col md:flex-row flex-wrap gap-3">
                    <section class="mb-3 flex-[1] min-w-[300px] flex flex-col overflow-x-auto w-full">
                        <!-- <h3 class="text-md text-gray-700 font-medium mb-2">Presensi</h3> -->
                        <div class="flex flex-col  gap-3 mb-2  card-animation">
                            <div v-if="step === 1"
                                class="overflow-x-auto bg-white  p-6  rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div v-if="pending || loading">
                                    <div class="flex flex-row mb-3">
                                        <div class="w-20 h-20 bg-gray-300 rounded-md"></div>
                                        <div class="ms-3">
                                            <div class="w-40 h-4 bg-gray-300 rounded mt-2"></div>
                                            <div class="w-32 h-4 bg-gray-300 rounded mt-2"></div>
                                            <div class="w-48 h-4 bg-gray-300 rounded mt-2"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="flex flex-row mb-3 space-x-4">
                                        <NuxtImg :src="me.data.photo
                                            ? `https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg`
                                            : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                                            alt="Foto Identitas"
                                            style="max-width: 80px; max-height: 80px; object-fit: cover;" format="webp"
                                            loading="lazy" />
                                        <div class="overflow-hidden">
                                            <p class="text-sm text-gray-700 dark:text-white line-clamp-1">{{
                                                me.data.name
                                                }} </p>
                                            <p class="text-sm text-gray-700 dark:text-white line-clamp-1"> {{
                                                me.data.nisn_npm_nim }} </p>
                                            <p class="text-sm text-gray-700 dark:text-white line-clamp-1">{{
                                                me.data.email
                                                }}
                                            </p>
                                            <p class="text-sm text-gray-700 dark:text-white line-clamp-1">{{
                                                FormatDate(new
                                                    Date()) }}</p> 
                                        </div>
                                    </div>
                                    <div class="w-full h-[1px] bg-gradient-to-r from-green-400 to-green-600 mb-3"></div>
                                    <div class="flex flex-row flex-wrap mb-3 gap-2">
                                        <div class="flex-[1] flex flex-col text-green-600 dark:text-white">
                                            <div class="flex items-center">
                                                <Icon name="material-symbols-light:export-notes-rounded"
                                                    class="w-5 h-5 " />
                                                <p class="ms-1 text-sm font-medium  ">Datang</p>
                                            </div>
                                            <p class="ms-1 text-sm">{{ attendanceToday?.data?.check_in_time ?? '--:--' }}
                                            </p>
                                        </div>
                                        <div class="flex-[1] flex flex-col text-red-600 dark:text-white">
                                            <div class="flex items-center">
                                                <Icon name="material-symbols-light:export-notes-rounded"
                                                    class="w-5 h-5 " />
                                                <p class="ms-1 text-sm font-medium  ">Pulang</p>
                                            </div>
                                            <p class="ms-1 text-sm">{{ attendanceToday?.data?.check_out_time ?? '--:--'
                                                }}</p>
                                        </div>
                                    </div>

                                    <button
                                        :disabled="!!(attendanceToday?.data?.check_in_time && attendanceToday?.data?.check_out_time)"
                                        @click="startCamera" :class="{
                                            'bg-gray-400 cursor-not-allowed': attendanceToday?.data?.check_in_time && attendanceToday?.data?.check_out_time,
                                            'bg-blue-500 hover:bg-blue-600': !(attendanceToday?.data?.check_in_time && attendanceToday?.data?.check_out_time)
                                        }" class="text-white bg-blue-700  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full  px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Presensi
                                    </button>
                                </div>
                            </div>
                            <div v-if="step === 2"
                                class="bg-gradient-to-tr from-green-50 to-cyan-50  w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div class="w-full  bg-white mb-3">
                                    <video ref="videoElement" class="w-full h-full rounded" autoplay></video>
                                </div>
                                <button @click="captureImage"
                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full  px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Ambil
                                    Gambar</button>
                            </div>
                            <div v-if="step === 3"
                                class="bg-gradient-to-tr from-green-50 to-cyan-50  w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div class="w-full bg-white mb-3">
                                    <img v-if="capturedImage" :src="capturedImage" alt="Captured"
                                        class=" object-contain rounded">
                                    <p v-else class="text-gray-500">tampilkan gambar disini</p>

                                </div>
                                <iframe :src="`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`"
                                    class="mb-3" width="100%" height="300" style="border:0;"></iframe>

                                <button @click="reset"
                                    class="w-full text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2">
                                    Ambil Ulang
                                </button>
                                <button @click="kirim" :disabled="loading || !locationEnabled" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center flex items-center justify-center gap-2 
        dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800
        disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400">
                                    <Icon v-if="loading" name="codex:loader" class="animate-spin w-5 h-5" />
                                    <span v-else>Kirim</span>
                                </button>
                            </div>
                        </div>
                        
          <div
            class="bg-gradient-to-tr from-orange-50 to-cyan-50  p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 space-y-2">
            <!-- {{ attendanceList }} -->
            <div v-for="dataPresensi in attendanceList?.data.data.slice(0, 3)" :key="dataPresensi.id"
              class=" border-b border-gray-300 last:border-0 pb-2 last:pb-0">

              <p class="text-right text-xs font-medium text-gray-700 dark:text-white whitespace-nowrap">
                {{ FormatDate(dataPresensi?.date) }}
              </p>
              <div class="flex items-center space-x-2 w-full"> 

                <div class="relative w-14 h-10 flex shrink-0">
                  <NuxtImg :src="dataPresensi.check_in_photo
                    ? `${config.public.storage}/storage/${dataPresensi.check_in_photo}`
                    : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                    class="rounded-full w-10 h-10 object-cover relative z-10 border-2 border-white" alt="Foto Identitas"
                    format="webp" loading="lazy" />
                  <NuxtImg :src="dataPresensi.check_out_photo
                    ? `${config.public.storage}/storage/${dataPresensi.check_out_photo}`
                    : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                    class="rounded-full w-10 h-10 object-cover absolute top-0 left-5 border-2 border-white"
                    alt="Foto Identitas" format="webp" loading="lazy" />
                </div>

 
                <div class="flex flex-col items-start space-y-1">
                  <div class="flex flex-row items-center">
                    <p class="text-xs  text-gray-800">Datang </p>
                    <p class="ms-1 text-xs  text-gray-800">{{ dataPresensi?.check_in_time }}</p>
                  </div>
                  <div class="flex flex-row items-center">
                    <p class="text-xs  text-gray-800">Pulang</p>
                    <p class="ms-1 text-xs  text-gray-800">{{ dataPresensi?.check_out_time }}</p>
                  </div>
                </div>
 
                <div class="flex flex-row w-full  justify-end">
                  <div v-if="!dataPresensi?.daily_report" class="flex justify-end items-center space-x-1 ms-auto relative group ">
                    <Icon @click="addLaporanHarian(dataPresensi?.id, dataPresensi?.date)"
                      name="material-symbols:add-to-photos-outline-rounded"
                      class="text-green-500 hover:text-green-600 w-5 h-5 cursor-pointer" />
                      <span
                          class="absolute bottom-full  right-0  mb-2 px-2 py-1 text-[10px] text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          Buat laporan
                      </span> 
                  </div>

                  <div v-else>
                    <span class="text-xs rounded-xl py-1 px-2 whitespace-nowrap cursor-default" :class="{
                      'bg-yellow-100 border border-yellow-200 text-yellow-600 cursor-auto': dataPresensi.daily_report.status === 'pending',
                      'bg-green-100 border border-green-200 text-green-600 cursor-auto': dataPresensi.daily_report.status === 'approved',
                      'bg-red-100 border border-red-200 text-red-600 cursor-auto': dataPresensi.daily_report.status === 'reject',
                    }">
                      {{ getStatusLabel(dataPresensi.daily_report?.status) }}
                    </span>
                  </div>

                </div>
              </div>

            </div>

          </div>
                    </section>
                    <section class="mb-3 flex-[2]">
                        <div
            class="w-full p-6 bg-white  border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <Form @submit="handleCreateLaporan" :validation-schema="addLaporanSchema" :validate-on-mount="false">
              <div class="grid grid-cols-1 md:grid-cols-2  gap-4 mt-4">
                <div>
                  <BaseInput label="Tanggal" name="tanggal" type="date" :errors="errors" :errorsValBack="errorsValBackDayliReport"
                    :disabled="true" v-model="tanggalPresensi" />
                  <p v-if="errorsValBackDayliReport.presensi_id" class="text-red-500 text-sm">Silahkan pilih tanggal
                  </p>
                </div>
                <BaseInput label="Nama Kegiatan" name="title" type="text"  :disabled="!tanggalPresensi" required :errors="errors"
                  :errorsValBack="errorsValBackDayliReport" /> 
              </div>
              <div class="grid grid-cols-1 md:grid-cols-1 mt-4">
                <div>
                  <label for="report" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Deskripsi Kegiatan
                  </label>
                  <Field :disabled="!tanggalPresensi" name="report" as="textarea" id="report" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-32  disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                   dark:disabled:bg-gray-800 dark:disabled:text-gray-500" />

                  <ErrorMessage name="report" class="text-red-500 text-sm" />

                  <p v-if="errorsValBackDayliReport.report" class="text-red-500 text-sm">
                    {{ errorsValBackDayliReport.report[0] }}
                  </p>
                </div>
              </div> 

              <div class="grid grid-cols-1 md:grid-cols-1  mt-4">
                <div>
                  <label for="result" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Hasil yang dicapai
                  </label>
                  <Field :disabled="!tanggalPresensi" name="result" as="textarea" id="result" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-32  disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                    dark:disabled:bg-gray-800 dark:disabled:text-gray-500" />

                  <ErrorMessage name="result" class="text-red-500 text-sm" />

                  <p v-if="errorsValBackDayliReport.result" class="text-red-500 text-sm">
                    {{ errorsValBackDayliReport.result[0] }}
                  </p>
                </div> 
              </div>
              <div v-if="tanggalPresensi" class="mt-6">
                <div class=" flex flex-row justify-end gap-3">
                  <button @click="tanggalPresensi = ''"
                    class=" text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                    <span>Batal</span>
                  </button>
                  <button type="submit" :disabled="pendingDayliReport"
                    class=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <Icon v-if="pendingDayliReport" name="tabler:loader-2"
                      class="w-4 h-4 animate-spin text-white" />
                    <span v-else>Tambah</span>
                  </button>
                </div>
              </div>
            </Form>
          </div>
                    </section>
                </div>
            </div>
        </section>
    </NuxtLayout>
</template>



<style scoped>
.card-animation {
    position: relative;
    padding: 5px;
    z-index: 1;
}

@property --angle {
    syntax: "<angle>";
    initial-value: 0deg;
    inherits: false;
}

.card-animation::after,
.card-animation::before {
    content: '';
    position: absolute;
    height: 100%;
    width: 100%;
    background-image: conic-gradient(from var(--angle), #ff4545, #00ff99, #ff0095, #ff4545);
    /* background-image: conic-gradient(from var(--angle), transparent 20%, blue); */
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    z-index: -1;
    padding: 5px;
    border-radius: 10px;
    animation: 4s spin infinite;
}

.card-animation::before {
    /* filter: blur(1rem); */
    opacity: 0.5;
}

@keyframes spin {

    from {
        --angle: 0deg;
    }

    to {
        --angle: 360deg;
    }
}
</style>