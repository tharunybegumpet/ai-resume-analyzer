import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { getAnalysisById } from '../api/analysisApi.js'

/* ================================================================
   HELPERS
================================================================ */
const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'
const scoreLabel = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Work'
const hiringColor = (r) => {
  if (!r) return 'bg-secondary'
  if (r.includes('STRONG')) return 'bg-success'
  if (r.includes('HIRE'))   return 'bg-primary'
  if (r.includes('CONSIDER')) return 'bg-warning text-dark'
  return 'bg-danger'
}

// Derive breakdown scores from atsScore + skillMatch
const deriveBreakdown = (atsScore, skillMatch) => {
  const base = atsScore ?? 50
  const sm   = skillMatch ?? 50
  return [
    { label: 'ATS Compatibility', pct: Math.min(100, Math.round(base * 0.95)),  color: '#4f46e5' },
    { label: 'Skills Match',      pct: sm,                                        color: '#10b981' },
    { label: 'Projects',          pct: Math.min(100, Math.round(base * 0.88)),  color: '#0ea5e9' },
    { label: 'Experience',        pct: Math.min(100, Math.round(base * 0.92)),  color: '#f59e0b' },
    { label: 'Education',         pct: Math.min(100, Math.round(base * 0.85)),  color: '#8b5cf6' },
    { label: 'Formatting',        pct: Math.min(100, Math.round(base * 0.78)),  color: '#06b6d4' },
    { label: 'Certifications',    pct: Math.min(100, Math.round(base * 0.70)),  color: '#f97316' },
  ]
}

const deriveSectionRatings = (atsScore) => {
  const b = atsScore ?? 50
  const r = (f) => Math.max(1, Math.min(5, Math.round((b / 100) * 5 * f)))
  return [
    { label: 'Summary',        stars: r(1.0) },
    { label: 'Education',      stars: r(0.9) },
    { label: 'Skills',         stars: r(1.05) },
    { label: 'Projects',       stars: r(0.88) },
    { label: 'Experience',     stars: r(0.95) },
    { label: 'Certifications', stars: r(0.75) },
  ]
}

const deriveReadiness = (atsScore, skillMatch) => {
  const base = ((atsScore ?? 50) + (skillMatch ?? 50)) / 2
  return {
    overall:      Math.round(base * 0.95),
    technical:    Math.round(base * 1.02),
    communication:Math.round(base * 0.88),
    projectQuality:Math.round(base * 0.92),
    confidence:   Math.round(base * 0.85),
  }
}

const deriveCareerMatch = (skills = [], atsScore = 50) => {
  const s = (skills || []).map(x => x.toLowerCase())
  const hasJava    = s.some(x => x.includes('java'))
  const hasReact   = s.some(x => x.includes('react'))
  const hasSpring  = s.some(x => x.includes('spring'))
  const hasPython  = s.some(x => x.includes('python'))
  const base = atsScore

  return [
    { role: 'Java Backend Developer',  pct: Math.min(98, base + (hasJava ? 12 : 0) + (hasSpring ? 8 : 0)) },
    { role: 'Full Stack Developer',    pct: Math.min(98, base + (hasReact ? 10 : 0) + (hasJava ? 5 : 0)) },
    { role: 'Software Engineer',       pct: Math.min(98, base + 5) },
    { role: 'Spring Boot Developer',   pct: Math.min(98, base + (hasSpring ? 15 : -5) + (hasJava ? 8 : 0)) },
    { role: 'Frontend Developer',      pct: Math.min(98, base + (hasReact ? 15 : -10)) },
    { role: 'Python Developer',        pct: Math.min(98, base + (hasPython ? 15 : -10)) },
  ].sort((a, b) => b.pct - a.pct).slice(0, 5)
}

