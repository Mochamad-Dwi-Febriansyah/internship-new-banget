<script setup lang="ts">
import {
    Dialog,
    DialogPanel,
    PopoverGroup,
} from '@headlessui/vue'
import {
    XMarkIcon,
} from '@heroicons/vue/24/outline'
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/vue/20/solid'
import { useDark, useToggle } from '@vueuse/core'

const mobileMenuOpen = ref(false)

const isDark = useDark()
const toggleDark = useToggle(isDark)

defineProps<{
    toggleSidebar: (event: MouseEvent) => void;
}>();
</script>

<template>
    <header class="bg-white border-b sticky top-0 z-20  dark:bg-gray-900 dark:border-gray-700">
        <nav class="container mx-auto flex items-center justify-between p-4 py-3" aria-label="Global">

            <div class="flex lg:flex-1">
                <button @click="toggleSidebar" class="text-gray-800 mr-4 dark:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <NuxtLink to="/" class="-m-1.5 p-1.5 flex items-center">
                    <span class="sr-only">Your Company</span>
                    <NuxtImg sizes="xs:30vw sm:35vw md:40px" src="/images/logo-web-pdam.png" format="webp"
                        densities="x1 x2" alt="logo pdam" />
                    <div class="flex flex-col items-start ml-4 justify-center">
                        <h2
                            class="-mx-3 block rounded-lg px-1 pt-2 pb-1 text-sm md:text-base font-semibold text-blue-900 hover:text-blue-800 dark:text-white">
                            Tirta Moedal
                        </h2>
                        <!-- <span class="text-gray-500 text-sm md:text-md">Kota Semarang</span> -->
                    </div>
                </NuxtLink>
            </div>

            <div class="flex lg:hidden">


                <button type="button"
                    class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                    @click="mobileMenuOpen = true">
                    <span class="sr-only">Open main menu</span>
                    <Icon name="material-symbols:keyboard-arrow-down" class="w-6 h-6" />
                </button>
            </div>
            <PopoverGroup class="hidden lg:flex lg:gap-x-6">

                <!-- <p class="text-sm/6 font-normal text-gray-700">{{ time }}</p> -->

                <div class="relative w-full">
                </div>



            </PopoverGroup>
            <div class="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center gap-4">
                <!-- Informasi User -->
                <div class="flex items-center gap-2">
                    <div class="flex flex-row items-center text-gray-700 dark:text-gray-200">
                        <div class="flex flex-col text-right">
                        <button
                            @click="toggleDark()"
                            class="p-2 rounded-full transition duration-300 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center group"
                            aria-label="Toggle Dark Mode"
                        >
                            <Icon
                            :name="isDark ? 'material-symbols:dark-mode' : 'material-symbols:light-mode'"
                            class="w-6 h-6 text-gray-700 dark:text-gray-200 transition-transform duration-500 group-active:rotate-[360deg]"
                            />
                        </button>
                        </div>
                    </div>
                </div> 
            </div>

            <!-- <button @click="authStore.refreshAccessToken()">refresh</button> -->
        </nav>
        <Dialog class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
            <div class="fixed inset-0 z-10" />

            <DialogPanel
                class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-900 dark:text-white dark:ring-gray-700">
                <div class="flex items-center justify-between ">
                    <a href="#" class="-m-1.5 p-1.5">
                    </a>
                    <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                        @click="mobileMenuOpen = false">
                        <span class="sr-only">Close menu</span>
                        <XMarkIcon class="size-6" aria-hidden="true" />
                    </button>
                </div>
                <div class="mt-6 flow-root">
                    <div class="-my-6 divide-y divide-gray-500/10">
                        <div class="space-y-2 py-6">

                            <a href="#"
                                class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800">Info
                                Cabang</a>




                        </div>
                        <!-- <div class="py-6">
              <Icon v-if="pendingLogout" name="tabler:loader-2" class="w-5 h-5 animate-spin text-gray-500" />
              <button v-else @click="handleLogout"
                class="text-sm/6 font-normal flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500  transition">
                <Icon name="tabler:logout" class="w-5 h-5" />
                Logout
              </button>
            </div> -->
                    </div>
                </div>
            </DialogPanel>
        </Dialog>
    </header>
</template>



<style scoped></style>