import { useCustomFetch } from "~~/plugins/fetch-interceptor"
import type { ApiResponseSingle } from "~~/types/types"


interface Login
{
    access_token: string
    refresh_token: string
    message: string
}


export const useAuthSso = () => {  

    const customFetch = useCustomFetch()

  const permissions = useState<string[]>('permissions', () => [])

    const user = useState<any>('auth_user', () => null)

    const authSource = useCookie<'sso' | 'laravel'>('auth_source', {
      maxAge: 60 * 60, // 1 jam
      sameSite: 'lax',
    })
    
    const accessToken = useCookie<string | null>('access_token', {
      maxAge: 60 * 60, // 1 jam
      sameSite: 'lax',
    })
  
    const refreshToken = useCookie<string | null>('refresh_token', {
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      sameSite: 'lax',
    })
  
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseSso
  
    const setToken = (token: string | null, refresh: string | null) => {
      accessToken.value = token
    //   refreshToken.value = refresh
    }
  
    const clearToken = () => {
      accessToken.value = null
      refreshToken.value = null
      user.value = null
    }
  
    const loginSso = async (payload: { npp: string; password: string }) => {
      const { data, error } = await useFetch<ApiResponseSingle<Login>>('/portal-pegawai/api/auth/login', {
        baseURL,
        method: 'POST',
        body: payload,
      }) 
      if (error.value) throw error.value
      const tokens = data.value?.data ?? null
      if(tokens === null) throw new Error('Invalid token response') 
      setToken(tokens.access_token, tokens.refresh_token)
      authSource.value = 'sso'
      return data.value
    }

    const logout = async () => {
      await useFetch('/portal-pegawai/api/auth/logout', {
        baseURL,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
  
      clearToken()
    }

    const fetchPermissions = async () => {
      try {
        const { data } = await customFetch<ApiResponseSingle<{ permissions: string[] }>>('/portal-pegawai/api/auth/permission-names', {
          baseURL,
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        })
  
        permissions.value = data?.permissions || []
        return permissions.value
      } catch (error) {
        throw error
      }
    }
  
    const can = (perm: string): boolean => {
      return Array.isArray(permissions.value) && permissions.value.includes(perm)
    }

    return {
        loginSso,
        logout,
        fetchPermissions,
        can,

        permissions
    }
}
