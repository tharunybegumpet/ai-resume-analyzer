import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadResume } from '../api/resumeApi.js'
import { analyzeResume } from '../api/analysisApi.js'
import { getMyJobDescriptions } from '../api/jobDescApi.js'
import JobSuitability, { RoleDropdown } from '../components/JobSuitability.jsx'

const ACCEPTED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

/* ── helpers ── */
const countWords = (r) => {
  const text = [r.parsedSummary, r.parsedSkills, r.parsedEducation, r.parsedExperience,
    r.parsedProjects, r.parsedCertifications, r.parsedAchievements, r.parsedLanguages]
    .filter(Boolean).join(' ')
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
const countItems = (str) => str ? str.split(/[,\n]/).map(s => s.trim()).filter(Boolean).length : 0
const calcCompleteness = (r) => {
  const fields = [r.parsedName, r.parsedEmail, r.parsedPhone, r.parsedEducation,
    r.parsedSkills, r.parsedProjects, r.parsedExperience, r.parsedCertifications,
    r.parsedAchievements, r.parsedLanguages]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}
const calcHealth = (r) => {
  let s = 0
  if (r.parsedName) s += 15; if (r.parsedEmail) s += 10; if (r.parsedPhone) s += 5
  if (r.parsedSkills) s += 20; if (r.parsedExperience) s += 20; if (r.parsedEducation) s += 15
  if (r.parsedProjects) s += 10; if (r.parsedCertifications) s += 5
  return s
}
const getMissing = (r) => [
  ['parsedName','Name'],['parsedEmail','Email'],['parsedPhone','Phone'],
  ['parsedEducation','Education'],['parsedSkills','Skills'],['parsedExperience','Experience'],
  ['parsedProjects','Projects'],['parsedCertifications','Certifications'],
  ['parsedAchievements','Achievements'],['parsedLanguages','Languages'],
].filter(([k]) => !r[k]).map(([,l]) => l)

const categoriseSkills = (s) => {
  if (!s) return {}
  const raw = s.split(/[,\n]/).map(x => x.trim().toLowerCase()).filter(Boolean)
  const cats = {
    'Programming': { color:'chip-blue',   kw:['java','python','javascript','typescript','c++','kotlin','swift','go','php','ruby','scala'] },
    'Frameworks':  { color:'chip-purple', kw:['spring','react','angular','vue','node','django','flask','express','nextjs','hibernate'] },
    'Databases':   { color:'chip-green',  kw:['mysql','postgresql','mongodb','oracle','redis','sqlite','firebase'] },
    'Tools':       { color:'chip-yellow', kw:['git','docker','kubernetes','jenkins','maven','gradle','postman','jira','linux'] },
    'Cloud':       { color:'chip-purple', kw:['aws','azure','gcp','cloud','heroku','netlify','vercel'] },
  }
  const result = {}; const used = new Set()
  for (const [cat, { color, kw }] of Object.entries(cats)) {
    const m = raw.filter(x => !used.has(x) && kw.some(k => x.includes(k)))
    if (m.length) { result[cat] = { color, items: m.map(x => x.charAt(0).toUpperCase()+x.slice(1)) }; m.forEach(x => used.add(x)) }
  }
  const others = raw.filter(x => !used.has(x))
  if (others.length) result['Other'] = { color:'chip-gray', items: others.map(x => x.charAt(0).toUpperCase()+x.slice(1)) }
  return result
}
const getInsights = (r) => [
  { label:'Resume Parsed Successfully',   status: r.parsedName ? 'pass':'warn',  icon:'bi-check-circle-fill' },
  { label:'ATS Friendly Layout',          status: r.parsedSkills && r.parsedExperience ? 'pass':'warn', icon:'bi-robot' },
  { label:'Contact Info Present',         status: r.parsedEmail && r.parsedPhone ? 'pass':'warn', icon:'bi-person-fill' },
  { label:'Strong Technical Skills',      status: countItems(r.parsedSkills) >= 5 ? 'pass':'warn', icon:'bi-lightning-fill' },
  { label:'Experience Section',           status: r.parsedExperience ? 'pass':'fail', icon:'bi-briefcase-fill' },
  { label:'Achievements Listed',          status: r.parsedAchievements ? 'pass':'warn', icon:'bi-trophy-fill' },
  { label:'Certifications Present',       status: r.parsedCertifications ? 'pass':'warn', icon:'bi-award-fill' },
  { label:'Projects Included',            status: r.parsedProjects ? 'pass':'fail', icon:'bi-kanban-fill' },
]

/* ── animated bar ── */
function AnimBar({ pct, color='linear-gradient(90deg,#4f46e5,#06b6d4)', height=10 }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 150); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ height, background:'#e2e8f0', borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${w}%`, background:color, borderRadius:99, transition:'width 1.4s cubic-bezier(0.4,0,0.2,1)' }}/>
    </div>
  )
}

/* ── health circle ── */
function HealthCircle({ score }) {
  const [a, setA] = useState(0)
  useEffect(() => { const t = setTimeout(() => setA(score), 200); return () => clearTimeout(t) }, [score])
  const r = 46, c = 2 * Math.PI * r
  const col = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="health-circle">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={col} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c-(a/100)*c}
          style={{transition:'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)'}}/>
      </svg>
      <div className="health-circle-text">
        <span style={{color:col}}>{score}</span>
        <span className="health-circle-label">Health</span>
      </div>
    </div>
  )
}

/* ── timeline ── */
function Timeline({ step }) {
  const steps = [
    {label:'Upload', icon:'bi-cloud-upload-fill'},
    {label:'Parse Resume', icon:'bi-file-earmark-text'},
    {label:'Extract Info', icon:'bi-cpu'},
    {label:'Validate', icon:'bi-shield-check'},
    {label:'AI Ready', icon:'bi-stars'},
  ]
  return (
    <div className="timeline">
      {steps.map((s, i) => {
        const st = i < step ? 'done' : i === step ? 'active' : ''
        return (
          <div key={i} className={`timeline-step ${st}`}>
            <div className="timeline-dot">
              <i className={`bi ${st==='done' ? 'bi-check-lg' : s.icon}`} style={{fontSize:'0.85rem'}}/>
            </div>
            <div className="timeline-label">{s.label}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ── resume preview ── */
function ResumePreview({ file }) {
  const [url, setUrl] = useState(null)
  const [zoom, setZoom] = useState(false)
  useEffect(() => {
    if (file?.type === 'application/pdf') {
      const u = URL.createObjectURL(file); setUrl(u)
      return () => URL.revokeObjectURL(u)
    }
  }, [file])
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; a.click() }
  const open     = () => window.open(URL.createObjectURL(file), '_blank')
  return (
    <>
      <div className="pdf-preview-wrap" style={{height: zoom ? 380 : 180, transition:'height 0.4s ease'}}>
        {url
          ? <iframe src={`${url}#page=1&toolbar=0&navpanes=0`} title="Preview" style={{width:'100%',height:'100%',border:'none',pointerEvents:'none'}}/>
          : <div className="pdf-preview-placeholder">
              <i className="bi bi-file-earmark-word" style={{fontSize:'3rem',color:'#2563eb'}}/>
              <span style={{fontSize:'0.82rem',fontWeight:600}}>{file?.name}</span>
              <span style={{fontSize:'0.72rem'}}>DOCX preview not available</span>
            </div>
        }
      </div>
      <div className="d-flex gap-2 mt-2">
        <button className="btn btn-outline-primary btn-sm flex-fill" onClick={open}><i className="bi bi-box-arrow-up-right me-1"/>Open</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setZoom(z=>!z)}><i className={`bi ${zoom?'bi-zoom-out':'bi-zoom-in'}`}/></button>
        <button className="btn btn-outline-success btn-sm flex-fill" onClick={download}><i className="bi bi-download me-1"/>Download</button>
      </div>
    </>
  )
}

