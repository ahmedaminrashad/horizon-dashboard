import apiClient from '../apiClient'
import { REQUESTS } from '../enums/requestEnum'

/**
 * Fetch all roles from the backend
 * @returns {Promise} API response with roles data
 */
export async function getRoles() {
  const response = await apiClient.get(REQUESTS.ROLES.LIST)
  return response.data
}

