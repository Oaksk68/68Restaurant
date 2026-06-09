import axios from 'axios'

const api = axios.create({
  baseURL: `http://${window.location.hostname}:8000/api/v1`,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((response) => {
  const token = localStorage.getItem('sanctum_token')
  if (token) {
    response.headers['Authorization'] = `Bearer ${token}`
  }
  return response
})

export default api