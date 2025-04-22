<script setup lang="ts">
definePageMeta({
    layout: 'dashboard',
    middleware: ['auth'],
    // middleware: ['permission', 'auth'],
    // permission: 'pdamintern.applications.view', // <-- contoh penggunaan permission
})

import type { ApiResponse, ApiResponseNoPagination, PaginationMeta } from '~~/types/types'
import { formatDateID, formatDateNoWeekday } from '~~/utils/date'
import { useNotification } from '~~/stores/notification'
import { getIconName, getStatusLabel } from '~~/utils/formatStatus'
import { useEmployee, type Employee } from '~/composables/sso/useEmployee'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import { useField, useForm } from 'vee-validate'
import { object, string, date } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import dayjs from 'dayjs'

const breadcrumb = [
    { label: "Berkas", icon: "material-symbols:checkbook-outline-rounded", to: "/berkas" }
]

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const { can, permissions } = useAuth()
const { getApplications, getApplicationById,submissionReceipt, updateStatusAndMentorApplication, errorsValBack, loading } = useApplications()
const { getList } = useEmployee()

// fetch employee
const selectedMentors = ref<Record<string, { value: string; text: string } | null>>({})

const employee = ref<ApiResponseNoPagination<Employee> | null>(null)

const mentorOptions = computed(() => {
    return (employee?.value?.data || []).map(e => ({
        value: e.npp,
        text: `${e.nama} ${e.pangkat_golongan}`
    }))
})

const fetchEmployee = async () => {
    try {
        pending.value = true
        const result = await getList()
        employee.value = result ?? null

    } catch (error) {
        console.error('Gagal mengambil data aplikasi:', error)
    } finally {
        pending.value = false
    }
}
const { addNotification } = useNotification()

const applications = ref<ApiResponse<DocumentItem> | null>(null)

watch([mentorOptions, applications], () => {
    const items = applications.value?.data.data || []
    items.forEach(item => {
        if (item.mentor_id && !selectedMentors.value[item.id]) {
            const found = mentorOptions.value.find(opt => opt.value === item.mentor_id)
            if (found) {
                selectedMentors.value[item.id] = found
            }
        }
    })
}, { immediate: true })

// fetch application
const fetchApplications = async () => {
    try {
        pending.value = true
        const result = await getApplications({ page: currentPage.value })
        applications.value = result ?? null

    } catch (error) {
        console.error('Gagal mengambil data aplikasi:', error)
    } finally {
        pending.value = false
    }
}

watch(
    () => route.query.page,
    (page) => {
        const parsedPage = Number(page)
        // console.log('Halaman berubah:', parsedPage)
        currentPage.value = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1
        fetchApplications()
        fetchEmployee()
        // console.log("ds",permissions)
    },
    { immediate: true }
)

function goToPage(page: number) {
    if (page < 1 || page > (applications.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
}

// detail
const applicationDetail = ref<DocumentItem>()

const showDetailModal = ref(false)
const modalDetailTitle = 'Detail Berkas'

const openDetail = async (id: string) => {
    showDetailModal.value = true

    const response = await getApplicationById(id)

    applicationDetail.value = response?.data

}

// update status application 
const pendingUpdateId = ref<string | null>(null)

const updateStatusApplication = async (values: any, item: { id: string }, { resetForm }: { resetForm: () => void }) => {
    pendingUpdateId.value = values.id
    const formData = new FormData()
    formData.append('document_status', values.document_status)
    // formData.append('document_status', values.document_status);
    const mentorId = selectedMentors.value[item.id]?.value ?? ''; // Pastikan nilai mentor_id adalah string kosong jika tidak ada
    if (mentorId) {
        formData.append('mentor_id', mentorId);
    }
    if (selectedMentors) { 
        if (mentorId && employee.value) {
            // console.log(employee.value.data[0]?.npp)
            // console.log("mentor", String(mentorId))
            const foundEmployee = employee.value.data.find(emp => emp.npp === String(mentorId))
            if (foundEmployee) { 
                formData.append('mentor_name', foundEmployee.nama);
                formData.append('mentor_rank_group', foundEmployee.jabatan);
                formData.append('mentor_position', foundEmployee.pangkat_golongan);
                formData.append('mentor_nik', foundEmployee.nik);

            } else {
                addNotification('error', 'Mentor tidak ditemukan di daftar employee')
            }
        }
    }
    for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
    }
    try {
        const response = await updateStatusAndMentorApplication(values.id, formData)

        addNotification('success', response.message)
        await fetchApplications()
    } catch (error: any) {
        addNotification('error', error.message)
        // console.error('Submit error:', error)
    } finally {
        pendingUpdateId.value = null
    }
}

// delete

const showDeleteModal = ref(false);
const pendingDelete = ref<string | null>(null);
const idToDelete = ref<string | null>(null);

const confirmDelete = () => {
    idToDelete.value = null;
    showDeleteModal.value = true;
};

// accepted later
const showFormAcceptedLetterModal = ref(false)
const modalAcceptedLetterTitle = 'Kirim Surat Balasan'

const showFormPassphraseModal = ref(false)
const modalPassphraseTitle = 'Passphrase'

const SubmitSchema = toTypedSchema(object({
    // number_letter_FAL: string().required('Nomor surat wajib diisi'),   
    // recipient_FAL: string().required('Kepada wajib diisi'), 
    // recipient_address_FAL: string().required('Alamat kepada wajib diisi'), 
    // recipient_date_FAL: date().required('Tanggal surat wajib diisi'),

    // id: string().required('ID wajib diisi'), 
    user_idFAL: string().required('User wajib dipilih'),
    name_FAL: string().required('Nama wajib diisi'),
    nisn_npm_nim_FAL: string().required('NISN/NPM/NIM wajib diisi'),
    school_university_name_FAL: string().required('Nama sekolah/universitas wajib diisi'),
    school_major_FAL: string(),
    university_faculty_FAL: string(),
    university_program_study_FAL: string(),
    date_letter_FAL: date().required('Tanggal surat wajib diisi'),
    start_date_FAL: date().required('Tanggal mulai wajib diisi'),
    end_date_FAL: date().required('Tanggal selesai wajib diisi'),
}))

const { handleSubmit, resetForm, errors } = useForm({
    validationSchema: SubmitSchema,
})

const { value: numberLetterFieldAcceptedLetter } = useField<string>('number_letter_FAL')
const { value: letterNatureFieldAcceptedLetter } = useField<string>('letter_nature')
const { value: attachmentFieldAcceptedLetter } = useField<string>('attachment_FAL')
const { value: recipientFieldAcceptedLetter } = useField<string>('recipient_FAL')
const { value: recipientAddressFieldAcceptedLetter } = useField<string>('recipient_address_FAL')
const { value: recipientDateFieldAcceptedLetter } = useField<string>('recipient_date_FAL')



const { value: idDocumentFieldAcceptedLetter } = useField<string>('idFAL')
const { value: userIdFieldAcceptedLetter } = useField<string>('user_idFAL')
const { value: nameFieldAcceptedLetter } = useField<string>('name_FAL')
const { value: nisnNpmNimFieldAcceptedLetter } = useField<string>('nisn_npm_nim_FAL')
const { value: schoolUniversityNameFieldAcceptedLetter } = useField<string>('school_university_name_FAL')
const { value: schoolMajorFieldAcceptedLetter } = useField<string>('school_major_FAL')
const { value: universityFacultyFieldAcceptedLetter } = useField<string>('university_faculty_FAL')
const { value: universityProgramStudyFieldAcceptedLetter } = useField<string>('university_program_study_FAL')
const { value: dateLetterFieldAcceptedLetter } = useField<string>('date_letter_FAL')
const { value: startDateFieldAcceptedLetter } = useField<string>('start_date_FAL')
const { value: endDateFieldAcceptedLetter } = useField<string>('end_date_FAL')

const openAcceptedLetter = async (data: DocumentItem) => {
    idDocumentFieldAcceptedLetter.value = data.id,
    userIdFieldAcceptedLetter.value = data.user_id,
        nameFieldAcceptedLetter.value = data.user.name
    nisnNpmNimFieldAcceptedLetter.value = data.user.nisn_npm_nim
    schoolUniversityNameFieldAcceptedLetter.value = data.school_uni.school_university_name
    schoolMajorFieldAcceptedLetter.value = data.school_uni.school_major || ''
    universityFacultyFieldAcceptedLetter.value = data.school_uni.university_faculty || ''
    universityProgramStudyFieldAcceptedLetter.value = data.school_uni.university_program_study || ''
    dateLetterFieldAcceptedLetter.value = formatDateNoWeekday(new Date())
    startDateFieldAcceptedLetter.value = formatDateID(data.start_date)
    endDateFieldAcceptedLetter.value = formatDateID(data.end_date)
    showFormAcceptedLetterModal.value = true
}

const zoomScale = ref(.6)

const formPreview = computed(() => ({
    nomor_surat: numberLetterFieldAcceptedLetter.value,
    sifat: letterNatureFieldAcceptedLetter.value,
    lampiran: attachmentFieldAcceptedLetter.value,
    kepada: recipientFieldAcceptedLetter.value,
    alamat_kepada: recipientAddressFieldAcceptedLetter.value,
    tanggalSurat: formatDateID(recipientDateFieldAcceptedLetter.value),

    nama: nameFieldAcceptedLetter.value,
    nisn_npm_nim_npp: nisnNpmNimFieldAcceptedLetter.value,
    program_studi_universitas: universityProgramStudyFieldAcceptedLetter.value,
    tanggalMulai: startDateFieldAcceptedLetter.value,
    tanggalSelesai: endDateFieldAcceptedLetter.value
}))

interface AcceptedLetterFormValues {
    id_FAL: string
    user_idFAL: string;
    name_FAL: string;
    nisn_npm_nim_FAL: string;
    school_university_name_FAL: string;
    school_major_FAL?: string;
    university_faculty_FAL?: string;
    university_program_study_FAL?: string;
    date_letter_FAL: string | Date;
    start_date_FAL: string | Date;
    end_date_FAL: string | Date;
    number_letter_FAL?: string;
    letter_nature?: string;
    attachment_FAL?: string;
    recipient_FAL?: string;
    recipient_address_FAL?: string;
    recipient_date_FAL?: string | Date;
}

const PassphraseField = ref<string | number>()

let pendingAcceptedLetterFormValues: AcceptedLetterFormValues | null = null
 
const submitAcceptedLetterForm = async (values: any) => {  
    if (!PassphraseField.value) {
        pendingAcceptedLetterFormValues = values
        showFormPassphraseModal.value = true
        return
    }

    const formData = new FormData()
    formData.append('passphrase', String(PassphraseField.value))
    formData.append('user_id', userIdFieldAcceptedLetter.value)
    formData.append('name', nameFieldAcceptedLetter.value)
    formData.append('nisn_npm_nim', nisnNpmNimFieldAcceptedLetter.value)
    formData.append('school_university_name', schoolUniversityNameFieldAcceptedLetter.value)
    formData.append('school_major', schoolMajorFieldAcceptedLetter.value)
    formData.append('university_faculty', universityFacultyFieldAcceptedLetter.value)
    formData.append('university_program_study', universityProgramStudyFieldAcceptedLetter.value)
    formData.append('date_document', dateLetterFieldAcceptedLetter.value)
    formData.append('start_date', dayjs(startDateFieldAcceptedLetter.value).format('YYYY-MM-DD'))
    formData.append('end_date', dayjs(endDateFieldAcceptedLetter.value).format('YYYY-MM-DD'))

    formData.append('number_document', numberLetterFieldAcceptedLetter.value) 
    formData.append('letter_nature', letterNatureFieldAcceptedLetter.value) 
    formData.append('attachment', attachmentFieldAcceptedLetter.value) 
    formData.append('recipient', recipientFieldAcceptedLetter.value) 
    formData.append('recipient_address', recipientAddressFieldAcceptedLetter.value) 
    formData.append('recipient_date', dayjs(recipientDateFieldAcceptedLetter.value).format('YYYY-MM-DD')) 
 
 
    // Object.entries(values).forEach(([key, val]) => {
    //     if (val !== null && val !== undefined) {
    //         formData.append(key, val.toString())
    //     }
    // })

    try {
        const response = await submissionReceipt(idDocumentFieldAcceptedLetter.value, formData)

        addNotification('success', response.message)
        // TODO: Kirim formData ke API di sini
        showFormAcceptedLetterModal.value = false
        await fetchApplications()
    } catch (error: any) {
        addNotification('error', error.message)
        // console.error('Submit error:', error)
    }
}

const continueAcceptedLetterSubmission = () => {
    if (pendingAcceptedLetterFormValues) {
        submitAcceptedLetterForm(pendingAcceptedLetterFormValues)
        pendingAcceptedLetterFormValues = null
        showFormPassphraseModal.value = false
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
                    <!-- <AppLinkButton v-if="can('pdamintern.applications.create')" to="/berkas/form/new" icon="material-symbols:add-to-photos-outline-rounded"
                        label="Berkas" variant="green" /> -->
                </div>
                <div
                    class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                    <BaseTable :headers="[
                        { label: 'Identitas', center: false },
                        { label: 'Identitas Sekolah/Universitas', center: false },
                        { label: 'Foto Identitas', center: false },
                        { label: 'Surat Pengajuan', center: false },
                        { label: 'Aksi', center: true }
                    ]">
                        <tr v-if="applications" v-for="(item, index) in applications.data.data" :key="item.id"
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td class="px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                                <div class="flex flex-col">
                                    <p class="text-sm text-gray-500 dark:text-white">{{ item.user.role }}</p>
                                    <p class="text-sm text-gray-500 dark:text-white">{{ item.user.name }}</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.user.email }}</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.user.nisn_npm_nim }}</p>
                                </div>
                            </td>
                            <td class="px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                                <div class="flex flex-col">
                                    <p class="text-sm text-gray-500 dark:text-white">{{
                                        item.school_uni.school_university_name }}</p>
                                    <p v-if="item.school_uni.school_major"
                                        class="text-sm text-gray-500 dark:text-white">{{ item.school_uni.school_major }}
                                    </p>
                                    <div v-else>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{
                                            item.school_uni.university_faculty }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{
                                            item.school_uni.university_program_study }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-2">
                                <FileLink :path="item.identity_photo" label="Foto identitas" />
                            </td>
                            <td class="px-6 py-2">
                                <FileLink :path="item.application_letter" label="Surat pengajuan" />
                            </td>
                            <td class="px-6 py-2">
                                <div class="flex flex-col items-center justify-center gap-2">

                                    <div class="flex flex-row flex-nowrap space-x-2 whitespace-nowrap">

                                        <Button size="sm" variant="custom" class="text-yellow-600 hover:text-yellow-800"
                                            :tooltip="true" tooltipText="Detail" @click="openDetail(item.id)">
                                            <Icon name="material-symbols:visibility-outline-rounded"
                                                class="text-xl align-middle" />
                                        </Button>

                                        <span
                                            class="w-fit px-3 py-1 text-xs  rounded-full flex items-center cursor-default"
                                            :class="{
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': item.document_status === 'accepted',
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': item.document_status === 'pending',
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': item.document_status === 'rejected',
                                            }">
                                            <Icon :name="getIconName(item.document_status)"
                                                class="w-4 h-4 inline-block align-middle me-1" />
                                            {{ getStatusLabel(item.document_status) }}
                                        </span>

                                        <ClientOnly>
                                            <span v-if="item.mentor_id">
                                                {{ selectedMentors[item.id]?.text || item.mentor_id }}
                                            </span>
                                            <span v-else>Belum memilih mentor</span>
                                        </ClientOnly>
                                    </div>

                                    <Form v-if="item.document_status !== 'accepted' || !item.mentor_id"
                                        class="flex flex-row flex-nowrap space-x-2 border border-gray-200 dark:border-gray-700 py-1 px-2"
                                        @submit="(values, helpers) => updateStatusApplication(values, item, helpers)">
                                        <div>
                                            <Field as="select" name="document_status" id="document_status"
                                                class="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200"
                                                :value="item.document_status || ''">
                                                >
                                                <option disabled value="">Pilih Status</option>
                                                <option value="pending">
                                                    Menunggu</option>
                                                <option value="accepted">
                                                    Terima</option>
                                                <option value="rejected">
                                                    Tolak</option>
                                            </Field>
                                            <!-- <ErrorMessage name="document_status" class="text-red-500 text-xs"  /> -->

                                        </div>


                                        <div>
                                            <div class="w-64">
                                                <Field :name="`mentor_id_${item.id}`" v-slot="{ field }">
                                                    <client-only>
                                                        <Multiselect v-model="selectedMentors[item.id]"
                                                            :options="mentorOptions" placeholder="Pilih Mentor"
                                                            label="text" track-by="value" :searchable="true"
                                                            :close-on-select="true" :clear-on-select="false"
                                                            :selectLabel="''" :selectedLabel="''" :deselectLabel="''"
                                                            tag-placeholder="" class="text-sm w-full"
                                                            @update:modelValue="field.value = $event?.value" />
                                                    </client-only>
                                                </Field>
                                            </div>

                                            <!-- <ErrorMessage name="mentor_id" class="text-red-500 text-xs"  />  -->
                                        </div>
                                        <Field name="id" type="hidden" id="user_id" :value="item.id" />

                                        <button
                                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs w-full sm:w-auto px-3 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                            <Icon v-if="pendingUpdateId === item.id" name="codex:loader"
                                                class="text-xl align-middle" />
                                            <span v-else>Simpan</span>
                                        </button>
                                    </Form>
                                    <div v-else class="flex flex-row gap-2">
                                        <Button v-if="!item.accepted_letter" size="sm" variant="default" @click="openAcceptedLetter(item)">
                                            Kirim surat balasan
                                        </Button> 
                                        <Button size="sm" variant="default">
                                            Kirim surat bidang
                                        </Button>
                                    </div>

                                </div>
                            </td>
                        </tr>
                    </BaseTable>
                </div>

                <Pagination v-if="applications?.data" :currentPage="applications.data.current_page"
                    :lastPage="applications.data.last_page" :from="applications.data.from" :to="applications.data.to"
                    :total="applications.data.total" :links="applications.data.links" @change="goToPage" />


                <!-- detail -->
                <BaseModal v-model="showDetailModal" :title="modalDetailTitle">
                    <SkeletonsDetailSkeleton v-if="loading" :repeat="3" />

                    <div v-else class="space-y-4" v-if="applicationDetail">
                        <DetailRow label="Nama">{{ applicationDetail.user.name }}</DetailRow>
                        <DetailRow label="Email">{{ applicationDetail.user.email }}</DetailRow>
                        <DetailRow label="Alamat">
                            {{ applicationDetail.user.address }}, {{ applicationDetail.user.district }}, {{
                                applicationDetail.user.city }}, {{ applicationDetail.user.province }},
                            {{ applicationDetail.user.postal_code }}
                        </DetailRow>
                        <DetailRow label="Nomor Pendaftaran">{{ applicationDetail.registration_number }}</DetailRow>
                        <DetailRow label="Tanggal Mulai">{{ formatDateID(applicationDetail?.start_date) }}</DetailRow>
                        <DetailRow label="Tanggal Selesai">{{ formatDateID(applicationDetail?.end_date) }}</DetailRow>
                        <DetailRow label="Status Dokumen">{{ applicationDetail?.document_status || '-' }}</DetailRow>
                        <!-- Dokumen -->
                        <DetailRow v-if="applicationDetail.identity_photo" label="Foto Identitas">
                            <a :href="`${config.public.apiBase}/storage/${applicationDetail.identity_photo}`"
                                target="_blank" class="text-blue-600 underline">
                                Lihat Foto Identitas
                            </a>
                        </DetailRow>
                        <DetailRow v-if="applicationDetail.application_letter" label="Surat Permohonan">
                            <a :href="`${config.public.apiBase}/storage/${applicationDetail.application_letter}`"
                                target="_blank" class="text-blue-600 underline">
                                Lihat Surat Permohonan
                            </a>
                        </DetailRow>
                        <DetailRow v-if="applicationDetail.work_certificate" label="Sertifikat">
                            <a :href="`${config.public.apiBase}/storage/${applicationDetail.work_certificate}`"
                                target="_blank" class="text-blue-600 underline">
                                Lihat Sertifikat
                            </a>
                        </DetailRow>

                        <!-- Asal Sekolah / Kampus -->
                        <DetailRow label="Asal Kampus">{{ applicationDetail.school_uni?.school_university_name }}
                        </DetailRow>
                        <DetailRow v-if="applicationDetail.school_uni?.university_faculty" label="Fakultas">{{
                            applicationDetail.school_uni.university_faculty }}</DetailRow>
                        <DetailRow v-if="applicationDetail.school_uni?.university_program_study" label="Program Studi">
                            {{
                                applicationDetail.school_uni.university_program_study }}</DetailRow>
                        <DetailRow label="Alamat Kampus">
                            {{ applicationDetail.school_uni.school_university_address }},
                            {{ applicationDetail.school_uni.school_university_district }},
                            {{ applicationDetail.school_uni.school_university_city }},
                            {{ applicationDetail.school_uni.school_university_province }},
                            {{ applicationDetail.school_uni.school_university_postal_code }}
                        </DetailRow>

                    </div>
                </BaseModal>

                <!-- surat terima -->
                <BaseModal v-model="showFormAcceptedLetterModal" :title="modalAcceptedLetterTitle" size="lg">
                    <div class="flex flex-col md:flex-row gap-4 max-h-[calc(100vh-116px)] items-start">
                        <Form :submit="handleSubmit(submitAcceptedLetterForm)"
                            class="w-full  md:w-1/3 max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-hide">
                            <BaseInput name="id_FAL" type="hidden" v-model="idDocumentFieldAcceptedLetter" />
                            <BaseInput name="user_idFAL" type="hidden" v-model="userIdFieldAcceptedLetter" />
                            <div class="grid gap-6 mb-6 md:grid-cols-1 dark:text-gray-900">

                                <BaseInput label="Nomor Surat" name="number_letter_FAL" type="text"
                                    v-model="numberLetterFieldAcceptedLetter" :errors="errors" />

                                <BaseSelect label="Sifat" name="letter_nature" v-model="letterNatureFieldAcceptedLetter"
                                    :options="[
                                        { value: 'Penting', text: 'Penting' },
                                        { value: 'Biasa', text: 'Biasa' },
                                        { value: 'Rahasia', text: 'Rahasia' },
                                        { value: '-', text: 'Tidak ada' }
                                    ]" required />

                                <BaseInput label="Lampiran" name="attachment_FAL"
                                    v-model="attachmentFieldAcceptedLetter" type="text" :errors="errors" />

                                <BaseInput label="Kepada" name="recipient_FAL" v-model="recipientFieldAcceptedLetter"
                                    type="text" :errors="errors" />

                                <BaseInput label="Alamat Kepada" name="recipient_address_FAL"
                                    v-model="recipientAddressFieldAcceptedLetter" type="text" :errors="errors" />

                                <BaseInput label="Tanggal Kepada" name="recipient_date_FAL"
                                    v-model="recipientDateFieldAcceptedLetter" type="date" :errors="errors" />


                                <BaseInput label="Nama" name="name_FAL" type="text" v-model="nameFieldAcceptedLetter"
                                    :disabled="true" required :errors="errors" :errorsValBack="errorsValBack" />
                                <BaseInput label="Nisn/NPM/NIM" name="nisn_npm_nim_FAL" type="text"
                                    v-model="nisnNpmNimFieldAcceptedLetter" :disabled="true" required :errors="errors"
                                    :errorsValBack="errorsValBack" />
                                <BaseInput label="Nama Sekolah/Universitas" name="school_university_name_FAL"
                                    type="text" v-model="schoolUniversityNameFieldAcceptedLetter" :disabled="true"
                                    required :errors="errors" :errorsValBack="errorsValBack" />
                                <BaseInput label="Jurusan Sekolah" name="school_major_FAL" type="text"
                                    v-model="schoolMajorFieldAcceptedLetter" :disabled="true" required :errors="errors"
                                    :errorsValBack="errorsValBack" />
                                <BaseInput label="Fakultas" name="university_faculty_FAL" type="text"
                                    v-model="universityFacultyFieldAcceptedLetter" :disabled="true" required
                                    :errors="errors" :errorsValBack="errorsValBack" />
                                <BaseInput label="Progam Studi" name="university_program_study_FAL" type="text"
                                    v-model="universityProgramStudyFieldAcceptedLetter" :disabled="true" required
                                    :errors="errors" :errorsValBack="errorsValBack" />
                                <BaseInput label="Tanggal Surat" name="date_letter_FAL" type="text"
                                    v-model="dateLetterFieldAcceptedLetter" :disabled="true" required :errors="errors"
                                    :errorsValBack="errorsValBack" />
                                <BaseInput label="Tanggal Mulai Magang" name="start_date_FAL" type="text"
                                    v-model="startDateFieldAcceptedLetter" :disabled="true" required :errors="errors"
                                    :errorsValBack="errorsValBack" />
                                <BaseInput label="Tanggal Selesai Magang" name="end_date_FAL" type="text"
                                    v-model="endDateFieldAcceptedLetter" :disabled="true" required :errors="errors"
                                    :errorsValBack="errorsValBack" />
                            </div>
                            <div class="flex justify-end gap-2 w-full">
                                <Button type="button" variant="red" @click="showFormAcceptedLetterModal = false">
                                    Batal
                                </Button>
                                <Button type="submit" :disabled="loading">
                                    <Icon v-if="loading" name="codex:loader" class="text-xl align-middle" />
                                    <span v-else>Kirim</span>
                                </Button>
                            </div>
                        </Form>
                        <div class="w-full md:w-2/3 max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-hide">
                            <PreviewLetterReceipt :form="formPreview"
                                :formattedTanggalKepada="startDateFieldAcceptedLetter" :scale="zoomScale" />
                        </div>
                    </div>
                </BaseModal>

                <!-- pashprhase -->
                <BaseModal v-model="showFormPassphraseModal" :title="modalPassphraseTitle">
                    <BaseInput label="Passphrase" name="passphrase_FAL" v-model="PassphraseField" type="text" />
                    <div class="flex justify-end gap-2 w-full">
                        <Button type="button" variant="red" @click="showFormPassphraseModal = false">
                            Batal
                        </Button>
                        <Button type="button" @click="continueAcceptedLetterSubmission" :disabled="!PassphraseField">
                            Kirim
                        </Button>
                    </div>
                </BaseModal>

            </div>

            <ConfirmationModal :show="showDeleteModal" :loading="pendingDelete !== null"
                message="Apakah Anda yakin ingin data ini?" @cancel="showDeleteModal = false" />
        </section>
    </NuxtLayout>
</template>

<style scoped>
:deep(.multiselect__select) {
    @apply text-xs w-[22px] h-[22px];
}

:deep(.multiselect__option) {
    @apply text-xs px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200;
}

:deep(.multiselect__option--highlight) {
    @apply bg-gray-100 dark:bg-gray-700;
}

:deep(.multiselect__single) {
    @apply text-xs;
}

:deep(.multiselect__input) {
    @apply text-xs py-1;
}

:deep(.multiselect__placeholder) {
    @apply mb-0 text-xs;
}

:deep(.multiselect__tags) {
    @apply py-0.5 px-2 text-xs min-h-0;
}

:deep(.multiselect) {
    @apply min-h-0 text-xs;
}

:deep(.multiselect__element) {
    @apply p-0 m-0;
}
</style>

<!-- <div class="mb-2">
                                        <label class="font-semibold">Zoom:</label>
                                        <input type="range" min="0.5" max="1.5" step="0.1" v-model="zoomScale" />
                                        </div> -->