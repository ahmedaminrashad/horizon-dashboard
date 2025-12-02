import axios from 'axios'
import { getCurrentLanguage } from './utils/language'

// Get API base URL from environment variable
// In production, this should be set via .env.production file
// In development, this should be set via .env file
// Fallback: use localhost for development, but warn in production
const getApiBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  
  if (envUrl) {
    return envUrl
  }
  
  // If no env variable is set, check if we're in production mode
  const isProduction = import.meta.env.PROD
  
  if (isProduction) {
    // In production, default to same-origin API (relative path)
    // This assumes API is on the same domain
    console.warn(
      '⚠️ VITE_API_BASE_URL not set in production! ' +
      'Using relative path /api. ' +
      'Set VITE_API_BASE_URL in .env.production before building.'
    )
    return '/api'
  }
  
  // Development fallback
  return 'http://localhost:3000/api'
}

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
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

// Request interceptor: Automatically attach token and language to all requests
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
    
    // Always attach language header to all requests
    const currentLang = getCurrentLanguage()
    config.headers['lang'] = currentLang
    
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


