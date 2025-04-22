<script setup lang="ts">
definePageMeta({
    layout: 'dashboard'
})

const breadcrumb = [
    { label: "Berkas", icon: "material-symbols:checkbook-outline-rounded", to: "/berkas" }
]

const pending = ref(false)
const route = useRoute()
const router = useRouter()
const currentPage = ref(Number(route.query.page) || 1)

const users = ref({
    data: {
        current_page: 2,
        from: 6,
        to: 10,
        per_page: 5,
        total: 20,
        last_page: 4,
        links: [
            { url: null, label: '&laquo; Previous', active: false },
            { url: '/users?page=1', label: '1', active: false },
            { url: '/users?page=2', label: '2', active: true },
            { url: '/users?page=3', label: '3', active: false },
            { url: '/users?page=4', label: '4', active: false },
            { url: '/users?page=3', label: 'Next &raquo;', active: false }
        ],
    }
})


function goToPage(page: number) {
    if (page < 1 || page > (users.value?.data.last_page ?? 1)) return;
    currentPage.value = page;

    router.push({ query: { ...route.query, page } });
}

function getPageNumber(url: string | null | undefined): number {
    const match = url?.match(/page=(\d+)/)
    return match?.[1] ? parseInt(match[1], 10) : 1
}

const showDeleteModal = ref(false);
const pendingDelete = ref<string | null>(null);
const idToDelete = ref<string | null>(null);

const confirmDelete = () => {
    idToDelete.value = null;
    showDeleteModal.value = true;
};
</script>

<template>
    <NuxtLayout>
        <Breadcrumb :items="breadcrumb" />
        <section class="mb-3">
            <BaseLoadingBar v-if="pending" />
            <div v-else class="p-3">
                <div class="flex flex-row justify-between items-center mb-2">
                    <AppLinkButton to="/berkas/form/new" icon="material-symbols:add-to-photos-outline-rounded"
                        label="Berkas" variant="green" />
                </div>
                <div
                    class="relative overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                    <BaseTable :headers="[
                        { label: 'Nama', center: false },
                        { label: 'NIM', center: false },
                        { label: 'Judul', center: false },
                        { label: 'Aksi', center: true }
                    ]">
                        <tr
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td class="px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                                <div class="flex flex-col">
                                    <p class="text-sm text-gray-500 dark:text-white">Alexander</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">alexa@gmail.com</p>
                                </div>
                            </td>
                            <td class="px-6 py-2">22670145</td>
                            <td class="px-6 py-2">Membuat tugas akhir yang sangat rumit</td>
                            <td class="px-6 py-2">
                                <div class="flex flex-row items-center justify-center gap-2">
                                    
                                    <AppLinkButton to="/berkas/1" icon="material-symbols:visibility-outline-rounded"
                                    variant="custom" label="Detail" tooltip
                                    class="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-400" />
                                    
                                    <AppLinkButton to="/berkas/edit" icon="material-symbols:edit-square-outline"
                                        label="Edit" variant="custom" tooltip
                                        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" />
                             
                                    <button @click="confirmDelete()"
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

                <Pagination :currentPage="currentPage" :lastPage="users.data.last_page" :from="users.data.from"
                    :to="users.data.to" :total="users.data.total" :links="users.data.links" @change="goToPage" />

            </div>

            <ConfirmationModal :show="showDeleteModal" :loading="pendingDelete !== null"
                message="Apakah Anda yakin ingin data ini?" @cancel="showDeleteModal = false" />
        </section>
    </NuxtLayout>
</template>

<style scoped></style>