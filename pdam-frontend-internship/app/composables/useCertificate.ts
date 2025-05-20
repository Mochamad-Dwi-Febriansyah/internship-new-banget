// composables/useCertificate.ts
import { useCustomFetch } from "~~/plugins/fetch-interceptor";
import type { 
  ApiResponseAction, 
} from "~~/types/types";
 

export function useCertificate() {
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

   

  async function create(payload: FormData) {
    loading.value = true;
    errorsValBack.value = {};

    try {
      const data = await customFetch<ApiResponseAction>(
        `${apiBase}/certificate`,
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
 

  return { 
    create, 
    errorsValBack,
    loading,
    errorMessage,
  };
}
