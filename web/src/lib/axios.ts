import axios from 'axios'
import { useAuthStore } from '../stores/useAuthStore'

const api = axios.create({
  baseURL: 'https://68restaurant-production.up.railway.app/api/v1',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanctum_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth data
      useAuthStore.getState().logout()

      // Redirect to login page
      if (window.location.pathname !== '/staff/login') {
        window.location.href = '/staff/login'
      }
    }
    return Promise.reject(error)
  }
)


export default api