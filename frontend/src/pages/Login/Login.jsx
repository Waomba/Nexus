import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

const FEATURES = [
  { icon: '🌍', title: 'Connect Globally',   sub: 'Follow people, share ideas, build community' },
  { icon: '🛡️', title: 'Safe for Everyone',  sub: 'Kids mode, parental controls & AI moderation' },
  { icon: '💼', title: 'Work & Collaborate', sub: 'Post tasks, find talent, get things done' },
  { icon: '🎬', title: 'Create & Share',     sub: 'Videos, polls, stories and real-time chat' },
]

const INTERESTS = [
  '🎨 Art & Design','💻 Technology','🎵 Music','📸 Photography',
  '🌱 Environment','✈️ Travel','🍕 Food & Cooking','📚 Books & Literature',
  '💪 Fitness & Health','🎮 Gaming','🏀 Sports','🎬 Film & TV',
  '💼 Business','🔬 Science','🌐 Politics','💡 Startups',
  '🧘 Wellness','🎭 Arts & Culture','🤝 Community','🚀 Space',
]

const STEP_LABELS = ['Your account', 'Your profile', 'Your interests']

function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < total - 1 ? 1 : 'none' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, flexShrink: 0,
            background: i < step ? 'var(--primary)' : i === step ? 'var(--primary)' : 'var(--bg)',
            color: i <= step ? '#fff' : 'var(--text-muted)',
            border: i > step ? '1.5px solid var(--border)' : 'none',
          }}>
            {i < step ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--border)', borderRadius: 1, transition: 'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Login() {
  const [mode, setMode]         = useState('login') // 'login' | 'register'
  const [regStep, setRegStep]   = useState(0)
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const [twoFA, setTwoFA]       = useState(null)
  const [code, setCode]         = useState('')
  const [selectedInterests, setSelectedInterests] = useState([])
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [reg, setReg] = useState({
    name: '', username: '', email: '', password: '',
    phone: '', date_of_birth: '', gender: '',
    bio: '', location: '', website: '',
    avatar: '',
  })
  const setL = k => e => setLoginForm(f => ({ ...f, [k]: e.target.value }))
  const setR = k => e => setReg(f => ({ ...f, [k]: e.target.value }))

  const toggleInterest = tag => {
    setSelectedInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 10 ? [...prev, tag] : prev
    )
  }

  const nextStep = e => {
    e.preventDefault()
    if (regStep === 0) {
      if (!reg.name || !reg.username || !reg.email || !reg.password) return toast.error('Please fill all required fields')
      if (reg.password.length < 6) return toast.error('Password must be at least 6 characters')
    }
    setRegStep(s => s + 1)
  }

  const handleLogin = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await api.post('/auth/login', loginForm)
      if (r.data.two_fa_required) {
        setTwoFA({ user_id: r.data.user_id, dev_code: r.data.dev_code })
        toast.success(`2FA code: ${r.data.dev_code}`)
      } else {
        login(r.data.data.token, r.data.data.user)
        navigate('/')
      }
    } catch(err) { toast.error(err.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }

  const handleVerify = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await api.post('/auth/verify-2fa', { user_id: twoFA.user_id, code })
      login(r.data.data.token, r.data.data.user)
      navigate('/')
    } catch(err) { toast.error(err.response?.data?.error || 'Invalid code') }
    finally { setLoading(false) }
  }

  const handleRegister = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...reg, interests: selectedInterests }
      const r = await api.post('/auth/register', payload)
      login(r.data.data.token, r.data.data.user)
      toast.success('Welcome to NEXUS! 🎉')
      navigate('/')
    } catch(err) { toast.error(err.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  // ── 2FA screen ─────────────────────────────────────────────────
  if (twoFA) return (
    <div className="auth-root">
      <LeftPanel />
      <div className="auth-right">
        <div className="auth-box">
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="auth-box-title">Two-step verification</h2>
          <p className="auth-box-sub">Enter the 6-digit code to confirm it's really you.</p>
          {twoFA.dev_code && (
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              🔑 <strong>Dev code:</strong> <code style={{ letterSpacing: 3, fontWeight: 600 }}>{twoFA.dev_code}</code>
            </div>
          )}
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <input className="form-control" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} maxLength={6}
                style={{ textAlign: 'center', fontSize: 26, letterSpacing: 10, fontWeight: 600 }} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }} /> Verifying…</> : 'Verify & Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
            <button onClick={() => setTwoFA(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>← Back to login</button>
          </p>
        </div>
      </div>
    </div>
  )

  // ── Main screen ────────────────────────────────────────────────
  return (
    <div className="auth-root">
      <LeftPanel />
      <div className="auth-right">
        <div className="auth-box">

          {/* Tab switcher */}
          {mode === 'login' && (
            <>
              <h2 className="auth-box-title">Welcome back</h2>
              <p className="auth-box-sub">Sign in to your NEXUS account</p>
              <div className="auth-tabs" style={{ marginBottom: 24 }}>
                <button className="auth-tab active">Sign In</button>
                <button className="auth-tab" onClick={() => { setMode('register'); setRegStep(0) }}>Create Account</button>
              </div>
              <SocialButtons />
              <AuthDivider />
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input className="form-control" type="email" placeholder="you@example.com" value={loginForm.email} onChange={setL('email')} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Password <span className="req">*</span></label>
                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => toast('Password reset coming soon', { icon: '📧' })}>Forgot?</button>
                  </div>
                  <div className="pw-wrap">
                    <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password} onChange={setL('password')} required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}><EyeIcon open={showPw} /></button>
                  </div>
                </div>
                <SubmitBtn loading={loading} label="Sign In" />
              </form>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                Don't have an account? <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                  onClick={() => { setMode('register'); setRegStep(0) }}>Create one</button>
              </p>
            </>
          )}

          {/* ── REGISTER FLOW ──────────────────────────────── */}
          {mode === 'register' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h2 className="auth-box-title" style={{ marginBottom: 0 }}>
                  {regStep === 0 ? 'Create your account' : regStep === 1 ? 'Complete your profile' : 'What interests you?'}
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Step {regStep + 1} of 3</span>
              </div>
              <p className="auth-box-sub" style={{ marginBottom: 20 }}>
                {regStep === 0 ? 'Your login credentials — keep your password safe' :
                 regStep === 1 ? 'Help others know who you are' :
                 'Pick up to 10 topics to personalise your feed'}
              </p>
              <StepIndicator step={regStep} total={3} />

              {/* STEP 1 — Account credentials */}
              {regStep === 0 && (
                <form onSubmit={nextStep}>
                  <div className="auth-tabs" style={{ marginBottom: 24 }}>
                    <button type="button" className="auth-tab" onClick={() => setMode('login')}>Sign In</button>
                    <button type="button" className="auth-tab active">Create Account</button>
                  </div>
                  <SocialButtons />
                  <AuthDivider />
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" placeholder="Jane Doe" value={reg.name} onChange={setR('name')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Username <span className="req">*</span></label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>@</span>
                        <input className="form-control" placeholder="janedoe" value={reg.username} onChange={setR('username')} style={{ paddingLeft: 26 }} required />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email address <span className="req">*</span></label>
                    <input className="form-control" type="email" placeholder="you@example.com" value={reg.email} onChange={setR('email')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password <span className="req">*</span></label>
                    <div className="pw-wrap">
                      <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Minimum 6 characters" value={reg.password} onChange={setR('password')} required />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}><EyeIcon open={showPw} /></button>
                    </div>
                    <p className="form-hint">Use at least 6 characters with a mix of letters and numbers.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input className="form-control" placeholder="+1 234 567 8900" value={reg.phone} onChange={setR('phone')} />
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '12px 18px' }}>
                    Continue →
                  </button>
                  <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                    By signing up you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a>
                  </p>
                </form>
              )}

              {/* STEP 2 — Profile details */}
              {regStep === 1 && (
                <form onSubmit={nextStep}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date of birth</label>
                      <input className="form-control" type="date" value={reg.date_of_birth} onChange={setR('date_of_birth')} max={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-control" value={reg.gender} onChange={setR('gender')}>
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" placeholder="Tell people a little about yourself…" value={reg.bio} onChange={setR('bio')} rows={3} maxLength={200} style={{ resize: 'none' }} />
                    <p className="form-hint">{reg.bio.length}/200 characters</p>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-control" placeholder="City, Country" value={reg.location} onChange={setR('location')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Website</label>
                      <input className="form-control" placeholder="https://yoursite.com" value={reg.website} onChange={setR('website')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Profile picture URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input className="form-control" placeholder="https://example.com/photo.jpg" value={reg.avatar} onChange={setR('avatar')} />
                    <p className="form-hint">Paste a direct image link, or skip and add one later in settings.</p>
                  </div>
                  {reg.avatar && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--success-light)', borderRadius: 8, marginBottom: 16 }}>
                      <img src={reg.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      <span style={{ fontSize: 13, color: '#065F46' }}>Looking good! That's your profile picture.</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setRegStep(0)} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>Continue →</button>
                  </div>
                </form>
              )}

              {/* STEP 3 — Interests */}
              {regStep === 2 && (
                <form onSubmit={handleRegister}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {INTERESTS.map(tag => {
                      const active = selectedInterests.includes(tag)
                      return (
                        <button key={tag} type="button" onClick={() => toggleInterest(tag)}
                          style={{
                            padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                            background: active ? 'var(--primary)' : 'var(--bg)',
                            color: active ? '#fff' : 'var(--text-secondary)',
                            borderColor: active ? 'var(--primary)' : 'var(--border)',
                          }}>
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>{selectedInterests.length} / 10 selected</span>
                    {selectedInterests.length === 0 && <span>Select at least 1 to continue</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setRegStep(1)} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                    <button type="submit" className="btn btn-primary" disabled={loading || selectedInterests.length === 0} style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
                      {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }} /> Creating account…</> : '🚀 Join NEXUS'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LeftPanel() {
  return (
    <div className="auth-left">
      <div className="auth-left-content">
        <div className="auth-logo">
          <div className="auth-logo-icon">N</div>
          <div className="auth-logo-name">NEXUS</div>
        </div>
        <div className="auth-hero-title">Your world,<br/><span>connected.</span></div>
        <p className="auth-hero-sub">NEXUS brings people together through posts, videos, conversations, and collaboration — safely and openly.</p>
        <div className="auth-features">
          {[
            { icon: '🌍', title: 'Connect Globally',   sub: 'Follow people, share ideas, build community' },
            { icon: '🛡️', title: 'Safe for Everyone',  sub: 'Kids mode, parental controls & AI moderation' },
            { icon: '💼', title: 'Work & Collaborate', sub: 'Post tasks, find talent, get things done' },
            { icon: '🎬', title: 'Create & Share',     sub: 'Videos, polls, stories and real-time chat' },
          ].map(f => (
            <div className="auth-feature" key={f.title}>
              <div className="auth-feature-icon">{f.icon}</div>
              <div className="auth-feature-text">
                <div className="af-title">{f.title}</div>
                <div className="af-sub">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SocialButtons() {
  return (
    <div className="social-btns">
      <button className="social-btn" type="button" onClick={() => toast('Social login coming soon!', { icon: '🔗' })}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>
    </div>
  )
}

function AuthDivider() {
  return <div className="auth-divider"><span>or continue with email</span></div>
}

function SubmitBtn({ loading, label }) {
  return (
    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: 14, marginTop: 4 }}>
      {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }} /> Signing in…</> : label}
    </button>
  )
}
