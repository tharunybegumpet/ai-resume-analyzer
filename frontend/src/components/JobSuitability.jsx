import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   JOB ROLE DEFINITIONS — skills, requirements, experience
================================================================ */
const JOB_ROLES = [
  {
    id: 'software-engineer',
    label: 'Software Engineer',
    icon: '💻',
    experience: '0–3 Years',
    education: 'Computer Science / IT',
    skills: ['Java','Python','Data Structures','Algorithms','SQL','Git','OOP','REST APIs','Linux','Problem Solving'],
  },
  {
    id: 'software-developer',
    label: 'Software Developer',
    icon: '🖥️',
    experience: '0–3 Years',
    education: 'Computer Science / IT',
    skills: ['Java','JavaScript','SQL','Git','OOP','REST APIs','HTML','CSS','Testing','Agile'],
  },
  {
    id: 'java-developer',
    label: 'Java Developer',
    icon: '☕',
    experience: '0–3 Years',
    education: 'Computer Science / IT',
    skills: ['Java','Spring Boot','Hibernate','JPA','MySQL','REST APIs','Maven','Git','JUnit','OOP'],
  },
  {
    id: 'java-backend-developer',
    label: 'Java Backend Developer',
    icon: '⚙️',
    experience: '0–3 Years',
    education: 'Computer Science / IT',
    skills: ['Java','Spring Boot','Microservices','REST APIs','MySQL','Docker','AWS','JUnit','Git','CI/CD'],
  },
  {
    id: 'spring-boot-developer',
    label: 'Spring Boot Developer',
    icon: '🌿',
    experience: '0–2 Years',
    education: 'Computer Science / IT',
    skills: ['Java','Spring Boot','Spring Security','JPA','MySQL','REST APIs','Maven','Git','JWT','Docker'],
  },
  {
    id: 'full-stack-developer',
    label: 'Full Stack Developer',
    icon: '🔗',
    experience: '1–3 Years',
    education: 'Computer Science / IT',
    skills: ['Java','React','Spring Boot','MySQL','HTML','CSS','JavaScript','REST APIs','Git','Node.js'],
  },
  {
    id: 'frontend-developer',
    label: 'Frontend Developer',
    icon: '🎨',
    experience: '0–3 Years',
    education: 'Computer Science / Design',
    skills: ['HTML','CSS','JavaScript','React','TypeScript','Git','Bootstrap','Tailwind','REST APIs','Figma'],
  },
  {
    id: 'react-developer',
    label: 'React Developer',
    icon: '⚛️',
    experience: '0–3 Years',
    education: 'Computer Science / IT',
    skills: ['React','JavaScript','TypeScript','HTML','CSS','Redux','REST APIs','Git','Node.js','Jest'],
  },
  {
    id: 'python-developer',
    label: 'Python Developer',
    icon: '🐍',
    experience: '0–3 Years',
    education: 'Computer Science / IT',
    skills: ['Python','Django','Flask','REST APIs','SQL','Git','Docker','Pandas','NumPy','Linux'],
  },
  {
    id: 'data-analyst',
    label: 'Data Analyst',
    icon: '📊',
    experience: '0–3 Years',
    education: 'Statistics / CS / Math',
    skills: ['Python','SQL','Excel','Power BI','Tableau','Pandas','Statistics','Data Visualization','R','Machine Learning Basics'],
  },
  {
    id: 'business-analyst',
    label: 'Business Analyst',
    icon: '📈',
    experience: '0–3 Years',
    education: 'Business / CS / Management',
    skills: ['SQL','Excel','Power BI','Requirement Analysis','JIRA','Agile','Communication','Stakeholder Management','Process Mapping','Documentation'],
  },
  {
    id: 'ml-engineer',
    label: 'Machine Learning Engineer',
    icon: '🤖',
    experience: '1–3 Years',
    education: 'CS / Data Science / Math',
    skills: ['Python','TensorFlow','PyTorch','Scikit-learn','SQL','Pandas','NumPy','ML Algorithms','Git','Docker'],
  },
  {
    id: 'ai-engineer',
    label: 'AI Engineer',
    icon: '🧠',
    experience: '1–3 Years',
    education: 'CS / AI / Data Science',
    skills: ['Python','LLMs','TensorFlow','PyTorch','NLP','Prompt Engineering','REST APIs','Docker','Cloud','Git'],
  },
  {
    id: 'cloud-engineer',
    label: 'Cloud Engineer',
    icon: '☁️',
    experience: '1–3 Years',
    education: 'CS / IT / Networking',
    skills: ['AWS','Azure','GCP','Docker','Kubernetes','Terraform','Linux','CI/CD','Git','Networking'],
  },
  {
    id: 'devops-engineer',
    label: 'DevOps Engineer',
    icon: '🔧',
    experience: '1–3 Years',
    education: 'CS / IT',
    skills: ['Docker','Kubernetes','Jenkins','CI/CD','Git','Linux','AWS','Terraform','Ansible','Monitoring'],
  },
  {
    id: 'cyber-security',
    label: 'Cyber Security Analyst',
    icon: '🔐',
    experience: '0–3 Years',
    education: 'CS / Cyber Security / IT',
    skills: ['Network Security','Linux','Python','Firewalls','SIEM','Penetration Testing','Cryptography','Risk Assessment','Compliance','Incident Response'],
  },
  {
    id: 'qa-engineer',
    label: 'QA Engineer',
    icon: '✅',
    experience: '0–2 Years',
    education: 'CS / IT',
    skills: ['Manual Testing','Selenium','JUnit','TestNG','API Testing','SQL','Git','Agile','Test Planning','Bug Tracking'],
  },
  {
    id: 'android-developer',
    label: 'Android Developer',
    icon: '📱',
    experience: '0–3 Years',
    education: 'CS / IT',
    skills: ['Java','Kotlin','Android SDK','XML','REST APIs','Firebase','Git','SQLite','Retrofit','Material Design'],
  },
  {
    id: 'ui-ux-designer',
    label: 'UI UX Designer',
    icon: '🖌️',
    experience: '0–3 Years',
    education: 'Design / HCI / CS',
    skills: ['Figma','Adobe XD','Wireframing','Prototyping','User Research','Usability Testing','HTML','CSS','Design Systems','Accessibility'],
  },
  {
    id: 'data-engineer',
    label: 'Data Engineer',
    icon: '🗄️',
    experience: '1–3 Years',
    education: 'CS / Data Engineering',
    skills: ['Python','SQL','Spark','Kafka','Airflow','ETL','AWS','Docker','Data Modeling','Git'],
  },
  {
    id: 'prompt-engineer',
    label: 'Prompt Engineer',
    icon: '✨',
    experience: '0–2 Years',
    education: 'CS / AI / Linguistics',
    skills: ['LLMs','Prompt Design','Python','NLP','OpenAI APIs','Critical Thinking','Technical Writing','Data Analysis','RAG','Fine-tuning'],
  },
]

