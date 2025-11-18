import React, { useState, useEffect, useMemo } from 'react'
import Header from '../../layout/Header'
import { getUsers } from '../../services/userService'
import DataTable from '../../components/DataTable'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    doctors: 0,
    staff: 0,
    patients: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = async (page = pagination.page, limit = pagination.limit, search = searchQuery) => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page,
        limit,
      }
      
      // Add search parameter if search query exists
      if (search && search.trim()) {
        params.search = search.trim()
      }
      
      const response = await getUsers(params)
      
      // Handle response format: { data: [], meta: {} }
      const usersData = response.data || []
      const meta = response.meta || {}
      
      setUsers(usersData)
      
      // Update pagination state from meta
      setPagination({
        page: meta.page || page,
        limit: meta.limit || limit,
        total: meta.total || 0,
        totalPages: meta.totalPages || 0,
        hasNextPage: meta.hasNextPage || false,
        hasPreviousPage: meta.hasPreviousPage || false,
      })
      
      // Update stats from total count
      if (meta.total !== undefined) {
        setStats((prev) => ({
          ...prev,
          total: meta.total,
        }))
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.response?.data?.message || 'Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1, 10, searchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch users when pagination changes
  const handlePaginationChange = (newPagination) => {
    fetchUsers(newPagination.page, newPagination.limit, searchQuery)
  }

  // Debounced search - fetch users when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, pagination.limit, searchQuery) // Reset to page 1 on search
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const summaryCards = [
    { title: 'All Customers', count: stats.total, icon: '👥', active: true },
    { title: 'Admins', count: stats.admins, icon: '👤' },
    { title: 'Doctors', count: stats.doctors, icon: '🩺' },
    { title: 'Staff', count: stats.staff, icon: '👤' },
    { title: 'Patients', count: stats.patients, icon: '👥' },
  ]

  // No need to filter users client-side since search is handled server-side
  const filteredUsers = users

  // Get user avatar initial
  const getUserAvatar = (user) => {
    if (user.avatar) return user.avatar
    if (user.name) {
      const names = user.name.split(' ')
      if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    return 'U'
  }

  const getRoleBadgeClass = (role) => {
    const classes = {
      doctor: 'role-badge role-badge-doctor',
      admin: 'role-badge role-badge-admin',
      staff: 'role-badge role-badge-staff',
      patient: 'role-badge role-badge-patient',
    }
    return classes[role] || 'role-badge'
  }

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'User',
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="user-cell">
              <div className="user-avatar">{getUserAvatar(user)}</div>
              <div className="user-info">
                <div className="user-name">{user.name || user.fullName || 'N/A'}</div>
                <div className="user-email">{user.email || user.phone || 'N/A'}</div>
              </div>
            </div>
          )
        },
        enableSorting: true,
      },
      {
        accessorKey: 'role.name',
        header: 'Role',
        cell: ({ row }) => {
          const role = row.original.role?.name?.toLowerCase() || ''
          return (
            <span className={getRoleBadgeClass(role)}>
              {row.original.role?.name || 'N/A'}
            </span>
          )
        },
        enableSorting: true,
      },
      {
        accessorKey: 'specialty',
        header: 'Specialty',
        cell: ({ row }) => row.original.specialty || row.original.specialization || 'N/A',
        enableSorting: true,
      },
      {
        accessorKey: 'clinic',
        header: 'Clinic',
        cell: ({ row }) => row.original.clinic || row.original.clinicName || 'N/A',
        enableSorting: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'active'
          return (
            <span className={`status-badge status-${status}`}>
              <span className="status-dot"></span>
              {status}
            </span>
          )
        },
        enableSorting: true,
      },
      {
        accessorKey: 'createdAt',
        header: 'Join Date',
        cell: ({ row }) => {
          const date = row.original.joinDate || row.original.createdAt
          return date ? new Date(date).toLocaleDateString() : 'N/A'
        },
        enableSorting: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const userItem = row.original
          return (
            <div className="action-buttons">
              <button className="action-btn" title="Edit" onClick={() => console.log('Edit user:', userItem.id)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.3333 2.00001C11.5084 1.8249 11.7163 1.68699 11.9447 1.59431C12.1731 1.50162 12.4173 1.45605 12.6667 1.45605C12.916 1.45605 13.1602 1.50162 13.3886 1.59431C13.617 1.68699 13.8249 1.8249 14 2.00001C14.1751 2.17512 14.313 2.38301 14.4057 2.61141C14.4984 2.83981 14.5439 3.08403 14.5439 3.33334C14.5439 3.58266 14.4984 3.82688 14.4057 4.05528C14.313 4.28368 14.1751 4.49157 14 4.66668L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="action-btn" title="Delete" onClick={() => console.log('Delete user:', userItem.id)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4H14M6 4V3C6 2.46957 6.21071 1.96086 6.58579 1.58579C6.96086 1.21071 7.46957 1 8 1H8C8.53043 1 9.03914 1.21071 9.41421 1.58579C9.78929 1.96086 10 2.46957 10 3V4M12.6667 4V13.3333C12.6667 13.8638 12.456 14.3725 12.0809 14.7475C11.7058 15.1226 11.1971 15.3333 10.6667 15.3333H5.33334C4.8029 15.3333 4.29419 15.1226 3.91912 14.7475C3.54405 14.3725 3.33334 13.8638 3.33334 13.3333V4H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="action-btn" title="More">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="4" r="1" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1" fill="currentColor"/>
                  <circle cx="8" cy="12" r="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    []
  )

  return (
    <div className="main">
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage all system users including admins, doctors, staff and patients</p>
          </div>
        </div>

        <div className="summary-cards">
          {summaryCards.map((card, index) => (
            <div key={index} className={`summary-card ${card.active ? 'summary-card-active' : ''}`}>
              <div className="summary-card-icon">{card.icon}</div>
              <div className="summary-card-content">
                <div className="summary-card-title">{card.title}</div>
                <div className={`summary-card-count ${card.active ? 'summary-card-count-active' : ''}`}>{card.count}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="action-bar">
          <div className="search-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search users by name, email ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-filters">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3H14M4 7H12M6 11H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="3" r="2" fill="currentColor"/>
              <circle cx="8" cy="7" r="2" fill="currentColor"/>
              <circle cx="4" cy="11" r="2" fill="currentColor"/>
            </svg>
            <span>Filters</span>
          </button>
          <button className="btn-add-user">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
           Add New User
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <DataTable
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'No users found matching your search.' : 'No users found.'}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </div>
    </div>
  )
}

export default UserManagement

