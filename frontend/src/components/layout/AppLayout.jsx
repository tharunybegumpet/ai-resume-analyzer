import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar  from './Topbar.jsx'

/**
 * AppLayout — wraps all protected pages with Sidebar + Topbar.
 * <Outlet /> renders the active child route page.
 */
function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AppLayout
