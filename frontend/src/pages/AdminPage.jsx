import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { toast } from 'react-toastify'
import { getAdminStats, getAllUsers } from '../api/dashboardApi.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AdminPage() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [tab, setTab]       = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers()])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data) })
      .catch(() => toast.error('Failed to load admin data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height:'60vh'}}>
      <div className="spinner-border text-primary" style={{width:48,height:48}}/>
    </div>
  )

  const skillsChart = {
    labels:   stats?.topSkills?.map(s => s.skill) ?? [],
    datasets: [{
      label: 'Count', data: stats?.topSkills?.map(s => Number(s.count)) ?? [],
      backgroundColor: 'rgba(79,70,229,0.8)', borderRadius: 6,
    }],
  }

  const missingChart = {
    labels:   stats?.topMissingSkills?.map(s => s.skill) ?? [],
    datasets: [{
      label: 'Count', data: stats?.topMissingSkills?.map(s => Number(s.count)) ?? [],
      backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 6,
    }],
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { grid:{color:'#f1f5f9'} }, y: { grid:{display:false} } },
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="section-title"><i className="bi bi-shield-fill"/>Admin Panel</h2>
        <p className="text-muted mt-1" style={{fontSize:'0.875rem'}}>Platform-wide statistics and user management.</p>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label:'Total Users',    value: stats?.totalUsers,    icon:'bi-people-fill',       color:'#4f46e5', bg:'#e0e7ff' },
          { label:'Total Resumes',  value: stats?.totalResumes,  icon:'bi-file-earmark-fill', color:'#0ea5e9', bg:'#e0f2fe' },
          { label:'Total Analyses', value: stats?.totalAnalyses, icon:'bi-cpu-fill',          color:'#10b981', bg:'#d1fae5' },
          { label:'Avg ATS Score',  value: stats?.globalAvgAtsScore != null ? stats.globalAvgAtsScore.toFixed(1) : '—',
            icon:'bi-graph-up', color:'#f59e0b', bg:'#fef3c7' },
        ].map(c => (
          <div key={c.label} className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="stat-card-icon" style={{background:c.bg,color:c.color}}><i className={`bi ${c.icon}`}/></div>
              <div className="stat-card-value" style={{color:c.color}}>{c.value ?? 0}</div>
              <div className="stat-card-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {[['overview','Overview'],['users','Users']].map(([key,label]) => (
          <li key={key} className="nav-item">
            <button className={`nav-link ${tab===key?'active':''}`} onClick={() => setTab(key)}>{label}</button>
          </li>
        ))}
      </ul>

      {tab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card-custom">
              <div className="card-header-custom">
                <span className="fw-semibold"><i className="bi bi-bar-chart-fill me-2 text-primary"/>Top Skills</span>
              </div>
              <div className="card-body-custom">
                {(stats?.topSkills?.length ?? 0) === 0
                  ? <p className="text-muted small">No data yet.</p>
                  : <div style={{height:280}}><Bar data={skillsChart} options={chartOpts}/></div>
                }
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card-custom">
              <div className="card-header-custom">
                <span className="fw-semibold"><i className="bi bi-exclamation-triangle-fill me-2 text-danger"/>Most Missing Skills</span>
              </div>
              <div className="card-body-custom">
                {(stats?.topMissingSkills?.length ?? 0) === 0
                  ? <p className="text-muted small">No data yet.</p>
                  : <div style={{height:280}}><Bar data={missingChart} options={chartOpts}/></div>
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card-custom">
          <div style={{overflowX:'auto'}}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Roles</th>
                  <th>Resumes</th><th>Analyses</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u,i) => (
                  <tr key={u.id}>
                    <td className="text-muted">{i+1}</td>
                    <td className="fw-semibold">{u.fullName}</td>
                    <td className="text-secondary">{u.email}</td>
                    <td>
                      {u.roles?.map(r => (
                        <span key={r} className={`badge me-1 ${r.includes('ADMIN')?'bg-danger':'bg-primary'}`} style={{fontSize:'0.7rem'}}>
                          {r.replace('ROLE_','')}
                        </span>
                      ))}
                    </td>
                    <td>{u.totalResumes}</td>
                    <td>{u.totalAnalyses}</td>
                    <td className="text-muted" style={{fontSize:'0.8rem'}}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN',{dateStyle:'medium'}) : '—'}
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