/* ================================================================
   MAIN PAGE
================================================================ */
export default function UploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [file, setFile]                 = useState(null)
  const [isDragging, setDragging]       = useState(false)
  const [progress, setProgress]         = useState(0)
  const [uploading, setUploading]       = useState(false)
  const [analyzing, setAnalyzing]       = useState(false)
  const [uploadError, setUploadError]   = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const [jds, setJds]                   = useState([])
  const [selectedJd, setSelectedJd]     = useState('')
  const [jdsLoaded, setJdsLoaded]       = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [timelineStep, setTimelineStep] = useState(0)
  const [completeness, setCompleteness] = useState(0)
  const [healthScore, setHealthScore]   = useState(0)

  const validate = (f) => {
    if (!ACCEPTED.includes(f.type)) return 'Only PDF and DOCX files are supported.'
    if (f.size > 10*1024*1024) return 'File size must not exceed 10 MB.'
    return null
  }

  const selectFile = useCallback((f) => {
    const err = validate(f)
    if (err) { toast.error(err); return }
    setFile(f); setUploadResult(null); setUploadError(''); setProgress(0); setTimelineStep(0)
  }, [])

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false) }
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) selectFile(f) }
  const onInput     = (e) => { if(e.target.files[0]) selectFile(e.target.files[0]); e.target.value='' }

  const handleUpload = async () => {
    if (!file || uploading) return
    setUploading(true); setUploadError(''); setTimelineStep(1)
    const fd = new FormData(); fd.append('file', file)
    try {
      const { data } = await uploadResume(fd, (e) => { if(e.total) setProgress(Math.round(e.loaded/e.total*100)) })
      setTimelineStep(2); await new Promise(r=>setTimeout(r,300))
      setTimelineStep(3); await new Promise(r=>setTimeout(r,300))
      setTimelineStep(4); setProgress(100)
      setUploadResult(data)
      setCompleteness(calcCompleteness(data))
      setHealthScore(calcHealth(data))
      toast.success('Resume uploaded and parsed!')
      if (!jdsLoaded) {
        const { data: jdList } = await getMyJobDescriptions()
        setJds(jdList); setJdsLoaded(true)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed.'
      setUploadError(msg); toast.error(msg); setProgress(0); setTimelineStep(0)
    } finally { setUploading(false) }
  }

  const handleAnalyze = async () => {
    if (!uploadResult) return
    setAnalyzing(true)
    try {
      const { data } = await analyzeResume({
        resumeId: uploadResult.id,
        jobDescriptionId: selectedJd ? Number(selectedJd) : null,
        targetJobRole: selectedRole || null,
      })
      toast.success('Analysis complete!')
      navigate(`/analysis/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.')
    } finally { setAnalyzing(false) }
  }

  const clear = () => {
    setFile(null); setUploadResult(null); setUploadError('')
    setProgress(0); setTimelineStep(0); setCompleteness(0); setHealthScore(0); setSelectedRole('')
  }

  const fmt = (b) => b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`

  const missing     = uploadResult ? getMissing(uploadResult) : []
  const insights    = uploadResult ? getInsights(uploadResult) : []
  const skillGroups = uploadResult ? categoriseSkills(uploadResult.parsedSkills) : {}
  const wordCount   = uploadResult ? countWords(uploadResult) : 0
  const skillCount  = uploadResult ? countItems(uploadResult.parsedSkills) : 0
  const projCount   = uploadResult ? countItems(uploadResult.parsedProjects) : 0
  const expCount    = uploadResult ? countItems(uploadResult.parsedExperience) : 0
  const certCount   = uploadResult ? countItems(uploadResult.parsedCertifications) : 0
  const eduCount    = uploadResult ? countItems(uploadResult.parsedEducation) : 0
  const langCount   = uploadResult ? countItems(uploadResult.parsedLanguages) : 0

  const card = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{duration:0.35}} }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="section-title"><i className="bi bi-cloud-upload-fill"/>Upload Resume</h2>
        <p className="text-muted mt-1" style={{fontSize:'0.875rem'}}>Upload PDF or DOCX — we'll extract, parse and analyze with AI.</p>
      </div>

      <div className="row g-4">

        {/* ═══════════ LEFT — Upload + Timeline + Preview + Tips ═══════════ */}
        <div className="col-lg-5">

          {/* Upload zone */}
          <motion.div className="card-custom" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.35}}>
            <div className="card-header-custom">
              <span className="fw-semibold"><i className="bi bi-file-earmark-arrow-up me-2 text-primary"/>Select File</span>
              <span className="badge bg-light text-secondary" style={{fontSize:'0.7rem'}}>PDF · DOCX · Max 10 MB</span>
            </div>
            <div className="card-body-custom">
              <div
                className={`upload-zone ${isDragging?'dragging':''} ${file?'has-file':''}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => !uploading && !uploadResult && inputRef.current?.click()}
                role="button" tabIndex={0}
                style={{cursor:(uploading||uploadResult)?'default':'pointer'}}
              >
                <input ref={inputRef} type="file" accept=".pdf,.docx" onChange={onInput}
                  style={{display:'none'}} disabled={uploading||!!uploadResult}/>
                {file ? (
                  <div className="d-flex align-items-center gap-3">
                    <span style={{fontSize:'2.5rem'}}>{file.type==='application/pdf'?'📄':'📝'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="fw-semibold text-truncate">{file.name}</div>
                      <div className="text-muted" style={{fontSize:'0.8rem'}}>{fmt(file.size)}</div>
                    </div>
                    {uploadResult && <i className="bi bi-check-circle-fill text-success fs-4"/>}
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div style={{fontSize:'3rem',marginBottom:'0.5rem'}}
                      animate={{scale:isDragging?1.2:1}} transition={{type:'spring',stiffness:300}}>
                      {isDragging?'📂':'☁️'}
                    </motion.div>
                    <p className="fw-semibold mb-1">{isDragging?'Drop your file here':'Drag & drop your resume'}</p>
                    <p className="text-muted" style={{fontSize:'0.8rem'}}>or click to browse</p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1" style={{fontSize:'0.8rem'}}>
                    <span className="text-secondary">Uploading…</span>
                    <span className="fw-semibold">{progress}%</span>
                  </div>
                  <div className="upload-progress"><div className="upload-progress-fill" style={{width:`${progress}%`}}/></div>
                </div>
              )}

              {uploadError && <div className="alert alert-danger mt-3 py-2 small"><i className="bi bi-exclamation-triangle me-2"/>{uploadError}</div>}

              <div className="d-flex gap-2 mt-3">
                {file && !uploading && !uploadResult && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={clear}>
                    <i className="bi bi-x-circle me-1"/>Clear
                  </button>
                )}
                {!uploadResult && (
                  <button className="btn btn-primary ms-auto" onClick={handleUpload} disabled={!file||uploading}>
                    {uploading ? <><span className="spinner-border spinner-border-sm me-2"/>Uploading…</>
                               : <><i className="bi bi-upload me-2"/>Upload Resume</>}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <AnimatePresence>
            {(uploading || uploadResult) && (
              <motion.div className="card-custom mt-3"
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.35}}>
                <div className="card-header-custom">
                  <span className="fw-semibold"><i className="bi bi-diagram-2-fill me-2 text-primary"/>Parsing Timeline</span>
                </div>
                <div className="card-body-custom"><Timeline step={timelineStep}/></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resume Preview */}
          <AnimatePresence>
            {file && (
              <motion.div className="card-custom mt-3"
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.38}}>
                <div className="card-header-custom">
                  <span className="fw-semibold"><i className="bi bi-eye-fill me-2 text-primary"/>Resume Preview</span>
                  <span className="badge bg-light text-secondary" style={{fontSize:'0.7rem'}}>Page 1</span>
                </div>
                <div className="card-body-custom"><ResumePreview file={file}/></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <motion.div className="card-custom mt-3"
            initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.1}}>
            <div className="card-header-custom">
              <span className="fw-semibold"><i className="bi bi-lightbulb-fill me-2 text-warning"/>Tips</span>
            </div>
            <div className="card-body-custom">
              {['Use text-based PDF (not scanned image)','Include clear section headers',
                'Contact info in plain text','DOCX from MS Word works best'].map((t,i) => (
                <div key={i} className="d-flex gap-2 mb-2" style={{fontSize:'0.82rem'}}>
                  <i className="bi bi-check-circle text-success mt-1 flex-shrink-0"/>
                  <span className="text-secondary">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══════════ RIGHT — AI Analysis + Results ═══════════ */}
        <div className="col-lg-7">

          {/* ╔══════════════════════════════════════════╗
              ║   AI ANALYSIS CARD — ALWAYS VISIBLE     ║
              ╚══════════════════════════════════════════╝ */}
          <motion.div className="card-custom mb-3"
            initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.35}}
            style={{border:'2px solid var(--primary)'}}
            whileHover={{boxShadow:'0 8px 24px rgba(79,70,229,0.15)'}}>
            <div className="card-header-custom" style={{background:'var(--primary-light)'}}>
              <span className="fw-bold" style={{color:'var(--primary)',fontSize:'0.95rem'}}>
                <i className="bi bi-cpu-fill me-2"/>AI Analysis
              </span>
              <span className={`badge ${uploadResult ? 'bg-success' : 'bg-secondary'}`} style={{fontSize:'0.7rem'}}>
                {uploadResult ? '✓ Resume Ready' : 'Upload resume first'}
              </span>
            </div>
            <div className="card-body-custom">

              {/* 1. Target Job Role */}
              <div className="mb-3">
                <label className="form-label-custom fw-bold">
                  <i className="bi bi-briefcase-fill me-1 text-primary"/>Target Job Role
                  <span className="text-muted fw-normal ms-1">(optional)</span>
                </label>
                <RoleDropdown value={selectedRole} onChange={setSelectedRole}/>
                {selectedRole && (
                  <div className="mt-2 d-flex align-items-center gap-1"
                    style={{fontSize:'0.75rem',color:'var(--success)',fontWeight:600}}>
                    <i className="bi bi-check-circle-fill"/>Role selected — AI will analyse for this role
                  </div>
                )}
              </div>

              {/* 2. Job Description */}
              <div className="mb-3">
                <label className="form-label-custom fw-bold">
                  <i className="bi bi-file-text me-1 text-primary"/>Job Description
                  <span className="text-muted fw-normal ms-1">(optional)</span>
                </label>
                <select className="form-select" value={selectedJd}
                  onChange={e => setSelectedJd(e.target.value)}
                  style={{borderColor:'#e2e8f0',fontSize:'0.875rem'}}>
                  <option value="">— Analyze without JD (general assessment) —</option>
                  {jds.map(jd => (
                    <option key={jd.id} value={jd.id}>{jd.title}{jd.company ? ` @ ${jd.company}` : ''}</option>
                  ))}
                </select>
              </div>

              <p className="text-muted small mb-3">
                <i className="bi bi-info-circle me-1"/>
                Select a Job Role and/or Job Description for targeted ATS scoring and skill gap analysis.
              </p>

              {/* 3. Buttons */}
              <div className="d-grid gap-2">
                <motion.button
                  className="btn btn-primary btn-lg fw-semibold"
                  onClick={handleAnalyze}
                  disabled={!uploadResult || analyzing}
                  whileHover={uploadResult ? {scale:1.02} : {}}
                  whileTap={uploadResult ? {scale:0.98} : {}}
                  style={{borderRadius:10}}
                >
                  {analyzing
                    ? <><span className="spinner-border spinner-border-sm me-2"/>Analyzing with Gemini AI…</>
                    : <><i className="bi bi-cpu me-2"/>Run AI Analysis</>}
                </motion.button>
                {uploadResult && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={clear}>
                    <i className="bi bi-upload me-1"/>Upload Different Resume
                  </button>
                )}
              </div>

              {!uploadResult && (
                <div className="alert alert-info mt-3 py-2 small mb-0">
                  <i className="bi bi-arrow-left me-1"/>Upload a resume on the left first, then click Run AI Analysis.
                </div>
              )}
            </div>
          </motion.div>

          {/* No resume yet — empty state below the card */}
          {!uploadResult ? (
            <motion.div className="card-custom d-flex align-items-center justify-content-center"
              style={{minHeight:200}} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}}>
              <div className="empty-state" style={{padding:'2rem'}}>
                <motion.div className="empty-state-icon"
                  animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2.5,ease:'easeInOut'}}>
                  🔍
                </motion.div>
                <h3>No resume uploaded yet</h3>
                <p className="text-muted small">Upload a resume on the left to see analysis cards here.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div className="d-flex flex-column gap-3"
              initial="hidden" animate="show"
              variants={{show:{transition:{staggerChildren:0.07}}}}>

              {/* Job Suitability Panel */}
              <AnimatePresence>
                {selectedRole && (
                  <JobSuitability resumeResult={uploadResult} selectedRoleId={selectedRole}/>
                )}
              </AnimatePresence>

              {/* Health + Completeness */}
              <motion.div className="card-custom" variants={card} whileHover={{y:-2,boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}>
                <div className="card-header-custom">
                  <span className="fw-semibold"><i className="bi bi-heart-pulse-fill me-2 text-danger"/>Resume Health &amp; Completeness</span>
                  <span className={`badge ${completeness>=70?'bg-success':completeness>=40?'bg-warning text-dark':'bg-danger'}`}>{completeness}% Complete</span>
                </div>
                <div className="card-body-custom">
                  <div className="d-flex align-items-center gap-4">
                    <HealthCircle score={healthScore}/>
                    <div style={{flex:1}}>
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{fontSize:'0.82rem',fontWeight:600,color:'var(--text-secondary)'}}>Profile Completeness</span>
                        <span style={{fontSize:'0.82rem',fontWeight:700,color:'var(--primary)'}}>{completeness}%</span>
                      </div>
                      <AnimBar pct={completeness}/>
                      <div className="d-flex flex-wrap gap-1 mt-3">
                        {[['Name',uploadResult.parsedName],['Email',uploadResult.parsedEmail],
                          ['Phone',uploadResult.parsedPhone],['Education',uploadResult.parsedEducation],
                          ['Skills',uploadResult.parsedSkills],['Experience',uploadResult.parsedExperience],
                          ['Projects',uploadResult.parsedProjects],['Certifications',uploadResult.parsedCertifications],
                          ['Achievements',uploadResult.parsedAchievements],['Languages',uploadResult.parsedLanguages],
                        ].map(([label,val]) => (
                          <span key={label} className={`badge ${val?'bg-success':'bg-light text-muted'}`} style={{fontSize:'0.7rem'}}>
                            <i className={`bi ${val?'bi-check':'bi-dash'} me-1`}/>{label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div className="card-custom" variants={card} whileHover={{y:-2,boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}>
                <div className="card-header-custom">
                  <span className="fw-semibold"><i className="bi bi-bar-chart-fill me-2 text-primary"/>Resume Statistics</span>
                </div>
                <div className="card-body-custom">
                  <div className="stat-grid">
                    {[{l:'Words',v:wordCount,i:'📝'},{l:'Skills',v:skillCount,i:'⚡'},{l:'Projects',v:projCount,i:'🗂️'},
                      {l:'Experience',v:expCount,i:'💼'},{l:'Certifications',v:certCount,i:'🏆'},{l:'Education',v:eduCount,i:'🎓'},
                      {l:'Languages',v:langCount,i:'🌐'},{l:'File Size',v:fmt(file?.size||0),i:'📦'},
                    ].map(({l,v,i}) => (
                      <motion.div key={l} className="stat-mini" whileHover={{scale:1.04}} transition={{type:'spring',stiffness:300}}>
                        <div style={{fontSize:'1.2rem',marginBottom:'0.25rem'}}>{i}</div>
                        <div className="stat-mini-val">{v}</div>
                        <div className="stat-mini-lbl">{l}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Insights */}
              <motion.div className="card-custom" variants={card} whileHover={{y:-2,boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}>
                <div className="card-header-custom">
                  <span className="fw-semibold"><i className="bi bi-robot me-2 text-info"/>Quick AI Insights</span>
                  <span className="badge bg-info" style={{fontSize:'0.7rem'}}>Instant</span>
                </div>
                <div className="card-body-custom">
                  <div className="d-flex flex-wrap gap-2">
                    {insights.map((ins,i) => (
                      <motion.span key={i} className={`insight-chip insight-${ins.status}`}
                        initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
                        transition={{delay:i*0.06,type:'spring',stiffness:300}}>
                        <i className={`bi ${ins.icon}`}/>{ins.label}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Skills by Category */}
              {Object.keys(skillGroups).length > 0 && (
                <motion.div className="card-custom" variants={card} whileHover={{y:-2,boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}>
                  <div className="card-header-custom">
                    <span className="fw-semibold"><i className="bi bi-lightning-fill me-2 text-warning"/>Skills by Category</span>
                    <span className="badge bg-light text-secondary" style={{fontSize:'0.7rem'}}>{skillCount} skills</span>
                  </div>
                  <div className="card-body-custom">
                    {Object.entries(skillGroups).map(([cat,{color,items}]) => (
                      <div key={cat}>
                        <div className="skill-group-title">{cat}</div>
                        <div className="d-flex flex-wrap gap-1 mb-1">
                          {items.map((s,i) => (
                            <motion.span key={i} className={`skill-chip ${color}`}
                              initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                              {s}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Missing Sections */}
              {missing.length > 0 && (
                <motion.div className="card-custom" variants={card} whileHover={{y:-2,boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}>
                  <div className="card-header-custom">
                    <span className="fw-semibold"><i className="bi bi-exclamation-triangle-fill me-2 text-warning"/>Missing Sections</span>
                    <span className="badge bg-warning text-dark" style={{fontSize:'0.7rem'}}>{missing.length} missing</span>
                  </div>
                  <div className="card-body-custom">
                    <p className="text-muted small mb-2">Add these sections to improve your ATS score:</p>
                    <div className="d-flex flex-wrap gap-2">
                      {missing.map((sec,i) => (
                        <motion.span key={i} className="missing-badge"
                          initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}>
                          <i className="bi bi-plus-circle me-1"/>{sec}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Extracted Info */}
              <motion.div className="card-custom" variants={card} whileHover={{y:-2,boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}>
                <div className="card-header-custom">
                  <span className="fw-semibold"><i className="bi bi-person-vcard me-2 text-success"/>Extracted Information</span>
                  <span className="badge bg-success">Parsed</span>
                </div>
                <div className="card-body-custom">
                  <div className="row g-2">
                    {[
                      {label:'Name',val:uploadResult.parsedName,icon:'bi-person'},
                      {label:'Email',val:uploadResult.parsedEmail,icon:'bi-envelope'},
                      {label:'Phone',val:uploadResult.parsedPhone,icon:'bi-telephone'},
                      {label:'LinkedIn',val:uploadResult.parsedLinkedin,icon:'bi-linkedin'},
                      {label:'GitHub',val:uploadResult.parsedGithub,icon:'bi-github'},
                    ].map(({label,val,icon}) => (
                      <div key={label} className="col-12">
                        <div className="d-flex align-items-start gap-2">
                          <i className={`bi ${icon} text-primary mt-1`} style={{width:16}}/>
                          <div style={{flex:1,minWidth:0}}>
                            <span className="text-muted d-block" style={{fontSize:'0.7rem'}}>{label}</span>
                            <span className="fw-medium d-block text-truncate" style={{fontSize:'0.85rem'}}>
                              {val || <span className="text-muted fst-italic">Not detected</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
