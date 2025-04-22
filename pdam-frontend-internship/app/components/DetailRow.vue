<template>
    <div class="flex flex-col md:flex-row gap-2 md:gap-4 text-sm">
      <div class="md:w-1/4 font-medium text-gray-700 dark:text-gray-300">{{ label }}</div>
      <div class="md:w-3/4 text-gray-600 dark:text-gray-400">
        <p class="leading-relaxed"><slot /></p>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    label: String,
  })
  </script>
  