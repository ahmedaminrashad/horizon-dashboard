import { useEffect, useState } from 'react'
import './register.css'
import { LOCALES, getTranslations } from '../i18n'
import { login, fetchMe, test } from './authService'
import { getCurrentLanguage, setCurrentLanguage } from '../utils/language'

function AuthLogin({ onLoggedIn, onShowRegister }) {
  const [locale, setLocale] = useState(getCurrentLanguage())
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = getTranslations(locale)

  const handleLocaleChange = (newLocale) => {
    setLocale(newLocale)
    setCurrentLanguage(newLocale)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
   test()
    }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      const me = await fetchMe()
      if (onLoggedIn) onLoggedIn(me)
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
    <div className="clinic-register-page" dir={locale === LOCALES.AR ? 'rtl' : 'ltr'}>
      <div className="clinic-register-shell">
        <div className="cr-lang-switch">
          <button
            type="button"
            className={locale === LOCALES.EN ? 'cr-lang-btn active' : 'cr-lang-btn'}
            onClick={() => handleLocaleChange(LOCALES.EN)}
          >
            EN
          </button>
          <button
            type="button"
            className={locale === LOCALES.AR ? 'cr-lang-btn active' : 'cr-lang-btn'}
            onClick={() => handleLocaleChange(LOCALES.AR)}
          >
            AR
          </button>
        </div>

        <header className="cr-header">
          <div className="cr-header-icon">🔐</div>
          <div className="cr-header-text">
            <h1>{t.loginTitle || 'Sign in to your account'}</h1>
          </div>
        </header>

        <main className="cr-main">
          <section className="cr-card">
            <div className="cr-card-body">
              <div className="cr-field">
                <label htmlFor="phone">{t.phoneLabel}</label>
                <div className="cr-input-wrapper">
                  <span className="cr-input-icon">📱</span>
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

              <div className="cr-field">
                <label htmlFor="password">{t.passwordLabel || 'Password'}</label>
                <div className="cr-input-wrapper">
                  <span className="cr-input-icon">🔑</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t.passwordPlaceholder || 'Enter your password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {error && <p className="form-error cr-feedback">{error}</p>}

              {onShowRegister && (
                <p className="form-note">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="cr-link-button"
                    onClick={onShowRegister}
                  >
                    {t.registerButton || 'Register'}
                  </button>
                </p>
              )}
            </div>
          </section>
        </main>

        <form className="cr-submit-bar" onSubmit={handleSubmit}>
          <button type="submit" className="cr-submit-button" disabled={loading}>
            {loading ? t.loginSubmitting || 'Signing in…' : t.loginButton || 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthLogin


