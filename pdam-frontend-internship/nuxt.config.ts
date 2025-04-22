// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({ 
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  components: true,
  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    scanPageMeta: 'after-resolve',
    sharedPrerenderData: false,
    compileTemplate: true,
    resetAsyncDataToUndefined: true,
    templateUtils: true,
    relativeWatchPaths: true,
    normalizeComponentNames: false,
    spaLoadingTemplateLocation: 'within',
    defaults: {
      useAsyncData: {
        deep: true
      }
    }
  },

  unhead: {
    renderSSRHeadOptions: {
      omitLineBreaks: false
    }
  },

  typescript: {
    typeCheck: true
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap',
        },
      ]
    }, 
  },
  css: [
    './assets/css/style.css', 
  ], 
  modules: [['@nuxtjs/tailwindcss', {
    exposeConfig: true,
    viewer: true,
  }], '@nuxt/image', '@nuxt/icon', '@pinia/nuxt','@vee-validate/nuxt',],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      storage: process.env.NUXT_PUBLIC_STORAGE,
      apiBaseSso: process.env.NUXT_PUBLIC_SSO,
      hwid: process.env.NUXT_PUBLIC_HWID,
      apiBaseRegion: process.env.NUXT_PUBLIC_API_REGION,
      apiKeyBaseRegion: process.env.NUXT_PUBLIC_API_KEY_REGION,
    }
  },   
})