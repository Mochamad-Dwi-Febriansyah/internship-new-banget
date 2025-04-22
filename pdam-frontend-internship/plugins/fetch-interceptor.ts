// composables/useCustomFetch.ts
import { useCookie, navigateTo } from '#app'
import { useNotification } from '~~/stores/notification'

export function useCustomFetch() {
  return new Proxy($fetch, {
    apply: async (target, thisArg, args) => {
      const token = useCookie('access_token')
      const { refreshAccessToken } = useAuth()
      const { addNotification } = useNotification()

      const cookiesToDelete = [
        'access_token', 'refresh_token',
      ]

      // Tambahkan Authorization header ke setiap request
      const defaultOptions = args[1] || {}
      args[1] = {
        ...defaultOptions,
        headers: {
          Authorization: `Bearer ${token.value}`,
          // "ngrok-skip-browser-warning": "69420", // opsional
          ...defaultOptions.headers,
        },
      }

      try {
        return await Reflect.apply(target as (...args: any[]) => Promise<any>, thisArg, args)
      } catch (error: any) {
        if (error?.status === 401 && (error?.data?.message === "Token is invalid or expired" || (error?.data?.message === "Unauthenticated."))) {
          try {
            await refreshAccessToken()
            return await Reflect.apply(target as (...args: any[]) => Promise<any>, thisArg, args)
          } catch (refreshError) {
            token.value = null
            return await navigateTo('/masuk')
          }
        } else if (error?.status === 403 && error?.data?.message === "Unauthorized") {
          return navigateTo('/unauthorized')
        } else if (error?.status >= 500) {
          console.error("🔥 Server error:", error.status, error.data)
          throw new Error("Terjadi kesalahan pada server. Silakan coba lagi nanti.")
        } else if (
          error?.status === 0 || 
          error?.status === undefined || 
          error?.message?.includes("Failed to fetch")
        ) {
          addNotification('error', "🚫 Tidak dapat terhubung ke server!")
          cookiesToDelete.forEach(name => {
            useCookie(name).value = null
          })
          return navigateTo('/')
        }

        throw error
      }
    }
  })
}