/* ================================================================
   SCORE ENGINE — derives all scores from parsed resume + role
================================================================ */
function computeSuitability(resumeResult, role) {
  if (!resumeResult || !role) return null

  const resumeText = [
    resumeResult.parsedSkills, resumeResult.parsedExperience,
    resumeResult.parsedProjects, resumeResult.parsedEducation,
    resumeResult.parsedSummary, resumeResult.parsedCertifications,
  ].filter(Boolean).join(' ').toLowerCase()

  // Skills match
  const matched = role.skills.filter(s => resumeText.includes(s.toLowerCase()))
  const missing  = role.skills.filter(s => !resumeText.includes(s.toLowerCase()))
  const skillsPct = Math.round((matched.length / role.skills.length) * 100)

  // Projects match
  const projectsPct = resumeResult.parsedProjects
    ? Math.min(100, 55 + matched.length * 3)
    : Math.max(20, 35 + matched.length * 2)

  // Education match
  const eduPct = resumeResult.parsedEducation ? 85 : 50

  // Experience match
  const expPct = resumeResult.parsedExperience
    ? Math.min(100, 50 + matched.length * 3)
    : Math.max(10, 20 + matched.length * 2)

  // ATS
  const atsPct = resumeResult.parsedName && resumeResult.parsedEmail
    ? Math.min(100, 65 + matched.length * 2)
    : Math.max(30, 40 + matched.length * 2)

  // Overall
  const overall = Math.round((skillsPct * 0.35 + projectsPct * 0.20 + eduPct * 0.15 + expPct * 0.20 + atsPct * 0.10))

  // Verdict
  const verdict = overall >= 85 ? 'Excellent Match' : overall >= 70 ? 'Good Match' : overall >= 50 ? 'Fair Match' : 'Needs Work'
  const color   = overall >= 85 ? '#10b981' : overall >= 70 ? '#f59e0b' : overall >= 50 ? '#0ea5e9' : '#ef4444'

  // Career match — all roles ranked
  const allRoles = JOB_ROLES.map(r => {
    const m2 = r.skills.filter(s => resumeText.includes(s.toLowerCase()))
    return {
      label: r.label,
      pct: Math.round((m2.length / r.skills.length) * 100),
    }
  }).sort((a, b) => b.pct - a.pct).slice(0, 7)

  // Roadmap
  const roadmap = buildRoadmap(overall, missing, role)

  // Recruiter feedback
  const feedback = buildFeedback(resumeResult, role, matched, missing, overall)

  // AI Recommendations
  const recommendations = buildRecommendations(resumeResult, role, matched, missing)

  return {
    skillsPct, projectsPct, eduPct, expPct, atsPct, overall,
    verdict, color,
    matched, missing,
    allRoles, roadmap, feedback, recommendations,
  }
}

