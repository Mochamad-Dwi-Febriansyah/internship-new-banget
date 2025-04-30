<script setup lang="ts">
definePageMeta({
    layout: 'dashboard',
    middleware: ['auth'],
    //   middleware: ['pemission', 'auth'],
    //   permission: 'pdamintern.assessment-aspects.view', // <-- contoh penggunaan permission
})

import type { ApiResponse, ApiResponseSingle, PaginationMeta } from '~~/types/types'
import { useNotification } from '~~/stores/notification'
import { statusLabel } from '~~/utils/statusLabel'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'
import { object, string } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { formatDateID } from '~~/utils/date'

const { addNotification } = useNotification()

const breadcrumb = [
    { label: "Profile", icon: "material-symbols:person", to: "/profile" }
]

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const { can, fetchUser, permissions } = useAuth()
const { update, loading } = useUsers()

const showDocumentDetail = ref(false)
const showUserDetail = ref(false)
const showSekolahDetail = ref(false)


// fetch user me
const me = ref()

const fetchUserMe = async () => {
    try {
        pending.value = true
        const response = await fetchUser()

        me.value = response.data ?? null

    } catch (error) {
        console.error('Gagal mengambil data aplikassi:', error)
    } finally {
        pending.value = false
    }
}
const { accessToken } = useAuth()
watch([() => accessToken.value, () => route.query.page], () => {
    fetchUserMe()  // fetch ulang saat accessToken atau page berubah
}, { immediate: true })

// update photo
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

const pendingUpdateFotoProfile = ref(false)

const handleFileUpload = async (event: any) => {
    console.log(event.target.files[0])
    pendingUpdateFotoProfile.value = true
    const file = event.target.files[0]
    try {
        if (file) {
            const formData = new FormData()
            formData.append("_method", "PUT")
            formData.append('photo', file)
            const response = await update(me.value.id, formData)
            console.log(response)
            // addNotification('success', response?.data?.value?.message || "Berhasil menghapus ");
            fetchUserMe()
        }
    } catch (error: any) {
        console.log(error.message)
        addNotification('success', error.data.message);
    } finally {
        pendingUpdateFotoProfile.value = false
    }
}
</script>

