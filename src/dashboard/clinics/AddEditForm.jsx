import React, { useState, useEffect } from 'react'
import { createUser, updateUser } from '../../services/userService'
import { getPackages } from '../../services/packageService'
import { getRoles } from '../../services/roleService'
import { ROLES } from '../../enums/rolesEnum'
import './AddEditForm.css'

function AddEditForm({ clinic, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    package_id: '',
    role_id: '',
  })
  const [packages, setPackages] = useState([])
  const [roles, setRoles] = useState([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditMode = !!clinic

  // Fetch packages and roles when form opens
  useEffect(() => {
    if (isOpen) {
      const fetchPackagesList = async () => {
        try {
          setLoadingPackages(true)
          const response = await getPackages({ limit: 100 }) // Get all packages
          setPackages(response.data || [])
        } catch (err) {
          console.error('Error fetching packages:', err)
        } finally {
          setLoadingPackages(false)
        }
      }

      const fetchRolesList = async () => {
        try {
          setLoadingRoles(true)
          const response = await getRoles()
          // Handle both array and object with data property
          const rolesData = Array.isArray(response) ? response : (response.data || [])
          setRoles(rolesData)
        } catch (err) {
          console.error('Error fetching roles:', err)
        } finally {
          setLoadingRoles(false)
        }
      }

      fetchPackagesList()
      fetchRolesList()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && clinic) {
        // Populate form with clinic data for editing
        setForm({
          name: clinic.name || clinic.fullName || '',
          email: clinic.email || '',
          phone: clinic.phone || '',
          password: '', // Don't pre-fill password
          package_id: clinic.package_id || clinic.packageId || '',
          role_id: clinic.role_id || clinic.roleId || clinic.role?.id || '',
        })
      } else {
        // Reset form for adding new clinic - default to clinic role (ID 2)
        setForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          package_id: '',
          role_id: roles.find(role => role.slug === ROLES.CLINIC)?.id || '',
        })
      }
      setError('')
    }
  }, [isOpen, isEditMode, clinic])

  useEffect(() => {
    if(roles.length > 0) {
      setForm((prev) => ({
        ...prev,
        role_id: roles.find(role => role.slug === ROLES.CLINIC)?.id || '',
      }))
    }
  }, [roles])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      }

      // Add package_id if selected
      if (form.package_id) {
        payload.package_id = parseInt(form.package_id, 10)
      }

      // Add role_id
      if (form.role_id) {
        payload.role_id = parseInt(form.role_id, 10)
      }

      if (isEditMode) {
        // Edit mode: only send password if provided
        if (form.password) {
          payload.password = form.password
        }
        await updateUser(clinic.id, payload)
      } else {
        // Add mode: include role_id and password
        if (form.password) {
          payload.password = form.password
        }
        await createUser(payload)
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save clinic')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get package name from translations
  const getPackageName = (pkg) => {
    if (!pkg.translations || pkg.translations.length === 0) return 'N/A'
    const enTranslation = pkg.translations.find(t => t.lang === 'en')
    if (enTranslation) return enTranslation.name
    return pkg.translations[0].name
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Clinic' : 'Add New Clinic'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-field">
            <label htmlFor="name">
              Clinic Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter clinic name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">
              Phone <span className="required">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          {!isEditMode && (
            <div className="form-field">
              <label htmlFor="role_id">
                Role <span className="required">*</span>
              </label>
              <select
                id="role_id"
                name="role_id"
                value={form.role_id}
                onChange={handleChange}
                disabled={loadingRoles || true}
                className="form-select"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name || role.title || `Role ${role.id}`}
                  </option>
                ))}
              </select>
              {loadingRoles && (
                <span className="form-loading-text">Loading roles...</span>
              )}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="package_id">
              Package
            </label>
            <select
              id="package_id"
              name="package_id"
              value={form.package_id}
              onChange={handleChange}
              disabled={loadingPackages}
              className="form-select"
            >
              <option value="">Select a package (optional)</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {getPackageName(pkg)} - ${parseFloat(pkg.cost || 0).toFixed(2)}
                </option>
              ))}
            </select>
            {loadingPackages && (
              <span className="form-loading-text">Loading packages...</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">
              Password {!isEditMode && <span className="required">*</span>}
              {isEditMode && <span className="optional">(leave blank to keep current)</span>}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={isEditMode ? 'Enter new password (optional)' : 'Enter password'}
              value={form.password}
              onChange={handleChange}
              required={!isEditMode}
            />
          </div>

          {error && (
            <div className="form-error clinic-form-error">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update Clinic' : 'Add Clinic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditForm

