// composables/useAssessmentAspect.ts
import { useCustomFetch } from '~~/plugins/fetch-interceptor'
import type { ApiResponse, ApiResponseAction, ApiResponseSingle } from '~~/types/types'

export interface UserListItem {
    id: string;
    name: string;
    email: string;
    nisn_npm_nim: string;
    role: string;
    address: string;
    province: string;
    city: string;
    district: string;
    village: string;
    postal_code: string;
    status: string;
    document: Document
  }
  
  // Data lengkap untuk detail
  export interface SchoolUni {
    id: string;
    school_university_name: string;
    school_major: string | null;
    university_faculty: string;
    university_program_study: string;
    school_university_address: string;
    school_university_postal_code: string;
    school_university_province: string;
    school_university_city: string;
    school_university_district: string;
    school_university_village: string;
    school_university_phone_number: string;
    school_university_email: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }
  
  export interface Document {
    id: string;
    user_id: string;
    school_university_id: string;
    mentor_id: string | null;
    registration_number: string;
    identity_photo: string;
    application_letter: string;
    accepted_letter: string | null;
    start_date: string;
    end_date: string;
    work_certificate: string;
    document_status: string;
    verified_by_id: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    school_uni: SchoolUni;
  }
  
  export interface UserDetail extends UserListItem {
    date_of_birth: string;
    gender: string;
    phone_number: string;
    photo: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    document: Document;
  }

export function useUsers() {
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
      const data = await customFetch<ApiResponse<UserListItem>>(`${apiBase}/users`, {
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
      const data = await customFetch<ApiResponseSingle<UserDetail>>(`${apiBase}/users/${id}`, {
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
      const data = await customFetch<ApiResponseAction>(`${apiBase}/users`, {
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
      console.error('Error creating data:', err)
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
      const data = await customFetch<ApiResponseAction>(`${apiBase}/users/${id}`, {
        method: 'POST',
        headers,
        body: payload,
      })

      return data
    } catch (err: any) {
        console.log("err dat",err.data)
        const errData = err?.data
        if (errData?.errors) {
          errorsValBack.value = errData.errors
        }
        //   console.error('Error updating data:', err.message)
        throw new Error(errData.message || 'Gagal menyimpan data')
    } finally {
        loading.value = false
    }
  }

  async function destroy(id: string | number) {
    try {
      const data = await customFetch(`${apiBase}/users/${id}`, {
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