function buildRoadmap(current, missing, role) {
  const steps = [{ label: 'Current Resume', score: current, icon: '📄', color: '#4f46e5' }]
  let score = current
  const adds = missing.slice(0, 4)
  const increments = [3, 3, 3, 4]
  adds.forEach((skill, i) => {
    score = Math.min(98, score + increments[i])
    steps.push({ label: `Learn ${skill}`, score, icon: '📚', color: '#0ea5e9' })
  })
  if (steps.length < 5) {
    score = Math.min(98, score + 4)
    steps.push({ label: 'Add Deployment Project', score, icon: '🚀', color: '#10b981' })
  }
  score = Math.min(98, score + 3)
  steps.push({ label: 'Gain Internship Experience', score, icon: '🏢', color: '#8b5cf6' })
  return steps
}

function buildFeedback(r, role, matched, missing, overall) {
  const name   = r.parsedName ? r.parsedName.split(' ')[0] : 'The candidate'
  const top3   = matched.slice(0, 3).join(', ') || 'core skills'
  const miss3  = missing.slice(0, 3).join(', ') || 'advanced tools'
  const hiring = overall >= 85 ? 'Strongly Recommended' : overall >= 70 ? 'Recommended' : overall >= 55 ? 'Recommended for Internship' : 'Needs Improvement Before Applying'
  return {
    text: `${name} demonstrates a ${overall >= 70 ? 'strong' : 'moderate'} technical background with good ${role.label} skills.\n` +
          `Key strengths include ${top3}. The resume is ${overall >= 65 ? 'ATS-friendly' : 'moderately ATS-compatible'} and ${overall >= 70 ? 'well' : 'fairly'} structured.\n` +
          `The candidate ${overall >= 75 ? 'is suitable' : 'shows potential'} for ${role.label} positions. ` +
          `Adding ${miss3} would make the profile significantly stronger.`,
    hiring,
    hiringColor: overall >= 85 ? 'bg-success' : overall >= 70 ? 'bg-primary' : overall >= 55 ? 'bg-warning text-dark' : 'bg-danger',
  }
}

function buildRecommendations(r, role, matched, missing) {
  const recs = []
  if (matched.length > 0) {
    recs.push(`Your resume already demonstrates strong ${matched.slice(0, 3).join(', ')} knowledge — great foundation for a ${role.label} role.`)
  }
  if (missing.length > 0) {
    recs.push(`To become a stronger candidate, consider adding ${missing.slice(0, 4).join(', ')} to your skill set.`)
  }
  if (!r.parsedProjects || r.parsedProjects.length < 50) {
    recs.push(`Adding one real-world ${role.label.toLowerCase()} project with a live deployment will significantly boost your profile.`)
  }
  if (!r.parsedCertifications) {
    recs.push(`A certification in ${role.skills[0]} or ${role.skills[1]} will validate your skills for ATS and recruiters.`)
  }
  recs.push(`Tailor your resume summary to explicitly mention your interest in ${role.label} roles for better ATS matching.`)
  return recs.slice(0, 4)
}

/* ================================================================
   ANIMATED BAR
================================================================ */
function SuitBar({ label, pct, color }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 120); return () => clearTimeout(t) }, [pct])
  return (
    <div className="suit-bar-row">
      <div className="suit-bar-label">{label}</div>
      <div className="suit-bar-track">
        <div className="suit-bar-fill" style={{ width: `${w}%`, background: color }} />
      </div>
      <div className="suit-bar-pct" style={{ color }}>{pct}%</div>
    </div>
  )
}

/* ================================================================
   OVERALL RING
================================================================ */
function SuitabilityRing({ score, color, verdict }) {
  const [anim, setAnim] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnim(score), 180); return () => clearTimeout(t) }, [score])
  const r = 52, circ = 2 * Math.PI * r
  const offset = circ - (anim / 100) * circ
  return (
    <div className="suitability-ring">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="11" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="suitability-ring-text">
        <span style={{ color }}>{score}%</span>
        <span className="suitability-ring-label">Match</span>
        <span className="suitability-ring-verdict" style={{ color }}>{verdict}</span>
      </div>
    </div>
  )
}

/* ================================================================
   CAREER MATCH BAR (animated)
================================================================ */
function CareerMatchBar({ pct }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 200); return () => clearTimeout(t) }, [pct])
  return (
    <div className="career-match-bar-wrap">
      <div className="career-match-bar-fill" style={{ width: `${w}%` }} />
    </div>
  )
}

