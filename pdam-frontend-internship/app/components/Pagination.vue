<script setup lang="ts">
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  lastPage: Number,
  from: Number,
  to: Number,
  total: Number,
  links: {
    type: Array as PropType<{ label: string; url: string | null; active: boolean }[]>,
    required: true,
  },
})

const { lastPage = 1 } = props

const emit = defineEmits(['change'])

function goToPage(page: any) {
  if (page >= 1 && page <= lastPage) {
    emit('change', page)
  }
}

function getPageNumber(url: any) {
  const params = new URLSearchParams(url.split('?')[1])
  return parseInt(params.get('page') || '1')
}
</script>

<template>
  <nav class="flex items-center flex-column flex-wrap md:flex-row justify-between py-3" aria-label="Table navigation">
    <!-- Info jumlah data -->
    <span class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
      Menampilkan
      <span class="font-semibold text-gray-900 dark:text-white">{{ from }}</span> -
      <span class="font-semibold text-gray-900 dark:text-white">{{ to }}</span> dari
      <span class="font-semibold text-gray-900 dark:text-white">{{ total }}</span>
    </span>

    <!-- Navigasi Pagination -->
    <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
      <!-- Tombol Previous -->
      <li>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1"
          class="flex items-center justify-center px-3 h-8 ms-0 leading-tight border rounded-s-lg transition"
          :class="currentPage > 1 ?
            'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'">
          Previous
        </button>
      </li>

      <!-- Nomor Halaman -->
      <li v-for="link in links" :key="link.label">
        <button v-if="link.url && !isNaN(parseInt(link.label))"
          @click="goToPage(getPageNumber(link.url))"
          class="flex items-center justify-center px-3 h-8 leading-tight border transition"
          :class="link.active ?
            'text-white bg-blue-600 dark:bg-blue-700 dark:text-white'
            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'">
          {{ link.label }}
        </button>
      </li>

      <!-- Tombol Next -->
      <li>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= lastPage"
          class="flex items-center justify-center px-3 h-8 leading-tight border rounded-e-lg transition"
          :class="currentPage < lastPage ?
            'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'">
          Next
        </button>
      </li>
    </ul>
  </nav>
</template>
