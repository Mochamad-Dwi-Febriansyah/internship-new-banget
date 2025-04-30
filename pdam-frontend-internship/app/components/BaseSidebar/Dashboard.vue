<script setup lang="ts">
import { useAuthSso } from '~/composables/sso/useAuthSSO';

const props = defineProps<{
    isSidebarLeftOpen: boolean
}>()

const route = useRoute()
const router = useRouter()
const pendingLogout = ref(false)

const openDropdowns = ref<Record<string, boolean>>({})

const authSource = useCookie('auth_source')

const toggleDropdown = (label: string) => {
    openDropdowns.value[label] = !openDropdowns.value[label]
}

const { fetchPermissions, can, permissions, logout } = authSource.value === 'sso' ? useAuthSso() : useAuth()
const token = useCookie('access_token')

watch(token, async (val) => {
    if (val) await fetchPermissions()
}, { immediate: true })

const handleLogout = async () => {
    pendingLogout.value = true
    await logout()
    router.push("/masuk")
}

const isActive = (item: any): boolean => {
    // Jika item punya path langsung, cocokkan dengan route saat ini
    if (item.path) {
        return route.path === item.path
    }

    // Jika item punya children (submenu), cocokkan salah satu anak
    if (item.children && Array.isArray(item.children)) {
        return item.children.some((child: MenuItem) => route.path === child.path)
    }

    return false
}


const windowWidth = ref(1024); // Default ukuran layar (desktop)

// Pastikan hanya dijalankan di client-side
onMounted(() => {
    if (typeof window !== "undefined") {
        windowWidth.value = window.innerWidth;
        window.addEventListener("resize", updateWindowWidth);
    }
});
onUnmounted(() => {
    if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateWindowWidth);
    }
});

// Update ukuran layar saat berubah
const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
};

// Cek apakah mode mobile (<= 768px)
const isMobile = computed(() => windowWidth.value <= 768);

// Hitung lebar sidebar
const sidebarWidth = computed(() => {
    if (isMobile.value) {
        return props.isSidebarLeftOpen ? "12rem" : "0rem"; // Mobile: Tertutup full
    }
    return props.isSidebarLeftOpen ? "12rem" : "3.4rem"; // Desktop: Tetap 3.4rem
});


type MenuItem = {
    label: string;
    path: string;
    icon?: string;
    permission?: string;
    children?: MenuItem[]
};

type GroupedMenuItem =
    | MenuItem // item langsung (tanpa kategori)
    | { category: string; items: MenuItem[] }; // item dalam kategori

const groupedMenuItems: GroupedMenuItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'material-symbols:person' }, // tanpa kategori
    { label: 'Kehadiran', path: '/kehadiran', icon: 'material-symbols:co-present-outline-rounded', permission: 'pdamintern.attendances.view' },
    { label: 'Laporan Harian', path: '/laporan-harian', icon: 'material-symbols:add-notes-outline', permission: 'pdamintern.daily-reports.view' },
    // { label: 'Berkas', path: '/berkas', icon: 'material-symbols:checkbook-outline-rounded', permission: 'pdamintern.applications.view' }, // tanpa kategori 
    { label: 'Berkas', path: '/berkas', icon: 'material-symbols:checkbook-outline-rounded' }, // tanpa kategori 
    { label: 'Laporan Akhir', path: '/laporan-akhir', icon: 'material-symbols:add-notes-outline', permission: 'pdamintern.final-reports.view' },

    { label: 'Verifikasi Laporan Harian', path: '/verifikasi-laporan-harian', icon: 'material-symbols:verified-outline-rounded' },
    //  permission: 'pdamintern.daily-reports.view-mentor'

    { label: 'Verifikasi Mentor Laporan Akhir', path: '/verifikasi-mentor-laporan-akhir', icon: 'material-symbols:verified-outline-rounded' },
    //  permission: 'pdamintern.final-reports.view-mentor'
    { label: 'Verifikasi Pegawai Laporan Akhir', path: '/verifikasi-pegawai-laporan-akhir', icon: 'material-symbols:verified-outline-rounded' },
    // permission: 'pdamintern.final-reports.view-hr' 
    {
        category: 'Master',
        items: [
            { label: 'Aspek Penilaian', path: '/aspek-penilaian', icon: 'material-symbols:edit-note-outline-rounded' },
            // , permission: 'pdamintern.assessment-aspects.view'
            { label: 'Magang', path: '/magang', icon: 'material-symbols:user-attributes-rounded', },
            // permission: 'pdamintern.assessment-aspects.view' 
            { label: 'Penelitian', path: '/penelitian', icon: 'material-symbols:user-attributes-rounded', },
            
            { label: 'Profile', path: '/profile', icon: 'material-symbols:person', },
            // permission: 'pdamintern.assessment-aspects.view' 
            
            { label: 'Tanda Tangan', path: '/tanda-tangan', icon: 'material-symbols:signature-rounded' , },
        ]
    },
    // {
    //     category: 'Lainnya',
    //     items: [
    //         {
    //             path: '/penelitian',
    //             label: 'Pengaturane',
    //             icon: 'material-symbols:settings',
    //             children: [
    //                 { label: 'Akun', path: '/dashboard/pengaturan/akun', icon: 'material-symbols:person' },
    //                 { label: 'Notifikasi', path: '/dashboard/pengaturan/notif', icon: 'material-symbols:notifications' }
    //             ]
    //         },
    //         { label: 'Pengaturan', path: '/dashboard/pengaturan', icon: 'material-symbols:settings' },
    //         { label: 'Logout', path: '/logout', icon: 'material-symbols:logout' },

    //     ]
    // }
];


