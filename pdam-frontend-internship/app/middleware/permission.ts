export default defineNuxtRouteMiddleware(async (to) => {
  const accessToken = useCookie<string | null>('access_token')

  if (!accessToken.value) {
    return navigateTo('/masuk')
  }

    const { fetchPermissions, permissions } = useAuth()
  
    if (!permissions.value.length) {
      await fetchPermissions()
    }
  
    const requiredPermission = to.meta.permission as string | undefined
    if (requiredPermission && !permissions.value.includes(requiredPermission)) {
      return navigateTo('/unauthorized')
    } 
  })
  