import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  saveJobDescription,
  updateJobDesc,
  getMyJobDescriptions,
  getJobDescById,
  deleteJobDesc,
} from '../api/jobDescApi.js'

/**
 * JobDescPage — manage saved Job Descriptions.
 *
 * Features:
 *  - Paste a JD and save it with a title/company
 *  - List all saved JDs
 *  - Expand to view full content
 *  - Edit an existing JD
 *  - Delete a JD
 *  - Auto-detected required skills shown as chips
 */
export default function JobDescPage() {
  const [jds, setJds]           = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)

  const emptyForm = { title: '', company: '', content: '', experienceRequired: '' }
  const [form, setForm]   = useState(emptyForm)
  const [errors, setErrors] = useState({})

  // ---- Fetch list ----
  const fetchJds = async () => {
    try {
      const { data } = await getMyJobDescriptions()
      setJds(data)
    } catch {
      toast.error('Failed to load job descriptions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJds() }, [])

  // ---- Form helpers ----
  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())   e.title   = 'Job title is required'
    if (!form.content.trim()) e.content = 'Job description content is required'
    return e
  }

  const openNew = () => {
    setForm(emptyForm); setErrors({}); setEditId(null); setShowForm(true)
  }

  const openEdit = async (id) => {
    try {
      const { data } = await getJobDescById(id)
      setForm({
        title:              data.title || '',
        company:            data.company || '',
        content:            data.content || '',
        experienceRequired: data.experienceRequired || '',
      })
      setErrors({}); setEditId(id); setShowForm(true)
    } catch { toast.error('Failed to load job description.') }
  }

  const handleCancel = () => { setShowForm(false); setEditId(null); setForm(emptyForm) }

  // ---- Save / Update ----
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      if (editId) {
        await updateJobDesc(editId, form)
        toast.success('Job description updated!')
      } else {
        await saveJobDescription(form)
        toast.success('Job description saved!')
      }
      setShowForm(false); setEditId(null); setForm(emptyForm)
      fetchJds()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  // ---- Delete ----
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job description?')) return
    setDeleting(id)
    try {
      await deleteJobDesc(id)
      setJds(prev => prev.filter(j => j.id !== id))
      toast.success('Deleted.')
    } catch { toast.error('Failed to delete.') }
    finally   { setDeleting(null) }
  }

  // ---- Skill chips ----
  const SkillChips = ({ skills }) => {
    if (!skills) return <span className="text-muted small fst-italic">None detected</span>
    return (
      <div className="d-flex flex-wrap gap-1 mt-1">
        {skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
          <span key={i} className="skill-chip chip-blue">{s}</span>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="section-title">
            <i className="bi bi-file-text-fill"/>Job Descriptions
          </h2>
          <p className="text-muted mt-1" style={{ fontSize: '0.875rem' }}>
            Save and reuse job descriptions for AI resume analysis.
          </p>
        </div>
        {!showForm && (
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            <i className="bi bi-plus-circle me-1"/>New Job Description
          </button>
        )}
      </div>

      {/* ---- Create / Edit Form ---- */}
      {showForm && (
        <div className="card-custom mb-4">
          <div className="card-header-custom">
            <span className="fw-semibold">
              <i className={`bi ${editId ? 'bi-pencil' : 'bi-plus-circle'} me-2 text-primary`}/>
              {editId ? 'Edit Job Description' : 'New Job Description'}
            </span>
          </div>
          <div className="card-body-custom">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label-custom">Job Title *</label>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="e.g. Full Stack Developer"
                    style={{ borderColor: '#e2e8f0' }}
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label-custom">Company (optional)</label>
                  <input
                    name="company" value={form.company} onChange={handleChange}
                    className="form-control" placeholder="e.g. Infosys"
                    style={{ borderColor: '#e2e8f0' }}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label-custom">Experience</label>
                  <input
                    name="experienceRequired" value={form.experienceRequired}
                    onChange={handleChange}
                    className="form-control" placeholder="e.g. 2-4 years"
                    style={{ borderColor: '#e2e8f0' }}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label-custom">
                    Job Description Content *{' '}
                    <span className="text-muted fw-normal">(paste the full JD here)</span>
                  </label>
                  <textarea
                    name="content" value={form.content} onChange={handleChange}
                    rows={10}
                    className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                    placeholder="Paste the complete job description here…&#10;Include responsibilities, required skills, qualifications, etc."
                    style={{ borderColor: '#e2e8f0', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    {errors.content
                      ? <div className="invalid-feedback d-block">{errors.content}</div>
                      : <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Skills will be auto-detected from the content.
                        </span>
                    }
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {form.content.length} chars
                    </span>
                  </div>
                </div>

              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2"/>Saving…</>
                    : <><i className="bi bi-check me-1"/>{editId ? 'Update' : 'Save'} Job Description</>
                  }
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- List ---- */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary"/>
        </div>
      ) : jds.length === 0 ? (
        <div className="card-custom">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No job descriptions saved</h3>
            <p className="text-muted small">
              Save a job description to compare it against your resume.
            </p>
            <button className="btn btn-primary mt-3" onClick={openNew}>
              <i className="bi bi-plus-circle me-1"/>Add Job Description
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {jds.map(jd => (
            <div key={jd.id} className="card-custom">
              {/* Row */}
              <div className="d-flex align-items-start gap-3 p-3">
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className="bi bi-briefcase-fill text-primary"/>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{jd.title}</span>
                    {jd.company && (
                      <span className="badge bg-light text-secondary" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-building me-1"/>{jd.company}
                      </span>
                    )}
                    {jd.experienceRequired && (
                      <span className="badge bg-light text-secondary" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-clock me-1"/>{jd.experienceRequired}
                      </span>
                    )}
                    {jd.totalAnalyses > 0 && (
                      <span className="badge bg-success" style={{ fontSize: '0.72rem' }}>
                        {jd.totalAnalyses} {jd.totalAnalyses === 1 ? 'analysis' : 'analyses'}
                      </span>
                    )}
                  </div>

                  {/* Required skills */}
                  <div className="mt-2">
                    <span className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Detected Skills:
                    </span>
                    <SkillChips skills={jd.requiredSkills}/>
                  </div>

                  <div className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-calendar3 me-1"/>
                    Saved {new Date(jd.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    {' · '}{jd.content.length} chars
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-1 flex-shrink-0">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setExpandedId(expandedId === jd.id ? null : jd.id)}
                    title="View content"
                  >
                    <i className={`bi ${expandedId === jd.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}/>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openEdit(jd.id)}
                    title="Edit"
                  >
                    <i className="bi bi-pencil"/>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(jd.id)}
                    disabled={deleting === jd.id}
                    title="Delete"
                  >
                    {deleting === jd.id
                      ? <span className="spinner-border spinner-border-sm"/>
                      : <i className="bi bi-trash"/>
                    }
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {expandedId === jd.id && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  padding: '1rem 1.25rem',
                  background: 'var(--surface-2)',
                  borderRadius: '0 0 12px 12px'
                }}>
                  <pre style={{
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    fontSize: '0.82rem', color: 'var(--text-secondary)',
                    margin: 0, fontFamily: 'inherit', maxHeight: 320, overflowY: 'auto'
                  }}>
                    {jd.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
