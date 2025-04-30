import { useCustomFetch } from "~~/plugins/fetch-interceptor"
import type { ApiResponseAction, ApiResponseSingle } from "~~/types/types"

interface Login
{
    access_token: string
    refresh_token: string
    message: string
}


export const useAuth = () => {

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
    const baseURL = config.public.apiBase
  
    const setToken = (token: string | null, refresh: string | null) => {
      accessToken.value = token
      refreshToken.value = refresh
    }
  
    const clearToken = () => {
      accessToken.value = null
      refreshToken.value = null
      user.value = null
    }
  
    const login = async (payload: { email: string; password: string }) => {
      const { data, error } = await useFetch<ApiResponseSingle<Login>>('/auth/login', {
        baseURL,
        method: 'POST',
        body: payload,
      })
  
      if (error.value) throw error.value
      const tokens = data.value?.data ?? null
      if(tokens === null) throw new Error('Invalid token response') 
      setToken(tokens.access_token, tokens.refresh_token)
     authSource.value = 'laravel'
      return data.value
    }
  
    const logout = async () => {
      await useFetch('/auth/logout', {
        baseURL,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
  
      clearToken()
    }
  
    const fetchUser = async () => {
      const { data, error } = await useFetch('/auth/me', {
        baseURL,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
  
      if (error.value) throw error.value
  
      user.value = data.value
      return user.value
    }
  
    const validateToken = async () => {
      const { data, error } = await useFetch('/auth/validate-token', {
        baseURL,
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
  
      if (error.value) return false

      const response = data.value as { user_session: { is_expired: boolean } }
      return !response.user_session.is_expired
    }
  
    const refreshAccessToken = async () => {
      const { data, error } = await useFetch('/auth/refresh-token', {
        baseURL,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken.value}`,
        },
      })
  
      if (error.value) {
        clearToken()
        throw error.value
      }
  
      const newToken = (data.value as { access_token: string }).access_token
      accessToken.value = newToken
      return newToken
    }

  

    const fetchPermissions = async () => {
      try {
        const { data } = await customFetch<ApiResponseSingle<{ permissions: string[] }>>('auth/permissions', {
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

    const forgotPassword = async (payload: FormData) => {
      try {
        const data = await $fetch<ApiResponseAction>('/auth/forgot-password', {
          baseURL,
          method: 'POST',
          body: payload,
        })
        return data
      } catch (error: any) {
        throw error?.data || error
      }
    }
    
    const resetPassword = async (payload: FormData) => {
      try {
        const data = await $fetch<ApiResponseAction>('/auth/reset-password', {
          baseURL,
          method: 'POST',
          body: payload,
        })
        return data
      } catch (error: any) {
        throw error?.data || error
      }
    }
  
    return {
      user,
      accessToken,
      refreshToken,
      permissions,
      can,
      login,
      logout,
      fetchUser,
      validateToken,
      refreshAccessToken,
      clearToken,
      fetchPermissions,
      forgotPassword,
      resetPassword
    }
  }
  