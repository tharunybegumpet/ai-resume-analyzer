import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { toast } from 'react-toastify'
import { getDashboardStats } from '../api/dashboardApi.js'
import { useAuth } from '../context/AuthContext.jsx'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// ---- Score colour helpers ----
const scoreColor  = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'
const scoreBadge  = (s) => s >= 80 ? 'score-excellent' : s >= 60 ? 'score-good' : 'score-fair'
const scoreLabel  = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Work'

const hiringBadge = (r) => {
  if (!r) return 'bg-secondary'
  if (r.includes('STRONG')) return 'bg-success'
  if (r.includes('HIRE'))   return 'bg-primary'
  if (r.includes('CONSIDER')) return 'bg-warning text-dark'
  return 'bg-danger'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted">Loading dashboard…</p>
      </div>
    </div>
  )

  // ---- Chart data ----
  const chartData = {
    labels:   stats?.atsScoreHistory?.map(p => shorten(p.label)) ?? [],
    datasets: [{
      label:           'ATS Score',
      data:            stats?.atsScoreHistory?.map(p => p.score) ?? [],
      borderColor:     '#4f46e5',
      backgroundColor: 'rgba(79,70,229,0.08)',
      tension:         0.4,
      fill:            true,
      pointBackgroundColor: '#4f46e5',
      pointRadius:     5,
      pointHoverRadius: 7,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ATS Score: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        min: 0, max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
    },
  }

  const avg = stats?.averageAtsScore
  const avgFormatted = avg != null ? avg.toFixed(1) : '—'

  return (
    <div>
      {/* Welcome */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
          Here's your resume analysis overview.
        </p>
      </div>

      {/* ---- Stat Cards ---- */}
      <div className="row g-3 mb-4">
        {[
          {
            label: 'Total Resumes',
            value: stats?.totalResumes ?? 0,
            icon:  'bi-file-earmark-person-fill',
            color: '#4f46e5', bg: '#e0e7ff',
          },
          {
            label: 'Total Analyses',
            value: stats?.totalAnalyses ?? 0,
            icon:  'bi-cpu-fill',
            color: '#0ea5e9', bg: '#e0f2fe',
          },
          {
            label: 'Average ATS Score',
            value: avgFormatted,
            icon:  'bi-graph-up-arrow',
            color: avg >= 60 ? '#10b981' : '#f59e0b',
            bg:    avg >= 60 ? '#d1fae5' : '#fef3c7',
          },
          {
            label: 'Highest ATS Score',
            value: stats?.highestAtsScore ?? '—',
            icon:  'bi-trophy-fill',
            color: '#f59e0b', bg: '#fef3c7',
          },
        ].map((card) => (
          <div key={card.label} className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
                <i className={`bi ${card.icon}`} />
              </div>
              <div className="stat-card-value" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-card-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Chart + Recent ---- */}
      <div className="row g-3">

        {/* Line Chart */}
        <div className="col-lg-7">
          <div className="card-custom h-100">
            <div className="card-header-custom">
              <span className="fw-semibold">
                <i className="bi bi-graph-up me-2 text-primary" />ATS Score History
              </span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Last 10 analyses</span>
            </div>
            <div className="card-body-custom">
              {(stats?.atsScoreHistory?.length ?? 0) === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon">📊</div>
                  <h3>No data yet</h3>
                  <p className="text-muted small">Analyze a resume to see your score trend.</p>
                </div>
              ) : (
                <div style={{ height: 260 }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-5">
          <div className="card-custom h-100">
            <div className="card-header-custom">
              <span className="fw-semibold">
                <i className="bi bi-lightning-fill me-2 text-warning" />Quick Actions
              </span>
            </div>
            <div className="card-body-custom d-flex flex-column gap-2">
              {[
                { icon: 'bi-cloud-upload-fill', label: 'Upload New Resume',    to: '/upload',           color: 'btn-primary' },
                { icon: 'bi-file-text-fill',    label: 'Add Job Description',  to: '/job-descriptions', color: 'btn-outline-primary' },
                { icon: 'bi-clock-history',     label: 'View All Analyses',    to: '/history',          color: 'btn-outline-secondary' },
                { icon: 'bi-person-fill',       label: 'Update Profile',       to: '/profile',          color: 'btn-outline-secondary' },
              ].map(({ icon, label, to, color }) => (
                <button
                  key={label}
                  className={`btn ${color} d-flex align-items-center gap-2`}
                  style={{ borderRadius: 8, textAlign: 'left' }}
                  onClick={() => navigate(to)}
                >
                  <i className={`bi ${icon}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ---- Recent Analyses ---- */}
      <div className="card-custom mt-4">
        <div className="card-header-custom">
          <span className="fw-semibold">
            <i className="bi bi-clock-history me-2 text-primary" />Recent Analyses
          </span>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => navigate('/history')}
          >
            View All
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {(stats?.recentAnalyses?.length ?? 0) === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No analyses yet</h3>
              <p className="text-muted small">Upload a resume and run an AI analysis to get started.</p>
              <button className="btn btn-primary mt-3" onClick={() => navigate('/upload')}>
                <i className="bi bi-upload me-2" />Upload Resume
              </button>
            </div>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Resume</th>
                  <th>Job Title</th>
                  <th>ATS Score</th>
                  <th>Skill Match</th>
                  <th>Recommendation</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAnalyses.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-pdf text-danger" />
                        <span className="text-truncate" style={{ maxWidth: 160 }}>
                          {item.resumeFileName}
                        </span>
                      </div>
                    </td>
                    <td className="text-secondary">{item.jobTitle || '—'}</td>
                    <td>
                      <span className={`score-badge ${scoreBadge(item.atsScore)}`}>
                        {item.atsScore ?? '—'}
                      </span>
                    </td>
                    <td>{item.skillMatchPercentage != null ? `${item.skillMatchPercentage}%` : '—'}</td>
                    <td>
                      <span className={`badge ${hiringBadge(item.hiringRecommendation)}`}
                            style={{ fontSize: '0.7rem' }}>
                        {item.hiringRecommendation ?? '—'}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary py-0"
                        onClick={() => navigate(`/analysis/${item.analysisId}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function shorten(name) {
  if (!name) return ''
  return name.length > 18 ? name.substring(0, 15) + '…' : name
}
