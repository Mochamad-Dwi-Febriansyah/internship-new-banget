// composables/useDayliReport.ts
import { useCustomFetch } from "~~/plugins/fetch-interceptor";
import type {
  ApiResponse,
  ApiResponseAction,
  ApiResponseSingle,
} from "~~/types/types";

 
export interface DayliReport {    
  id?: string;
  user_id?: string;
  attendance_id?: string; 
  title?: string;
  report?: string; 
  result?: string;
  status: string;
  rejection_note?: string;
  verified_by_id?: string; 
  attendance?: Attendance
}

export function useDayliReport() {
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
      const data = await customFetch<ApiResponse<DayliReport>>(
        `${apiBase}/daily-reports`,
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

  async function getById(id: string | number, date: string) {
    loading.value = true;
    try {
      const data = await customFetch<ApiResponseSingle<DayliReport>>(
        `${apiBase}/daily-reports/${id}?date=${date}`,
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
  async function exportDayliReport() {
    loading.value = true;
    try {
      const data = await fetch(
        `${apiBase}/daily-reports/export`,
        {
          headers,
        }
      );

      const blob = await data.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "logbook.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      return data;
    } catch (err:any) {
      console.error("Error fetching by id:", err);
      throw new Error(err?.data.message || "Gagal menyimpan data");
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
        `${apiBase}/daily-reports`,
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
        `${apiBase}/daily-reports/${id}`,
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
      const data = await customFetch(`${apiBase}/daily-reports/${id}`, {
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
  async function getDayliReportsByMentor(params = {}) {
    loading.value = true;
    try {
      const data = await customFetch<ApiResponse<DayliReport>>(
        `${apiBase}/daily-reports/mentor`,
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

  async function mentorVerification(payload: any) {
    loading.value = true;
    errorsValBack.value = {};
    try {
      const data = await customFetch<ApiResponseAction>(
        `${apiBase}/daily-reports/mentor-verification`,
        {
          method: "POST",
          headers,
          body: payload,
        }
      );
      return data;
    } catch (err: any) { 
      const errData = err?.data;
      if (errData?.errors) {
        errorsValBack.value = errData.errors;
      }
      console.error("Error mentor verification:", err);
      throw new Error(errData?.message || "Gagal memverifikasi sebagai mentor");
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
    getDayliReportsByMentor,
    mentorVerification,
    exportDayliReport,
    errorsValBack,
    loading,
    errorMessage,
  };
}