<template>
    <NuxtLayout>
        <Breadcrumb :items="breadcrumb" />
        <section class="mb-3">
            <LoadingBar v-if="pending" />
            <div v-else class="p-3">
                <div class="flex flex-col items-start md:flex-row gap-3">
                    <div
                        class="w-full md:w-1/3  min-w-[300px]   bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div class="flex justify-end px-4 pt-4">
                            <button id="dropdownButton" data-dropdown-toggle="dropdown"
                                class="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
                                type="button">
                                <span class="sr-only">Open dropdown</span>
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor" viewBox="0 0 16 3">
                                    <path
                                        d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                                </svg>
                            </button>
                            <!-- Dropdown menu -->
                            <div id="dropdown"
                                class="z-10 hidden text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
                                <ul class="py-2" aria-labelledby="dropdownButton">
                                    <li>
                                        <a href="#"
                                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Edit</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Export
                                            Data</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div v-if="me" class="flex flex-col items-center pb-10">
                            <div class="relative">
                                <div v-if="pendingUpdateFotoProfile"
                                    class="absolute w-24 h-24 inset-0 flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full z-10">
                                    <Icon name="codex:loader" class="w-4 h-4 " />
                                </div>
                                <NuxtImg :src="me.photo
                                    ? `${config.public.storage}/storage/${me.photo}`
                                    : 'https://rotendaokab.go.id/wp-content/uploads/2016/08/dummy-prod-1.jpg'"
                                    class="w-24 h-24 mb-3 rounded-full shadow-lg cursor-pointer hover:border-2"
                                    alt="Foto Identitas" format="webp" loading="lazy" @click="triggerFileInput" />
                                <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" />
                            </div>

                            <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">{{
                                me.name }}</h5>
                            <span class="mb-2 text-sm text-gray-500 dark:text-gray-400">{{ me.email
                                }}</span>
                            <span
                                class="px-3 mb-2  text-xs w-fit font-semibold rounded-md  bg-yellow-100  border border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                {{ me.role === 'intern' ? 'Magang' : 'Penelitian' }}
                            </span>
                            <span v-if="me.role === 'intern' || me.role === 'researcher'"
                                class="px-3  text-center text-xs w-fit font-semibold rounded-md  bg-yellow-100  border border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                Mentor <br>{{ me.document.mentor_name }} <br> {{ me.document.mentor_id }} </span>

                        </div>
                    </div>
                    <div v-if="me"
                        class="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div class="mt-4">
                            <button @click="showUserDetail = !showUserDetail"
                                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <Icon :name="showUserDetail ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
                                Detail  {{ me.role === 'intern' ? 'Magang' : 'Penelitian' }}
                            </button>
                            <div v-if="showUserDetail" class="mt-6 space-y-4">
                                <DetailRow label="Nama">{{ me.name }}</DetailRow>
                                <DetailRow label="Email">{{ me.email }}</DetailRow>
                                <DetailRow label="NISN/NPM/NIM">{{ me.nisn_npm_nim }}</DetailRow>
                                <DetailRow label="Tanggal Lahir">{{ formatDateID(me.date_of_birth) }}</DetailRow>
                                <DetailRow label="Jenis Kelamin">{{ me.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                                </DetailRow>
                                <DetailRow label="No. Telepon">{{ me.phone_number }}</DetailRow>
                                <DetailRow label="Alamat">{{ me.address }}</DetailRow>
                                <DetailRow label="Kode Pos">{{ me.postal_code }}</DetailRow>
                                <DetailRow label="Provinsi">{{ me.province }}</DetailRow>
                                <DetailRow label="Kota">{{ me.city }}</DetailRow>
                                <DetailRow label="Kecamatan">{{ me.district }}</DetailRow>
                                <DetailRow label="Desa/Kelurahan">{{ me.village }}</DetailRow>
                                <DetailRow label="Status">{{ me.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
                                </DetailRow>
                                <DetailRow label="Role">{{ me.role }}</DetailRow>
                            </div>
                        </div>

                        <div class="mt-4">
                            <button @click="showSekolahDetail = !showSekolahDetail"
                                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <Icon :name="showSekolahDetail ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
                                Detail {{ me.document.school_uni.school_major ? 'Sekolah' : 'Universitas' }} 
                            </button>
                            <div v-if="showSekolahDetail" class="mt-6 space-y-4">
                                <DetailRow label="Nama">{{ me.document.school_uni.school_university_name }}</DetailRow>

                                <template v-if="me.document.school_uni.school_major">
                                    <DetailRow label="Jurusan">{{ me.document.school_uni.school_major }}</DetailRow>
                                </template>
                                <template v-else>
                                    <DetailRow label="Fakultas">{{ me.document.school_uni.university_faculty }}
                                    </DetailRow>
                                    <DetailRow label="Program Studi">{{ me.document.school_uni.university_program_study
                                        }}</DetailRow>
                                </template>


                                <DetailRow label="Alamat">{{ me.document.school_uni.school_university_address }}
                                </DetailRow>
                                <DetailRow label="Kode Pos">{{ me.document.school_uni.school_university_postal_code }}
                                </DetailRow>
                                <DetailRow label="Provinsi">{{ me.document.school_uni.school_university_province }}
                                </DetailRow>
                                <DetailRow label="Kota">{{ me.document.school_uni.school_university_city }}</DetailRow>
                                <DetailRow label="Kecamatan">{{ me.document.school_uni.school_university_district }}
                                </DetailRow>
                                <DetailRow label="Desa/Kelurahan">{{ me.document.school_uni.school_university_village }}
                                </DetailRow>
                            </div>
                        </div>

                        <!-- Tambahkan setelah detail profil (di bawah div DetailRow) -->
                        <div class="mt-4">
                            <button @click="showDocumentDetail = !showDocumentDetail"
                                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <Icon :name="showDocumentDetail ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
                                Detail Berkas
                            </button>

                            <div v-if="showDocumentDetail" class="mt-6 space-y-4">
                                <DetailRow label="No Registrasi">{{ me.document.registration_number }}</DetailRow>
                                <DetailRow label="Status Dokumen">{{ statusLabel(me.document.document_status) }}
                                </DetailRow>
                                <DetailRow label="Tanggal Mulai">{{ formatDateID(me.document.start_date) }}</DetailRow>
                                <DetailRow label="Tanggal Selesai">{{ formatDateID(me.document.end_date) }}</DetailRow>
                                <DetailRow label="Lampiran Dokumen">
                                    <a :href="`${config.public.storage}/storage/${me.document.identity_photo}`"
                                        target="_blank" class="text-blue-600 underline text-sm">Foto Identitas</a>
                                    <br>
                                    <a :href="`${config.public.storage}/storage/${me.document.application_letter}`"
                                        target="_blank" class="text-blue-600 underline text-sm">Surat Pengantar</a>
                                    <br>
                                    <a :href="`${config.public.storage}/storage/${me.document.accepted_letter?.path}`"
                                        target="_blank" class="text-blue-600 underline text-sm">Surat Balasan</a>
                                    <br>
                                    <a :href="`${config.public.storage}/storage/${me.document.field_letter?.path}`"
                                        target="_blank" class="text-blue-600 underline text-sm">Surat Bidang</a>
                                    <br>
                                    <a v-if="me.document.work_certificate"
                                        :href="`${config.public.storage}/storage/${me.document.work_certificate?.path}`"
                                        target="_blank" class="text-blue-600 underline text-sm">Sertifikat Kerja</a>
                                </DetailRow>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    </NuxtLayout>
</template>



<style scoped></style>