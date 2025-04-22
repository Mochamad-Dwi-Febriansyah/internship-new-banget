export default defineNuxtRouteMiddleware((to, from) => {
    const accessToken = useCookie<string | null>('access_token')
  
    // Jika tidak ada token, redirect ke login
    if (!accessToken.value) {
      return navigateTo('/masuk')
    }
  })