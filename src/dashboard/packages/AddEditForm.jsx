import React, { useState, useEffect } from 'react'
import { createPackage, updatePackage } from '../../services/packageService'
import { LANGUAGES } from '../../enums/languagesEnum'
import './AddEditForm.css'

function AddEditForm({ package: pkg, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    cost: '',
    translations: [
      { lang: LANGUAGES.EN, name: '', content: '' },
      { lang: LANGUAGES.AR, name: '', content: '' },
    ],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditMode = !!pkg

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && pkg) {
        // Populate form with package data for editing
        const existingTranslations = pkg.translations || []
        
        // Initialize translations array with both languages
        const translations = [
          { lang: LANGUAGES.EN, name: '', content: '' },
          { lang: LANGUAGES.AR, name: '', content: '' },
        ]
        
        // Fill in existing translations
        existingTranslations.forEach((trans) => {
          const index = translations.findIndex((t) => t.lang === trans.lang)
          if (index !== -1) {
            translations[index] = {
              lang: trans.lang,
              name: trans.name || '',
              content: trans.content || '',
            }
          }
        })
        
        setForm({
          cost: pkg.cost || '',
          translations,
        })
      } else {
        // Reset form for adding new package
        setForm({
          cost: '',
          translations: [
            { lang: LANGUAGES.EN, name: '', content: '' },
            { lang: LANGUAGES.AR, name: '', content: '' },
          ],
        })
      }
      setError('')
    }
  }, [isOpen, isEditMode, pkg])

  const handleCostChange = (e) => {
    const value = e.target.value
    setForm((prev) => ({
      ...prev,
      cost: value,
    }))
  }

  const handleTranslationChange = (lang, field, value) => {
    setForm((prev) => ({
      ...prev,
      translations: prev.translations.map((trans) =>
        trans.lang === lang ? { ...trans, [field]: value } : trans
      ),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Filter out empty translations (where both name and content are empty)
      const validTranslations = form.translations.filter(
        (trans) => trans.name.trim() || trans.content.trim()
      )

      if (validTranslations.length === 0) {
        setError('At least one translation (name or content) is required')
        setLoading(false)
        return
      }

      const payload = {
        cost: parseFloat(form.cost) || 0,
        translations: validTranslations.map((trans) => ({
          lang: trans.lang,
          name: trans.name.trim(),
          content: trans.content.trim(),
        })),
      }

      if (isEditMode) {
        await updatePackage(pkg.id, payload)
      } else {
        await createPackage(payload)
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save package')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getLanguageLabel = (lang) => {
    return lang === LANGUAGES.EN ? 'English' : 'Arabic'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content package-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Package' : 'Add New Package'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-field">
            <label htmlFor="cost">
              Cost <span className="required">*</span>
            </label>
            <input
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter package cost (e.g., 99.99)"
              value={form.cost}
              onChange={handleCostChange}
              required
            />
          </div>

          <div className="translations-section">
            <h3 className="translations-title">
              Translations
            </h3>
            
            {form.translations.map((translation) => (
              <div
                key={translation.lang}
                className="translation-card"
              >
                <div className="translation-language-label">
                  {getLanguageLabel(translation.lang)} ({translation.lang.toUpperCase()})
                </div>
                
                <div className="form-field translation-form-field">
                  <label htmlFor={`name-${translation.lang}`}>
                    Package Name
                  </label>
                  <input
                    id={`name-${translation.lang}`}
                    type="text"
                    placeholder={`Enter package name in ${getLanguageLabel(translation.lang)}`}
                    value={translation.name}
                    onChange={(e) => handleTranslationChange(translation.lang, 'name', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor={`content-${translation.lang}`}>
                    Package Content/Description
                  </label>
                  <textarea
                    id={`content-${translation.lang}`}
                    rows="3"
                    placeholder={`Enter package description in ${getLanguageLabel(translation.lang)}`}
                    value={translation.content}
                    onChange={(e) => handleTranslationChange(translation.lang, 'content', e.target.value)}
                    className="translation-textarea"
                  />
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="form-error package-form-error">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update Package' : 'Add Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditForm

