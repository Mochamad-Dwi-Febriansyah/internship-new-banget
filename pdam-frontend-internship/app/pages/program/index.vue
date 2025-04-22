<script setup lang="ts">
import { useNotification } from '~~/stores/notification'
import { toTypedSchema } from '@vee-validate/yup'
import { object, string, date, mixed, number, ref as yupRef } from 'yup'
const { createApplication, errors, loading } = useApplications();
const { addNotification } = useNotification()

const internships = ref([
    {
        title: "Magang Frontend Developer",
        company: "Tech Corp",
        description: "Kami mencari magang Frontend Developer yang mahir menggunakan Vue.js dan React.",
        location: "Jakarta, Indonesia",
        link: "/"
    },
    {
        title: "Magang Backend Developer",
        company: "Innovate Inc.",
        description: "Kami mencari magang Backend Developer yang memahami Node.js dan Express .",
        location: "Bandung, Indonesia",
        link: "/"
    },
    {
        title: "Magang UI/UX Designer",
        company: "DesignStudio",
        description: "Kami mencari magang UI/UX Designer untuk membantu mendesain antarmuka pengguna.",
        location: "Surabaya, Indonesia",
        link: "/"
    },
    {
        title: "Magang UI/UX Designer",
        company: "DesignStudio",
        description: "Kami mencari magang UI/UX Designer untuk membantu mendesain antarmuka pengguna.",
        location: "Surabaya, Indonesia",
        link: "/"
    }
]);


// step form
const steps = [
    { title: 'Informasi Pribadi' },
    { title: 'Informasi Sekolah/Universitas' },
    { title: 'Informasi Berkas' },
];

const currentStep = ref(0);

function prevStep() {
    if (currentStep.value <= 0) {
        return;
    }

    currentStep.value--;
}
const handleFileUpload = (event: Event, handleChange: (value: File | null) => void): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  handleChange(file);
};
const validationSchema = [
    object({
        nisn_npm_nim: string().required('NISN / NIM wajib diisi'),
        date_of_birth: date()
            .typeError('Tanggal lahir tidak valid')
            .required('Tanggal lahir wajib diisi')
            .max(new Date(), 'Tanggal lahir tidak boleh di masa depan'),
        name: string().required('Nama depan wajib diisi'), 
        gender: string().oneOf(['male', 'female'], 'Pilih jenis kelamin yang valid').required('Jenis kelamin wajib diisi'),
        role: string().oneOf(['intern', 'researcher'], 'Pilih jenis program yang valid').required('Jenis program wajib diisi'),
        phone_number: string().matches(/^[0-9]+$/, 'Nomor HP hanya boleh berisi angka').required('Nomor HP wajib diisi'),
        address: string().required('Alamat wajib diisi'),
        province: string().required('Provinsi wajib diisi'),
        city: string().required('Kabupaten/Kota wajib diisi'),
        district: string().required('Kecamatan wajib diisi'),
        village: string().required('Kelurahan/Desa wajib diisi'),
        // kode_pos: string().matches(/^[0-9]+$/, 'Kode Pos hanya boleh berisi angka').required('Kode Pos wajib diisi'),
        email: string().email('Format email tidak valid').required('Email wajib diisi'),
        //password: string().required('Password wajib diisi').min(6, 'Password minimal 6 karakter'),
    }),
    object({
        school_university_name: string().required("Nama sekolah/universitas wajib diisi"),
        school_university_email: string().required("Email sekolah/universitas wajib diisi").email("Format email tidak valid"),
        school_major: string(),
        university_faculty: string(),
        university_program_study: string(),
        school_university_address: string().required("Alamat sekolah/universitas wajib diisi"),
        // school_university_postal_code: string().matches(/^\d{5}$/, "Kode pos harus 5 digit angka").required("Kode pos wajib diisi"),
        school_university_province: string().required("Provinsi wajib diisi"),
        school_university_city: string().required("Kabupaten/Kota wajib diisi"),
        school_university_district: string().required("Kecamatan wajib diisi"),
        school_university_village: string().required("Kelurahan Desa wajib diisi"),
        school_university_phone_number: string().matches(/^\d+$/, "Nomor telepon hanya boleh mengandung angka").min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit").required("Nomor telepon wajib diisi"),
    }),
    object({
        identity_photo:
            mixed()
                .required("Foto identitas wajib diunggah")
                .test("fileFormat", "Format file harus JPG, PNG, atau PDF", (value: any) => {
                    return value instanceof File && ["image/jpeg", "image/png", "application/pdf"].includes(value.type);
                })
                .test("fileSize", "Ukuran file maksimal 2MB", (value: any) => {
                    return value instanceof File && value.size <= 2 * 1024 * 1024;
                }),

        application_letter:
            mixed()
                .required("Surat permohonan wajib diunggah")
                .test("fileFormat", "Format file harus JPG, PNG, atau PDF", (value: any) => {
                    return value instanceof File && ["image/jpeg", "image/png", "application/pdf"].includes(value.type);
                })
                .test("fileSize", "Ukuran file maksimal 2MB", (value: any) => {
                    return value instanceof File && value.size <= 2 * 1024 * 1024;
                }),
    }),
];

const currentSchema = computed(() => {
    return validationSchema[currentStep.value];
});

const nextStep = async (values: any, { resetForm }: { resetForm: () => void }) => {
    try {
        const formValues = values // Paksa tipe ke InternshipForm
        const formData = new FormData();

        // Konversi object ke FormData
        Object.entries(formValues).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value as string | Blob); // Handle file upload jika ada
            }
        });
        // 🚀 Override ID Wilayah dengan Nama Wilayah untuk Alamat Pribadi  
        if (selectedProvince.value) {
            formData.set("province", selectedProvince.value.name);
        }
        if (selectedDistrict.value) {
            formData.set("city", selectedDistrict.value.name);
        }
        if (selectedSubdistrict.value) {
            formData.set("district", selectedSubdistrict.value.name);
        }
        if (villages.value.length > 0) {
            const selectedVillage = villages.value.find(v => v.code === formValues.kelurahan_desa);
            if (selectedVillage) {
                formData.set("village", selectedVillage.name);
                formData.set("postal_code", selectedVillage.postal_code);
            }
        }

        // 🚀 Override ID Wilayah dengan Nama Wilayah untuk Alamat Sekolah/Universitas  
        if (selectedSchoolProvince.value) {
            formData.set("school_university_province", selectedSchoolProvince.value.name);
        }
        if (selectedSchoolDistrict.value) {
            formData.set("school_university_city", selectedSchoolDistrict.value.name);
        }
        if (selectedSchoolSubdistrict.value) {
            formData.set("school_university_district", selectedSchoolSubdistrict.value.name);
        }
        if (schoolVillages.value.length > 0) {
            const selectedSchoolVillage = schoolVillages.value.find(v => v.code === formValues.school_university_village);
            if (selectedSchoolVillage) {
                formData.set("school_university_village", selectedSchoolVillage.name);
                formData.set("school_university_postal_code", selectedSchoolVillage.postal_code);
            }
        }
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
        if (currentStep.value === 2) {
            // console.log('Step:', currentStep.value);

            await createApplication(formData);

            // console.log('Done:', JSON.stringify(formValues, null, 2));
            resetForm();
            //   showForm.value = false
            currentStep.value = 0;
            addNotification('success', 'Pengajuan berkas berhasil dikirim!');
            addNotification('info', 'Silahkan cek email untuk mendapatkan nomor registrasi!', 10000);

            return;
        }

        currentStep.value++;
    } catch (error: any) {
        // console.error('Gagal mengajukan berkas:', (error as Error).message); 
        addNotification('error', error.data.message);
        const errorFields = Object.keys(error.data.errors).join(', ')
        addNotification('error', `Validasi gagal pada: ${errorFields}`)
    }
};


// select alamat

const { province, getRegenciesByProvince, getDistrictByRegencies, getVillagesByDistrict } = useRegionIndonesia()
const selectedProvince = ref<{ code: string; name: string } | null>(null)
const selectedDistrict = ref<{ code: string; name: string } | null>(null)
const selectedSubdistrict = ref<{ code: string; name: string } | null>(null)

const districts = ref<{ code: string; name: string }[]>([])
const subdistricts = ref<{ code: string; name: string }[]>([])
const villages = ref<{ code: string; name: string, postal_code: string }[]>([])

const selectedSchoolProvince = ref<{ code: string; name: string } | null>(null)
const selectedSchoolDistrict = ref<{ code: string; name: string } | null>(null)
const selectedSchoolSubdistrict = ref<{ code: string; name: string } | null>(null)

const schoolDistricts = ref<{ code: string; name: string }[]>([])
const schoolSubdistricts = ref<{ code: string; name: string }[]>([])
const schoolVillages = ref<{ code: string; name: string, postal_code: string }[]>([])

const getDistrict = async (event: Event, type: 'identity' | 'school') => {
    const selectedId = (event.target as HTMLSelectElement).value
    const selectedData = Array.isArray(province.value.data) ? province.value.data.find((q: any) => q.code === selectedId) : null
    if (!selectedData) return

    if (type === 'identity') {
        selectedProvince.value = { code: selectedData.code, name: selectedData.name }
    } else {
        selectedSchoolProvince.value = { code: selectedData.code, name: selectedData.name }
    }

    try {
        const response = await getRegenciesByProvince(selectedId)
        if (type === 'identity') {
            districts.value = response.data
            subdistricts.value = []
            villages.value = []
        } else {
            schoolDistricts.value = response.data
            schoolSubdistricts.value = []
            schoolVillages.value = []
        }
    } catch (error) {
        console.error(`Gagal mengambil kota/kabupaten (${type}):`, error)
    }
}

const getSubdistricts = async (event: Event, type: 'identity' | 'school') => {
    const selectedId = (event.target as HTMLSelectElement).value
    const selectedData = (type === 'identity' ? districts.value : schoolDistricts.value).find(q => q.code === selectedId) || null
    if (!selectedData) return

    if (type === 'identity') {
        selectedDistrict.value = { code: selectedData.code, name: selectedData.name }
    } else {
        selectedSchoolDistrict.value = { code: selectedData.code, name: selectedData.name }
    }

    try {
        const response = await getDistrictByRegencies(selectedId)
        if (type === 'identity') {
            subdistricts.value = response.data
            villages.value = []
        } else {
            schoolSubdistricts.value = response.data
            schoolVillages.value = []
        }
    } catch (error) {
        console.error(`Gagal mengambil Kecamatan (${type}):`, error)
    }
}

const getVillages = async (event: Event, type: 'identity' | 'school') => {
    const selectedId = (event.target as HTMLSelectElement).value
    const selectedData = (type === 'identity' ? subdistricts.value : schoolSubdistricts.value).find(q => q.code === selectedId) || null
    if (!selectedData) return

    if (type === 'identity') {
        selectedSubdistrict.value = { code: selectedData.code, name: selectedData.name }
    } else {
        selectedSchoolSubdistrict.value = { code: selectedData.code, name: selectedData.name }
    }

    try {
        const response = await getVillagesByDistrict(selectedId)
        if (type === 'identity') {
            villages.value = response.data
        } else {
            schoolVillages.value = response.data
        }
    } catch (error) {
        console.error(`Gagal mengambil Desa/Kelurahan (${type}):`, error)
    }
}


</script>

