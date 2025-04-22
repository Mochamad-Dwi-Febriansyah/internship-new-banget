<script setup lang="ts">
import type { ApiResponseSingle } from '~~/types/types'

definePageMeta({
    layout: false,
    middleware: ['permission', 'auth'],
    permission: 'pdamintern.assessment-aspects.show',
})
const route = useRoute()
const router = useRouter()

const { getById, loading } = useAssessmentAspect()
const id = String(route.params.id)

const result = ref<AssessmentAspect>() 

onMounted(async () => {

    const response = await getById(id)
    result.value = response?.data 
})

</script>

<template>
    <NuxtLayout>
        <div class="min-h-screen flex justify-center items-start bg-gray-50 dark:bg-gray-800 px-4 py-6">
            <div class="w-full md:w-2/3 space-y-4">
                <div class="flex flex-row gap-3">
                    <div class="flex items-center space-x-2 cursor-pointer text-gray-600 dark:text-gray-400 hover:underline"
                        @click="router.back()">
                        <Icon name="material-symbols:arrow-back-rounded" class="text-lg align-middle" />
                    </div>
                    <h1 class="text-md font-medium text-gray-800 dark:text-white">
                        Detail Aspek Penilaian
                    </h1>
                </div>

                <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                    <!-- Skeleton saat loading -->
                    <div v-if="loading" class="animate-pulse space-y-6">
                        <div class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm">
                            <div class="h-4 bg-gray-300 rounded md:w-1/4 dark:bg-gray-600"></div>
                            <div class="h-4 bg-gray-200 rounded md:w-3/4 dark:bg-gray-700"></div>
                        </div>
                        <div class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm">
                            <div class="h-4 bg-gray-300 rounded md:w-1/4 dark:bg-gray-600"></div>
                            <div class="h-4 bg-gray-200 rounded md:w-3/4 dark:bg-gray-700"></div>
                        </div>
                        <div class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm">
                            <div class="h-4 bg-gray-300 rounded md:w-1/4 dark:bg-gray-600"></div>
                            <div class="h-4 bg-gray-200 rounded md:w-3/4 dark:bg-gray-700"></div>
                        </div>
                    </div>

                    <!-- Konten saat data siap -->
                    <div v-else class="space-y-6">
                        <div class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm">
                            <div class="md:w-1/4 font-medium text-gray-700 dark:text-gray-300">Kode</div>
                            <div class="md:w-3/4 text-gray-600 dark:text-gray-400">
                                <p class="leading-relaxed">
                                    {{ result?.code_field }}
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm">
                            <div class="md:w-1/4 font-medium text-gray-700 dark:text-gray-300">Nama</div>
                            <div class="md:w-3/4 text-gray-600 dark:text-gray-400">
                                <p class="leading-relaxed">
                                    {{ result?.name_field }}
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm">
                            <div class="md:w-1/4 font-medium text-gray-700 dark:text-gray-300">Status</div>
                            <div class="md:w-3/4 text-gray-600 dark:text-gray-400">
                                <p class="leading-relaxed">
                                    {{ result?.status }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>


<style scoped></style>