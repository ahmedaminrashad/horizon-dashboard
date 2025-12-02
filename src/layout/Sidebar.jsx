import React from 'react'
import { ROUTES } from '../routes/routes'
import { getRoutePath } from '../utils/navigation'

function Sidebar({ activeNav, onNavChange, user, onLogout }) {
  const navItems = [
    {
      id: ROUTES.OVERVIEW,
      label: 'Overview',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
    },
    {
      id: ROUTES.USER_MANAGEMENT,
      label: 'User Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="15" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M17.5 7.5C17.5 8.88071 16.3807 10 15 10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
    },
    {
      id: ROUTES.CLINIC_MANAGEMENT,
      label: 'Clinic Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="8" width="14" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 2L17 6V8H3V6L10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="6" y="10" width="2" height="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="10" y="10" width="2" height="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="14" y="10" width="2" height="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="6" y="14" width="2" height="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="10" y="14" width="2" height="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <line x1="9" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="5" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: ROUTES.PACKAGES,
      label: 'Packages',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 6V18" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 2L10 6L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: ROUTES.APPOINTMENTS,
      label: 'Appointments & Bookings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M13 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="10" cy="12" r="1" fill="currentColor"/>
        </svg>
      ),
    },
    {
      id: ROUTES.NOTIFICATIONS,
      label: 'Notifications & Alerts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 3C7.5 2.17157 8.17157 1.5 9 1.5H11C11.8284 1.5 12.5 2.17157 12.5 3V4.5H7.5V3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M4 7.5C4 6.67157 4.67157 6 5.5 6H14.5C15.3284 6 16 6.67157 16 7.5V13.5C16 14.3284 15.3284 15 14.5 15H5.5C4.67157 15 4 14.3284 4 13.5V7.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M7 15V16.5C7 17.3284 7.67157 18 8.5 18H11.5C12.3284 18 13 17.3284 13 16.5V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="15" cy="5" r="2" fill="currentColor"/>
        </svg>
      ),
    },
    {
      id: ROUTES.ROLE_PERMISSIONS,
      label: 'Role & Permissions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L3 5V9C3 13.5 6.5 17.5 10 18.5C13.5 17.5 17 13.5 17 9V5L10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 10L7 7L10 4L13 7L10 10Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
    },
    {
      id: ROUTES.SYSTEM_SETTINGS,
      label: 'System Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.6569 4.34315L14.2426 5.75736M5.75736 14.2426L4.34315 15.6569M15.6569 15.6569L14.2426 14.2426M5.75736 5.75736L4.34315 4.34315" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <aside className="sidebar">
      <nav className="nav">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={getRoutePath(item.id)}
            className={`nav-item ${activeNav === item.id ? 'nav-item-active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onNavChange(item.id)
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="profile-avatar">A</div>
          <div className="profile-info">
            <div className="profile-name">Admin User</div>
            <div className="profile-email">{user?.email || 'admin@clinic.com'}</div>
          </div>
        </div>

        <button className="nav-item nav-item-logout" onClick={onLogout}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 7L16 10M16 10L13 13M16 10H7M11 4C9.67392 4 8.40215 4.52678 7.46447 5.46447C6.52678 6.40215 6 7.67392 6 9V11C6 12.3261 6.52678 13.5979 7.46447 14.5355C8.40215 15.4732 9.67392 16 11 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

