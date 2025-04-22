<script setup lang="ts">
definePageMeta({
  layout: false,
})

import { useField, useForm } from 'vee-validate'
import { object, string } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { useNotification } from '~~/stores/notification'

const route = useRoute()
const router = useRouter()
const { create, getById, update, loading, errorsValBack } = useAssessmentAspect()
const { addNotification } = useNotification()

const id = String(route.params.id)
const isEdit = computed(() => id !== 'new')

const SubmitSchema = toTypedSchema(object({
  code_field: string().required('Kode wajib diisi'),
  name_field: string().required('Nama wajib diisi'),
  status: string().required('Status wajib diisi'),
}))

const { handleSubmit, errors  } = useForm({
  validationSchema: SubmitSchema,
})

const { value: codeField } = useField<string>('code_field')
const { value: nameField } = useField<string>('name_field')
const { value: status } = useField<string>('status')

const isFormReady = ref(!isEdit.value)

onMounted(async () => {
  if (isEdit.value) {
    const  data  = await getById(id)
    codeField.value = data?.data.code_field ?? ''
    nameField.value = data?.data.name_field ?? ''
    status.value = data?.data.status ?? ''
    isFormReady.value = true
  }
})

const onSubmit = async (values: any, { resetForm }: { resetForm: () => void }) => {
  const formData = new FormData()
  formData.append('code_field', values.code_field)
  formData.append('name_field', values.name_field)
  formData.append('status', values.status)

  try {
    const result = isEdit.value
      ? await update(id, formData)
      : await create(formData)

    addNotification('success', result.message)
    resetForm()
    router.back()
  } catch (err: any) {
    addNotification('error', err.message)
  }
}
</script>

<template>
  <NuxtLayout>
    <Notification />
    <div class="min-h-screen flex justify-center items-start bg-gray-50 dark:bg-gray-800 px-4 py-6">
      <div class="w-full md:w-2/3 space-y-4">
        <div class="flex flex-row gap-3">
          <div
            class="flex items-center space-x-2 cursor-pointer text-gray-600 dark:text-gray-400 hover:underline"
            @click="router.back()"
          >
            <Icon name="material-symbols:arrow-back-rounded" class="text-lg align-middle" />
          </div>
          <h1 class="text-md font-medium text-gray-800 dark:text-white">
            {{ isEdit ? 'Edit Aspek Penilaian' : 'Tambah Aspek Penilaian' }}
          </h1>
        </div>

        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
          <template v-if="isFormReady">
            <Form :submit="handleSubmit(onSubmit)">
              <div class="grid gap-6 mb-6 md:grid-cols-2 dark:text-gray-900">
                <BaseInput
                  label="Kode"
                  name="code_field"
                  type="text"
                  v-model="codeField"
                  required
                  :errors="errors"
                  :errorsValBack="errorsValBack"
                />
                <BaseInput
                  label="Nama"
                  name="name_field"
                  type="text"
                  v-model="nameField"
                  required
                  :errors="errors"
                  :errorsValBack="errorsValBack"
                />
                <BaseSelect
                  label="Status"
                  name="status"
                  v-model="status"
                  :options="[
                    { value: 'active', text: 'Aktif' },
                    { value: 'inactive', text: 'Tidak Aktif' }
                  ]"
                  required
                  :errors="errors"
                />
              </div>
              <Button type="submit" :disabled="loading" class="w-full">
                <Icon v-if="loading" name="codex:loader" class="text-xl align-middle" />
                <span v-else>{{ isEdit ? 'Ubah' : 'Tambah' }}</span>
              </Button>
            </Form>
          </template>

          <template v-else>
            <div class="animate-pulse space-y-4">
              <div class="h-6 bg-gray-200 rounded w-1/3 dark:bg-gray-600"></div>
              <div class="grid gap-6 mb-6 md:grid-cols-2">
                <div class="h-12 bg-gray-200 rounded dark:bg-gray-600"></div>
                <div class="h-12 bg-gray-200 rounded dark:bg-gray-600"></div>
                <div class="h-12 bg-gray-200 rounded dark:bg-gray-600"></div>
              </div>
              <div class="h-10 bg-gray-300 rounded w-full dark:bg-gray-700"></div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
