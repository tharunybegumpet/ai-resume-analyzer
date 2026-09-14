import React from 'react'
import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card text-center">
        <div style={{fontSize:'4rem'}}>🔍</div>
        <h2 className="auth-title mt-3">404 — Not Found</h2>
        <p className="auth-subtitle">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn btn-primary mt-3">Go to Dashboard</Link>
      </div>
    </div>
  )
}
