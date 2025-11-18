import apiClient from '../apiClient'
import { REQUESTS } from '../enums/requestEnum'

/**
 * Fetch all users from the backend
 * @param {Object} params - Query parameters (e.g., { page, limit, search, role })
 * @returns {Promise} API response with users data
 */
export async function getUsers(params = {}) {
  const response = await apiClient.get(REQUESTS.USERS.LIST, { params })
  return response.data
}

/**
 * Fetch user statistics
 * @returns {Promise} API response with user statistics
 */
export async function getUserStats() {
  const response = await apiClient.get(REQUESTS.USERS.STATS)
  return response.data
}

/**
 * Get a single user by ID
 * @param {string|number} id - User ID
 * @returns {Promise} API response with user data
 */
export async function getUserById(id) {
  const response = await apiClient.get(REQUESTS.USERS.DETAIL(id))
  return response.data
}

