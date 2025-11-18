import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // enable if your backend uses cookies/sessions
})

// Helper function to get token from localStorage
function getAuthToken() {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token || parsed?.access_token || null
  } catch (error) {
    console.warn('Error reading auth token:', error)
    return null
  }
}

// Request interceptor: Automatically attach token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Always attach token from localStorage if present
    const token = getAuthToken()
    
    if (token) {
      // Ensure Authorization header is set with Bearer token
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Remove Authorization header if no token exists
      delete config.headers.Authorization
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data)
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request)
      console.error('Request URL:', error.config?.url)
      console.error('Base URL:', apiClient.defaults.baseURL)
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  },
)

export default apiClient


