import { useCustomFetch } from '~~/plugins/fetch-interceptor';
import type {ApiResponse, ApiResponseAction, ApiResponseSingle} from '~~/types/types'


interface User {
    id: string;
    name: string;
    email: string;
  }
  
interface CekApplication {
    document_status: 'pending' | 'approved' | 'rejected'; // gunakan union type jika status hanya terbatas
    registration_number: string;
    user_id: string;
    user: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  nisn_npm_nim: string;
  role: string
  address: string
  province: string
  city: string
  district: string
  village: string
  postal_code: string
}

interface SchoolUni {
  id: string;
  school_university_name: string;
  school_major?: string | null;
  university_faculty?: string | null;
  university_program_study?: string | null; 
  school_university_address?: string | null
  school_university_district?: string | null
  school_university_city?: string | null
  school_university_province?: string | null
  school_university_postal_code?: string | null
}

export interface DocumentItem {
  id: string; 
  user_id: string;
  registration_number: string;
  identity_photo: string;
  application_letter: string;
  accepted_letter: string | null;
  start_date: string;
  end_date: string;
  work_certificate: string;
  mentor_id: string;
  document_status: 'pending' | 'accepted' | 'rejected';
  user: User;
  school_uni: SchoolUni;
}

export function useApplications() {
  const customFetch = useCustomFetch()
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const token = useCookie("access_token"); // Ambil token dari cookie
  const errors = ref<Record<string, string[]>>({});
  const loading = ref(false)
  const errorMessage = ref('')

  const errorsValBack = ref<Record<string, string[]>>({})

  const headers = {
    Authorization: `Bearer ${token.value}`,
    Accept: "application/json",
  };

  async function getApplications(params = {}) {
    try {
      const { data } = await useFetch<ApiResponse<DocumentItem>>(`${apiBase}/applications`, {
        headers,
        query: params,
      });
      return data.value;
    } catch (error) {
      console.error("Error fetching applications:", error);
      return null;
    }
  }

  async function getApplicationById(id: string) {
    loading.value = true
    try {
      const data   = await customFetch<ApiResponseSingle<DocumentItem>>(`${apiBase}/applications/${id}`, {
        headers,
      });
      return data
    } catch (error) {
      console.error(`Error fetching application with ID ${id}:`, error);
      return null;
    }finally{
      loading.value = false
    }
  }

  async function createApplication(payload: FormData) {
    loading.value = true
    errors.value = {};
    const { data, error } = await useFetch(`${apiBase}/applications`, {
      method: "POST",
      headers,
      body: payload,
    });
  
    if (error.value) {
      const errData = error.value.data;
      if (errData?.status === "error" && errData?.errors) {
        errors.value = errData.errors;
        throw new Error(errData.message || 'Validasi gagal');
      }
      throw new Error('Gagal mengajukan');
    }
    
        loading.value = false
    
    return data.value;
  } 

  async function updateApplication(id: string, payload: FormData) {
    try {
      const { data } = await useFetch(`${apiBase}/applications/${id}`, {
        method: "POST",
        headers,
        body: payload,
      });
      return data.value;
    } catch (error) {
      console.error(`Error updating application with ID ${id}:`, error);
      return null;
    }
  }

 
    async function updateStatusAndMentorApplication(id: string | number, payload: FormData) {
      loading.value = true
      errorsValBack.value = {}
      payload.append('_method', 'PUT')   
      try {
        const data = await customFetch<ApiResponseAction>(`${apiBase}/applications/${id}/update-status-mentor`, {
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
    async function submissionReceipt(id: string | number, payload: FormData) {
      loading.value = true
      errorsValBack.value = {}
      payload.append('_method', 'PUT')   
      try {
        const data = await customFetch<ApiResponseAction>(`${apiBase}/applications/${id}/submission-receipt`, {
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

    async function exportWorkCertificate(id: string | number, payload: FormData) {
      loading.value = true
      errorsValBack.value = {}
      payload.append('_method', 'PUT')   
      try {
        const data = await customFetch<ApiResponseAction>(`${apiBase}/documents/export-work-certificate/${id}`, {
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

  async function deleteApplication(id: string) {
    try {
      const { data } = await useFetch(`${apiBase}/applications/${id}`, {
        method: "DELETE",
        headers,
      });
      return data.value;
    } catch (error) {
      console.error(`Error deleting application with ID ${id}:`, error);
      return false;
    }
  }

  async function checkApplicationStatus(registrationNumber: string) {
    loading.value = true
    errorMessage.value = ''
  
    try {
      const { data, error } = await useFetch<ApiResponseSingle<CekApplication>>(`${apiBase}/applications/${registrationNumber}/status`, {
        method: 'GET',
        headers,
      })
  
      if (error.value) {
        const errData = error.value.data
  
        if (errData?.message) {
          errorMessage.value = errData.message
          throw new Error(errData.message)
        }
  
        throw new Error('Gagal memeriksa status pengajuan.')
      }
  
      return data.value
    } catch (err) { 
      if (!errorMessage.value) errorMessage.value = 'Terjadi kesalahan saat memeriksa status.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getMenteesByMentor(mentorId: string, perPage = 1) {
    try {
      const { data } = await useFetch(`${apiBase}/applications/mentees`, {
        headers,
        query: { user_sso_id: mentorId, per_page: perPage },
      });
      return data.value;
    } catch (error) {
      console.error(`Error fetching mentees for mentor ${mentorId}:`, error);
      return null;
    }
  }

  return {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    checkApplicationStatus,
    getMenteesByMentor,
    updateStatusAndMentorApplication,
    submissionReceipt,
    exportWorkCertificate,
    errors,
    loading,
    errorMessage,
    errorsValBack,
  };
}
