// composables/useFinalReport.ts
import { useCustomFetch } from "~~/plugins/fetch-interceptor";
import type {
  ApiResponse,
  ApiResponseAction,
  ApiResponseSingle,
} from "~~/types/types";

export interface FinalReportListItem {
  id: string;
  user_id: string;
  document_id: string;
  school_university_id: string; 
  title: string;
  report: string;
  assessment_report_file: string;
  final_report_file: string;
  photo: string;
  video: string;
  mentor_verified_by_id: string | null;
  mentor_verification_status: 'pending' | 'approved' | 'rejected';
  mentor_rejection_note: string | null;
  hr_verified_by_id: string | null;
  hr_verification_status: 'pending' | 'approved' | 'rejected';
  hr_rejection_note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: FinalReportUser
}

// Detail
export interface FinalReportUser {
  id: string;
  name: string;
  email: string;
  nisn_npm_nim: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  photo: string;
  address: string;
  postal_code: string;
  province: string;
  city: string;
  district: string;
  village: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FinalReportDocument {
  id: string;
  user_id: string;
  school_university_id: string;
  mentor_id: string;
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
}

export interface Histori{
  id: string 
  version_number: string 
  rejection_note?: string 
  created_at: string  
}
export interface FinalReportDetail extends FinalReportListItem {
  user: FinalReportUser;
  document: FinalReportDocument;
  histories: Histori[]
}

export function useFinalReport() {
  const customFetch = useCustomFetch();
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const token = useCookie("access_token");

  const loading = ref(false);
  const errorMessage = ref("");
  const errorsValBack = ref<Record<string, string[]>>({});

  const headers = {
    Authorization: `Bearer ${token.value}`,
    Accept: "application/json",
  };

  async function getList(params = {}) {
    loading.value = true;
    errorMessage.value = "";

    try {
      const data = await customFetch<ApiResponse<FinalReportListItem>>(
        `${apiBase}/final-reports`,
        {
          headers,
          query: params,
        }
      );

      return data;
    } catch (err: any) {
      errorMessage.value = err.message || "Terjadi kesalahan.";
      console.error("Error fetching list:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: string | number) {
    loading.value = true;
    try {
      const data = await customFetch<ApiResponseSingle<FinalReportDetail>>(
        `${apiBase}/final-reports/${id}`,
        {
          headers,
        }
      );

      return data;
    } catch (err) {
      console.error("Error fetching by id:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: FormData) {
    loading.value = true;
    errorsValBack.value = {};

    try {
      const data = await customFetch<ApiResponseAction>(
        `${apiBase}/final-reports`,
        {
          method: "POST",
          headers,
          body: payload,
        }
      );

      return data;
    } catch (err: any) {
      console.log("err dat", err.data.errors);
      const errData = err?.data;
      if (errData?.errors) {
        errorsValBack.value = errData.errors;
      }
      console.error("Error creating aspect:", err);
      throw new Error(errData?.message || "Gagal menyimpan data");
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string | number, payload: FormData) {
    loading.value = true;
    errorsValBack.value = {};
    payload.append("_method", "PUT"); // override ke PUT
    try {
      const data = await customFetch<ApiResponseAction>(
        `${apiBase}/final-reports/${id}`,
        {
          method: "POST",
          headers,
          body: payload,
        }
      );

      return data;
    } catch (err: any) {
      console.log("err dat", err.data.errors);
      const errData = err?.data;
      if (errData?.errors) {
        errorsValBack.value = errData.errors;
      }
      console.error("Error updateing aspect:", err);
      throw new Error(errData?.message || "Gagal menyimpan data");
    } finally {
      loading.value = false;
    }
  }

  async function destroy(id: string | number) {
    try {
      const data = await customFetch(`${apiBase}/final-reports/${id}`, {
        method: "DELETE",
        headers,
      });

      return data;
    } catch (err) {
      console.error("Error deleting aspect:", err);
      return false;
    }
  }

  // Tambahan: Verifikasi oleh Mentor
  async function getFinalReportsByMentor(params = {}) {
    loading.value = true;
    try {
      const data = await customFetch<ApiResponse<FinalReportListItem>>(
        `${apiBase}/final-reports/mentor-verification`,
        {
          headers,
          query: params,
        }
      );
      return data;
    } catch (err) {
      console.error("Error fetching mentor reports:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function mentorVerification(id: string | number, payload: any) {
    loading.value = true;
    try {
      const data = await customFetch<ApiResponseAction>(
        `${apiBase}/final-reports/${id}/mentor-verification`,
        {
          method: "POST",
          headers,
          body: payload,
        }
      );
      return data;
    } catch (err: any) {
      const errData = err?.data;
      console.error("Error mentor verification:", err);
      throw new Error(errData?.message || "Gagal memverifikasi sebagai mentor");
    } finally {
      loading.value = false;
    }
  }

    // Tambahan: Verifikasi oleh Mentor
    async function getFinalReportsByHr(params = {}) {
      loading.value = true;
      try {
        const data = await customFetch<ApiResponse<FinalReportListItem>>(
          `${apiBase}/final-reports/hr-verification`,
          {
            headers,
            query: params,
          }
        );
        return data;
      } catch (err) {
        console.error("Error fetching hr reports:", err);
        return null;
      } finally {
        loading.value = false;
      }
    }
  
    async function hrVerification(id: string | number, payload: any) {
      loading.value = true;
      try {
        const data = await customFetch<ApiResponseAction>(
          `${apiBase}/final-reports/${id}/hr-verification`,
          {
            method: "POST",
            headers,
            body: payload,
          }
        );
        return data;
      } catch (err: any) {
        const errData = err?.data;
        console.error("Error hr verification:", err);
        throw new Error(errData?.message || "Gagal memverifikasi sebagai hr");
      } finally {
        loading.value = false;
      }
    }

  return {
    getList,
    getById,
    create,
    update,
    destroy,
    getFinalReportsByMentor,
    mentorVerification,
    getFinalReportsByHr,
    hrVerification,
    errorsValBack,
    loading,
    errorMessage,
  };
}
