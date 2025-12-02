import apiClient from '../apiClient'
import { REQUESTS } from '../enums/requestEnum'

/**
 * Fetch all packages from the backend
 * @param {Object} params - Query parameters (e.g., { page, limit, search })
 * @returns {Promise} API response with packages data
 */
export async function getPackages(params = {}) {
  const response = await apiClient.get(REQUESTS.PACKAGES.LIST, { params })
  return response.data
}

/**
 * Get a single package by ID
 * @param {string|number} id - Package ID
 * @returns {Promise} API response with package data
 */
export async function getPackageById(id) {
  const response = await apiClient.get(REQUESTS.PACKAGES.DETAIL(id))
  return response.data
}

/**
 * Create a new package
 * @param {Object} packageData - Package data to create
 * @returns {Promise} API response with created package data
 */
export async function createPackage(packageData) {
  const response = await apiClient.post(REQUESTS.PACKAGES.CREATE, packageData)
  return response.data
}

/**
 * Update an existing package
 * @param {string|number} id - Package ID
 * @param {Object} packageData - Package data to update
 * @returns {Promise} API response with updated package data
 */
export async function updatePackage(id, packageData) {
  const response = await apiClient.patch(REQUESTS.PACKAGES.UPDATE(id), packageData)
  return response.data
}

/**
 * Delete a package
 * @param {string|number} id - Package ID
 * @returns {Promise} API response
 */
export async function deletePackage(id) {
  const response = await apiClient.delete(REQUESTS.PACKAGES.DELETE(id))
  return response.data
}

