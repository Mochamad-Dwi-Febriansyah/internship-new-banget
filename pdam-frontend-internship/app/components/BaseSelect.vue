<script setup lang="ts">
defineProps({
  label: String,
  name: {
        type: String,
        default: ''
    },
  modelValue: String,
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
        type: Boolean,
        default: false
    },
  options: {
    type: Array as () => { value: string; text: string }[],
    default: () => []
  }
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label :for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <Field as="select" :name="name" :id="name"
      class="block w-full p-2.5 border text-sm rounded-lg border-gray-300  dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)">
      <option value="" disabled>Pilih {{ label }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value" :selected="option.value === modelValue">
        {{ option.text }} {{  }}
      </option>
    </Field>
    <ErrorMessage :name="name" class="text-red-500 text-sm" />
  </div>
</template>
