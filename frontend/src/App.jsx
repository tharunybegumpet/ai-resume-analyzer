import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

// Layouts
import AppLayout from './components/layout/AppLayout.jsx'

// Pages
import LoginPage       from './pages/LoginPage.jsx'
import RegisterPage    from './pages/RegisterPage.jsx'
import DashboardPage   from './pages/DashboardPage.jsx'
import UploadPage      from './pages/UploadPage.jsx'
import AnalysisPage    from './pages/AnalysisPage.jsx'
import HistoryPage     from './pages/HistoryPage.jsx'
import JobDescPage     from './pages/JobDescPage.jsx'
import ProfilePage     from './pages/ProfilePage.jsx'
import AdminPage       from './pages/AdminPage.jsx'
import NotFoundPage    from './pages/NotFoundPage.jsx'

/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{height:'100vh'}}><div className="spinner-border text-primary"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

/**
 * PublicRoute — redirects to /dashboard if already logged in.
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected — wrapped in AppLayout (sidebar + topbar) */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="upload"    element={<UploadPage />} />
        <Route path="analysis/:id" element={<AnalysisPage />} />
        <Route path="history"   element={<HistoryPage />} />
        <Route path="job-descriptions" element={<JobDescPage />} />
        <Route path="profile"   element={<ProfilePage />} />
        <Route path="admin"     element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  )
}
