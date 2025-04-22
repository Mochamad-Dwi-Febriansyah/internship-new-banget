<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['permission', 'auth'],
  permission: 'pdamintern.assessment-aspects.view', // <-- contoh penggunaan permission
})

import type { ApiResponse, ApiResponseSingle, PaginationMeta } from '~~/types/types'
import { useNotification } from '~~/stores/notification'
import { statusLabel } from '~~/utils/statusLabel'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'
import { object, string } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { formatDateID } from '~~/utils/date'

const { addNotification } = useNotification()

const breadcrumb = [
  { label: "Penelitian", icon: "material-symbols:user-attributes-rounded", to: "/penelitian" }
]

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)

const selectedSort = ref('')

onMounted(() => {
  const sort_by = route.query.sort_by as string
  const sort_order = route.query.sort_order as string
  if (sort_by && sort_order) {
    selectedSort.value = `${sort_by}_${sort_order}`
  }
})

const { can, permissions } = useAuth()
const { getList, destroy, create, update, getById, loading, errorsValBack } = useUsers()

const users = ref<ApiResponse<UserListItem> | null>(null)

const roleType = 'researcher'
const fetchUsers = async () => {
  try {
    pending.value = true

    let sort_by = undefined
    let sort_order = undefined

    if (selectedSort.value) {
      const parts = selectedSort.value.split('_')
      sort_order = parts.pop()
      sort_by = parts.join('_')
    }

    const response = await getList({
      role: roleType,
      page: currentPage.value,
      ...(sort_by && { sort_by }),
      ...(sort_order && { sort_order }),
    })

    users.value = response ?? null

  } catch (error) {
    console.error('Gagal mengambil data aplikasi:', error)
  } finally {
    pending.value = false
  }
}


watch(
  [() => route.query.page, () => route.query.sort_by, () => route.query.sort_order],
  () => {
    currentPage.value = Number(route.query.page) || 1
    const sort_by = route.query.sort_by as string
    const sort_order = route.query.sort_order as string
    if (sort_by && sort_order) {
      selectedSort.value = `${sort_by}_${sort_order}`
    }
    fetchUsers()
  },
  { immediate: true }
)

// Update URL ketika sort berubah
watch(selectedSort, (val) => {
  let sort_by = ''
  let sort_order = ''
  if (val) {
    const parts = val.split('_')
    sort_order = parts.pop()!
    sort_by = parts.join('_')
  }

  router.push({
    query: {
      ...route.query,
      page: 1,
      sort_by,
      sort_order,
    },
  })
})

function goToPage(page: number) {
  if (page < 1 || page > (users.value?.data.last_page ?? 1)) return;
  currentPage.value = page;

  router.push({ query: { ...route.query, page } });
}


// detail 

const userDetail = ref<UserDetail>()

const showDetailModal = ref(false)
const modalDetailTitle = 'Detail Penelitian'

const openDetail = async (id: string) => {
  showDetailModal.value = true

  const response = await getById(id)

  userDetail.value = response?.data

}

// create & update
const showFormModal = ref(false)
const isEdit = ref(false)
const form = ref<{ id?: string }>({})

const modalFormTitle = computed(() =>
  isEdit.value ? 'Ubah Penelitian' : 'Tambah Penelitian'
)

const SubmitSchema = toTypedSchema(object({
  name: string().required('Nama wajib diisi'),
  email: string().email().required('Email wajib diisi'),
  status: string().required('Status wajib diisi'),
}))

const { handleSubmit, resetForm, errors } = useForm({
  validationSchema: SubmitSchema,
})

const { value: nameField } = useField<string>('name')
const { value: emailField } = useField<string>('email')
const { value: statusField } = useField<string>('status')

const resetFormFields = () => {
  resetForm({
    values: {
      name: '',
      email: '',
      status: 'active',
    }
  })
  form.value = {}
}

watch(showFormModal, (isOpen) => {
  if (!isOpen) {
    resetFormFields()
  }
})

const openCreateForm = () => {
  isEdit.value = false
  form.value = {}
  showFormModal.value = true
}

const openEditForm = (user: UserListItem) => {
  isEdit.value = true
  nameField.value = user.name,
    emailField.value = user.email,
    statusField.value = user.status ?? 'active',

    form.value.id = user.id
  showFormModal.value = true
}

