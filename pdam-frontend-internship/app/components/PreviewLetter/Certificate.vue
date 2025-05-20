<script setup>
defineProps({
    form: Object,
    formattedTanggalKepada: String,
    scale: {
        type: Number,
        default: 1,
    },
})

// Ukuran F4 dalam px (96 DPI)
const baseWidth = 1248
const baseHeight = 794
</script>

<template>
    <div class="origin-top-left md:origin-top-left scale-wrapper" :style="{
        transform: `scale(${scale})`,
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
    }">
        <div class="border h-full min-h-full p-4 shadow-md " style="line-height: 1.6; width: 1248px; height: 794px;">
            <div class="border-figure   min-h-full p-4 text-center flex flex-col justify-between h-full">

                <div>

               
                <img src="http://localhost:3000/_ipx/w_100&f_webp/images/logo-web-pdam.png" alt="Logo Kiri" width="80"
                    class="mx-auto mb-2" />
                <h1 class="text-2xl font-bold mb-2">Tirta Moedal Certificate Internship</h1>
                <p class="number-certificate inline-block bg-slate-700 px-2 rounded-sm text-white">{{ form.certificate_number }}</p>

                <p class="mt-4">Given to:</p>
                <h2 class="text-xl font-bold">{{ form.name || '.......' }}</h2>

                <p class="text-2d3e50 mt-2">
                    Implementation of Internship at Perumda Tirta Moedal Drinking Water, Semarang City <br />
                    On the date {{ form.start_date || '.......' }} until {{ form.end_date || '.......' }}
                </p>

                <div class="mt-6 text-2d3e50">
                    <p>Semarang, {{ form.now_date || '.......' }}</p>
                    <p>An. Direksi Perusahaan Umum Daerah Air Minum</p>
                    <p>Tirta Moedal Kota Semarang</p>
                    <p>Direktur Umum</p>
                    <p>Ub</p>
                    <p>Head of Personnel Section</p>

                    <!-- Kondisi tanda tangan -->
                    <div  >
                        <div  >
                            <br /><br /> 
                            <p>#</p> <!-- BSrE placeholder -->
                            <br /><br /> 
                        </div>

                        <p class="font-bold  pt-2">
                            Alexa
                            <!-- {{ form.signature.name_snapshot || '?' }} -->
                        </p>
                        <p>
                            NPP. 
                            <!-- {{ form.signature.rank_group || '?' }}<br /> -->
                            <!-- NPP. {{ form.signature.user_id || '?' }} -->
                        </p>
                    </div>
                </div>
                </div> 
                   <div class="text-center text-xs px-4 bg-white font-italic"><i>
                    Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik <br> yang diterbitkan oleh
                    Balai Besar Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara</i>
                </div> 
            </div> 
        </div>
      
    </div>

    <div class="origin-top-left md:origin-top-left scale-wrapper" :style="{
        transform: `scale(${scale})`,
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
    }">
        <div class="border p-4 shadow-md bg-white" style="line-height: 1.6; width: 1248px; height: 794px;">
            <div class="border-figure h-full bg-white min-h-full p-10 text-center">

                <div class="flex flex-row items-center justify-between mb-10">
                    <img src="http://localhost:3000/_ipx/w_100&f_webp/images/logo-web-pdam.png" alt="Logo Kiri"
                        width="40" class="  mb-2" />
                    <p class="text-xl font-normal text-gray-500">Halaman 2</p>
                </div>

                <table class="table-auto w-full border border-gray-400 border-collapse">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="border border-gray-400 px-4 py-2">No</th>
                            <th class="border border-gray-400 px-4 py-2">ASPEK YANG DINILAI</th>
                            <th class="border border-gray-400 px-4 py-2">HURUF</th>
                            <th class="border border-gray-400 px-4 py-2">ANGKA</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="border border-gray-400 px-4 py-2 text-center">1</td>
                            <td class="border border-gray-400 px-4 py-2">Contoh Aspek</td>
                            <td class="border border-gray-400 px-4 py-2 text-center">A</td>
                            <td class="border border-gray-400 px-4 py-2 text-center">90</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="border border-gray-400 px-4 py-2 text-right">Jumlah</td> 
                            <td class="border border-gray-400 px-4 py-2 text-center"></td>
                        </tr>
                        <tr>
                            <td colspan="3" class="border border-gray-400 px-4 py-2 text-right">Rata-rata</td> 
                            <td class="border border-gray-400 px-4 py-2 text-center"></td>
                        </tr>
                        <tr>
                            <td colspan="3" class="border border-gray-400 px-4 py-2 text-right">Predikat</td> 
                            <td class="border border-gray-400 px-4 py-2 text-center"></td>
                        </tr>
                        <!-- Tambah baris lain sesuai kebutuhan -->
                    </tbody>
                </table>


            </div>
        </div>
    </div>
</template>

<style scoped>
.border-figure {
    border-style: solid;
    border-width: 5px;
    min-height: 100vh;
    border-color: #4285F4 #EA4335 #FBBC05 #34A853;
    /* top, right, bottom, left */
}
 
</style>
