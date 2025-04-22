<script setup lang="ts">
const props = defineProps({
  label: String,
  name: {
    type: String,
    default: ''
  },
  classInput: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  modelValue: [String, Number],
  errors: Object,
  errorsValBack: Object,
  placeholder: String,
  rows: {
    type: Number,
    default: 4
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label :for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <Field
      as="textarea"
      :name="name"
      :id="name"
      :rows="rows"
      :placeholder="placeholder"
      class="block w-full p-2.5 border text-sm rounded-lg border-gray-300 dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
      :class="classInput"
      :model-value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :disabled="disabled"
    />

    <ErrorMessage :name="name" class="text-red-500 text-sm" />
    <p v-if="errorsValBack && errorsValBack[name]" class="text-red-500 text-sm">
      {{ errorsValBack[name][0] }}
    </p>
    <p v-if="errors?.[name]" class="text-red-500 text-sm">
      {{ errors[name] }}
    </p>
  </div>
</template>
