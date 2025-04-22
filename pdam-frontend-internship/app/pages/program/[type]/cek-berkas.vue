<script setup lang="ts">
const route = useRoute();
const tipe = route.params.type; 
const { checkApplicationStatus, errors, loading, errorMessage, } = useApplications(); // Import the checkApplicationStatus function from your composable
import { object, string } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { useNotification } from '~~/stores/notification'

const { addNotification } = useNotification()

const schema = toTypedSchema(
  object({
    registration_number: string().required('Nomor pengajuan wajib diisi'),
  })
)

const result = ref<null | Record<string, any>>(null)

const onSubmit = async (values: any) => {
result.value = null 
  try {
    const data = await checkApplicationStatus(values.registration_number)
    // console.log('Data:', data)
    result.value = data?.data ?? null;
  } catch (e: any) {
    addNotification('error', e.message);
    // console.log(e.message) 
  }
}

const statusMapping: { [key: string]: string } = {
  pending: "Pending",
  approved: "Approved",
  reject: "Rejected"
};
</script>

<template>
    <NuxtLayout>
        <section class="bg-gray-50 dark:bg-gray-900 py-16">
            <div class="container lg:px-16 mb-3 md:py-12 py-12">
                <div class="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                    <h2 class="text-3xl font-bold text-gray-800 mb-10 text-center md:text-left dark:text-white">
                        Cek Pengajuan Berkas
                    </h2>
                    <Form @submit="onSubmit" :validation-schema="schema" >
                        <!-- No Pengajuan --> 
                        <BaseInput label="Nomor Pengajuan" name="registration_number" :errors="errors" type="text"
                            placeholder="Masukkan no pengajuan" required /> 
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
                <div  v-if="result" class="w-full mx-auto bg-green-100 border border-green-300 rounded-lg p-6 mt-6" 
                    :class="{
                    'bg-yellow-100 border-yellow-300': result.document_status === 'pending',
                    'bg-green-100 border-green-300': result.document_status === 'approved',
                    'bg-red-100 border-red-300': result.document_status === 'rejected'}">
                    <p class="text-gray-700"><strong>No Registrasi :</strong> {{ result.registration_number }}</p>
                    <p class="text-gray-700"><strong>Nama :</strong> {{ result.user.name }}</p>
                    <p class="text-gray-700"><strong>Status :</strong> {{ statusMapping[result.document_status as keyof typeof statusMapping]   }}</p>

                </div>
            </div>
        </section>
    </NuxtLayout>
</template>


<style scoped></style>