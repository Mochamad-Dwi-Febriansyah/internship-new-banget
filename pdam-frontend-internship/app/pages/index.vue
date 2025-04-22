<script setup lang="ts">

</script>

<template>
    <NuxtLayout>
        <section>
            <div class="container lg:px-16   md:py-12 py-12 dark:bg-gray-900">
                <div class="flex flex-col md:flex-row justify-between gap-4 ">
                    <div class="md:flex-[2]">
                        <div class="flex flex-row justify-between mb-3">
                            <h1 class="text-3xl text-gray-800 dark:text-white">Berita</h1>
                        </div>

                        <!-- Grid Berita -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            <!-- Card Berita 1 -->
                            <div class="bg-white dark:bg-gray-800 border rounded-lg overflow-hidden hover:shadow-sm transition ">
                                <NuxtImg src="/images/slide-1.jpg" alt="Berita 1" class="w-full h-40 object-cover" />
                                <div class="p-4">
                                    <h2 class="text-lg font-semibold text-gray-700  dark:text-white">Judul Berita 1</h2>
                                    <p class="text-gray-600  dark:text-gray-300 text-sm mt-2 line-clamp-3">
                                        Ini adalah deskripsi singkat berita yang menarik dan memberikan gambaran isi
                                        berita...
                                    </p>
                                    <div class="mt-4 flex  justify-end">
                                        <NuxtLink
                                            class="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline flex items-center gap-2 cursor-pointer">
                                            Selengkapnya
                                            <Icon name="material-symbols:arrow-forward-rounded" class="w-6 h-6" />
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Berita 2 -->
                            <div class="bg-white  dark:bg-gray-800  border rounded-lg overflow-hidden hover:shadow-sm transition">
                                <NuxtImg src="/images/slide-2.jpg" alt="Berita 2" class="w-full h-40 object-cover" />
                                <div class="p-4">
                                    <h2 class="text-lg font-semibold text-gray-700  dark:text-white">Judul Berita 2</h2>
                                    <p class="text-gray-600  dark:text-gray-300 text-sm mt-2 line-clamp-3">
                                        Berita terbaru yang sedang viral dan banyak dibicarakan, baca selengkapnya di
                                        sini...
                                    </p>
                                    <div class="mt-4 flex justify-end">
                                        <NuxtLink class="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                                            <Icon name="material-symbols:arrow-forward-rounded" class="w-6 h-6" />
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Berita 3 -->
                            <div class="bg-white  dark:bg-gray-800  border rounded-lg overflow-hidden hover:shadow-sm transition">
                                <NuxtImg src="/images/slide-3.png" alt="Berita 3" class="w-full h-40 object-cover" />
                                <div class="p-4">
                                    <h2 class="text-lg font-semibold text-gray-700  dark:text-white">Judul Berita 3</h2>
                                    <p class="text-gray-600  dark:text-gray-300 text-sm mt-2 line-clamp-3">
                                        Simak berita terbaru yang sedang menjadi perbincangan hangat di media sosial...
                                    </p>
                                    <div class="mt-4 flex justify-end">
                                        <NuxtLink class="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                                            <Icon name="material-symbols:arrow-forward-rounded" class="w-6 h-6" />
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                            <!-- Card Berita 3 -->
                            <div class="bg-white  dark:bg-gray-800  border rounded-lg overflow-hidden hover:shadow-sm transition">
                                <NuxtImg src="/images/slide-3.png" alt="Berita 3" class="w-full h-40 object-cover" />
                                <div class="p-4">
                                    <h2 class="text-lg font-semibold text-gray-700  dark:text-white">Judul Berita 3</h2>
                                    <p class="text-gray-600  dark:text-gray-300 text-sm mt-2 line-clamp-3">
                                        Simak berita terbaru yang sedang menjadi perbincangan hangat di media sosial
                                        ihunitbgnyu Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, quos.
                                    </p>
                                    <div class="mt-4 flex justify-end">
                                        <NuxtLink class="text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                                            <Icon name="material-symbols:arrow-forward-rounded" class="w-6 h-6" />
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="md:w-1/4">
                        <div class="">

                            <!-- List Menu Action -->
                            <div class="flex flex-col gap-3">
                                <a href="#"
                                    class="flex items-center gap-2 bg-blue-500 text-white text- px-8 py-4 rounded-lg  hover:bg-blue-600 transition">
                                    <Icon name="material-symbols:credit-card" class="w-5 h-5" />
                                    Info Tagihan Pelanggan
                                </a>

                                <NuxtLink to="/program"
                                    class="flex items-center gap-2 bg-green-500 text-white text- px-8 py-4 rounded-lg  hover:bg-green-600 transition">
                                    <Icon name="material-symbols:school-outline" class="w-5 h-5" />
                                    Program
                                </NuxtLink>

                                <a href="#"
                                    class="flex items-center gap-2 bg-yellow-500 text-white text- px-8 py-4 rounded-lg  hover:bg-yellow-600 transition">
                                    <Icon name="material-symbols:headset-mic" class="w-5 h-5" />
                                    Call Center
                                </a>

                                <a href="#"
                                    class="flex items-center gap-2 bg-red-500 text-white text- px-8 py-4 rounded-lg  hover:bg-red-600 transition">
                                    <Icon name="material-symbols:storefront-outline" class="w-5 h-5" />
                                    Loket Pembayaran
                                </a>

                                <a href="#"
                                    class="flex items-center gap-2 bg-purple-500 text-white text- px-8 py-4 rounded-lg  hover:bg-purple-600 transition">
                                    <Icon name="material-symbols:cloud-download-outline" class="w-5 h-5" />
                                    Dapatkan Aplikasinya
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </NuxtLayout>
</template>

<style scoped></style>