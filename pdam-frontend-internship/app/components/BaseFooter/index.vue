<script setup lang="ts">
const sections = [
    {
        title: "Solutions",
        links: ["Marketing", "Insights", "Automation", "Commerce"],
    },
    {
        title: "Support",
        links: ["Submit ticket", "Documentation", "Guides"],
    },
    {
        title: "Company",
        links: ["About", "Blog", "Job", "Press"],
    },
    {
        title: "Legal",
        links: ["Terms of service", "Privacy policy", "License"],
    }
];
</script>

<template>
    <footer class="border-t bg-white dark:bg-gray-900">
        <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 lg:py-12 border-b border-gray-300 dark:border-gray-700">
            <div class="flex flex-grow flex-col lg:grid grid-flow-col auto-cols-fr gap-8 xl:col-span-2">
                <div class="flex flex-grow-2 flex-col items-start lg:col-span-2">
                    <NuxtImg 
                        sizes="47px"
                        src="/images/logo-web-pdam.png" 
                        format="webp"
                        densities="x1"
                        alt="logo pdam"
                    />
                    
                    <p class="my-6 text-gray-600 dark:text-gray-400">
                        Jl. Kelud Raya No.60, Petompon, Kec. Gajahmungkur, Kota Semarang, Jawa Tengah 50237
                    </p>

                    <div class="flex items-start gap-5"> 
                        <Icon name="uil:instagram" class="w-8 h-8 text-gray-600 dark:text-gray-300 hover:text-gray-700 hover:dark:text-white" />
                        <Icon name="uil:twitter" class="w-8 h-8 text-gray-600 dark:text-gray-300 hover:text-gray-700 hover:dark:text-white" />
                        <Icon name="uil:whatsapp" class="w-8 h-8 text-gray-600 dark:text-gray-300 hover:text-gray-700 hover:dark:text-white" />
                        <Icon name="uil:facebook" class="w-8 h-8 text-gray-600 dark:text-gray-300 hover:text-gray-700 hover:dark:text-white" />
                    </div>
                </div>

                <div v-for="(section, index) in sections" :key="index" class="flex flex-grow-1 flex-col items-start">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-white">{{ section.title }}</h3>
                    <ul role="list" class="mt-6 space-y-4">
                        <li v-for="(item, idx) in section.links" :key="idx">
                            <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 hover:dark:text-white">
                                {{ item }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div> 

        <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4 lg:py-6">
            <p class="text-md text-gray-700 dark:text-gray-400">
                Copyright © 2016-2025 Nuxt - All rights reserved.
            </p>
        </div>
    </footer>
</template>


