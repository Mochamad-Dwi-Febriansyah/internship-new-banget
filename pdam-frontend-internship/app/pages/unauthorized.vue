<script setup lang="ts">
definePageMeta({
  layout: false
})

// Tidak ada logika khusus untuk halaman ini
</script>
<!-- pages/unauthorized.vue -->
<template>
  <NuxtLayout>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="text-center  p-8  w-full max-w-md">
        <h1 class="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
        <p class="text-lg text-gray-700 my-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <NuxtLink to="/masuk"
          class="inline-block bg-blue-500 text-white py-2 px-6 rounded-lg text-lg hover:bg-blue-600">
          Kembali ke Login
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>