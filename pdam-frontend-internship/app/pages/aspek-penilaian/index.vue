<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['permission', 'auth'],
  permission: 'pdamintern.assessment-aspects.view', // <-- contoh penggunaan permission
})

import type { ApiResponse, PaginationMeta } from '~~/types/types'
import { useNotification } from '~~/stores/notification'
import { statusLabel } from '~~/utils/statusLabel'

const { addNotification } = useNotification()

const breadcrumb = [
    { label: "Aspek Penilaian", icon: "material-symbols:edit-note-outline-rounded", to: "/aspek-penilaian" }
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

const { can,permissions } = useAuth()
const { getList, destroy } = useAssessmentAspect()

const assessmentAspect = ref<ApiResponse<AssessmentAspect> | null>(null)

const fetchAssessmentAspects = async () =>{
  try {
    pending.value = true

    let sort_by = undefined
    let sort_order = undefined

    if (selectedSort.value) {
      const parts = selectedSort.value.split('_')
      sort_order = parts.pop()
      sort_by = parts.join('_')
    }


    const result = await getList({ 
        page: currentPage.value,
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order }),
    }) 

    assessmentAspect.value = result ?? null

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
    fetchAssessmentAspects()
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
    if (page < 1 || page > (assessmentAspect.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
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

        const result = await getList({ page: currentPage.value }) 
        assessmentAspect.value = result ?? null 

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
                    <AppLinkButton v-if="can('pdamintern.assessment-aspects.create')" to="/aspek-penilaian/form/new" icon="material-symbols:add-to-photos-outline-rounded"
                        label="Aspek Penilaian" variant="green" />
                        <div class="flex flex-row items-center gap-2 ms-auto">
                            <Icon name="material-symbols:sort" class="text-xl align-middle"/>
                            <Field name="sort_by" v-model="selectedSort" as="select" class="block py-1 px-2 border text-xs rounded-lg border-gray-300  dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                                <option value="">Urutkan</option>
                                <option value="code_field_asc">&#8593; Kode </option>
                                <option value="code_field_desc">&#8595; Kode </option>
                                <option value="name_field_asc">&#8593; Nama </option>
                                <option value="name_field_desc">&#8595; Nama </option>
                                <option value="status_asc">&#8593; Status </option>
                                <option value="status_desc">&#8595; Status </option>
                                <option value="created_at_asc">&#8593; Created </option>
                                <option value="created_at_desc">&#8595; Created </option>
                            </Field> 
                        </div>
                </div>
                <div v-if="!assessmentAspect?.data.data || assessmentAspect?.data.data.length === 0"
                        class="text-center text-gray-500 p-4 border border-gray-200 rounded-lg">
                        Tidak ada data.
                    </div>
                <div v-else>

                
                <div
                    class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                    <BaseTable :headers="[
                        { label: 'Kode', center: false }, 
                        { label: 'Nama', center: false }, 
                        { label: 'Status', center: false }, 
                        { label: 'Aksi', center: true }
                    ]">
                        <tr v-if="assessmentAspect" v-for="(item, index) in assessmentAspect.data.data" :key="index"
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td class="px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                                {{ item.code_field }} 
                            </td>
                            <td class="px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                               {{ item.name_field }}
                            </td> 

                            <td class="px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                                {{ statusLabel(item.status) }}
                            </td> 
                           
                            <td class="px-6 py-2">
                                <div class="flex flex-row items-center justify-center gap-2"> 

                                    <AppLinkButton :to="`/aspek-penilaian/${item.id}`" icon="material-symbols:visibility-outline-rounded"
                                        variant="custom" label="Detail" tooltip
                                        class="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-400" />

                                    <AppLinkButton :to="`/aspek-penilaian/form/${item.id}`" icon="material-symbols:edit-square-outline"
                                        label="Edit" variant="custom" tooltip
                                        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" />

                                    <button @click="confirmDelete(item.id)"
                                        class="relative group text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                                        <Icon name="material-symbols:delete-outline" class="text-xl align-middle" />
                                        <span
                                            class="absolute pointer-events-none bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-gray-700 dark:bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                            Hapus
                                        </span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </BaseTable>
                </div>

                <Pagination v-if="assessmentAspect?.data" :currentPage="assessmentAspect.data.current_page"
                    :lastPage="assessmentAspect.data.last_page" :from="assessmentAspect.data.from" :to="assessmentAspect.data.to"
                    :total="assessmentAspect.data.total" :links="assessmentAspect.data.links" @change="goToPage" />
                </div>
            </div>

            <ConfirmationModal :show="showDeleteModal" :loading="pendingDeleteId !== null"
                message="Apakah Anda yakin ingin data ini?"  @confirm="deleteClick" @cancel="showDeleteModal = false" />
        </section>
    </NuxtLayout>
</template>

<style scoped></style>