// console.log("permission", permissions)

const filteredMenuItems = computed(() => {
    return groupedMenuItems
        .map((section) => {
            if ('label' in section) {
                return !section.permission || can(section.permission) ? section : null
            }

            const filteredItems = section.items
                .map((item) => {
                    if (item.children) {
                        const visibleChildren = item.children.filter(child => !child.permission || can(child.permission))
                        if (visibleChildren.length) {
                            return { ...item, children: visibleChildren }
                        }
                        return null
                    }

                    return !item.permission || can(item.permission) ? item : null
                })
                .filter(Boolean)

            return filteredItems.length ? { ...section, items: filteredItems } : null
        })
        .filter(Boolean)
})
// console.log(permissions)
// console.log(groupedMenuItems)
// console.log(filteredMenuItems)
</script>

<template>
    <div class="bg-white border-r h-screen fixed transition-all duration-500 flex flex-col justify-between 
        dark:bg-gray-900 dark:border-gray-700" :style="{ width: sidebarWidth }">
        <div class="h-[calc(100vh-20vh)]">
            <div class="flex-1 h-[100%] overflow-y-auto scrollbar-hide">
                <ul :class="{ 'opacity-0 pointer-events-none': !isSidebarLeftOpen && isMobile }">
                    <template v-if="permissions.length" v-for="(section, index) in filteredMenuItems" :key="index">
                        <li v-if="section && 'label' in section" class="group relative py-2 px-4" :class="[isActive(section)
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50']">
                            <NuxtLink :to="section.path" class="flex items-center">
                                <Icon :name="section.icon" class="h-5 w-5 min-h-5 min-w-5"
                                    :class="{ 'mr-2': isSidebarLeftOpen }" />
                                <span v-if="isSidebarLeftOpen" class="text-[0.7rem] whitespace-nowrap truncate">{{
                                    section.label }}</span>
                            </NuxtLink>
                            <span v-if="!isSidebarLeftOpen" class="absolute top-1/2 -translate-y-1/2 left-full ml-2 px-2 py-1 text-[0.7rem] text-white 
                            bg-gray-700 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity 
                            whitespace-nowrap">
                                {{ section?.label }}
                            </span>
                        </li>

                        <template v-else>
                            <li v-if="section && section.category && isSidebarLeftOpen" class="whitespace-nowrap text-[.65rem] uppercase text-gray-500 font-semibold mt-3 mb-1 px-4
                        dark:text-gray-400">
                                {{ section.category }}
                            </li>

                            <li v-for="item in section?.items || []" :key="item?.label" class="group relative py-2 px-4"
                                :class="[isActive(item)
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50']">
                                <NuxtLink v-if="!item?.children" :to="item?.path"
                                    class="flex items-center justify-between cursor-pointer w-full">
                                    <div class="flex items-center">
                                        <Icon :name="item?.icon" class="h-5 w-5 min-h-5 min-w-5"
                                            :class="{ 'mr-2': isSidebarLeftOpen }" />
                                        <span v-if="isSidebarLeftOpen" class="text-[0.7rem] whitespace-nowrap truncate">
                                            {{ item?.label }}
                                        </span>
                                    </div>
                                </NuxtLink>

                                <div v-else class="flex items-center justify-between cursor-pointer w-full"
                                    @click="toggleDropdown(item.label)">
                                    <div class="flex items-center">
                                        <Icon :name="item?.icon" class="h-5 w-5 min-h-5 min-w-5"
                                            :class="{ 'mr-2': isSidebarLeftOpen }" />
                                        <span v-if="isSidebarLeftOpen" class="text-[0.7rem] whitespace-nowrap truncate">
                                            {{ item?.label }}
                                        </span>
                                    </div>
                                    <Icon :name="openDropdowns[item.label] ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                                        class="w-4 h-4" />
                                </div>

                                <ul v-if="item?.children" v-show="openDropdowns[item.label]" class="pl-6 mt-1">
                                    <li v-for="child in item.children" :key="child.label" class="py-2">
                                        <NuxtLink :to="child.path"
                                            class="flex items-center text-[0.7rem] text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                            <Icon :name="child.icon" class="w-4 h-4 mr-2" />
                                            <span>{{ child.label }}</span>
                                        </NuxtLink>
                                    </li>
                                </ul>

                                <span v-if="!isSidebarLeftOpen" class="absolute top-1/2 -translate-y-1/2 left-full ml-2 px-2 py-1 text-[0.7rem] text-white 
                            bg-gray-700 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity 
                            whitespace-nowrap">
                                    {{ item?.label }}
                                </span>
                            </li>
                        </template>
                    </template>
                </ul>
            </div>
        </div>

        <div :class="{ 'opacity-0 pointer-events-none': !isSidebarLeftOpen && isMobile }"
            class="border-t sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 dark:border-gray-700">
            <button @click="handleLogout" class="w-full flex items-center gap-2 py-2 px-4 transition-all text-red-500 
                hover:text-red-700 dark:hover:text-red-400">
                <Icon v-if="pendingLogout" name="codex:loader" class="h-5 w-5 min-h-5 min-w-5 animate-spin" />
                <Icon v-else name="material-symbols:power-settings-new-rounded" class="h-5 w-5 min-h-5 min-w-5" />
                <span v-if="isSidebarLeftOpen" class="text-sm font-semibold">Logout</span>
            </button>
        </div>
    </div>
</template>

<style scoped></style>