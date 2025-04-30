<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import { useNotification } from '~~/stores/notification'
import { object, string } from 'yup'

const route = useRoute()
const router = useRouter()
const { addNotification } = useNotification()
const { resetPassword } = useAuth()
const showPassword = ref(false)
const showPasswordConfirmed = ref(false)
const loading = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
const togglePasswordConfirmed = () => {
  showPasswordConfirmed.value = !showPasswordConfirmed.value
}
// Skema validasi



const SubmitSchemaResetPassword = toTypedSchema(object({
  password: string()
    .required('Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),

  confirm_password: string()
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak sesuai')
    .required('Konfirmasi password wajib diisi')
}))

const { handleSubmit: handleSubmitResetPassword, resetForm, errors } = useForm({
  validationSchema: SubmitSchemaResetPassword,
})

const { value: password } = useField<string>('password')
const { value: confirmPassword } = useField<string>('confirm_password')

const resetFormFields = () => {
  resetForm({
    values: {
      password: '',
      confirm_password: '',
    }
  })
}

// Fungsi reset password
const onSubmitResetPassword = async (values: any) => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('password', values.password)
    formData.append('password_confirmation', values.confirm_password)
    formData.append('token', route.query.token as string)
    await resetPassword(formData)
    addNotification('success', 'Password berhasil direset. Silakan login.')
    router.push('/masuk')
  } catch (err) {
    addNotification('error', (err as Error).message)
  } finally {
    loading.value = false
    resetFormFields()
  }
}
</script>

<template>
  <NuxtLayout>
    <section class="flex items-center justify-center min-h-screen bg-gray-100 py-20 md:py-10 p-8">
      <div class="bg-white p-8 rounded-lg border w-full max-w-md shadow-md">
        <h2 class="text-2xl font-semibold text-center text-gray-700 mb-6">
          Reset Password
        </h2>

        <!-- <Form @submit="handleResetPassword" :validation-schema="schema" v-slot="{ meta }"> -->
        <Form :submit="handleSubmitResetPassword(onSubmitResetPassword)">
          <div class="mb-4">
            <BaseInput label="Password Baru" name="password" type="password" :errors="errors"
              placeholder="Masukkan password baru" required v-model="password" :showToggle="true" />

          </div>

          <!-- Konfirmasi Password -->
          <div class="mb-6">
            <BaseInput label="Konfirmasi Password" name="confirm_password" type="password" :errors="errors"
              placeholder="Konfirmasi password baru" required v-model="confirmPassword" :showToggle="true" />
          </div>

          <!-- Tombol Submit -->
          <Button type="submit" :disabled="loading" class="w-full">
            <Icon v-if="loading" name="codex:loader" class="text-xl align-middle" />
            <span v-else>Reset Password</span>
          </Button>
        </Form>
      </div>
    </section>
  </NuxtLayout>
</template>