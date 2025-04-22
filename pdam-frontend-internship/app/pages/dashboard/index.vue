<script setup lang="ts">
import type { ApiResponseNoPagination } from '~~/types/types'
import { hasPermission } from '~~/utils/hasPermission'

definePageMeta({
    layout: 'dashboard',
    middleware: ['auth'],
})

// const permissions = ref<string[]>([
//   'view-dashboard',
//   'view-total-pengajuan', 
// ]) 

const cards = [
  {
    title: 'Total Pengajuan Berkas',
    label: 'Belum Disetujui',
    value: 12,
    permission: 'view-total-pengajuan'
  },
  {
    title: 'Total Berkas',
    label: 'Belum Disetujui',
    value: 12,
    permission: 'view-total-berkas'
  },
  {
    title: 'Data Pengguna',
    label: 'Aktif',
    value: 5,
    permission: 'view-users'
  }
]


const pending = ref(false)
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentPage = ref(Number(route.query.page) || 1)
const selectedSort = ref('')
const { can, permissions} = useAuth()
const { getDashboardCards } = useDashboard()
const statistics = ref()
const fetchStatistics = async () => {
    try {
        pending.value = true

        let sort_by = undefined
        let sort_order = undefined

        if (selectedSort.value) {
            const parts = selectedSort.value.split('_')
            sort_order = parts.pop()
            sort_by = parts.join('_')
        }

        const response = await getDashboardCards({ 
            ...(sort_by && { sort_by }),
            ...(sort_order && { sort_order }),
        })

        statistics.value = response.data 

    } catch (error) {
        console.error('Gagal mengambil data aplikasi:', error)
    } finally {
        pending.value = false
    }
}


// watch(
//     [ () => route.query.sort_by, () => route.query.sort_order],
//     () => { 
//         const sort_by = route.query.sort_by as string
//         const sort_order = route.query.sort_order as string
//         if (sort_by && sort_order) {
//             selectedSort.value = `${sort_by}_${sort_order}`
//         }
//         fetchStatistics()
//     },
//     { immediate: true }
// )

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
            sort_by,
            sort_order,
        },
    })
})
 
</script>

<template>
    <NuxtLayout>
      <section class="mb-3">
        <div class="p-3"> 
            <div class="flex flex-wrap gap-4 justify-start items-stretch">
              <!-- {{ statistics }} -->
                <div v-for="card in statistics" :key="card.title" >
                    <div v-if="hasPermission(permissions, card.permission)"
                      class="h-full flex flex-col flex-1 min-w-[240px] max-w-[300px] p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                      <div>
                        <h5 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          {{ card.title }}
                        </h5>
                        <p class="text-sm text-gray-700 dark:text-gray-300">
                          {{ card.label }}<span class="font-bold">{{ card.value }}</span>
                        </p>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </NuxtLayout>
  </template>



<style scoped></style>