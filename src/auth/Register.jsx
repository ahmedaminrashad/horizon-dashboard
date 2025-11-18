import { useState } from 'react'
import './register.css'
import apiClient from '../apiClient'
import { REQUESTS } from '../enums/requestEnum'
import { LOCALES, getTranslations } from '../i18n'

function AuthRegister({ onShowLogin }) {
  const [locale, setLocale] = useState(LOCALES.EN)
  const [form, setForm] = useState({
    clinicName: '',
    email: '',
    phone: '',
    plan: 'professional',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const t = getTranslations(locale)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePlanSelect = (planId) => {
    setForm((prev) => ({ ...prev, plan: planId }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    setLoading(true)
    try {
      const payload = {
        clinicName: form.clinicName,
        email: form.email,
        phone: form.phone,
        plan: form.plan,
      }

      await apiClient.post(REQUESTS.AUTH.REGISTER, payload)
      setSuccess(t.success)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t.fallbackError
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="clinic-register-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="clinic-register-shell">
        <div className="cr-lang-switch">
          <button
            type="button"
            className={locale === LOCALES.EN ? 'cr-lang-btn active' : 'cr-lang-btn'}
            onClick={() => setLocale(LOCALES.EN)}
          >
            EN
          </button>
          <button
            type="button"
            className={locale === LOCALES.AR ? 'cr-lang-btn active' : 'cr-lang-btn'}
            onClick={() => setLocale(LOCALES.AR)}
          >
            AR
          </button>
        </div>

        {/* Top header */}
        <header className="cr-header">
          <div className="cr-header-icon">🏢</div>
          <div className="cr-header-text">
            <h1>{t.headerTitle}</h1>
            <p>{t.headerSubtitle}</p>
          </div>
        </header>

        {/* Main content cards */}
        <main className="cr-main">
          {/* Clinic information */}
          <section className="cr-card">
            <div className="cr-card-header">
              <h2>{t.clinicInfoTitle}</h2>
            </div>
            <div className="cr-card-body">
              <div className="cr-field">
                <label htmlFor="clinicName">
                  {t.clinicNameLabel} <span className="cr-required">*</span>
                </label>
                <div className="cr-input-wrapper">
                  <span className="cr-input-icon">🏥</span>
                  <input
                    id="clinicName"
                    name="clinicName"
                    type="text"
                    placeholder={t.clinicNamePlaceholder}
                    value={form.clinicName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="cr-field">
                <label htmlFor="email">
                  {t.emailLabel} <span className="cr-required">*</span>
                </label>
                <div className="cr-input-wrapper">
                  <span className="cr-input-icon">✉️</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="cr-field">
                <label htmlFor="phone">
                  {t.phoneLabel} <span className="cr-required">*</span>
                </label>
                <div className="cr-input-wrapper">
                  <span className="cr-input-icon">📞</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Subscription plans */}
          <section className="cr-card">
            <div className="cr-card-header cr-card-header-inline">
              <div className="cr-card-header-icon">📄</div>
              <h2>{t.subscriptionTitle}</h2>
            </div>

            <div className="cr-card-body">
              <div className="cr-plan-grid">
                {['basic', 'professional', 'enterprise'].map((planId) => {
                  const plan = t.plans[planId]
                  const isActive = form.plan === planId
                  return (
                    <button
                      key={planId}
                      type="button"
                      className={`cr-plan-card${isActive ? ' cr-plan-card-active' : ''}`}
                      onClick={() => handlePlanSelect(planId)}
                    >
                      <div className="cr-plan-name">{plan.name}</div>
                      <div className="cr-plan-price">{plan.price}</div>
                      <ul className="cr-plan-features">
                        {plan.features.map((feature) => (
                          <li key={feature}>
                            <span className="cr-plan-check">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Feedback messages */}
          {error && <p className="form-error cr-feedback">{error}</p>}
          {success && <p className="form-success cr-feedback">{success}</p>}
        </main>

        {/* Bottom submit bar */}
        <form className="cr-submit-bar" onSubmit={handleSubmit}>
          <button type="submit" className="cr-submit-button" disabled={loading}>
            {loading ? t.registering : t.registerButton}
          </button>
        </form>

        {onShowLogin && (
          <p className="form-note">
            Already have an account?{' '}
            <button type="button" className="cr-link-button" onClick={onShowLogin}>
              {t.loginButton || 'Sign in'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthRegister