import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import { login as loginApi } from '../api/authApi.js'

/**
 * LoginPage — full enterprise-style login form.
 *
 * Flow:
 *  1. User submits email + password
 *  2. POST /api/auth/login
 *  3. On success: store token + user in AuthContext → redirect to /dashboard
 *  4. On failure: show toast error
 */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await loginApi(form)
      login(data.token, {
        id:       data.userId,
        fullName: data.fullName,
        email:    data.email,
        roles:    data.roles,
      })
      toast.success(`Welcome back, ${data.fullName}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div style={{width:56,height:56,background:'linear-gradient(135deg,#4f46e5,#06b6d4)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem'}}>
            <i className="bi bi-cpu-fill text-white" style={{fontSize:'1.6rem'}}/>
          </div>
          <div style={{fontSize:'0.7rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase'}}>AI Resume Analyzer</div>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label-custom">Email address</label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{background:'#f8fafc',borderColor:'#e2e8f0'}}>
                <i className="bi bi-envelope text-muted"/>
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                style={{borderColor:'#e2e8f0',background:'#f8fafc'}}
                disabled={loading}
              />
            </div>
            {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label-custom">Password</label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{background:'#f8fafc',borderColor:'#e2e8f0'}}>
                <i className="bi bi-lock text-muted"/>
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                style={{borderColor:'#e2e8f0',background:'#f8fafc'}}
                disabled={loading}
              />
              <button
                type="button"
                className="input-group-text border-start-0"
                style={{background:'#f8fafc',borderColor:'#e2e8f0',cursor:'pointer'}}
                onClick={() => setShowPass(p => !p)}
              >
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`}/>
              </button>
            </div>
            {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold"
            style={{padding:'0.625rem',borderRadius:8,background:'var(--primary)',border:'none'}}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"/>Signing in…</>
              : <><i className="bi bi-box-arrow-in-right me-2"/>Sign In</>
            }
          </button>
        </form>

        <p className="text-center mt-4" style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>
          Don't have an account?{' '}
          <Link to="/register" style={{color:'var(--primary)',fontWeight:600}}>
            Create one free
          </Link>
        </p>

      </div>
    </div>
  )
}
