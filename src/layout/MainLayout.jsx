import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

function MainLayout({ activeNav, onNavChange, user, children, onLogout }) {
  return (  
  
  <>
  <Header />
    <div className="app">
    
      <Sidebar activeNav={activeNav} onNavChange={onNavChange} user={user} onLogout={onLogout} />
      {children}
    </div>
    </>
  )
}

export default MainLayout

