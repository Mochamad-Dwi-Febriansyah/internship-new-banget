<script setup>
import { formatDateID } from '~~/utils/date';

defineProps({
    form: Object,
    formattedTanggalKepada: String,
    scale: {
        type: Number,
        default: 1, // default tanpa zoom
    },
})

// Ukuran F4 dalam px (96 DPI)
const baseWidth = 794
const baseHeight = 1248
</script>
<template>
    <div class="w-full md:flex justify-center">
        <div class="origin-top-left md:origin-top scale-wrapper" :style="{
            transform: `scale(${scale})`,
            width: `${baseWidth}px`,
            height: `${baseHeight * scale}px`,
        }">
            <div class="border p-4 shadow-md bg-white"
                style="font-family: 'Times New Roman', Times, serif; line-height: 1.6; width: 794px; height: 1248px;">
                <!-- === Kop Surat === -->
                <div class="text-center border-b-4 border-black pb-4 mb-4 relative">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Lambang_Kota_Semarang.png" alt="Logo"
                        class="absolute left-0 top-5 w-20" />
                    <div>
                        <p class="text-md font-bold tracking-widest">PEMERINTAH KOTA SEMARANG</p>
                        <p class="text-2xl font-bold">PERUSAHAAN UMUM DAERAH AIR MINUM</p>
                        <p class="text-2xl font-bold">"TIRTA MOEDAL"</p>
                        <p class="text-md font-bold leading-tight">Alamat: Jl. Kelud Raya Semarang, Kode Pos : 50237</p>
                        <p class="text-md font-bold leading-tight">Telp. (024) 8315514 Fax. 8314078 Email:
                            pdam@pdamkotasmg.co.id</p>
                    </div>
                    <img src="http://localhost:3000/_ipx/w_100&f_webp/images/logo-web-pdam.png" alt="Logo"
                        class="absolute right-0 top-5 w-20" />
                </div>

                <div class="mx-8">
                    <div class="max-w-3xl mx-auto text-justify text-lg leading-relaxed px-8">
                        <div class="text-center my-4">
                            <p class="font-bold border-b border-black inline-block text-sm">
                                SURAT
                                KETERANGAN</p>
                            <p class=" ">Nomor: {{ form.nomor_surat ||
                                '.......' }}</p>
                        </div>

                        <ol class="list-decimal pl-6  ">
                            <li class="mb-4">
                                <p class="indent-8 mb-4">Yang bertanda tangan di bawah ini:
                                </p>
                                <div class="pl-8">
                                    <table width="100%" cellspacing="0" cellpadding="5" border="0">
                                        <tbody>
                                            <tr>
                                                <td class="pb-0 p-0 tracking-[0.2em] " width="25%">Nama</td>
                                                <td class="pb-0  p-0">:</td>
                                                <td class="pb-0  p-0">{{
                                                    form.ttdNama }}</td>
                                            </tr>
                                            <tr>
                                                <td class="pb-0 p-0 tracking-[0.2em] ">NPP
                                                </td>
                                                <td class="pb-0  p-0">:</td>
                                                <td class="pb-0  p-0">{{
                                                    form.ttdNpp }}</td>
                                            </tr>
                                            <tr>
                                                <td class="pb-0  p-0">Pangkat / Gol.</td>
                                                <td class="pb-0  p-0">:</td>
                                                <td class="pb-0  p-0">{{
                                                    form.ttdGol }}</td>
                                            </tr>
                                            <tr>
                                                <td class="pb-0  p-0">Jabatan</td>
                                                <td class="pb-0  p-0">:</td>
                                                <td class="pb-0  p-0">Kepala Bagian
                                                    Kepegawaian
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </li>
                            <li class="mb-4">
                                <p class="indent-8 mb-4">Dengan ini menerangkan bahwa:</p>
                                <div class="pl-8 mb-4">
                                    <table width="100%" cellspacing="0" cellpadding="5" class="align-top" border="0">
                                        <tbody>
                                            <tr>
                                                <td class="pb-0 p-0 tracking-[0.2em] " width="25%">Nama</td>
                                                <td class="pb-0 p-0">:</td>
                                                <td class="pb-0 p-0">{{
                                                    form.name
                                                }}</td>
                                            </tr>
                                            <tr>
                                                <td class="pb-0 p-0 tracking-[0.2em] "> {{ form.school_majoor ? 'NISN' :
                                                    'NIM' }}
                                                </td>
                                                <td class="pb-0 p-0">:</td>
                                                <td class="pb-0 p-0">{{
                                                    form.nisn_npm_nim }}
                                                </td>
                                            </tr>

                                            <tr v-if="form.school_majoor">
                                                <td class="pb-0 p-0">Jurusan</td>
                                                <td class="pb-0 p-0">:</td>
                                                <td class="pb-0 p-0">{{
                                                    form.school_majoor
                                                }} <br>
                                                    {{
                                                        form.school_university_name
                                                    }}</td>
                                            </tr>
                                            <tr v-else>

                                                <td class="pb-0 p-0">Program Studi</td>
                                                <td class="pb-0 p-0">:</td>
                                                <td class="pb-0 p-0">{{
                                                    form.university_program_study
                                                    }}</td>
                                            </tr>
                                            <tr v-if="!form.school_majoor">
                                                <td class="pb-0 p-0 align-top">Fakultas</td>
                                                <td class="pb-0 p-0 align-top">:</td>
                                                <td class="pb-0 p-0 align-top">{{
                                                    form.university_faculty
                                                }} <br>
                                                    {{
                                                        form.school_university_name
                                                    }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p>Telah melakukan Magang di Perusahaan
                                    Umum Daerah Air Minum Tirta Moedal Kota Semarang dari
                                    tanggal {{ formatDateID(form.start_date) }} sampai
                                    dengan {{ formatDateID(form.end_date) }}.
                                </p>
                            </li>
                            <li>
                                <p class="indent-8">Demikian Surat Keterangan ini dibuat
                                    untuk dipergunakan
                                    sebagaimana mestinya.</p>
                            </li>
                        </ol>
                    </div>
                </div>

                <!-- TTD -->
                <div class="w-fit text-center float-right mx-8 py-2 px-8">
                    <p class="mb-2">Semarang, {{ formatDateID(form.now_date) }}</p>

                    <p class="-mt-2">An. Direksi Perusahaan Umum Daerah Air Minum</p>
                    <p class="-mt-2">Tirta Moedal Kota Semarang</p>
                    <p class="-mt-2">Direktur Umum</p>
                    <p class="-mt-2">Ub</p>
                    <p class="mb-12 -mt-2">Kepala Bagian Kepegawaian</p>
                    <p class="font-bold underline">Sundariyah, S.E.</p>
                    <p class="-mt-2">Staf Madya I</p>
                    <p class="-mt-2">NPP. 6908384</p>
                </div>
            </div>
        </div>
    </div>
</template>