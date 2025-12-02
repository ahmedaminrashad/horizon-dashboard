// Centralized route configuration
import DashboardHome from '../dashboard/Home'
import UserManagement from '../dashboard/users'
import ClinicManagement from '../dashboard/clinics'
import PackageManagement from '../dashboard/packages'

export const ROUTES = {
  OVERVIEW: 'overview',
  USER_MANAGEMENT: 'user-management',
  CLINIC_MANAGEMENT: 'clinic-management',
  PACKAGES: 'packages',
  APPOINTMENTS: 'appointments',
  NOTIFICATIONS: 'notifications',
  ROLE_PERMISSIONS: 'role-permissions',
  SYSTEM_SETTINGS: 'system-settings',
}

// Route to component mapping
export const routeComponents = {
  [ROUTES.OVERVIEW]: DashboardHome,
  [ROUTES.USER_MANAGEMENT]: UserManagement,
  [ROUTES.CLINIC_MANAGEMENT]: ClinicManagement,
  [ROUTES.PACKAGES]: PackageManagement,
  [ROUTES.APPOINTMENTS]: DashboardHome, // Placeholder - replace with actual component
  [ROUTES.NOTIFICATIONS]: DashboardHome, // Placeholder - replace with actual component
  [ROUTES.ROLE_PERMISSIONS]: DashboardHome, // Placeholder - replace with actual component
  [ROUTES.SYSTEM_SETTINGS]: DashboardHome, // Placeholder - replace with actual component
}

// Default route
export const DEFAULT_ROUTE = ROUTES.OVERVIEW

