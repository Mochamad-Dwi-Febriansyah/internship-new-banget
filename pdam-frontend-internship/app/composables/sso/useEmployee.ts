// composables/useEmployee.ts
import { useCustomFetch } from '~~/plugins/fetch-interceptor'
import type { ApiResponse, ApiResponseAction, ApiResponseNoPagination, ApiResponseSingle } from '~~/types/types'



export interface Employee {
    npp: string,
    nama: string,
    jenis_kelamin: string,
    status_pegawai: string,
    pangkat_golongan: string,
    jabatan: string,
    satker_id: string,
    nik: string,
    ttd: string
}

export function useEmployee() {
    const customFetch = useCustomFetch()
    const config = useRuntimeConfig()
    const apiBaseSso = config.public.apiBaseSso
    const token = useCookie("access_token")

    const loading = ref(false)
    const errorMessage = ref('')
    const errorsValBack = ref<Record<string, string[]>>({})

    const headers = {
        Authorization: `Bearer ${token.value}`,
        Accept: "application/json",
    }

    async function getList(params = {}) {
        loading.value = true
        errorMessage.value = ''

        try {
            const data = await customFetch<ApiResponseNoPagination<Employee>>(`${apiBaseSso}portal-pegawai/api/client/user/all-pegawai`, {
                headers,
                query: params,
            })

            return data
        } catch (err: any) {
            errorMessage.value = err.message || 'Terjadi kesalahan.'
            console.error('Error fetching list:', err)
            throw err
        } finally {
            loading.value = false
        }
    }
    return {
        getList,
    }
}