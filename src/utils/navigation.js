// Navigation utility functions for URL-based routing
import { ROUTES, DEFAULT_ROUTE } from '../routes/routes'

/**
 * Get the current route from the URL hash
 * @returns {string} The current route
 */
export function getRouteFromUrl() {
  const hash = window.location.hash.slice(1) // Remove the #
  const route = hash || `/${DEFAULT_ROUTE}`
  
  // Remove leading slash if present
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route
  
  // Validate route exists, otherwise return default
  const validRoutes = Object.values(ROUTES)
  return validRoutes.includes(cleanRoute) ? cleanRoute : DEFAULT_ROUTE
}

/**
 * Update the URL hash with a new route
 * @param {string} route - The route to navigate to
 */
export function navigateToRoute(route) {
  window.location.hash = `/${route}`
}

/**
 * Get the URL path for a route
 * @param {string} route - The route
 * @returns {string} The URL path
 */
export function getRoutePath(route) {
  return `#/${route}`
}

