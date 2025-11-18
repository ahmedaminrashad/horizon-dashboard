import apiClient from '../apiClient'
import { REQUESTS } from '../enums/requestEnum'

const STORAGE_KEY = 'auth'

export function saveAuth({ token, user }) {
  const data = { token, user }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasPermissionTo(user, permission) {
  if (!user || !Array.isArray(user.permissions)) return false
  return user.permissions.includes(permission)
}

export async function login(credentials) {
  const res = await apiClient.post(REQUESTS.AUTH.LOGIN, credentials)
  // Backend may return access_token or token; normalize to token
  const token = res.data.access_token || res.data.token
  const user = res.data.user || { ...res.data, access_token: undefined, token: undefined }
  saveAuth({ token, user })
  return { token, user }
}

export async function fetchMe() {
  const res = await apiClient.get(REQUESTS.AUTH.ME)
  const me = res.data
  const current = loadAuth()
  saveAuth({
    token: current?.token || null,
    user: me,
  })
  return me
}

export async function logout() {
  try {
    // Call logout endpoint if available
    await apiClient.post(REQUESTS.AUTH.LOGOUT)
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error)
  } finally {
    // Always clear local auth
    clearAuth()
  }
}


