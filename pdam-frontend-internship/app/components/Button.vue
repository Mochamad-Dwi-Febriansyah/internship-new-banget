<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?:
    | 'default'
    | 'alternative'
    | 'dark'
    | 'light'
    | 'green'
    | 'red'
    | 'yellow'
    | 'purple'
    | 'gray'
    | 'custom'
  size?: 'sm' | 'md' | 'lg' | 'noP'
  disabled?: boolean
  class?: string
  tooltip?: boolean
  tooltipText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'default',
  size: 'md',
  tooltip: false,
  tooltipText: '',
  class: '',
})

const emit = defineEmits<{ click: [] }>()

const baseClass = computed(() =>
  props.variant === 'custom'
    ? 'relative group w-fit'
    : 'relative group w-fit text-sm font-medium rounded-lg focus:outline-none focus:ring-4 transition-all flex justify-center'
)

const sizeClass = computed(() => {
  const sizes: Record<string, string> = {
    noP: 'text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return sizes[props.size]
})

const variantClass = computed(() => {
  const variants: Record<string, string> = {
    default: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 ',
    alternative:
      'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100',
    dark: 'text-white bg-gray-800 hover:bg-gray-900 focus:ring-gray-300',
    light:
      'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-gray-100',
    green: 'text-white bg-green-700 hover:bg-green-800 focus:ring-green-300',
    red: 'text-white bg-red-700 hover:bg-red-800 focus:ring-red-300',
    yellow: 'text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300',
    purple: 'text-white bg-purple-700 hover:bg-purple-800 focus:ring-purple-300',
    gray: 'text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-400',
    custom: '', // untuk style custom
  }
  return variants[props.variant]
})
</script>

<template>
  <button
    :type="props.type"
    :class="[baseClass, sizeClass, variantClass, props.class, { 'opacity-50 cursor-not-allowed': props.disabled }]"
    :disabled="props.disabled"
    @click="emit('click')"
  >
    <slot />

    <!-- Tooltip -->
    <span
      v-if="props.tooltip && props.tooltipText"
      class="absolute pointer-events-none bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-gray-700 dark:bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap"
    >
      {{ props.tooltipText }}
    </span>
  </button>
</template>

