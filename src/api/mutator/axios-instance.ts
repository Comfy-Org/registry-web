import Axios, { AxiosRequestConfig } from 'axios'
import qs from 'qs'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const AXIOS_INSTANCE = Axios.create({
    baseURL: BACKEND_URL,
    paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'repeat' }),
}) // use your own URL here or environment variable

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
