import React from 'react'

function Header() {
  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="13" width="16" height="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M12 3L20 8V13H4V8L12 3Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <rect x="6" y="9" width="2" height="2" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="10" y="9" width="2" height="2" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="14" y="9" width="2" height="2" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="6" y="15" width="2" height="2" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="10" y="15" width="2" height="2" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="14" y="15" width="2" height="2" stroke="white" strokeWidth="1.5" fill="none"/>
            <rect x="16" y="15" width="2" height="2" stroke="white" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div className="header-text">
          <h1 className="header-title">Clinic Tenant Management</h1>
          <p className="header-subtitle">System Administration Dashboard</p>
        </div>
      </div>
    </header>
  )
}

export default Header

