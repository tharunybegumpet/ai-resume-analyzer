import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getMyHistory, searchHistory, deleteHistory } from '../api/analysisApi.js'

const scoreBadge = (s) => s >= 80 ? 'score-excellent' : s >= 60 ? 'score-good' : 'score-fair'
const hiringColor = (r) => {
  if (!r) return 'bg-secondary'
  if (r.includes('STRONG')) return 'bg-success'
  if (r.includes('HIRE'))   return 'bg-primary'
  if (r.includes('CONSIDER')) return 'bg-warning text-dark'
  return 'bg-danger'
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [sortBy, setSortBy]     = useState('date')
  const [query, setQuery]       = useState('')
  const [searching, setSearching] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async (sort) => {
    setLoading(true)
    try {
      const { data } = await getMyHistory(sort)
      setItems(data)
    } catch { toast.error('Failed to load history.') }
    finally   { setLoading(false) }
  }, [])

  useEffect(() => { load(sortBy) }, [sortBy])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) { load(sortBy); return }
    setSearching(true)
    try {
      const { data } = await searchHistory(query.trim())
      setItems(data)
    } catch { toast.error('Search failed.') }
    finally   { setSearching(false) }
  }

  const handleClearSearch = () => { setQuery(''); load(sortBy) }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis from history?')) return
    setDeleting(id)
    try {
      await deleteHistory(id)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Deleted.')
    } catch { toast.error('Failed to delete.') }
    finally   { setDeleting(null) }
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="section-title"><i className="bi bi-clock-history"/>Analysis History</h2>
          <p className="text-muted mt-1" style={{fontSize:'0.875rem'}}>
            {items.length} {items.length === 1 ? 'analysis' : 'analyses'} found
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
          <i className="bi bi-plus-circle me-1"/>New Analysis
        </button>
      </div>

      {/* Controls */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="d-flex gap-2 flex-grow-1" style={{maxWidth:400}}>
          <div className="input-group">
            <span className="input-group-text" style={{background:'#f8fafc',borderColor:'#e2e8f0'}}>
              <i className="bi bi-search text-muted"/>
            </span>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              className="form-control border-start-0" placeholder="Search by file name or job title…"
              style={{borderColor:'#e2e8f0',background:'#f8fafc'}}
            />
            {query && (
              <button type="button" className="btn btn-outline-secondary border-start-0"
                style={{borderColor:'#e2e8f0'}} onClick={handleClearSearch}>
                <i className="bi bi-x"/>
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-outline-primary" disabled={searching}>
            {searching ? <span className="spinner-border spinner-border-sm"/> : 'Search'}
          </button>
        </form>

        {/* Sort */}
        <div className="d-flex gap-1">
          {[{val:'date',label:'Newest First'},{val:'score',label:'Highest Score'}].map(opt => (
            <button key={opt.val}
              className={`btn btn-sm ${sortBy === opt.val ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSortBy(opt.val)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
      ) : items.length === 0 ? (
        <div className="card-custom">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No analyses found</h3>
            <p className="text-muted small">Upload a resume and run an AI analysis to see results here.</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/upload')}>
              <i className="bi bi-upload me-2"/>Upload Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="card-custom">
          <div style={{overflowX:'auto'}}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Resume File</th>
                  <th>Job Title</th>
                  <th>ATS Score</th>
                  <th>Skill Match</th>
                  <th>Recommendation</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-pdf text-danger"/>
                        <span className="text-truncate" style={{maxWidth:180}}>{item.resumeFileName}</span>
                      </div>
                    </td>
                    <td className="text-secondary">{item.jobTitle || <span className="text-muted fst-italic">No JD</span>}</td>
                    <td>
                      {item.atsScore != null
                        ? <span className={`score-badge ${scoreBadge(item.atsScore)}`}>{item.atsScore}</span>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td>{item.skillMatchPercentage != null ? `${item.skillMatchPercentage}%` : '—'}</td>
                    <td>
                      <span className={`badge ${hiringColor(item.hiringRecommendation)}`} style={{fontSize:'0.7rem'}}>
                        {item.hiringRecommendation || '—'}
                      </span>
                    </td>
                    <td className="text-muted" style={{fontSize:'0.8rem'}}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN',{dateStyle:'medium'})}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary py-0"
                          onClick={() => navigate(`/analysis/${item.analysisId}`)}>
                          <i className="bi bi-eye"/>
                        </button>
                        <button className="btn btn-sm btn-outline-danger py-0"
                          onClick={() => handleDelete(item.id)} disabled={deleting === item.id}>
                          {deleting === item.id
                            ? <span className="spinner-border spinner-border-sm"/>
                            : <i className="bi bi-trash"/>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
