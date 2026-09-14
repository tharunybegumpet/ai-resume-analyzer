import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import { register as registerApi } from '../api/authApi.js'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: ''
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim())     errs.fullName = 'Full name is required'
    if (!form.email.trim())        errs.email    = 'Email is required'
    if (!form.password)            errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await registerApi({
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
        phone:    form.phone,
      })
      login(data.token, {
        id:       data.userId,
        fullName: data.fullName,
        email:    data.email,
        roles:    data.roles,
      })
      toast.success('Account created! Welcome to AI Resume Analyzer.')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, icon, extra }) => (
    <div className="mb-3">
      <label className="form-label-custom">{label}</label>
      <div className="input-group">
        <span className="input-group-text border-end-0" style={{background:'#f8fafc',borderColor:'#e2e8f0'}}>
          <i className={`bi ${icon} text-muted`}/>
        </span>
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`form-control border-start-0 ${errors[name] ? 'is-invalid' : ''}`}
          style={{borderColor:'#e2e8f0',background:'#f8fafc'}}
          disabled={loading}
        />
        {extra}
      </div>
      {errors[name] && <div className="invalid-feedback d-block">{errors[name]}</div>}
    </div>
  )

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{maxWidth:480}}>

        <div className="auth-logo">
          <div style={{width:56,height:56,background:'linear-gradient(135deg,#4f46e5,#06b6d4)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem'}}>
            <i className="bi bi-cpu-fill text-white" style={{fontSize:'1.6rem'}}/>
          </div>
          <div style={{fontSize:'0.7rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase'}}>AI Resume Analyzer</div>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start analyzing resumes with AI in minutes</p>

        <form onSubmit={handleSubmit} noValidate>

          <Field label="Full Name"  name="fullName" placeholder="John Doe"          icon="bi-person"/>
          <Field label="Email"      name="email"    placeholder="you@example.com"   icon="bi-envelope" type="email"/>
          <Field label="Phone (optional)" name="phone" placeholder="+91 9876543210" icon="bi-telephone"/>

          {/* Password */}
          <div className="mb-3">
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
                placeholder="Min. 8 characters"
                className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                style={{borderColor:'#e2e8f0',background:'#f8fafc'}}
                disabled={loading}
              />
              <button type="button" className="input-group-text border-start-0" style={{background:'#f8fafc',borderColor:'#e2e8f0'}} onClick={() => setShowPass(p=>!p)}>
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`}/>
              </button>
            </div>
            {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="form-label-custom">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{background:'#f8fafc',borderColor:'#e2e8f0'}}>
                <i className="bi bi-shield-check text-muted"/>
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`form-control border-start-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                style={{borderColor:'#e2e8f0',background:'#f8fafc'}}
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold"
            style={{padding:'0.625rem',borderRadius:8,background:'var(--primary)',border:'none'}}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"/>Creating account…</>
              : <><i className="bi bi-person-plus me-2"/>Create Account</>
            }
          </button>
        </form>

        <p className="text-center mt-4" style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'var(--primary)',fontWeight:600}}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}
