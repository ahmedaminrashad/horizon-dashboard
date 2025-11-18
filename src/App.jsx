import './App.css'
import { useEffect, useState } from 'react'
import AuthLogin from './auth/Login'
import AuthRegister from './auth/Register'
import MainLayout from './layout/MainLayout'
import Router from './routes/Router'
import { loadAuth, fetchMe, logout as authLogout } from './auth/authService'
import { PAGES } from './enums/pagesEnum'
import { DEFAULT_ROUTE } from './routes/routes'
import { getRouteFromUrl, navigateToRoute } from './utils/navigation'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(PAGES.LOGIN)
  
  // Initialize route from URL, fallback to default
  const getInitialRoute = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return getRouteFromUrl()
    }
    return DEFAULT_ROUTE
  }
  
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute)

  useEffect(() => {
    // Defer synchronous localStorage read to avoid linter warning
    setTimeout(() => {
      const existing = loadAuth()
      setUser(existing?.user || null)
      setView(existing?.user ? PAGES.DASHBOARD : PAGES.LOGIN)
      setLoading(false)
      
      // Set initial hash if not present and user is logged in
      if (existing?.user && !window.location.hash) {
        navigateToRoute(DEFAULT_ROUTE)
      }
    }, 0)
  }, [])

  // Listen to hash changes
  useEffect(() => {
    if (view !== PAGES.DASHBOARD) return

    const handleHashChange = () => {
      const route = getRouteFromUrl()
      setCurrentRoute(route)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [view])

  const handleLoggedIn = async () => {
    try {
      const me = await fetchMe()
      setUser(me)
      setView(PAGES.DASHBOARD)
    } catch {
      setView(PAGES.LOGIN)
    }
  }

  if (loading) return null

  if (view === PAGES.LOGIN) {
    return <AuthLogin onLoggedIn={handleLoggedIn} onShowRegister={() => setView(PAGES.REGISTER)} />
  }

  if (view === PAGES.REGISTER) {
    return <AuthRegister onShowLogin={() => setView(PAGES.LOGIN)} />
  }

  const handleNavChange = (route) => {
    navigateToRoute(route)
    setCurrentRoute(route)
  }

  const handleLogout = async () => {
    try {
      await authLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setView(PAGES.LOGIN)
      // Clear hash on logout
      window.location.hash = ''
    }
  }

  return (
    <MainLayout activeNav={currentRoute} onNavChange={handleNavChange} user={user} onLogout={handleLogout}>
      <Router currentRoute={currentRoute} user={user} />
    </MainLayout>
  )
}

export default App
