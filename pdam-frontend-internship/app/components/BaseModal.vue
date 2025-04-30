<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  classBody?: string
  overlap?: boolean
  scrollbar?: boolean
}>(), {
  overlap: true,
  scrollbar: true,
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-sm'
    case 'lg':
      return 'max-w-4xl'
    case 'xl':
      return 'max-w-6xl'
    case 'full':
      return 'w-full h-full'
    case 'md':
    default:
      return 'max-w-xl'
  }
})


const emit = defineEmits(['update:modelValue', 'close'])

const onClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.4);
  border-radius: 8px;
}
</style>

<!-- components/FormModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px]"
      @click.self="onClose">
      <button @click="onClose"
        class="hidden sm:block absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-50">
        <Icon name="material-symbols:close-rounded" />
      </button>

      <!-- <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl p-6 relative max-h-[calc(100vh-20px)] overflow-y-auto"
        @keydown.esc="$emit('update:modelValue', false)"> -->
      <div :class="[
        'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full p-6 relative ',
        sizeClass
      ]" @keydown.esc="onClose">
       <!-- <div :class="[
        'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full p-6 relative max-h-[calc(100vh-20px)] overflow-y-auto',
        sizeClass
      ]" @keydown.esc="$emit('update:modelValue', false)">  -->

        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
            {{ title }}
          </h2>
          <button @click="$emit('update:modelValue', false)"
            class="sm:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Icon name="material-symbols:close-rounded" class="text-xl" />
          </button>
        </div>

        <!-- Body -->
        <div  :class="['space-y-4 max-h-[calc(100vh-114px)]', classBody, overlap === true ? 'overflow-y-auto' : '', scrollbar === false ? 'scrollbar-hide' : '']">
          <slot />
        </div>

      </div>
    </div>
  </Transition>
</template>