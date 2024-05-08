import Axios, { AxiosRequestConfig } from 'axios'
import { getAuth } from 'firebase/auth'
import { initializeApp, getApps, getApp } from 'firebase/app'
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_DEV_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_DEV_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_DEV_PROJECT_ID,
}
getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const AXIOS_INSTANCE = Axios.create({ baseURL: BACKEND_URL }) // use your own URL here or environment variable
// Add an interceptor to attach the Firebase JWT token to every request
AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    const auth = getAuth()
    const user = auth.currentUser

    if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig
): Promise<T> => {
    const promise = AXIOS_INSTANCE({
        ...config,
        ...options,
    }).then(({ data }) => data)

    return promise
}
