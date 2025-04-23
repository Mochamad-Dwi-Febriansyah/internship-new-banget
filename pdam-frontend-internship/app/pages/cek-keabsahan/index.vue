<script setup lang="ts">
definePageMeta({
    layout: false
})

const showKeabsahanModal = ref(false)
const modalKeabsahanTitle = ref("Cek Keabsahan")
const openCheckKeabsahan = () => { 
    console.log("Cek Keabsahan clicked")
    showKeabsahanModal.value = true
} 
</script>

<template>
    <NuxtLayout>
        <div class="min-h-screen bg-blue-400 flex items-center justify-center px-4 py-10">
            <div class="w-full max-w-2xl border rounded-lg shadow-md p-8 bg-white">
                <!-- Header Logo & Title -->
                <div class="flex items-center gap-4 mb-6">
                    <NuxtImg sizes="xs:30vw sm:35vw md:40px" src="/images/logo-web-pdam.png" format="webp"
                        densities="x1 x2" alt="logo pdam" class="rounded-md" />
                    <div>
                        <h1 class="text-xl font-semibold text-gray-800">Validasi Dokumen TTE</h1>
                        <p class="text-sm text-gray-500">Badan Siber dan Sandi Negara Republik Indonesia</p>
                    </div>
                </div>

                <!-- Status Valid -->
                <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-2">
                    <p class="text-sm text-blue-700 font-medium">
                        ✅ Dokumen sah secara hukum dengan tanda tangan elektronik tersertifikasi.
                    </p>
                </div>

                <!-- Hash Value (Placed below Status Valid) -->
        <div class="  p-4 mb-2">
          <p class="text-right text-sm text-yellow-700 font-medium">
              **Hash Value**: <span class="font-semibold">1234567890abcdef</span> <!-- Replace with actual hash_value from API -->
          </p>
        </div>

                <!-- Detail Dokumen -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                    <div>
                        <p class="font-semibold">Nama Penandatangan</p>
                        <p>Budi Santoso</p>
                    </div>
                    <div>
                        <p class="font-semibold">NIK</p>
                        <p>1234567890123456</p>
                    </div>
                    <div>
                        <p class="font-semibold">Waktu Tanda Tangan</p>
                        <p>2025-04-21 10:34 WIB</p>
                    </div>
                    <div>
                        <p class="font-semibold">Dokumen</p>
                        <p>Surat Tugas - Magang</p>
                    </div>
                </div>

                <!-- Signature Details -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <p class="text-sm text-yellow-700 font-medium">
                        ⚠️ Sertifikat yang digunakan tidak terpercaya. Harap cek kembali keabsahan dokumen.
                    </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-4 mt-6 justify-end">
                    <Button variant="green" @click="openCheckKeabsahan">Cek Keabsahan</Button> 
                    <AppLinkButton to="/" label="Hubungi Support" variant="blue"
                        class="px-4 py-2  font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200" />

                </div>

                <!-- Footer -->
                <div class="mt-6 text-xs text-gray-400 text-center">
                    © 2025 Sistem Validasi Dokumen TTE - BSrE Kominfo
                </div>
            </div>
        </div>

        <BaseModal v-model="showKeabsahanModal" :title="modalKeabsahanTitle">
            <div class="space-y-4">
        <DetailRow label="Nama Penandatangan">Budi Santoso</DetailRow>
        <DetailRow label="NIK">1234567890123456</DetailRow>
        <DetailRow label="Waktu Tanda Tangan">2025-04-21 10:34 WIB</DetailRow>
        <DetailRow label="Dokumen">Surat Tugas - Magang</DetailRow>
        <DetailRow label="Sertifikat Penggunaan">
          Sertifikat ini tidak terpercaya
        </DetailRow>
        <DetailRow label="Status Keabsahan">
          ⚠️ Dokumen perlu verifikasi ulang, sertifikat tidak valid
        </DetailRow>
      </div>
        </BaseModal>
    </NuxtLayout>
</template>



<style scoped></style>