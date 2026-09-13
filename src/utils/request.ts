import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios'

const request: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers['ngrok-skip-browser-warning'] = 'any'
        const token = localStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error: AxiosError) => Promise.reject(error),
)

request.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => Promise.reject(error),
)

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
    request.get<T, T>(url, config)

export const post = <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
) => request.post<T, T, D>(url, data, config)

export const put = <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
) => request.put<T, T, D>(url, data, config)

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
    request.delete<T, T>(url, config)

export default request