<script setup>
const props = defineProps({
  path: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "Lihat File",
  },
});

const config = useRuntimeConfig();
const baseUrl = config.public.storage;
</script>
<template>
  <a
    :href="`${baseUrl}/storage/${path}`"
    target="_blank"
    rel="noopener noreferrer"
    class="relative group px-3 py-1 text-xs w-fit flex items-center gap-2 text-yellow-600 dark:text-yellow-300"
  >
    <Icon name="material-symbols:open-in-new" class="text-xl align-middle" />
    <span
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none"
    >
      {{ label }}
    </span>
  </a>
</template>
