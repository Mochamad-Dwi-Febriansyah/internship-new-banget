// composables/useTTE.ts
import { useCustomFetch } from "~~/plugins/fetch-interceptor";
import type {
  ApiResponse,
  ApiResponseAction,
  ApiResponseSingle,
} from "~~/types/types";

export interface TTE {
    nama_dokumen: string;
    jumlah_signature: number;
    notes: string;
    details: {
      info_tsa: {
        name: string;
        tsa_cert_validity: string | null;
      };
      signature_field: string;
      info_signer: {
        issuer_dn: string;
        signer_name: string;
        signer_cert_validity: string;
        signer_dn: string;
        cert_user_certified: boolean;
      };
      signature_document: {
        signed_using_tsa: boolean;
        reason: string | null;
        document_integrity: boolean;
        signature_value: string | null;
        signed_in: string;
        location: string | null;
        hash_value: string | null;
      };
    }[];
    summary: string;
  }


export function useTTE() { 
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const loading = ref(false);

  const cekKeabsahan = async (payload: FormData) => {
    loading.value = true;
        try {
          const data = await $fetch<ApiResponseSingle<TTE>>(`${apiBase}/cek-keabsahan`, { 
            method: 'POST',
            body: payload,
          })
          return data
        } catch (error: any) {
          throw error?.data || error
        }finally{
            loading.value = false;
        }
      }

      return {
        cekKeabsahan,
        loading
      }
}