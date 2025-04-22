// composables/useDashboard.ts
import { useCustomFetch } from "~~/plugins/fetch-interceptor";
import type { ApiResponseNoPagination } from "~~/types/types";

export interface DashboardCard {
  title: string;
  value: number;
  permission: string;
}

export function useDashboard() {
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

  async function getDashboardCards(params = {}) {
    loading.value = true;
    errorMessage.value = "";

    try {
      const data = await customFetch<ApiResponseNoPagination<DashboardCard[]>>(
        `${apiBase}/statistics`,
        {
          headers,
          query: params,
        }
      );
      return data;
    } catch (err: any) {
      errorMessage.value = err.message || "Terjadi kesalahan.";
      console.error("Error fetching dashboard cards:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    getDashboardCards,
    errorsValBack,
    loading,
    errorMessage,
  };
}