const submitForm = async (values: any, { resetForm }: { resetForm: () => void }) => {
  const formData = new FormData()
  formData.append('name', values.name)
  formData.append('email', values.email)
  formData.append('status', values.status)
  // for (const [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value)
  // }
  try {
    const response = isEdit.value && form.value.id
      ? await update(form.value.id, formData)
      : await create(formData)

    addNotification('success', response.message)

    await fetchUsers()
    showFormModal.value = false
  } catch (error: any) {
    addNotification('error', error.message)
    // console.error('Submit error:', error)
  }
}


// delete date
const showDeleteModal = ref(false);
const pendingDeleteId = ref<string | null>(null);
const idToDelete = ref<string | null>(null);

const confirmDelete = (id: string) => {
  idToDelete.value = id;
  showDeleteModal.value = true;
};

const deleteClick = async () => {
  if (!idToDelete.value) return;
  pendingDeleteId.value = idToDelete.value;
  try {
    const response = await destroy(idToDelete.value) as { message: string };

    addNotification('success', response.message);

    showDeleteModal.value = false;

    await fetchUsers()

  } catch (error: any) {
    addNotification('error', error.data.message);
  } finally {
    showDeleteModal.value = false;
    idToDelete.value = null;
    pendingDeleteId.value = null
  }
};
</script>