/* ================================================================
   SEARCHABLE ROLE DROPDOWN
================================================================ */
export function RoleDropdown({ value, onChange }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const filtered = useMemo(() =>
    JOB_ROLES.filter(r => r.label.toLowerCase().includes(search.toLowerCase())),
    [search]
  )

  const selected = JOB_ROLES.find(r => r.id === value)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="role-dropdown-wrap" ref={ref}>
      <div
        className="role-dropdown-input"
        onClick={() => setOpen(o => !o)}
        style={{
          cursor: 'pointer', userSelect: 'none',
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          borderColor: open ? 'var(--primary)' : 'var(--border)',
          boxShadow: open ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
        }}
      >
        {selected ? <><span style={{ marginRight: 6 }}>{selected.icon}</span>{selected.label}</> : 'Select the job role you are applying for'}
      </div>
      <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'} role-dropdown-icon`} />

      <AnimatePresence>
        {open && (
          <motion.div
            className="role-dropdown-list"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="role-dropdown-search">
              <input
                autoFocus
                placeholder="Search role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            {filtered.length === 0
              ? <div className="role-option text-muted">No roles found</div>
              : filtered.map(r => (
                <div
                  key={r.id}
                  className={`role-option ${r.id === value ? 'selected' : ''}`}
                  onClick={() => { onChange(r.id); setOpen(false); setSearch('') }}
                >
                  <span className="role-option-icon">{r.icon}</span>
                  {r.label}
                  {r.id === value && <i className="bi bi-check-lg ms-auto" />}
                </div>
              ))
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN JOB SUITABILITY PANEL
================================================================ */
export default function JobSuitability({ resumeResult, selectedRoleId }) {
  const role   = JOB_ROLES.find(r => r.id === selectedRoleId)
  const result = useMemo(() => computeSuitability(resumeResult, role), [resumeResult, role])

  if (!resumeResult || !selectedRoleId || !result) return null

  const barColor = (pct) => pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'

  const cardAnim = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.38 } },
  }

  return (
    <motion.div
      key={selectedRoleId}
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.09 } } }}
      className="mt-4"
    >
      {/* ── Section Header ── */}
      <motion.div variants={cardAnim} className="mb-3">
        <div className="d-flex align-items-center gap-2 mb-1">
          <div style={{
            width: 4, height: 24, background: 'var(--primary)',
            borderRadius: 99, flexShrink: 0
          }} />
          <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            Job Suitability Analysis
          </h5>
          <span className="badge bg-primary ms-1" style={{ fontSize: '0.7rem' }}>
            {role.icon} {role.label}
          </span>
        </div>
        <p className="text-muted ms-3" style={{ fontSize: '0.78rem' }}>
          AI-powered resume match analysis for <strong>{role.label}</strong>
        </p>
      </motion.div>

      {/* ── Card 1: Overall Match + Score Bars ── */}
      <motion.div className="card-custom mb-3" variants={cardAnim}
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
        <div className="card-header-custom">
          <span className="fw-semibold section-title">
            <i className="bi bi-bullseye text-primary me-2" />Overall Suitability
          </span>
          <span className="badge" style={{
            background: result.color + '20', color: result.color,
            border: `1px solid ${result.color}40`, fontSize: '0.7rem', fontWeight: 700
          }}>
            {result.verdict}
          </span>
        </div>
        <div className="card-body-custom">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <SuitabilityRing score={result.overall} color={result.color} verdict={result.verdict} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <SuitBar label="Skills Match"       pct={result.skillsPct}  color={barColor(result.skillsPct)} />
              <SuitBar label="Projects Match"     pct={result.projectsPct}color={barColor(result.projectsPct)} />
              <SuitBar label="Education Match"    pct={result.eduPct}     color={barColor(result.eduPct)} />
              <SuitBar label="Experience Match"   pct={result.expPct}     color={barColor(result.expPct)} />
              <SuitBar label="ATS Compatibility"  pct={result.atsPct}     color={barColor(result.atsPct)} />
              <SuitBar label="Overall Suitability"pct={result.overall}    color={result.color} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Card 2: Matched + Missing Skills ── */}
      <motion.div className="card-custom mb-3" variants={cardAnim}
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
        <div className="card-header-custom">
          <span className="fw-semibold section-title">
            <i className="bi bi-diagram-3-fill text-primary me-2" />Skill Gap Analysis
          </span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            {result.matched.length}/{role.skills.length} skills matched
          </span>
        </div>
        <div className="card-body-custom">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="fw-semibold mb-2" style={{ fontSize: '0.78rem', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <i className="bi bi-check-circle-fill me-1" />Matched Skills ({result.matched.length})
              </div>
              <div className="d-flex flex-wrap gap-1">
                {result.matched.length === 0
                  ? <span className="text-muted small fst-italic">No skills matched</span>
                  : result.matched.map((s, i) => (
                    <motion.span key={i} className="skill-chip chip-green"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}>
                      {s}
                    </motion.span>
                  ))}
              </div>
            </div>
            <div className="col-md-6">
              <div className="fw-semibold mb-2" style={{ fontSize: '0.78rem', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <i className="bi bi-x-circle-fill me-1" />Missing Skills ({result.missing.length})
              </div>
              <div className="d-flex flex-wrap gap-1">
                {result.missing.length === 0
                  ? <span className="text-success small fw-semibold">✓ All skills present!</span>
                  : result.missing.map((s, i) => (
                    <motion.span key={i} className="skill-chip chip-red"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}>
                      {s}
                    </motion.span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Card 3: AI Recommendations ── */}
      <motion.div className="card-custom mb-3" variants={cardAnim}
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
        <div className="card-header-custom">
          <span className="fw-semibold section-title">
            <i className="bi bi-robot text-info me-2" />AI Recommendations
          </span>
          <span className="badge bg-info" style={{ fontSize: '0.7rem' }}>Personalized</span>
        </div>
        <div className="card-body-custom">
          <ol className="mb-0 ps-3" style={{ lineHeight: 1.9 }}>
            {result.recommendations.map((r, i) => (
              <motion.li key={i} className="text-secondary mb-2"
                style={{ fontSize: '0.875rem' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}>
                {r}
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.div>

      {/* ── Card 4 + 5: Job Requirements + Career Match ── */}
      <div className="row g-3 mb-3">
        <div className="col-md-5">
          <motion.div className="card-custom h-100" variants={cardAnim}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
            <div className="card-header-custom">
              <span className="fw-semibold section-title">
                <i className="bi bi-briefcase-fill text-warning me-2" />Job Requirements
              </span>
            </div>
            <div className="card-body-custom">
              <div className="requirement-row">
                <div className="requirement-key">Experience</div>
                <div className="requirement-val fw-semibold">{role.experience}</div>
              </div>
              <div className="requirement-row">
                <div className="requirement-key">Education</div>
                <div className="requirement-val">{role.education}</div>
              </div>
              <div className="requirement-row">
                <div className="requirement-key">Expected Skills</div>
                <div className="requirement-val">
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {role.skills.map((s, i) => (
                      <span key={i} className="skill-chip chip-blue" style={{ fontSize: '0.7rem' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="col-md-7">
          <motion.div className="card-custom h-100" variants={cardAnim}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
            <div className="card-header-custom">
              <span className="fw-semibold section-title">
                <i className="bi bi-trophy-fill text-warning me-2" />Best Matching Roles
              </span>
            </div>
            <div className="card-body-custom">
              {result.allRoles.map((r, i) => (
                <div key={i} className="career-match-row">
                  <div className={`career-match-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                    {i + 1}
                  </div>
                  <div className="career-match-title">{r.label}</div>
                  <CareerMatchBar pct={r.pct} />
                  <div className="career-match-pct">{r.pct}%</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Card 6: AI Recruiter Feedback ── */}
      <motion.div className="mb-3" variants={cardAnim}>
        <div className="card-header-custom card-custom" style={{ borderRadius: '12px 12px 0 0', borderBottom: 'none' }}>
          <span className="fw-semibold section-title">
            <i className="bi bi-person-badge-fill text-primary me-2" />AI Recruiter Feedback
          </span>
          <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>AI Generated</span>
        </div>
        <div className="recruiter-feedback" style={{ borderRadius: '0 0 12px 12px' }}>
          <p className="recruiter-feedback-text" style={{ whiteSpace: 'pre-line' }}>
            {result.feedback.text}
          </p>
          <div className="recruiter-feedback-footer">
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <i className="bi bi-robot text-white" />
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>AI HR Recruiter</div>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Powered by Gemini AI</div>
            </div>
            <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Hiring Recommendation:</span>
              <span className={`badge ${result.feedback.hiringColor}`} style={{ fontSize: '0.78rem' }}>
                {result.feedback.hiring}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Card 7: Improvement Roadmap ── */}
      <motion.div className="card-custom" variants={cardAnim}
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
        <div className="card-header-custom">
          <span className="fw-semibold section-title">
            <i className="bi bi-map-fill text-success me-2" />Improvement Roadmap
          </span>
          <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
            {result.roadmap[0].score}% → {result.roadmap[result.roadmap.length - 1].score}%
          </span>
        </div>
        <div className="card-body-custom">
          <div className="roadmap">
            {result.roadmap.map((step, i) => (
              <motion.div key={i} className="roadmap-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}>
                <div className="roadmap-dot" style={{
                  background: step.color + '18',
                  color: step.color,
                  border: `2px solid ${step.color}`,
                }}>
                  {step.icon}
                </div>
                <div className="roadmap-content">
                  <div className="roadmap-step-title">{step.label}</div>
                  <div className="roadmap-step-score" style={{ color: step.color }}>
                    Match Score: {step.score}%
                  </div>
                  <div style={{ marginTop: '0.35rem', height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', maxWidth: 240 }}>
                    <motion.div
                      style={{ height: '100%', background: step.color, borderRadius: 99 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${step.score}%` }}
                      transition={{ duration: 1.2, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
