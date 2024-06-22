import Axios, { AxiosRequestConfig } from 'axios'
import { getAuth } from 'firebase/auth'
import qs from 'qs'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const AXIOS_INSTANCE = Axios.create({ 
    baseURL: BACKEND_URL,
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }) 
}) // use your own URL here or environment variable
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
