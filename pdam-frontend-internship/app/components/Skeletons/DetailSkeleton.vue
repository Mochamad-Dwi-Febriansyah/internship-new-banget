<template>
    <div class="animate-pulse space-y-4">
      <div
        v-for="i in repeat"
        :key="i"
        class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm"
      >
        <div class="h-5 bg-gray-300 rounded md:w-1/4 dark:bg-gray-600"></div>
        <div class="h-5 bg-gray-200 rounded md:w-3/4 dark:bg-gray-700"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    repeat: {
      type: Number,
      default: 3,
    },
  });
  </script>
  