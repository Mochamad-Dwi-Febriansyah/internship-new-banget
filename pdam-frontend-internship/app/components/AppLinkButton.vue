<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  to: string
  icon?: string
  label?: string
  tooltip?: boolean
  variant?:
    | 'default'
    | 'green'
    | 'blue'
    | 'red'
    | 'yellow'
    | 'purple'
    | 'gray'
    | 'custom'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  label: '',
  tooltip: false,
  variant: 'default',
  class: '',
})

const baseClass =
  'relative group w-fit rounded-md transition-colors duration-200'

const variantClass = computed(() => {
  const variants: Record<string, string> = {
    default: ' flex items-center gap-2 py-1 px-3 bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: ' flex items-center gap-2 py-1 px-3 bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900 dark:text-green-300',
    red: ' flex items-center gap-2 py-1 px-3 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900 dark:text-red-300',
    blue: ' flex items-center gap-2 py-1 px-3 bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    yellow: ' flex items-center gap-2 py-1 px-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    purple: ' flex items-center gap-2 py-1 px-3 bg-purple-100 hover:bg-purple-200 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    gray: ' flex items-center gap-2 py-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-900 dark:text-gray-300',
    custom: '', // no bg/text default
  }

  return variants[props.variant] ?? variants.default
})

const textSizeClass = computed(() =>
  props.variant === 'custom' ? 'text-xl' : 'text-xs'
)
</script>

<template>
  <NuxtLink
    :to="props.to"
    :class="[baseClass, variantClass, props.class]"
  >
    <!-- ICON -->
    <Icon v-if="props.icon" :name="props.icon" class="text-xl align-middle" />

    <!-- LABEL -->
    <span
      v-if="props.label && props.variant !== 'custom'"
      :class="textSizeClass"
    >
      {{ props.label }}
    </span>

    <!-- TOOLTIP (jika diaktifkan & pakai variant custom) -->
    <span
      v-if="props.tooltip && props.label && props.variant === 'custom'"
      class="absolute pointer-events-none bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-gray-700 dark:bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap"
    >
      {{ props.label }}
    </span>
  </NuxtLink>
</template>

<!-- 

✅ Dengan label & icon
<AppLinkButton
  to="/berkas/form/new"
  icon="material-symbols:add-to-photos-outline-rounded"
  label="Berkas"
  variant="green"
/>

✅ Hanya icon + tooltip
<AppLinkButton
  to="/berkas/edit"
  icon="material-symbols:edit-square-outline"
  label="Edit"
  variant="custom"
  tooltip
  class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
/>

✅ Hanya label tanpa icon
<AppLinkButton to="/home" label="Home" variant="blue" />

✅ Hanya icon, tanpa label, tanpa tooltip
<AppLinkButton
  to="/delete"
  icon="material-symbols:delete-outline"
  variant="custom"
  class="text-red-500 hover:text-red-700"
/>

-->
