import axios from 'axios'
import { store } from '../app/store'
import { setCredentials, clearCredentials } from '../features/auth/authSlice'

const axiosInstance = axios.create({ withCredentials: true })

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  failedQueue = []
}

export const axiosBaseQuery =
  ({ baseUrl = '' } = {}) =>
  async ({ url, method = 'GET', data, params, headers = {} }) => {
    const token = store.getState().auth.accessToken
    const reqHeaders = { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }

    try {
      const res = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: reqHeaders,
        withCredentials: true,
      })
      return { data: res.data }
    } catch (err) {
      const status = err.response?.status
      const errData = err.response?.data

      if (status === 401 && !url.includes('/auth/login')) {
        if (!isRefreshing) {
          isRefreshing = true
          try {
            const refreshRes = await axiosInstance.post(
              '/api/v1/auth/refresh',
              {},
              { withCredentials: true }
            )
            const newToken = refreshRes.data.data.accessToken
            store.dispatch(setCredentials({ accessToken: newToken }))
            processQueue(null, newToken)
            isRefreshing = false

            const retryRes = await axiosInstance({
              url: baseUrl + url,
              method,
              data,
              params,
              headers: { ...headers, Authorization: `Bearer ${newToken}` },
              withCredentials: true,
            })
            return { data: retryRes.data }
          } catch (refreshErr) {
            processQueue(refreshErr, null)
            isRefreshing = false
            store.dispatch(clearCredentials())
            if (typeof window !== 'undefined') window.location.href = '/login'
            return { error: { status: 401, data: 'Session expired' } }
          }
        }

        return new Promise((resolve) => {
          failedQueue.push({
            resolve: async (newToken) => {
              try {
                const retryRes = await axiosInstance({
                  url: baseUrl + url,
                  method,
                  data,
                  params,
                  headers: { ...headers, Authorization: `Bearer ${newToken}` },
                  withCredentials: true,
                })
                resolve({ data: retryRes.data })
              } catch (retryErr) {
                resolve({
                  error: { status: retryErr.response?.status, data: retryErr.response?.data },
                })
              }
            },
            reject: (e) =>
              resolve({ error: { status: e.response?.status || 401, data: e.response?.data } }),
          })
        })
      }

      return { error: { status, data: errData || err.message } }
    }
  }
