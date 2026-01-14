import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000, // 10 second timeout
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.log('Network error - backend may be down')
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - checking if this is a login attempt...')
      
      // Don't logout if this is a login attempt (POST to /auth/login)
      const isLoginAttempt = error.config?.method === 'post' && 
                           error.config?.url?.includes('/auth/login')
      
      if (isLoginAttempt) {
        console.log('This is a login attempt - not logging out current user')
        return Promise.reject(error)
      }
      
      console.log('401 on protected route - clearing auth data')
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