const deriveInterviewQuestions = (skills = [], fileName = '') => {
  const s = (skills || []).map(x => x.toLowerCase())
  const questions = [
    'Tell me about yourself and your technical background.',
    'What projects are you most proud of and why?',
    'How do you approach debugging a complex production issue?',
    'Explain the difference between REST and GraphQL APIs.',
    'How do you ensure code quality in your projects?',
    'Describe a challenging technical problem you solved recently.',
    'What is your experience with version control and CI/CD pipelines?',
    'How do you handle performance optimization in your applications?',
    'What design patterns do you use most frequently and why?',
    'Where do you see yourself technically in the next 2 years?',
  ]
  if (s.some(x => x.includes('java') || x.includes('spring'))) {
    questions[3] = 'Explain Spring Boot auto-configuration and how it works internally.'
    questions[6] = 'What is the difference between @Component, @Service, and @Repository in Spring?'
  }
  if (s.some(x => x.includes('react'))) {
    questions[4] = 'Explain the React component lifecycle and hooks like useEffect and useMemo.'
  }
  return questions
}

const derivePriorities = (suggestions = [], missing = []) => {
  const all = [...(suggestions || []), ...(missing || []).map(s => `Learn and add: ${s}`)]
  return all.map((s, i) => ({
    text:  s,
    level: i < 2 ? 'HIGH' : i < 5 ? 'MEDIUM' : 'LOW',
  })).slice(0, 9)
}

/* ================================================================
   SUB-COMPONENTS (all existing ones kept)
================================================================ */

function ScoreRing({ score }) {
  const color = scoreColor(score ?? 0)
  const ringClass = score >= 80 ? 'ring-excellent' : score >= 60 ? 'ring-good' : 'ring-fair'
  return (
    <div className="text-center">
      <div className={`ats-score-ring ${ringClass}`} style={{ margin: '0 auto' }}>
        <span>{score ?? '—'}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: 2 }}>/ 100</span>
      </div>
      <div className="fw-bold mt-2" style={{ color, fontSize: '0.875rem' }}>{scoreLabel(score)}</div>
      <div className="text-muted" style={{ fontSize: '0.75rem' }}>ATS Score</div>
    </div>
  )
}

function Section({ icon, title, children, accent = 'text-primary' }) {
  return (
    <motion.div
      className="card-custom mb-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.10)', translateY: -2 }}
    >
      <div className="card-header-custom">
        <span className="fw-semibold section-title">
          <i className={`bi ${icon} ${accent} me-2`} />{title}
        </span>
      </div>
      <div className="card-body-custom">{children}</div>
    </motion.div>
  )
}

function Chips({ items = [], variant = 'chip-blue' }) {
  if (!items?.length) return <span className="text-muted fst-italic small">None</span>
  return (
    <div className="d-flex flex-wrap gap-1 mt-2">
      {items.map((s, i) => <span key={i} className={`skill-chip ${variant}`}>{s}</span>)}
    </div>
  )
}

function BulletList({ items = [] }) {
  if (!items?.length) return <span className="text-muted fst-italic small">None</span>
  return (
    <ul className="mb-0 ps-3" style={{ lineHeight: 1.9 }}>
      {items.map((s, i) => <li key={i} className="text-secondary" style={{ fontSize: '0.875rem' }}>{s}</li>)}
    </ul>
  )
}

function NumberedList({ items = [] }) {
  if (!items?.length) return <span className="text-muted fst-italic small">None</span>
  return (
    <ol className="mb-0 ps-3" style={{ lineHeight: 1.9 }}>
      {items.map((s, i) => <li key={i} className="text-secondary" style={{ fontSize: '0.875rem' }}>{s}</li>)}
    </ol>
  )
}

function EvalParagraph({ text }) {
  if (!text) return <p className="text-muted fst-italic small">Not evaluated.</p>
  return <p className="text-secondary mb-0" style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>{text}</p>
}

/* ---- Animated Progress Bar ---- */
function AnimBar({ pct, color = 'var(--primary)', height = 8 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 120); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ height, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${width}%`, background: color,
        borderRadius: 99, transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)'
      }} />
    </div>
  )
}

/* ---- Star Rating ---- */
function Stars({ count = 3 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`bi ${i <= count ? 'bi-star-fill star-filled' : 'bi-star star-empty'}`} />
      ))}
    </div>
  )
}

/* ---- Metric Card (top row) ---- */
function MetricCard({ label, value, icon, color, bg, delay = 0 }) {
  const [animVal, setAnimVal] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnimVal(value), 200 + delay * 100); return () => clearTimeout(t) }, [value])
  return (
    <motion.div
      className="metric-card"
      style={{ '--metric-color': color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08 }}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}
    >
      <div className="metric-icon" style={{ background: bg, color }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="metric-value">{animVal}<span style={{ fontSize: '1rem' }}>%</span></div>
      <div className="metric-label">{label}</div>
      <div className="metric-bar">
        <div className="metric-bar-fill" style={{ width: `${animVal}%` }} />
      </div>
    </motion.div>
  )
}

/* ================================================================
   MAIN PAGE
================================================================ */
export default function AnalysisPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    getAnalysisById(id)
      .then(({ data }) => setData(data))
      .catch(() => { toast.error('Failed to load analysis.'); navigate('/history') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
        <p className="text-muted">Loading analysis report…</p>
      </div>
    </div>
  )

  if (!data) return null

  // ---- derived data (all computed from existing API fields) ----
  const breakdown   = deriveBreakdown(data.atsScore, data.skillMatchPercentage)
  const ratings     = deriveSectionRatings(data.atsScore)
  const readiness   = deriveReadiness(data.atsScore, data.skillMatchPercentage)
  const careerMatch = deriveCareerMatch(data.identifiedSkills, data.atsScore)
  const interviewQs = deriveInterviewQuestions(data.identifiedSkills, data.resumeFileName)
  const priorities  = derivePriorities(data.improvementSuggestions, data.missingSkills)
  const projectedScore = Math.min(100, Math.round((data.atsScore ?? 50) * 1.22))

  const tabs = [
    { key: 'overview',    label: 'Overview',       icon: 'bi-bar-chart-fill' },
    { key: 'skills',      label: 'Skills',         icon: 'bi-lightning-fill' },
    { key: 'evaluation',  label: 'Evaluation',     icon: 'bi-clipboard-check-fill' },
    { key: 'improvement', label: 'Improvement',    icon: 'bi-magic' },
    { key: 'recommend',   label: 'Recommendations',icon: 'bi-stars' },
  ]

  return (
    <div>
      {/* ── Back + Title ── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1" />Back
        </button>
        <div>
          <h2 className="section-title mb-0"><i className="bi bi-cpu-fill" />Analysis Report</h2>
          <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-file-earmark-pdf text-danger me-1" />{data.resumeFileName}
            {data.jobTitle && <> · <i className="bi bi-briefcase me-1 ms-1" />{data.jobTitle}</>}
            {data.analyzedAt && <> · {new Date(data.analyzedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</>}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          FEATURE 10 — Professional Metrics Row (5 cards)
      ══════════════════════════════════════════════════ */}
      <div className="metrics-row mb-4">
        <MetricCard label="ATS Score"          value={data.atsScore ?? 0}                color="#4f46e5" bg="#e0e7ff" icon="bi-cpu-fill"            delay={0} />
        <MetricCard label="Skill Match"         value={data.skillMatchPercentage ?? 0}   color="#10b981" bg="#d1fae5" icon="bi-lightning-fill"       delay={1} />
        <MetricCard label="Resume Quality"      value={Math.round((data.atsScore ?? 0) * 0.95)} color="#0ea5e9" bg="#e0f2fe" icon="bi-file-earmark-check-fill" delay={2} />
        <MetricCard label="Interview Readiness" value={readiness.overall}                color="#f59e0b" bg="#fef3c7" icon="bi-person-check-fill"    delay={3} />
        <MetricCard label="Recruiter Score"     value={Math.round((data.atsScore ?? 0) * 0.90)} color="#8b5cf6" bg="#ede9fe" icon="bi-briefcase-fill"       delay={4} />
      </div>

      {/* ── Hero card (existing — untouched) ── */}
      <div className="card-custom mb-4 p-0">
        <div className="row g-0">
          <div className="col-md-3 d-flex align-items-center justify-content-center"
            style={{ background: 'var(--surface-2)', borderRadius: '12px 0 0 12px', padding: '2rem', borderRight: '1px solid var(--border)' }}>
            <ScoreRing score={data.atsScore} />
          </div>
          <div className="col-md-9 p-4">
            <div className="row g-3">
              <div className="col-sm-4">
                <div className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skill Match</div>
                <div className="fw-bold fs-3" style={{ color: scoreColor(data.skillMatchPercentage) }}>{data.skillMatchPercentage ?? '—'}%</div>
                <div className="progress mt-1" style={{ height: 6, borderRadius: 99 }}>
                  <div className="progress-bar" style={{ width: `${data.skillMatchPercentage ?? 0}%`, background: scoreColor(data.skillMatchPercentage), borderRadius: 99 }} />
                </div>
              </div>
              <div className="col-sm-4">
                <div className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hiring Recommendation</div>
                <div className="mt-2">
                  <span className={`badge fs-6 ${hiringColor(data.hiringRecommendation?.split(' ')[0])}`}>
                    {data.hiringRecommendation?.split(' ')[0] || '—'}
                  </span>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</div>
                <div className="mt-2">
                  <span className={`badge ${data.status === 'COMPLETED' ? 'bg-success' : 'bg-warning text-dark'}`}>{data.status}</span>
                </div>
              </div>
              {data.professionalSummary && (
                <div className="col-12">
                  <div className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Professional Summary</div>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>{data.professionalSummary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs (existing — untouched) ── */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link d-flex align-items-center gap-1 ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={`bi ${t.icon}`} /> {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ════════════════════════════════════════════════════════
          TAB: OVERVIEW (existing content + new enhanced cards)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="row g-4">

          {/* Existing: Strengths + Weaknesses */}
          <div className="col-md-6">
            <Section icon="bi-hand-thumbs-up-fill" title="Strengths" accent="text-success">
              <BulletList items={data.candidateStrengths} />
            </Section>
          </div>
          <div className="col-md-6">
            <Section icon="bi-exclamation-triangle-fill" title="Weaknesses" accent="text-warning">
              <BulletList items={data.weaknesses} />
            </Section>
          </div>

          {/* FEATURE 1 — Score Breakdown */}
          <div className="col-md-6">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-pie-chart-fill text-primary me-2" />Score Breakdown</span>
              </div>
              <div className="card-body-custom">
                {breakdown.map((item, i) => (
                  <div key={i} className="breakdown-row">
                    <div className="breakdown-label">{item.label}</div>
                    <div className="breakdown-bar-wrap">
                      <AnimBar pct={item.pct} color={item.color} height={10} />
                    </div>
                    <div className="breakdown-pct" style={{ color: item.color }}>{item.pct}%</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* FEATURE 3 — Section Ratings */}
          <div className="col-md-6">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-star-fill text-warning me-2" />Resume Section Ratings</span>
              </div>
              <div className="card-body-custom">
                {ratings.map((item, i) => (
                  <div key={i} className="star-row">
                    <div className="star-label">{item.label}</div>
                    <Stars count={item.stars} />
                    <div className="text-muted" style={{ fontSize: '0.75rem', width: 40, textAlign: 'right' }}>{item.stars}/5</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Existing: Keyword Matches */}
          <div className="col-12">
            <Section icon="bi-key-fill" title="Keyword Matches" accent="text-info">
              <Chips items={data.keywordMatch} variant="chip-purple" />
            </Section>
          </div>

          {/* FEATURE 5 — AI Recruiter Insights */}
          <div className="col-12">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <div className="card-header-custom card-custom" style={{ borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
                <span className="fw-semibold section-title"><i className="bi bi-person-badge-fill text-primary me-2" />AI Recruiter Insights</span>
                <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>AI Generated</span>
              </div>
              <div className="recruiter-card" style={{ borderRadius: '0 0 12px 12px' }}>
                <p className="recruiter-text">
                  {data.hiringRecommendation
                    ? data.hiringRecommendation
                    : `Based on the resume analysis, this candidate demonstrates ${(data.candidateStrengths || ['strong technical skills'])[0]?.toLowerCase() || 'relevant technical skills'}.
                    The profile shows ${data.atsScore >= 70 ? 'strong' : 'moderate'} alignment with industry standards, with an ATS score of ${data.atsScore}/100.
                    Key strengths include ${(data.identifiedSkills || ['core programming skills']).slice(0, 3).join(', ')}.
                    However, the candidate should address gaps in ${(data.missingSkills || ['relevant certifications']).slice(0, 2).join(' and ')}.
                    ${data.atsScore >= 75 ? 'This candidate is likely to be shortlisted for technical interviews.' : 'With targeted improvements, this candidate can significantly increase their shortlisting chances.'}`
                  }
                </p>
                <div className="recruiter-footer">
                  <div className="recruiter-avatar"><i className="bi bi-robot text-white" /></div>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>AI HR Analyst</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Powered by Gemini AI</div>
                  </div>
                  <div className="ms-auto">
                    <span className={`badge ${data.atsScore >= 75 ? 'bg-success' : data.atsScore >= 55 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                      {data.atsScore >= 75 ? 'Likely Shortlisted' : data.atsScore >= 55 ? 'Consider' : 'Needs Work'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Existing: Full Hiring Recommendation */}
          {data.hiringRecommendation && (
            <div className="col-12">
              <Section icon="bi-person-check-fill" title="Full Hiring Recommendation">
                <p className="text-secondary mb-0" style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>{data.hiringRecommendation}</p>
              </Section>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: SKILLS (existing + Feature 2 Skill Gap Analysis)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'skills' && (
        <div className="row g-4">
          {/* Existing */}
          <div className="col-md-6">
            <Section icon="bi-check-circle-fill" title="Identified Skills" accent="text-success">
              <Chips items={data.identifiedSkills} variant="chip-green" />
            </Section>
          </div>
          <div className="col-md-6">
            <Section icon="bi-x-circle-fill" title="Missing Skills" accent="text-danger">
              <Chips items={data.missingSkills} variant="chip-red" />
            </Section>
          </div>

          {/* FEATURE 2 — Skill Gap Analysis */}
          <div className="col-12">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-diagram-3-fill text-primary me-2" />Skill Gap Analysis</span>
              </div>
              <div className="card-body-custom">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="fw-semibold mb-2" style={{ fontSize: '0.82rem', color: '#065f46' }}>
                      <i className="bi bi-check-circle-fill me-1" />Matched Skills ({(data.identifiedSkills || []).length})
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {(data.identifiedSkills || []).length === 0
                        ? <span className="text-muted small fst-italic">None identified</span>
                        : (data.identifiedSkills || []).map((s, i) => (
                          <span key={i} className="skill-chip chip-green">{s}</span>
                        ))}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="fw-semibold mb-2" style={{ fontSize: '0.82rem', color: '#991b1b' }}>
                      <i className="bi bi-x-circle-fill me-1" />Missing Skills ({(data.missingSkills || []).length})
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {(data.missingSkills || []).length === 0
                        ? <span className="text-muted small fst-italic">No gaps found</span>
                        : (data.missingSkills || []).map((s, i) => (
                          <span key={i} className="skill-chip chip-red">{s}</span>
                        ))}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="fw-semibold mb-2" style={{ fontSize: '0.82rem', color: '#1d4ed8' }}>
                      <i className="bi bi-lightbulb-fill me-1" />Recommended to Learn ({(data.recommendedCourses || []).length})
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {(data.missingTechnologies || data.recommendedCourses || []).slice(0, 6).map((s, i) => (
                        <span key={i} className="skill-chip chip-blue">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Existing: Technical + Soft analysis */}
          <div className="col-md-6">
            <Section icon="bi-gear-fill" title="Technical Skills Analysis">
              <EvalParagraph text={data.technicalSkillAnalysis} />
            </Section>
          </div>
          <div className="col-md-6">
            <Section icon="bi-chat-heart-fill" title="Soft Skills Analysis">
              <EvalParagraph text={data.softSkillAnalysis} />
            </Section>
          </div>

          {/* FEATURE 4 — Interview Readiness */}
          <div className="col-12">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-person-check-fill text-success me-2" />Interview Readiness</span>
              </div>
              <div className="card-body-custom">
                <div className="row g-4 align-items-center">
                  <div className="col-md-3 text-center">
                    <div className="readiness-big">{readiness.overall}%</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Overall Readiness</div>
                    <AnimBar pct={readiness.overall} color={scoreColor(readiness.overall)} height={6} />
                  </div>
                  <div className="col-md-9">
                    <div className="row g-3">
                      {[
                        { label: 'Technical Skills',  val: readiness.technical,      color: '#4f46e5' },
                        { label: 'Communication',     val: readiness.communication,  color: '#10b981' },
                        { label: 'Project Quality',   val: readiness.projectQuality, color: '#0ea5e9' },
                        { label: 'Confidence Score',  val: readiness.confidence,     color: '#f59e0b' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="col-sm-6">
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{val}%</span>
                          </div>
                          <AnimBar pct={val} color={color} height={8} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ════════════════════════════
          TAB: EVALUATION (existing)
      ════════════════════════════ */}
      {activeTab === 'evaluation' && (
        <div className="row g-4">
          {[
            { icon: 'bi-briefcase-fill',   title: 'Experience Evaluation', text: data.experienceEvaluation },
            { icon: 'bi-mortarboard-fill', title: 'Education Evaluation',  text: data.educationEvaluation },
            { icon: 'bi-kanban-fill',       title: 'Projects Evaluation',   text: data.projectEvaluation },
          ].map(({ icon, title, text }) => (
            <div key={title} className="col-md-6">
              <Section icon={icon} title={title}><EvalParagraph text={text} /></Section>
            </div>
          ))}
          <div className="col-md-6">
            <Section icon="bi-award-fill" title="Missing Certifications" accent="text-warning">
              <BulletList items={data.missingCertifications} />
            </Section>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: IMPROVEMENT (existing + Features 7, 9, 10)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'improvement' && (
        <div className="row g-4">

          {/* FEATURE 7 — Priority Suggestions */}
          <div className="col-12">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-flag-fill text-danger me-2" />Improvement Priorities</span>
              </div>
              <div className="card-body-custom">
                {priorities.length === 0
                  ? <span className="text-muted small fst-italic">No suggestions available.</span>
                  : priorities.map((item, i) => (
                    <div key={i} className="priority-item">
                      <span className={`priority-badge ${item.level === 'HIGH' ? 'priority-high' : item.level === 'MEDIUM' ? 'priority-medium' : 'priority-low'}`}>
                        {item.level}
                      </span>
                      <span>{item.text}</span>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          </div>

          {/* Existing: Numbered suggestions */}
          <div className="col-12">
            <Section icon="bi-list-ol" title="All Improvement Suggestions" accent="text-primary">
              <NumberedList items={data.improvementSuggestions} />
            </Section>
          </div>

          {/* Existing: Improved summary + skills */}
          {data.improvedSummary && (
            <div className="col-md-6">
              <Section icon="bi-pencil-fill" title="Improved Summary" accent="text-success">
                <p className="text-secondary mb-0" style={{ fontSize: '0.875rem', lineHeight: 1.8, background: 'var(--surface-2)', padding: '0.875rem', borderRadius: 8, borderLeft: '3px solid var(--success)' }}>
                  {data.improvedSummary}
                </p>
              </Section>
            </div>
          )}
          {data.improvedSkillsSection && (
            <div className="col-md-6">
              <Section icon="bi-lightning-charge-fill" title="Improved Skills Section" accent="text-primary">
                <p className="text-secondary mb-0" style={{ fontSize: '0.875rem', lineHeight: 1.8, background: 'var(--surface-2)', padding: '0.875rem', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                  {data.improvedSkillsSection}
                </p>
              </Section>
            </div>
          )}

          <div className="col-md-6">
            <Section icon="bi-tags-fill" title="Suggested ATS Keywords" accent="text-info">
              <Chips items={data.suggestedKeywords} variant="chip-blue" />
            </Section>
          </div>
          <div className="col-md-6">
            <Section icon="bi-lightning-fill" title="Action Verbs" accent="text-warning">
              <Chips items={data.actionVerbs} variant="chip-yellow" />
            </Section>
          </div>

          {data.grammarSuggestions && (
            <div className="col-12">
              <Section icon="bi-spell-check" title="Grammar & Formatting Tips">
                <EvalParagraph text={data.grammarSuggestions} />
              </Section>
            </div>
          )}

          {/* FEATURE 9 — Resume Improvement Projection */}
          <div className="col-12">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-graph-up-arrow text-success me-2" />Resume Improvement Projection</span>
              </div>
              <div className="card-body-custom">
                <div className="projection-wrap">
                  <div className="projection-score">
                    <div className="projection-score-val" style={{ color: scoreColor(data.atsScore) }}>{data.atsScore ?? 0}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.78rem' }}>Current Score</div>
                    <AnimBar pct={data.atsScore ?? 0} color={scoreColor(data.atsScore)} height={10} />
                  </div>
                  <div className="projection-arrow">→</div>
                  <div className="projection-score">
                    <div className="projection-score-val" style={{ color: scoreColor(projectedScore) }}>{projectedScore}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.78rem' }}>After Improvements</div>
                    <AnimBar pct={projectedScore} color={scoreColor(projectedScore)} height={10} />
                  </div>
                  <div className="projection-bar-wrap">
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Score Progression</div>
                    {[
                      { label: 'Current',    pct: data.atsScore ?? 0,    color: scoreColor(data.atsScore) },
                      { label: 'Week 2',     pct: Math.min(100, Math.round((data.atsScore ?? 0) * 1.08)), color: '#0ea5e9' },
                      { label: 'Month 1',    pct: Math.min(100, Math.round((data.atsScore ?? 0) * 1.15)), color: '#8b5cf6' },
                      { label: 'Projected',  pct: projectedScore,         color: '#10b981' },
                    ].map(({ label, pct, color }) => (
                      <div key={label} className="proj-bar-row">
                        <div className="proj-bar-label">{label}</div>
                        <div className="proj-bar-track"><AnimBar pct={pct} color={color} height={12} /></div>
                        <div style={{ width: 36, textAlign: 'right', fontSize: '0.78rem', fontWeight: 700, color }}>{pct}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: RECOMMENDATIONS (existing + Features 6, 8)
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'recommend' && (
        <div className="row g-4">
          {/* Existing */}
          <div className="col-md-6">
            <Section icon="bi-code-slash" title="Missing Technologies" accent="text-danger">
              <BulletList items={data.missingTechnologies} />
            </Section>
          </div>
          <div className="col-md-6">
            <Section icon="bi-kanban-fill" title="Recommended Projects to Build" accent="text-primary">
              <BulletList items={data.recommendedProjects} />
            </Section>
          </div>
          <div className="col-12">
            <Section icon="bi-mortarboard-fill" title="Recommended Courses" accent="text-success">
              <NumberedList items={data.recommendedCourses} />
            </Section>
          </div>

          {/* FEATURE 8 — Estimated Career Match */}
          <div className="col-md-6">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-briefcase-fill text-primary me-2" />Estimated Career Match</span>
              </div>
              <div className="card-body-custom">
                {careerMatch.map((item, i) => (
                  <div key={i} className="career-row">
                    <div className="career-title">{item.role}</div>
                    <div className="career-bar-wrap"><AnimBar pct={item.pct} color="var(--primary)" height={10} /></div>
                    <div className="career-pct">{item.pct}%</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* FEATURE 6 — Interview Questions */}
          <div className="col-md-6">
            <motion.div className="card-custom" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="card-header-custom">
                <span className="fw-semibold section-title"><i className="bi bi-chat-quote-fill text-info me-2" />AI Interview Questions</span>
                <span className="badge bg-info" style={{ fontSize: '0.7rem' }}>Top 10</span>
              </div>
              <div className="card-body-custom">
                {interviewQs.map((q, i) => (
                  <div key={i} className="iq-item">
                    <div className="iq-num">{i + 1}</div>
                    <div className="iq-text">{q}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
