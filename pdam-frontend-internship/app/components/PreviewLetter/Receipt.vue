<script setup>
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
             <div
        class="border p-4 shadow-md bg-white"
        style="font-family: 'Times New Roman', Times, serif; line-height: 1.6; width: 794px; height: 1248px;"
      >
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
                    <!-- Judul -->
                    <p class="text-center font-bold underline text-lg mb-4">SURAT KETERANGAN PENERIMAAN MAGANG</p>

                    <!-- Nomor & Tujuan -->
                    <div class="flex justify-between mb-8 text-md">
                        <div class="flex flex-col space-y-1 w-1/2 pr-4">
                            <div class="h-[20px]"></div>
                            <div class="flex leading-none"><span class="w-24">Nomor</span><span
                                    class="w-2">:</span><span class="flex-1">{{ form.nomor_surat || '.......' }}</span>
                            </div>
                            <div class="flex leading-none"><span class="w-24">Sifat</span><span
                                    class="w-2">:</span><span class="flex-1">{{ form.sifat || '.......' }}</span></div>
                            <div class="flex leading-none"><span class="w-24">Lampiran</span><span
                                    class="w-2">:</span><span class="flex-1">{{ form.lampiran || '.......' }}</span>
                            </div>
                            <div class="flex leading-none"><span class="w-24">Hal</span><span class="w-2">:</span><span
                                    class="flex-1">Surat Keterangan Penerimaan</span></div>
                        </div>

                        <div class="flex flex-col font-bold w-1/2 pl-4 space-y-1 text-left">
                            <p>Semarang, {{ form.tanggalSurat || '.......' }}</p>
                            <div class="h-[65px]"></div>
                            <p>K e p a d a :</p>
                            <p>{{ form.kepada || '......' }}</p>
                            <p>{{ form.alamat_kepada || '......' }}</p>
                            <p>di -</p>
                            <p>&nbsp; &nbsp; &nbsp; &nbsp;<span class="underline">S E M A R A N G</span></p>
                        </div>
                    </div>

                    <!-- Isi Surat -->
                    <div class="mb-4 text-justify ml-20">
                        <ol class="list-decimal pl-5 space-y-2">
                            <li>&nbsp;&nbsp;&nbsp; Memperhatikan Surat {{ form.kepada || '......' }} Nomor: {{
                                form.nomor_surat || '.......' }} tanggal {{ formattedTanggalKepada || '.......' }}
                                perihal permohonan izin magang.</li>
                            <li>&nbsp;&nbsp;&nbsp; Sehubungan dengan hal tersebut di atas, bersama ini dapat kami
                                sampaikan bahwa pada prinsipnya PERUMDA Air Minum Tirta Moedal Kota Semarang dapat
                                menerima mahasiswa Saudara untuk melakukan magang mulai tanggal {{ form.tanggalMulai ||
                                '.......' }} sampai {{ form.tanggalSelesai || '.......' }} dengan data sebagai berikut:
                                <table class="border-collapse w-full my-4 text-sm border border-black" border="1">
                                    <thead>
                                        <tr class="text-center">
                                            <th class="border border-black p-2 uppercase">No</th>
                                            <th class="border border-black p-2 uppercase">Nama</th>
                                            <th class="border border-black p-2 uppercase">NIM</th>
                                            <th class="border border-black p-2 uppercase">Program Studi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="border border-black p-2 text-center">1</td>
                                            <td class="border border-black p-2">{{ form.nama || '...........' }}</td>
                                            <td class="border border-black p-2 text-center">{{ form.nisn_npm_nim_npp ||
                                                '...........' }}</td>
                                            <td class="border border-black p-2 text-center">{{
                                                form.program_studi_universitas || '...........' }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                Untuk keterangan lebih lanjut dapat menghubungi <span class="font-bold underline">Bagian
                                    Kepegawaian.</span>
                            </li>
                            <li>&nbsp;&nbsp;&nbsp; Demikian informasi ini kami sampaikan. Atas perhatian dan kerjasama
                                Bapak/Ibu, kami ucapkan terima kasih.</li>
                        </ol>
                    </div>
                </div>

                <!-- TTD -->
                <div class="w-fit text-center float-right mx-8">
                    <p>An. Direksi Perusahaan Umum Daerah Air Minum</p>
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