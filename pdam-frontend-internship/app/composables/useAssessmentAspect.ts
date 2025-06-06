// composables/useAssessmentAspect.ts
import { useCustomFetch } from '~~/plugins/fetch-interceptor'
import type { ApiResponse, ApiResponseAction, ApiResponseSingle } from '~~/types/types'



export interface AssessmentAspect {
id: string
  code_field: string
  name_field: string
  status: string
}

export function useAssessmentAspect() {
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
      const data = await customFetch<ApiResponse<AssessmentAspect>>(`${apiBase}/assessment-aspects`, {
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

  async function getById(id: string | number) {
    loading.value = true
    try {
      const data = await customFetch<ApiResponseSingle<AssessmentAspect>>(`${apiBase}/assessment-aspects/${id}`, {
        headers,
      })

      return data
    } catch (err) {
      console.error('Error fetching by id:', err)
      return null
    }finally{
      loading.value = false
    }
  }

  async function create(payload: FormData) {
    loading.value = true
    errorsValBack.value = {}

    try {
      const data = await customFetch<ApiResponseAction>(`${apiBase}/assessment-aspects`, {
        method: 'POST',
        headers,
        body: payload,
      })

      return data
    } catch (err: any) {
        console.log("err dat",err.data.errors)
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
      const data = await customFetch<ApiResponseAction>(`${apiBase}/assessment-aspects/${id}`, {
        method: 'POST',
        headers,
        body: payload,
      })

      return data
    } catch (err: any) {
        console.log("err dat",err.data.errors)
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
      const data = await customFetch(`${apiBase}/assessment-aspects/${id}`, {
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
    getById,
    create,
    update,
    destroy,
    errorsValBack,
    loading,
    errorMessage,
  }
}