<template>
  <NuxtLayout>
    <Breadcrumb :items="breadcrumb" />
    <section class="mb-3">
      <LoadingBar v-if="pending" />
      <div v-else class="p-3">
        <div class="flex flex-row justify-between items-center mb-2"> 
          <div class="flex flex-row items-center gap-2 ms-auto">
            <Icon name="material-symbols:sort" class="text-xl align-middle" />
            <Field name="sort_by" v-model="selectedSort" as="select"
              class="block py-1 px-2 border text-xs rounded-lg border-gray-300  dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
              <option value="">Urutkan</option>
              <option value="name_asc">&#8593; Nama </option>
              <option value="name_desc">&#8595; Nama </option>
              <option value="status_asc">&#8593; Status </option>
              <option value="status_desc">&#8595; Status </option>
              <option value="created_at_asc">&#8593; Created </option>
              <option value="created_at_desc">&#8595; Created </option>
            </Field>
          </div>
        </div>
        <div v-if="!users?.data.data || users?.data.data.length === 0"
          class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg">
          Tidak ada data.
        </div>
        <div v-else>
          <div
            class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <BaseTable :headers="[
              { label: 'Identitas', center: false },
              { label: 'Aksi', center: true }
            ]">
              <tr v-if="users" v-for="(item, index) in users.data.data" :key="index"
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                  <div class="flex flex-col">
                    <p class="text-sm text-gray-700 dark:text-white">{{ item.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.email }}</p>
                    <p class="leading-relaxed text-sm text-gray-500 dark:text-white">
                      {{ item.address }},
                      {{ item.district }},
                      {{ item.city }},
                      {{ item.province }},
                      {{ item.postal_code }}
                    </p>
                  </div>
                </td>
                <td class="px-6 py-2">
                  <div class="flex flex-row items-center justify-center gap-2">

                    <AppLinkButton :to="`/penelitian/${item.id}`" icon="material-symbols:visibility-outline-rounded"
                        variant="custom" label="Detail Penelitian" tooltip
                        class="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-400" />

                    <Button size="noP" variant="custom" class="text-yellow-600 hover:text-yellow-800" :tooltip="true"
                      tooltipText="Detail" @click="openDetail(item.id)">
                      <Icon name="material-symbols:visibility-outline-rounded" class="text-xl align-middle" />
                    </Button>

                    <Button size="noP" variant="custom" class="text-blue-600 hover:text-blue-800" :tooltip="true"
                      tooltipText="Edit" @click="openEditForm(item)">
                      <Icon name="material-symbols:edit-square-outline" class="text-xl align-middle" />
                    </Button>

                    <Button size="noP" variant="custom" class="text-red-600 hover:text-red-800" :tooltip="true" tooltipText="Hapus"
                      @click="confirmDelete(item.id)">
                      <Icon name="material-symbols:delete-outline" class="text-xl align-middle" />
                    </Button>

                  </div>
                </td>
              </tr>
            </BaseTable>
          </div>

          <Pagination v-if="users?.data" :currentPage="users.data.current_page" :lastPage="users.data.last_page"
            :from="users.data.from" :to="users.data.to" :total="users.data.total" :links="users.data.links"
            @change="goToPage" />


          <!-- Detail -->
          <BaseModal v-model="showDetailModal" :title="modalDetailTitle">
            <SkeletonsDetailSkeleton v-if="loading" :repeat="3" />

            <div v-else class="space-y-4" v-if="userDetail">
              <DetailRow label="Nama">{{ userDetail.name }}</DetailRow>
              <DetailRow label="Email">{{ userDetail.email }}</DetailRow>
              <DetailRow label="Alamat">
                {{ userDetail.address }}, {{ userDetail.district }}, {{ userDetail.city }}, {{ userDetail.province }},
                {{ userDetail.postal_code }}
              </DetailRow>
              <DetailRow label="Nomor Pendaftaran">{{ userDetail.document.registration_number }}</DetailRow>
              <DetailRow label="Tanggal Mulai">{{ formatDateID(userDetail?.document.start_date) }}</DetailRow>
              <DetailRow label="Tanggal Selesai">{{ formatDateID(userDetail?.document.end_date) }}</DetailRow>
              <DetailRow label="Status Dokumen">{{ userDetail?.document.document_status || '-' }}</DetailRow>
              <!-- Dokumen -->
              <DetailRow v-if="userDetail.document.identity_photo" label="Foto Identitas">
                <a :href="`${config.public.storage}/storage/${userDetail.document.identity_photo}`" target="_blank"
                  class="text-blue-600 underline">
                  Lihat Foto Identitas
                </a>
              </DetailRow>
              <DetailRow v-if="userDetail.document.application_letter" label="Surat Permohonan">
                <a :href="`${config.public.storage}/storage/${userDetail.document.application_letter}`" target="_blank"
                  class="text-blue-600 underline">
                  Lihat Surat Permohonan
                </a>
              </DetailRow>
              <DetailRow v-if="userDetail.document.work_certificate" label="Sertifikat">
                <a :href="`${config.public.storage}/storage/${userDetail.document.work_certificate}`" target="_blank"
                  class="text-blue-600 underline">
                  Lihat Sertifikat
                </a>
              </DetailRow>

              <!-- Asal Sekolah / Kampus -->
              <DetailRow label="Asal Kampus">{{ userDetail.document.school_uni?.school_university_name }}</DetailRow>
              <DetailRow v-if="userDetail.document.school_uni?.university_faculty" label="Fakultas">{{
                userDetail.document.school_uni.university_faculty }}</DetailRow>
              <DetailRow v-if="userDetail.document.school_uni?.university_program_study" label="Program Studi">{{
                userDetail.document.school_uni.university_program_study }}</DetailRow>
              <DetailRow label="Alamat Kampus">
                {{ userDetail.document.school_uni.school_university_address }},
                {{ userDetail.document.school_uni.school_university_district }},
                {{ userDetail.document.school_uni.school_university_city }},
                {{ userDetail.document.school_uni.school_university_province }},
                {{ userDetail.document.school_uni.school_university_postal_code }}
              </DetailRow>

            </div>
          </BaseModal>

        </div>
                  <!-- create & update -->
                  <BaseModal v-model="showFormModal" :title="modalFormTitle">
            <Form :submit="handleSubmit(submitForm)" class="space-y-3">
              <div class="grid gap-6 mb-6 md:grid-cols-2 dark:text-gray-900">
                <BaseInput label="Nama" name="name" type="text" v-model="nameField" required :errors="errors"
                  :errorsValBack="errorsValBack" />
                <BaseInput label="Email" name="email" type="text" v-model="emailField" required :errors="errors"
                  :errorsValBack="errorsValBack" />
                <BaseSelect label="Status" name="status" v-model="statusField" :options="[
                  { value: 'active', text: 'Aktif' },
                  { value: 'inactive', text: 'Tidak Aktif' }
                ]" required :errors="errors" :errorsValBack="errorsValBack" />
              </div>
              <div class="flex justify-end gap-2 w-full">
                <Button type="button" variant="red" @click="showFormModal = false">
                  Batal
                </Button>
                <Button type="submit" :disabled="loading">
                  <Icon v-if="loading" name="codex:loader" class="text-xl align-middle" />
                  <span v-else>{{ isEdit ? 'Ubah' : 'Tambah' }}</span>
                </Button>
              </div>
            </Form>
          </BaseModal>

      </div>

      <ConfirmationModal :show="showDeleteModal" :loading="pendingDeleteId !== null"
        message="Apakah Anda yakin ingin data ini?" @confirm="deleteClick" @cancel="showDeleteModal = false" />
    </section>
  </NuxtLayout>
</template>

<style scoped></style>