<template>
    <NuxtLayout>
        <section class="bg-white dark:bg-gray-900 py-16">
            <div class="px-4 mx-auto max-w-screen-xl text-center">
                <h1
                    class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                    Jelajahi peluang magang & kerja
                </h1>
                <p class="mb-8 text-lg font-normal text-gray-500 lg:text-2xl sm:px-16 lg:px-48 dark:text-gray-400">
                    Dengan Budaya Kerja "Hebat" Satria Surya Sembada siap mewujudkan Air Sehat Untuk Masyarakat.
                </p>
                <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                    <a href="#"
                        class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                        Mulai Sekarang
                        <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </a>
                    <a href="#"
                        class="py-3 px-5 sm:ms-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                        Selengkapnya
                    </a>
                </div>
            </div>
        </section>

        <section class="bg-gray-50 dark:bg-gray-900 py-16">
            <div id="internships" class="container lg:px-16">
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-12 text-center">
                    Kategori Berdasarkan Program Magang
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="internship in internships" :key="internship.title"
                        class="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm flex flex-col h-full hover:shadow-md">
                        <div class="flex-1">
                            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                {{ internship.title }}
                            </h2>
                            <p class="text-gray-600 dark:text-gray-400 text-sm">
                                {{ internship.company }}
                            </p>
                            <p class="text-gray-500 dark:text-gray-300 mt-2">
                                {{ internship.description }}
                            </p>
                            <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                {{ internship.location }}
                            </p>
                        </div>
                        <!-- Bagian Icon Tetap di Bawah -->
                        <div class="flex justify-end items-end mt-4">
                            <NuxtLink
                                class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline cursor-pointer">
                                <Icon name="material-symbols:arrow-forward-rounded" class="w-6 h-6" />
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="py-16 bg-gray-50 dark:bg-gray-900">
            <div id="galeri" class="container lg:px-16">
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-12 text-center">
                    Galeri Program Magang
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="grid gap-4">
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg" alt="">
                        </div>
                    </div>
                    <div class="grid gap-4">
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-5.jpg" alt="">
                        </div>
                    </div>
                    <div class="grid gap-4">
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-6.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-7.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-8.jpg" alt="">
                        </div>
                    </div>
                    <div class="grid gap-4">
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-9.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-10.jpg" alt="">
                        </div>
                        <div>
                            <img class="h-auto max-w-full rounded-lg dark:border dark:border-gray-700"
                                src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-11.jpg" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="bg-gray-50 dark:bg-gray-900 py-16">
            <div id="process" class="container lg:px-16">
                <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-12 text-center">
                    Alur Proses Magang
                </h2>

                <div class="space-y-6">
                    <div class="flex items-start">
                        <div
                            class="w-8 h-8 p-4 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4">
                            1
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Daftar Magang</h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Kirimkan aplikasi Anda melalui form pendaftaran yang ada di setiap detail magang yang
                                tersedia.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start">
                        <div
                            class="w-8 h-8 p-4 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4">
                            2
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Seleksi Berkas</h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Tim kami akan meninjau berkas Anda dan memutuskan siapa yang akan lanjut ke tahap
                                selanjutnya.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start">
                        <div
                            class="w-8 h-8 p-4 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4">
                            3
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Wawancara</h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Jika berkas Anda lolos seleksi, Anda akan diundang untuk wawancara baik secara online
                                maupun tatap muka.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start">
                        <div
                            class="w-8 h-8 p-4 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4">
                            4
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Penawaran Magang</h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Setelah wawancara, kami akan memberikan penawaran magang jika Anda berhasil diterima.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start">
                        <div
                            class="w-8 h-8 p-4 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mr-4">
                            5
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Mulai Magang</h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Setelah diterima, Anda akan mulai magang sesuai jadwal yang telah disepakati dengan
                                perusahaan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="bg-gray-50  dark:bg-gray-900 py-16">
            <!-- <section v-if="showForm" id="apply-internship" class="py-12 "> -->
            <div id="apply-internship" class="container lg:px-16">
                <h2 class="text-3xl font-bold text-gray-800 mb-12 dark:text-white">Daftar Magang</h2>

                <div class="flex flex-col">

                    <div class="mb-6 pb-3 border-b border-gray-200 ">
                        <ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse">
                            <li v-for="(data, index) in steps" :key="data.title"
                                class="flex items-center space-x-2.5 rtl:space-x-reverse " :class="{
                                    'text-blue-600 dark:text-blue-500': currentStep === index,
                                    'text-gray-500 dark:text-gray-400': currentStep !== index,
                                }">
                                <span
                                    class="flex items-center justify-center w-8 h-8 border  rounded-full shrink-0 border-blue-600 dark:border-blue-500"
                                    :class="{
                                        'border-blue-500 dark:border-blue-500': currentStep === index,
                                        'border-gray-500 dark:border-gray-500': currentStep !== index,
                                    }">
                                    {{ index + 1 }}
                                </span>
                                <span>
                                    <h3 class="font-medium leading-tight">{{ data.title }}</h3>
                                    <p class="text-sm">Detail langkah di sini</p>
                                </span>
                            </li>
                        </ol>
                    </div>

                    <Form @submit="nextStep" :validation-schema="currentSchema" keep-values>
                        <div v-if="currentStep === 0">
                            <div class="grid gap-6 mb-6 md:grid-cols-3">
                                <BaseInput label="Nama Depan" name="name" type="text"
                                    placeholder="Masukan nama depan" required /> 
                                <BaseInput label="NISN/NPM/NIM" name="nisn_npm_nim" type="text"
                                    placeholder="A1124000" required />
                                <BaseSelect label="Jenis Program" name="role" :options="[
                                    { value: 'intern', text: 'Magang' },
                                    { value: 'researcher', text: 'Penelitian' }
                                    ]" required />
                            </div>
                            <div class="grid gap-6 mb-6 md:grid-cols-3">
                                <BaseInput label="Tanggal Lahir" name="date_of_birth" type="date" required />
                                <BaseSelect label="Jenis Kelamin" name="gender" :options="[
                                    { value: 'male', text: 'Laki-laki' },
                                    { value: 'female', text: 'Perempuan' }
                                ]" required />
                                <BaseInput label="Nomor HP" name="phone_number" type="number" placeholder="123-45-678"
                                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" required />
                            </div>
                            <div class="grid gap-6 mb-6 md:grid-cols-3">
                                <BaseInput label="Email" name="email" type="email" placeholder="xx@xx.xx" required />
                                <!-- <BaseInput label="Password" name="password" type="password" :showToggle="true"
                                    required />
                                <BaseInput label="Konfirmasi Password" name="confirm_password" type="password"
                                    :showToggle="true" required /> -->
                            </div>

                            <div class="grid grid-cols-1  mb-6 md:grid-cols-3 gap-4 mt-4">
                                <BaseInput label="Alamat" name="address" type="text" placeholder="Jl xxx no. xx"
                                    :errors="errors" required />
                                <!-- belum berhasil di component reusable       -->
                                <div>
                                    <label for="province"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Provinsi
                                        <span class="text-red-500">*</span></label>
                                    <Field as="select" name="province" id="province"
                                        @change="(event: any) => getDistrict(event, 'identity')"
                                        class=" p-2.5 w-full border rounded-md">
                                        <option value="" disabled selected>Pilih Provinsi</option>
                                        <option v-for="data in province.data" :key="data.code" :value="data.code">{{
                                            data.name }}</option>
                                    </Field>
                                    <ErrorMessage name="province" class="text-red-500 text-sm" />
                                    <p v-if="errors.province" class="text-red-500 text-sm">{{ errors.province[0] }}</p>
                                </div>
                                <div>
                                    <label for="city"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kabupaten/Kota
                                        <span class="text-red-500">*</span></label>
                                    <Field as="select" name="city" id="city"
                                        @change="(event: any) => getSubdistricts(event, 'identity')"
                                        class=" p-2.5 w-full border rounded-md" :disabled="!districts.length">
                                        <option value="" disabled selected>Pilih kabupaten/Kota</option>
                                        <option v-for="data in districts" :key="data.code" :value="data.code">{{
                                            data.name }}</option>
                                    </Field>
                                    <ErrorMessage name="city" class="text-red-500 text-sm" />
                                    <p v-if="errors.city" class="text-red-500 text-sm">{{
                                        errors.city[0] }}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1  mb-6 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label for="district"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kecamatan<span
                                            class="text-red-500">*</span></label>
                                    <Field as="select" name="district" id="district"
                                        class=" p-2.5 w-full border rounded-md" :disabled="!subdistricts.length"
                                        @change="(event: any) => getVillages(event, 'identity')">
                                        <option value="" disabled selected>Pilih Kecamatan</option>
                                        <option v-for="data in subdistricts" :key="data.code" :value="data.code">
                                            {{ data.name }}
                                        </option>
                                    </Field>
                                    <ErrorMessage name="district" class="text-red-500 text-sm" />
                                    <p v-if="errors.district" class="text-red-500 text-sm">{{ errors.district[0] }}
                                    </p>
                                </div>
                                <div>
                                    <label for="village"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kelurahan/Desa<span
                                            class="text-red-500">*</span></label>
                                    <Field as="select" name="village" id="village"
                                        class=" p-2.5 w-full border rounded-md" :disabled="!villages.length">
                                        <option value="" disabled selected>Pilih Desa/Kelurahan</option>
                                        <option v-for="data in villages" :key="data.code" :value="data.code">
                                            {{ data.name }}
                                        </option>
                                    </Field>
                                    <ErrorMessage name="village" class="text-red-500 text-sm" />
                                    <p v-if="errors.village" class="text-red-500 text-sm">{{
                                        errors.village[0] }}</p>
                                </div>

                            </div>

                        </div>

                        <div v-if="currentStep === 1">
                            <div class="grid gap-6 mb-6 md:grid-cols-3">
                                <BaseInput label="Nama Sekolah/Universitas" name="school_university_name" type="text"
                                    placeholder="Masukan nama sekolah/universitas" required />
                                <BaseInput label="Email Sekolah/Universitas" name="school_university_email"
                                    type="text" placeholder="Masukan email sekolah/universitas" required />
                                <BaseInput label="Nomor Telepon Sekolah/Universitas"
                                    name="school_university_phone_number" type="text"
                                    placeholder="Masukan nomor telepon sekolah/universitas" required />
                            </div>

                            <div class="grid gap-6 mb-6 md:grid-cols-2">
                                <div>
                                    <p class="text-sm font-medium text-gray-500 text-right dark:text-white">Jika dari
                                        sekolah</p>
                                    <BaseInput label="Jurusan Sekolah" name="school_major" type="text"
                                        placeholder="Masukan jurusan sekolah" />
                                </div>
                                <div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-500 text-right dark:text-white">Jika
                                            dari Universitas
                                        </p>
                                    </div>
                                    <div class="flex flex-col gap-6">
                                        <BaseInput label="Fakultas" name="university_faculty" type="text"
                                            placeholder="Masukan fakultas" />
                                        <BaseInput label="Program Studi" name="university_program_study" type="text"
                                            placeholder="Masukan program studi" />
                                    </div>
                                </div>
                            </div>
                            <div class="grid grid-cols-1  mb-6 md:grid-cols-3 gap-4 mt-4">
                                <BaseInput label="Alamat sekolah universitas" name="school_university_address"
                                    type="text" placeholder="Masukan alamat sekolah/universitas" :errors="errors"
                                    required />
                                <div>
                                    <label for="school_university_province"
                                        class="block text-sm font-medium text-gray-700 dark:text-white">Provinsi
                                        <span class="text-red-500">*</span></label>
                                    <Field as="select" name="school_university_province"
                                        id="school_university_province"
                                        @change="(event: any) => getDistrict(event, 'school')"
                                        class="mt-1 p-2 w-full border rounded-md">
                                        <option value="" disabled selected>Pilih Provinsi</option>
                                        <option v-for="data in province.data" :key="data.code" :value="data.code">{{
                                            data.name }}</option>
                                    </Field>
                                    <ErrorMessage name="school_university_province" class="text-red-500 text-sm" />
                                    <p v-if="errors.school_university_province" class="text-red-500 text-sm">{{
                                        errors.school_university_province[0] }}</p>
                                </div>
                                <div>
                                    <label for="school_university_city"
                                        class="block text-sm font-medium text-gray-700 dark:text-white">Kabupaten/Kota <span
                                            class="text-red-500">*</span></label>
                                    <Field as="select" name="school_university_city"
                                        id="school_university_city"
                                        @change="(event: any) => getSubdistricts(event, 'school')"
                                        class="mt-1 p-2 w-full border rounded-md" :disabled="!schoolDistricts.length">
                                        <option value="" disabled selected>Pilih kabupaten/Kota</option>
                                        <option v-for="data in schoolDistricts" :key="data.code" :value="data.code">{{
                                            data.name }}</option>
                                    </Field>
                                    <ErrorMessage name="school_university_city"
                                        class="text-red-500 text-sm" />
                                    <p v-if="errors.school_university_city" class="text-red-500 text-sm">{{
                                        errors.school_university_city[0] }}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1  mb-6 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label for="school_university_district"
                                        class="block text-sm font-medium text-gray-700 dark:text-white">school_university_district<span
                                            class="text-red-500">*</span></label>
                                    <Field as="select" name="school_university_district"
                                        id="school_university_district" class="mt-1 p-2 w-full border rounded-md"
                                        :disabled="!schoolSubdistricts.length"
                                        @change="(event: any) => getVillages(event, 'school')">
                                        <option value="" disabled selected>Pilih school_university_district</option>
                                        <option v-for="data in schoolSubdistricts" :key="data.code" :value="data.code">
                                            {{ data.name }}
                                        </option>
                                    </Field>
                                    <ErrorMessage name="school_university_district" class="text-red-500 text-sm" />
                                    <p v-if="errors.school_university_district" class="text-red-500 text-sm">{{
                                        errors.school_university_district[0] }}</p>
                                </div>
                                <div>
                                    <label for="school_university_village"
                                        class="block text-sm font-medium text-gray-700 dark:text-white">Kelurahan/Desa<span
                                            class="text-red-500">*</span></label>
                                    <Field as="select" name="school_university_village"
                                        id="school_university_village"
                                        class="mt-1 p-2 w-full border rounded-md" :disabled="!schoolVillages.length">
                                        <option value="" disabled selected>Pilih Desa/Kelurahan</option>
                                        <option v-for="data in schoolVillages" :key="data.code" :value="data.code">
                                            {{ data.name }}
                                        </option>
                                    </Field>
                                    <ErrorMessage name="school_university_village"
                                        class="text-red-500 text-sm" />
                                    <p v-if="errors.school_university_village" class="text-red-500 text-sm">{{
                                        errors.school_university_village[0] }}</p>
                                </div>

                            </div>
                        </div>

                        <div v-if="currentStep === 2">
                            <div class="grid gap-6 mb-6 md:grid-cols-2">
                                <div>
                                    <label for="identity_photo"
                                        class="block text-sm font-medium text-gray-700 dark:text-white">
                                        Foto Identitas (KTP/SIM/Kartu Pelajar)
                                    </label>
                                    <Field name="identity_photo" v-slot="{ handleChange }">
                                        <input type="file" id="identity_photo" @change="handleFileUpload($event, handleChange)"
                                        class="mt-1 p-2 w-full border rounded-md" />
                                        <ErrorMessage name="identity_photo" class="text-red-500 text-sm" />
                                        <p v-if="errors.identity_photo" class="text-red-500 text-sm">{{ errors.identity_photo[0] }}</p>
                                    </Field> 
                                </div>
                                <div>
                                    <label for="application_letter"
                                        class="block text-sm font-medium text-gray-700 dark:text-white">
                                        Surat Permohonan Magang
                                    </label>
                                    <Field name="application_letter" v-slot="{ handleChange }">
                                        <input type="file" id="application_letter" @change="handleFileUpload($event, handleChange)"
                                        class="mt-1 p-2 w-full border rounded-md" />
                                        <ErrorMessage name="application_letter" class="text-red-500 text-sm" />
                                        <p v-if="errors.application_letter" class="text-red-500 text-sm">{{ errors.application_letter[0] }}
                                        </p>
                                    </Field>
                                </div>
                            </div>
                            <div class="grid gap-6 mb-6 md:grid-cols-2">
                                <BaseInput label="Tanggal mulai" name="start_date" type="date" required />
                                <BaseInput label="Tanggal selesai" name="end_date" type="date" required />
                            </div>
                        </div>

                        <!-- <Button type="submit">Selanjutnya</Button> -->

                        <div class="flex mb-6 justify-between">
                            <Button v-if="currentStep !== 0" @click="prevStep" type="button" variant="gray">
                                Kembali
                            </Button>

                            <Button v-if="currentStep !== 2" type="submit">Selanjutnya</Button>

                            <Button v-if="currentStep === 2" type="submit">
                                <Icon v-if="loading" name="codex:loader" class="text-xl align-middle"/>
                                <span v-else>Kirim</span> 
                            </Button> 
                        </div>

                    </Form>

                </div>
            </div>
            <!-- </section> -->
        </section>

    </NuxtLayout>
</template>


<style scoped></style>