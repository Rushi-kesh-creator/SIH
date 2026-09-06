import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the JWT to every outgoing request automatically.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aic_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// A listener the AuthContext registers itself with, so this module
// never has to import React state directly.
let onUnauthorized = () => {}
export const registerUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network failure — backend unreachable.
      error.isNetworkError = true
      return Promise.reject(error)
    }

    const status = error.response.status
    if (status === 401) {
      onUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default api
