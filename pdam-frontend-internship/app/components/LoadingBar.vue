<script setup>
defineProps({
  colorFrom: { type: String, default: 'from-green-400' },
  colorTo: { type: String, default: 'to-green-600' },
})
</script>

<template>
  <div class="relative w-full h-[1px] bg-gray-200 overflow-hidden">
    <div
      class="absolute h-full animate-loading"
      :class="['bg-gradient-to-r', colorFrom, colorTo]"
    ></div>
  </div>
</template>
<!-- <BaseLoadingBar v-if="pending" color-from="from-blue-400" color-to="to-blue-600" / -->