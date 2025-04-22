<script setup lang="ts"> 
definePageMeta({
  layout: false
})

const router = useRouter()
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
                <h1 class="text-md font-semibold text-gray-800 dark:text-white">
                    Tambah Berkas
                </h1>
                </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <!-- Isi konten di sini -->
                <Form>
                    <div class="grid gap-6 mb-6 md:grid-cols-2 dark:text-gray-900">
                        <BaseInput label="Email" name="email" type="email" placeholder="mail@mail.com" required />
                        <BaseInput label="Email" name="email" type="email" placeholder="mail@mail.com" required />
                    </div>
                </Form> 
            </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<style scoped>
</style>