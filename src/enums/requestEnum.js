// Central place to define API endpoint paths used with axios / apiClient.
// Use these constants instead of hard‑coding strings in components.

export const REQUESTS = Object.freeze({
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  PATIENTS: {
    LIST: '/patients',
    DETAIL: (id) => `/patients/${id}`,
  },
  DOCTORS: {
    LIST: '/doctors',
    DETAIL: (id) => `/doctors/${id}`,
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    DETAIL: (id) => `/appointments/${id}`,
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    STATS: '/users/stats',
  },
})


