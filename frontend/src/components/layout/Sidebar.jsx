import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Sidebar navigation component.
 * Uses NavLink so the active route gets the "active" class automatically.
 */
function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <div style={{width:32,height:32,background:'#4f46e5',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i className="bi bi-cpu text-white" style={{fontSize:'1rem'}}/>
          </div>
          <div>
            <div className="sidebar-brand-title">AI Resume Analyzer</div>
            <div className="sidebar-brand-sub">HR Intelligence Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>

        <NavLink to="/dashboard" className={({isActive})=>`sidebar-link ${isActive?'active':''}`}>
          <i className="bi bi-grid-1x2-fill"/> Dashboard
        </NavLink>

        <NavLink to="/upload" className={({isActive})=>`sidebar-link ${isActive?'active':''}`}>
          <i className="bi bi-cloud-upload-fill"/> Upload Resume
        </NavLink>

        <NavLink to="/history" className={({isActive})=>`sidebar-link ${isActive?'active':''}`}>
          <i className="bi bi-clock-history"/> Analysis History
        </NavLink>

        <NavLink to="/job-descriptions" className={({isActive})=>`sidebar-link ${isActive?'active':''}`}>
          <i className="bi bi-file-text-fill"/> Job Descriptions
        </NavLink>

        <div className="sidebar-section-label mt-3">Account</div>

        <NavLink to="/profile" className={({isActive})=>`sidebar-link ${isActive?'active':''}`}>
          <i className="bi bi-person-fill"/> My Profile
        </NavLink>

        {isAdmin() && (
          <>
            <div className="sidebar-section-label mt-3">Admin</div>
            <NavLink to="/admin" className={({isActive})=>`sidebar-link ${isActive?'active':''}`}>
              <i className="bi bi-shield-fill"/> Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{width:32,height:32,borderRadius:'50%',background:'#4f46e5',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.8rem'}}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:'#fff',fontSize:'0.8rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.fullName}</div>
            <div style={{color:'#94a3b8',fontSize:'0.7rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-100" style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',justifyContent:'flex-start'}}>
          <i className="bi bi-box-arrow-left"/> Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
