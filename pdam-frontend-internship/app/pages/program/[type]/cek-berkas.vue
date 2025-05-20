<script setup lang="ts">
const route = useRoute();
const tipe = route.params.type;  
const registrationNumber = Array.isArray(route.query.registration_number) ? route.query.registration_number[0]  : route.query.registration_number
const { checkApplicationStatus, errors: errorsValBack, loading, errorMessage, } = useApplications(); // Import the checkApplicationStatus function from your composable
import { object, string } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { useNotification } from '~~/stores/notification'
import { getIconName, getStatusLabel } from '~~/utils/formatStatus';
import { getStatusVariant } from '~~/utils/statusLabel';

const { addNotification } = useNotification()
 

const SubmitSchemaCekBerkas = toTypedSchema(object({
  registration_number: string().required('Nomor registrasi wajib diisi'),
}))
const { handleSubmit, resetForm, errors } = useForm({
    validationSchema: SubmitSchemaCekBerkas,
})

const { value: registrationNumberField } = useField<string>('registration_number')
onMounted(() => {
  if (registrationNumber) {
    registrationNumberField.value = registrationNumber
  }
})

const result = ref<null | Record<string, any>>(null)
const showDetailModal = ref(false)
const modalDetailTitle = 'Cek Pengajuan Berkas'

const onSubmit = async (values: any) => {
result.value = null 
  try {
    const data = await checkApplicationStatus(values.registration_number)
    // console.log('Data:', data)
    result.value = data?.data ?? null;
    showDetailModal.value = true
  } catch (e: any) {
    addNotification('error', e.message);
    // console.log(e.message) 
  }
} 
</script>

<template>
    <NuxtLayout>
        <section class="bg-gray-50 dark:bg-gray-900 py-16">
            <div class="container lg:px-16 mb-3 md:py-12 py-12">
                <div class="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                    <h2 class="text-3xl font-bold text-gray-800 mb-10 text-center md:text-left dark:text-white">
                        Cek Pengajuan Berkas
                    </h2>
                    <Form @submit="onSubmit" :validationSchema="SubmitSchemaCekBerkas" >
                    <!-- <Form :submit="handleSubmit(onSubmit)"  > -->
                        <!-- No Pengajuan -->  
                        <BaseInput label="Nomor Pengajuan" name="registration_number" v-model="registrationNumberField"  :errors="errors" :errorsValBack="errorsValBack" type="text"
                            placeholder="Masukkan no pengajuan" /> 
                            <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
                        <!-- Tombol Cek -->
                        <div class="mt-6 flex justify-center">
                            <Button type="submit" :disabled="loading">
                                <Icon v-if="loading" name="codex:loader" class="text-xl align-middle"/>
                                <span v-else>Cek</span>
                            </Button>
                        </div>
                    </Form> 
                </div>
                <BaseModal v-model="showDetailModal" :title="modalDetailTitle">
            <SkeletonsDetailSkeleton v-if="loading" :repeat="3" />

            <div v-else class="space-y-4" v-if="result">
              <DetailRow label="No Registrasi">{{ result.registration_number  }}</DetailRow>
              <DetailRow label="Nama">{{ result.user.name  }}</DetailRow>
              <DetailRow label="Status">
                <Button :variant="getStatusVariant(result.document_status)" size="sm">
                  <Icon :name="getIconName(result.document_status)" class="w-4 h-4" /> {{ getStatusLabel(result.document_status)  }}
                </Button>
              </DetailRow>
            </div>
            </BaseModal> 
            </div>
        </section>
    </NuxtLayout>
</template>


<style scoped></style>