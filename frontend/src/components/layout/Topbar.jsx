import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const PAGE_TITLES = {
  '/dashboard':        'Dashboard',
  '/upload':           'Upload Resume',
  '/history':          'Analysis History',
  '/job-descriptions': 'Job Descriptions',
  '/profile':          'My Profile',
  '/admin':            'Admin Panel',
}

function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/analysis') ? 'Resume Analysis' : 'AI Resume Analyzer')

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>

      <div className="topbar-right">
        {/* Notification bell placeholder */}
        <button className="btn btn-sm btn-light border-0" style={{background:'transparent'}}>
          <i className="bi bi-bell" style={{fontSize:'1.1rem',color:'var(--text-secondary)'}}/>
        </button>

        {/* Avatar dropdown */}
        <div className="dropdown">
          <div
            className="topbar-avatar"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{cursor:'pointer'}}
          >
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{minWidth:180}}>
            <li><span className="dropdown-item-text fw-bold small">{user?.fullName}</span></li>
            <li><span className="dropdown-item-text text-muted" style={{fontSize:'0.75rem'}}>{user?.email}</span></li>
            <li><hr className="dropdown-divider"/></li>
            <li><button className="dropdown-item small" onClick={()=>navigate('/profile')}><i className="bi bi-person me-2"/>Profile</button></li>
            <li><button className="dropdown-item small text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-left me-2"/>Logout</button></li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Topbar
