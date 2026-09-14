import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getProfile, updateProfile } from '../api/authApi.js'

export default function ProfilePage() {
  const [profile, setProfile]  = useState(null)
  const [form, setForm]        = useState({})
  const [loading, setLoading]  = useState(true)
  const [saving, setSaving]    = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    getProfile()
      .then(({ data }) => { setProfile(data); setForm(data) })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await updateProfile({
        fullName:        form.fullName,
        phone:           form.phone,
        profileHeadline: form.profileHeadline,
        linkedinUrl:     form.linkedinUrl,
        githubUrl:       form.githubUrl,
      })
      setProfile(data)
      setEditMode(false)
      toast.success('Profile updated successfully!')
    } catch { toast.error('Failed to update profile.') }
    finally   { setSaving(false) }
  }

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary"/>
    </div>
  )

  const avatar = profile?.fullName?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="section-title"><i className="bi bi-person-fill"/>My Profile</h2>
        {!editMode && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>
            <i className="bi bi-pencil me-1"/>Edit Profile
          </button>
        )}
      </div>

      <div className="row g-4">

        {/* Left: Avatar + stats */}
        <div className="col-md-3">
          <div className="card-custom p-4 text-center">
            <div style={{width:80,height:80,borderRadius:'50%',background:'var(--primary)',color:'#fff',fontSize:'2rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
              {avatar}
            </div>
            <h5 className="fw-bold mb-1">{profile.fullName}</h5>
            <p className="text-muted small mb-2">{profile.email}</p>
            {profile.profileHeadline && <p className="text-secondary small">{profile.profileHeadline}</p>}
            <div className="d-flex justify-content-center gap-2 mt-3">
              {profile.roles?.map(r => (
                <span key={r} className={`badge ${r.includes('ADMIN') ? 'bg-danger' : 'bg-primary'}`}>
                  {r.replace('ROLE_','')}
                </span>
              ))}
            </div>
            <hr/>
            <div className="row text-center g-2">
              <div className="col-6">
                <div className="fw-bold fs-4 text-primary">{profile.totalResumes}</div>
                <div className="text-muted" style={{fontSize:'0.75rem'}}>Resumes</div>
              </div>
              <div className="col-6">
                <div className="fw-bold fs-4 text-success">{profile.totalAnalyses}</div>
                <div className="text-muted" style={{fontSize:'0.75rem'}}>Analyses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="col-md-9">
          <div className="card-custom">
            <div className="card-header-custom">
              <span className="fw-semibold">{editMode ? 'Edit Profile' : 'Profile Details'}</span>
            </div>
            <div className="card-body-custom">
              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label-custom">Full Name</label>
                    <input name="fullName" value={form.fullName||''} onChange={handleChange}
                      disabled={!editMode} className="form-control" style={{borderColor:'#e2e8f0'}}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Email</label>
                    <input value={profile.email} disabled className="form-control bg-light" style={{borderColor:'#e2e8f0'}}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Phone</label>
                    <input name="phone" value={form.phone||''} onChange={handleChange}
                      disabled={!editMode} className="form-control" placeholder="+91 9876543210" style={{borderColor:'#e2e8f0'}}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Profile Headline</label>
                    <input name="profileHeadline" value={form.profileHeadline||''} onChange={handleChange}
                      disabled={!editMode} className="form-control" placeholder="e.g. Full Stack Developer" style={{borderColor:'#e2e8f0'}}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom"><i className="bi bi-linkedin me-1 text-primary"/>LinkedIn URL</label>
                    <input name="linkedinUrl" value={form.linkedinUrl||''} onChange={handleChange}
                      disabled={!editMode} className="form-control" placeholder="https://linkedin.com/in/..." style={{borderColor:'#e2e8f0'}}/>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom"><i className="bi bi-github me-1"/>GitHub URL</label>
                    <input name="githubUrl" value={form.githubUrl||''} onChange={handleChange}
                      disabled={!editMode} className="form-control" placeholder="https://github.com/..." style={{borderColor:'#e2e8f0'}}/>
                  </div>
                </div>

                {editMode && (
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><span className="spinner-border spinner-border-sm me-1"/>Saving…</> : <><i className="bi bi-check me-1"/>Save Changes</>}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditMode(false); setForm(profile) }}>
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
