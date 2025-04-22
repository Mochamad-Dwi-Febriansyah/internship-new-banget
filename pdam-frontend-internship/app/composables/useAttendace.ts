// composables/useAttendance.ts
import { useCustomFetch } from '~~/plugins/fetch-interceptor'
import type { ApiResponse, ApiResponseAction, ApiResponseSingle } from '~~/types/types'

 interface DayliReportd {
  id: string;
  user_id: string;
  attendance_id: string; 
  title: string;
  report: string; 
  result: string;
  status: string;
  rejection_note: string;
  verified_by_id: string; 
 }

export interface Attendance {
  id: string
  user_id: string
  date: string
  check_in_time: string
  check_in_photo: string
  check_out_time: string
  check_out_photo: string
  check_in_latitude: string
  check_out_latitude: string
  check_in_longitude: string
  check_out_longitude: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string
  daily_report: DayliReportd
}

export function useAttendance() {
  const customFetch = useCustomFetch()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
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
      const data = await customFetch<ApiResponse<Attendance>>(`${apiBase}/attendances`, {
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

  async function getListToday(params = {}) {
    loading.value = true
    errorMessage.value = ''

    try {
      const data = await customFetch<ApiResponseSingle<Attendance>>(`${apiBase}/attendances/today`, {
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

  async function getById(id: string | number, date: string) {
    loading.value = true
    try {
      const data = await customFetch<ApiResponseSingle<Attendance>>(`${apiBase}/attendances/${id}?date=${date}`, {
        headers,
      })

      return data
    } catch (err) {
      console.error('Error fetching by id:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function create(payload: FormData) {
    loading.value = true
    errorsValBack.value = {}

    try {
      const data = await customFetch<ApiResponseAction>(`${apiBase}/attendances`, {
        method: 'POST',
        headers,
        body: payload,
      })

      return data
    } catch (err: any) {
      console.log("err dat", err.data.errors)
      const errData = err?.data
      if (errData?.errors) {
        errorsValBack.value = errData.errors
      }
      console.error('Error creating aspect:', err)
      throw new Error(errData?.message || 'Gagal menyimpan data')
    } finally {
      loading.value = false
    }
  }

  async function update(id: string | number, payload: FormData) {
    loading.value = true
    errorsValBack.value = {}
    payload.append('_method', 'PUT') // override ke PUT 
    try {
      const data = await customFetch<ApiResponseAction>(`${apiBase}/attendances/${id}`, {
        method: 'POST',
        headers,
        body: payload,
      })

      return data
    } catch (err: any) {
      console.log("err dat", err.data.errors)
      const errData = err?.data
      if (errData?.errors) {
        errorsValBack.value = errData.errors
      }
      console.error('Error updateing aspect:', err)
      throw new Error(errData?.message || 'Gagal menyimpan data')
    } finally {
      loading.value = false
    }
  }

  async function destroy(id: string | number) {
    try {
      const data = await customFetch(`${apiBase}/attendances/${id}`, {
        method: 'DELETE',
        headers,
      })

      return data
    } catch (err) {
      console.error('Error deleting aspect:', err)
      return false
    }
  }

  return {
    getList,
    getListToday,
    getById,
    create,
    update,
    destroy,
    errorsValBack,
    loading,
    errorMessage,
  }
}
