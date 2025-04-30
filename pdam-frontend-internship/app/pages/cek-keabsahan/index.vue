<script setup lang="ts">
definePageMeta({
    layout: false
})
import { useNotification } from '~~/stores/notification'
import type { ApiResponseSingle } from '~~/types/types'
import { FormatDate, formatIndonesianDateTime, formatIndonesianDateTimeRange } from '~~/utils/date'
const route = useRoute()
const idDocument = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id
const { addNotification } = useNotification()
const { cekKeabsahan, loading } = useTTE()

const showKeabsahanModal = ref(false)
const modalKeabsahanTitle = ref("Cek Keabsahan")
const openCheckKeabsahan = () => {
    console.log("Cek Keabsahan clicked")
    showKeabsahanModal.value = true
}

onMounted(() => {
    if (idDocument) {
        onSubmit(idDocument)
    }
})
const result = ref<TTE | null>()
const errorMessage = ref()
const onSubmit = async (idDocument: string) => {
    result.value = null
    try {
        const formData = new FormData()
        formData.append('id_document', idDocument)
        const data = await cekKeabsahan(formData)
        console.log('Data:', data)
        result.value = data?.data ?? null; 
    } catch (e: any) {
        addNotification('error', e.message);
        errorMessage.value = e.message
        console.log(e.message) 
    }
}
</script>

<template>
    <NuxtLayout>
        <Notification />
        <div class="min-h-screen bg-blue-400 flex items-center justify-center px-4 py-10">
            <div class="w-full max-w-2xl border rounded-lg shadow-md p-8 bg-white">
                <!-- Header Logo & Title -->
                <div class="flex items-center gap-4 mb-6">
                    <NuxtLink to="/">
                    <NuxtImg sizes="xs:30vw sm:35vw md:40px" src="/images/logo-web-pdam.png" format="webp"
                        densities="x1 x2" alt="logo pdam" class="rounded-md" />
                    </NuxtLink>
                    <div>
                        <h1 class="text-xl font-semibold text-gray-800">Validasi Dokumen TTE</h1>
                        <p class="text-sm text-gray-500">Badan Siber dan Sandi Negara Republik Indonesia</p>
                    </div>
                </div>

 
                <!-- Status Valid -->
                <div v-if="result" class="border rounded-md p-4 mb-2"
                    :class="result?.summary === 'WARNING' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700'">
                    <p class="text-sm font-medium">
                        {{ result?.notes }}
                    </p>
                </div>
 
                <SkeletonsDetailSkeleton v-if="loading" :repeat="4" />

                <div v-else-if="result"> 
                <div  class="p-4 mb-2">
                    <p class="text-right text-sm text-yellow-700 font-medium">
                        **Hash Value**: <span class="font-semibold">{{
                            result?.details[0]?.signature_document?.hash_value }}</span>
                        <!-- Replace with actual hash_value from API -->
                    </p>
                </div> 

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                    <div>
                        <p class="font-semibold">Nama Dokumen</p>
                        <p>{{ result?.nama_dokumen }}</p>
                    </div>
                    <div>
                        <p class="font-semibold">Nama Penandatangan</p>
                        <p>{{ result?.details[0]?.info_signer?.signer_name }}</p>
                    </div>
                    <div>
                        <p class="font-semibold">NIK</p>
                        <p>{{ result?.details[0]?.info_signer?.signer_dn }}</p>
                    </div>
                    <div>
                        <p class="font-semibold">Waktu Tanda Tangan</p>
                        <p>{{ formatIndonesianDateTime(result?.details[0]?.signature_document?.signed_in || '') }}</p>
                    </div>
                    <!-- <div>
                        <p class="font-semibold">Organisasi Penerbit</p>
                        <p>{{ result?.details[0]?.info_signer?.issuer_dn }}</p>
                    </div> -->
                    <div>
                        <p class="font-semibold">Masa Berlaku Sertifikat</p>
                        <p>{{ formatIndonesianDateTimeRange(result?.details[0]?.info_signer?.signer_cert_validity || '') }}</p>
                    </div>
                    <div>
                        <p class="font-semibold">Disertifikasi BSrE?</p>
                        <p>{{ result?.details[0]?.info_signer?.cert_user_certified ? 'Ya' : 'Tidak' }}</p>
                    </div>
                    <div>
                        <p class="font-semibold">Menggunakan TSA?</p>
                        <p>{{ result?.details[0]?.signature_document?.signed_using_tsa ? 'Ya' : 'Tidak' }}</p>
                    </div>
                </div>
                </div>

                <div v-else class="p-4 text-center text-gray-600">
                <p>{{ errorMessage }}</p>
                </div>


                <!-- Action Buttons -->
                <!-- <div class="flex gap-4 mt-6 justify-end">
                    <Button variant="green" @click="openCheckKeabsahan">Cek Keabsahan</Button>
                </div> -->

                <!-- Footer -->
                <div class="mt-6 text-xs text-gray-400 text-center">
                    © 2025 Sistem Validasi Dokumen TTE - BSrE Kominfo
                </div>
            </div>
        </div>

        <BaseModal v-model="showKeabsahanModal" :title="modalKeabsahanTitle">
            <div class="space-y-4">
                <DetailRow label="Nama Penandatangan">{{ result?.details[0]?.info_signer?.signer_name }}</DetailRow>
                <DetailRow label="NIK">{{ result?.details[0]?.info_signer?.signer_dn }}</DetailRow>
                <DetailRow label="Waktu Tanda Tangan">{{ result?.details[0]?.signature_document?.signed_in }}
                </DetailRow>
                <DetailRow label="Dokumen">{{ result?.nama_dokumen }}</DetailRow>
                <DetailRow label="Sertifikat Penggunaan">
                    {{ result?.details[0]?.info_signer?.cert_user_certified ? 'Sertifikat terpercaya' : 'Sertifikat ini tidak terpercaya' }}
                </DetailRow>
                <DetailRow label="Status Keabsahan">
                    ⚠️ {{ result?.notes }}
                </DetailRow>
            </div>
        </BaseModal>
    </NuxtLayout>
</template>



<style scoped></style>