import type { ApiResponseSingle } from "~~/types/types"

interface Roles 
{
    role: string[]
}

interface Permissions 
{
    permissions: string[]
}
interface HasRole
{
    has_role: string
}

interface HasPermission
{
    has_permission: string
}

export const usePermissions = () => {
    const accessToken = useCookie<string | null>('access_token')
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase
  
    const getRoles = async () => {
      const { data, error } = await useFetch<ApiResponseSingle<Roles>>('/auth/role', {
        baseURL,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      if (error.value) throw error.value
      return data.value?.data.role ?? []
    }
  
    const getPermissions = async () => {
      const { data, error } = await useFetch<ApiResponseSingle<Permissions>>('/auth/permissions', {
        baseURL,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      if (error.value) throw error.value
      return data.value?.data.permissions ?? []
    }
  
    const hasPermission = async (permission: string) => {
      const { data, error } = await useFetch<ApiResponseSingle<HasPermission>>(`/auth/has-permission/${permission}`, {
        baseURL,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      if (error.value) return false
      return data.value?.data.has_permission ?? false
    }
  
    const hasRole = async (role: string) => {
      const { data, error } = await useFetch<ApiResponseSingle<HasRole>>(`/auth/has-role/${role}`, {
        baseURL,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      if (error.value) return false
      return data.value?.data.has_role ?? false
    }
  
    return { getRoles, getPermissions, hasPermission, hasRole }
  }
  