<script setup>
defineProps({
    headers: {
        type: Array,
        required: true,
        default: () => [],
    },
})
</script>

<template>
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th v-for="(header, index) in headers" :key="index" class="px-6 py-2"
                    :class="header.center ? 'text-center' : ''">
                    {{ header.label }}
                </th>
            </tr>
        </thead>
        <tbody>
            <slot />
        </tbody>
    </table>
</template>