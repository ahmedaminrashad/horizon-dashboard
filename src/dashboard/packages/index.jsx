import React, { useState, useEffect, useMemo } from 'react'
import { getPackages, deletePackage } from '../../services/packageService'
import DataTable from '../../components/DataTable'
import AddEditForm from './AddEditForm'
import ConfirmDialog from '../../components/ConfirmDialog'

function PackageManagement() {
  const [packages, setPackages] = useState([])
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
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, package: null })

  const fetchPackages = async (page = pagination.page, limit = pagination.limit, search = searchQuery) => {
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
      
      const response = await getPackages(params)
      
      // Handle response format: { data: [], meta: {} }
      const packagesData = response.data || []
      const meta = response.meta || {}
      
      setPackages(packagesData)
      
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
      console.error('Error fetching packages:', err)
      setError(err.response?.data?.message || 'Failed to fetch packages')
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages(1, 10, searchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch packages when pagination changes
  const handlePaginationChange = (newPagination) => {
    fetchPackages(newPagination.page, newPagination.limit, searchQuery)
  }

  // Debounced search - fetch packages when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPackages(1, pagination.limit, searchQuery) // Reset to page 1 on search
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleAddClick = () => {
    setEditingPackage(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (pkg) => {
    setEditingPackage(pkg)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    // Refresh the packages list after successful add/edit
    fetchPackages(pagination.page, pagination.limit, searchQuery)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingPackage(null)
  }

  const handleDeleteClick = (pkg) => {
    setDeleteConfirm({ isOpen: true, package: pkg })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.package) return

    try {
      setLoading(true)
      setError(null)
      await deletePackage(deleteConfirm.package.id)
      setDeleteConfirm({ isOpen: false, package: null })
      // Refresh the packages list after successful delete
      fetchPackages(pagination.page, pagination.limit, searchQuery)
    } catch (err) {
      console.error('Error deleting package:', err)
      setError(err.response?.data?.message || 'Failed to delete package')
      setDeleteConfirm({ isOpen: false, package: null })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, package: null })
  }

  // Helper function to get package name from translations (prefer English, fallback to first)
  const getPackageName = (pkg) => {
    if (!pkg.translations || pkg.translations.length === 0) return 'N/A'
    const enTranslation = pkg.translations.find(t => t.lang === 'en')
    if (enTranslation) return enTranslation.name
    return pkg.translations[0].name
  }

  const getPackageNameForDelete = (pkg) => {
    if (!pkg) return 'this package'
    if (!pkg.translations || pkg.translations.length === 0) return 'this package'
    const enTranslation = pkg.translations.find(t => t.lang === 'en')
    if (enTranslation) return enTranslation.name
    return pkg.translations[0].name
  }

  const summaryCards = [
    { title: 'Total Packages', count: stats.total, icon: '📦', active: true },
  ]


  // Helper function to get package content from translations (prefer English, fallback to first)
  const getPackageContent = (pkg) => {
    if (!pkg.translations || pkg.translations.length === 0) return 'N/A'
    const enTranslation = pkg.translations.find(t => t.lang === 'en')
    if (enTranslation) return enTranslation.content
    return pkg.translations[0].content
  }

  // Helper function to format cost
  const formatCost = (cost) => {
    if (cost === null || cost === undefined) return 'N/A'
    return `$${parseFloat(cost).toFixed(2)}`
  }

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Package Name',
        cell: ({ row }) => {
          const pkg = row.original
          return (
            <div className="user-cell">
              <div className="user-info">
                <div className="user-name">{getPackageName(pkg)}</div>
                <div className="user-email" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {getPackageContent(pkg)}
                </div>
              </div>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'cost',
        header: 'Cost',
        cell: ({ row }) => {
          return (
            <span style={{ fontWeight: 600, color: '#2563eb' }}>
              {formatCost(row.original.cost)}
            </span>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'translations',
        header: 'Languages',
        cell: ({ row }) => {
          const translations = row.original.translations || []
          return (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {translations.map((t, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#eff6ff',
                    color: '#2563eb',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  {t.lang}
                </span>
              ))}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const packageItem = row.original
          return (
            <div className="action-buttons">
              <button className="action-btn" title="Edit" onClick={() => handleEditClick(packageItem)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.3333 2.00001C11.5084 1.8249 11.7163 1.68699 11.9447 1.59431C12.1731 1.50162 12.4173 1.45605 12.6667 1.45605C12.916 1.45605 13.1602 1.50162 13.3886 1.59431C13.617 1.68699 13.8249 1.8249 14 2.00001C14.1751 2.17512 14.313 2.38301 14.4057 2.61141C14.4984 2.83981 14.5439 3.08403 14.5439 3.33334C14.5439 3.58266 14.4984 3.82688 14.4057 4.05528C14.313 4.28368 14.1751 4.49157 14 4.66668L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="action-btn" title="Delete" onClick={() => handleDeleteClick(packageItem)}>
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
            <h1 className="page-title">Package Management</h1>
            <p className="page-subtitle">Manage all subscription packages and pricing</p>
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
              placeholder="Search packages by name..."
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
          <button className="btn-add-user" onClick={handleAddClick}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
           Add New Package
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <DataTable
          data={packages}
          columns={columns}
          loading={loading}
          emptyMessage={searchQuery ? 'No packages found matching your search.' : 'No packages found.'}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </div>

      <AddEditForm
        package={editingPackage}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Package"
        message={`Are you sure you want to delete "${getPackageNameForDelete(deleteConfirm.package)}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default PackageManagement

