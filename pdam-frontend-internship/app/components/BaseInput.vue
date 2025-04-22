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
    type: {
        type: String,
        default: 'text'
    },
    required: {
        type: Boolean,
        default: false
    },
    modelValue: [String, Number], // Pastikan mendukung berbagai tipe data
    errors: Object,
    errorsValBack: Object,
    placeholder: String,
    showToggle: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const showPassword = ref(false);
const togglePassword = () => {
    showPassword.value = !showPassword.value;
};
</script>

<template>
    <div>
        <label :for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>

        <div v-if="showToggle" class="relative">
            <Field 
                :type="showPassword ? 'text' : 'password'" 
                :name="name" 
                :id="name" 
                :placeholder="placeholder"
                class="block w-full p-2.5 border text-sm rounded-lg border-gray-300 pr-10  dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                :model-value="modelValue"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                :disabled="disabled"
            />
            <button type="button" @click="togglePassword"
                class="absolute inset-y-0 right-4 top-0 flex items-center text-gray-400">
                <Icon :name="showPassword ? 'material-symbols:visibility-off-outline-rounded' : 'material-symbols:visibility-outline-rounded'" class="w-6 h-6" />
            </button>
        </div>

        <Field 
            v-else 
            :type="type" 
            :name="name" 
            :id="name" 
            :placeholder="placeholder"
            class="block w-full p-2.5 border text-sm rounded-lg border-gray-300  dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            :class="classInput"
            :model-value="modelValue"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            :disabled="disabled"
        />

        <ErrorMessage :name="name" class="text-red-500 text-sm" />
        <p v-if="errorsValBack && errorsValBack[name]" class="text-red-500 text-sm">{{ errorsValBack[name][0] }}</p>
        <p v-if="errors?.[name]" class="text-red-500 text-sm">{{ errors[name] }}</p> 
        
    </div>
</template>
