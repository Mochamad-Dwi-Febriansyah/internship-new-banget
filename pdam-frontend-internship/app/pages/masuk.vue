<script setup lang="ts"> 
definePageMeta({
  layout: false
})
import { ref } from 'vue'
import { Form, Field, ErrorMessage, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { object, string } from 'yup'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotification } from '~~/stores/notification' 
import { useAuthSso } from '~/composables/sso/useAuthSSO'


const router = useRouter()
const { login, fetchUser } = useAuth()
const { loginSso } = useAuthSso()

const { addNotification } = useNotification()

const isLogin = ref(true)
const toggleForm = () => (isLogin.value = !isLogin.value)
const loading = ref(false)
const errorMsg = ref('')

// Schema Login Magang
const loginMagangSchema = toTypedSchema(object({
  email: string().required('Email wajib diisi').email('Email tidak valid'),
  password: string().required('Kata sandi wajib diisi'),
}))

// Schema Login Pegawai
const loginPegawaiSchema = toTypedSchema(object({
  npp: string().required('NPP wajib diisi'),
  password: string().required('Kata sandi wajib diisi'),
}))

// Handler Login Magang
const onSubmitMagang = async (values: any, { resetForm }: { resetForm: () => void }) => {  
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await login(values)
    // console.log(result)
    addNotification('success', result?.message  || 'Login berhasil');
    resetForm()
    await fetchUser()
    router.push('/dashboard')
  } catch (err: any) {
    console.error(err.data.message)
    errorMsg.value = err.data?.message || 'Login gagal'
    addNotification('error', err.data.message);
  } finally {
    
    loading.value = false
  }
}

// Handler Login Pegawai
const onSubmitPegawai = async (values: any, { resetForm }: { resetForm: () => void }) => {  
    loading.value = true
  errorMsg.value = ''
  try {
    const payload = {
        ...values,
        hwid: 'prod-try-edms-mode'
        } 
    const result = await loginSso(payload)
    // console.log("Sas",result?.data)
    addNotification('success', result?.message || 'Login berhasil');
    resetForm()
    // await fetchUser()
    router.push('/dashboard')
  } catch (err: any) {
    console.error(err.data.message)
    errorMsg.value = err.data?.message || 'Login gagal'
    addNotification('error', err.data.message);
  } finally {
    
    loading.value = false
  }
}
</script> 

<template>
    <NuxtLayout> 
        <Notification /> 
       <div class="h-screen flex  dark:bg-gray-900 dark:text-white">
           <div class="hidden lg:flex w-1/2 bg-blue-700 dark:bg-blue-900  items-center justify-center p-10 text-white relative">
               <div class="text-center lg:text-left z-10">
                   <NuxtLink to="/">
                       <NuxtImg src="/images/base_logo_pdam.png" alt="Company Logo" class="mb-4 mx-auto lg:mx-0 object-contain"
                           sizes="lg:70px xl:80px" format="webp" />
                   </NuxtLink>
                   <h1 class="text-4xl font-bold leading-tight">
                       Perumda Air Minum <br> Tirta Moedal Kota Semarang
                   </h1>
                   <p class="text-lg mt-2">Jl. Kelud Raya No.60, Petompon, Kec. Gajahmungkur, Kota Semarang, Jawa Tengah 50237</p>
               </div>
   
               <!-- Water Effect -->
               <NuxtImg src="/images/water-effect.png" alt="Water Effect"
                   class="absolute bottom-0 left-0 w-full object-cover opacity-40" format="webp"
                   sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw" />
           </div>
   
           <div class="w-full lg:w-1/2 flex items-center justify-center p-6">
               <div class="max-w-md w-full min-h-[400px] flex justify-center items-center relative overflow-hidden">
                   <transition name="slide">
                       <div v-if="isLogin" key="login" class="absolute w-full">
                           <h2 class="text-3xl font-semibold text-center mb-6">Masuk ke Akun Anda</h2>
                           <Form @submit="onSubmitMagang" :validation-schema="loginMagangSchema">
                               <div class="grid gap-6 mb-6 md:grid-cols-1 dark:text-gray-900">
                                   <BaseInput label="Email" name="email" type="email" placeholder="mail@mail.com" required />
                                   <BaseInput label="Kata Sandi" name="password" type="password" :showToggle="true"  required />
                               </div> 
                               <div class="flex justify-between items-center mb-4"> 
                                   <a href="#" class="text-blue-500 hover:underline ms-auto  dark:text-blue-300">Lupa kata sandi?</a>
                               </div> 
                               <Button type="submit" :disabled="loading" class="w-full">
                                   <Icon v-if="loading" name="codex:loader" class="text-xl align-middle"/>
                                   <span v-else>Masuk</span>
                               </Button>
                           </Form>
                           <p class="text-center text-gray-600 mt-4  dark:text-gray-300">
                               <a href="#" class="text-blue-500 hover:underline dark:text-blue-300" @click="toggleForm">Masuk Pegawai?</a>
                           </p>
                       </div>
   
                       <div v-else key="register" class="absolute w-full">
                           <h2 class="text-3xl font-semibold text-center mb-6">Masuk Pegawai</h2>
                           <Form @submit="onSubmitPegawai" :validation-schema="loginPegawaiSchema">
                               <div class="grid gap-6 mb-6 md:grid-cols-1  dark:text-gray-900">
                                   <BaseInput label="NPP" name="npp" type="string"  required />
                                   <BaseInput label="Password" name="password" type="password" :showToggle="true"  required />
                               </div>   
                               <Button type="submit" :disabled="loading" class="w-full">
                                   <Icon v-if="loading" name="codex:loader" class="text-xl align-middle"/>
                                   <span v-else>Masuk</span>
                               </Button>
                           </Form>
                           <p class="text-center text-gray-600 mt-4  dark:text-gray-300">
                               <a href="#" class="text-blue-500 hover:underline dark:text-blue-300" @click="toggleForm">Masuk Magang?</a>
                           </p>
                       </div>
                   </transition>
               </div>
           </div>
       </div>
    </NuxtLayout>
</template>

<style scoped>
/* Animasi Slide */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
    position: absolute;
    width: 100%;
}

.slide-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.slide-enter-to {
    transform: translateX(0);
    opacity: 1;
}

.slide-leave-from {
    transform: translateX(0);
    opacity: 1;
}

.slide-leave-to {
    transform: translateX(-100%);
    opacity: 0;
}
</style>
