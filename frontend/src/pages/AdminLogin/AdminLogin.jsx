import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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

export default function AdminLogin() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login }           = useAuth()
  const navigate            = useNavigate()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await api.post('/auth/admin-login', form)
      login(r.data.data.token, r.data.data.user)
      navigate('/admin')
    } catch(err) {
      toast.error(err.response?.data?.error || 'Admin login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-left" style={{ background: 'linear-gradient(145deg, #030712 0%, #0F172A 50%, #1E1B4B 100%)' }}>
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-icon" style={{ background: '#EF4444' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="auth-logo-name">NEXUS Admin</div>
          </div>
          <div className="auth-hero-title">
            Administration<br/><span style={{ color: '#F87171' }}>Portal</span>
          </div>
          <p className="auth-hero-sub">
            This area is restricted to authorized administrators only. All activity is logged and monitored.
          </p>
          <div className="auth-features" style={{ marginTop: 40 }}>
            {[
              { icon: '📊', title: 'Full Analytics',     sub: 'Platform-wide stats, trends and insights' },
              { icon: '🔍', title: 'Content Moderation', sub: 'Review flagged posts, videos and reports'  },
              { icon: '👤', title: 'User Management',    sub: 'Manage accounts, ban, and monitor activity' },
              { icon: '🛡️', title: 'Parental Oversight', sub: 'Monitor kids accounts and screen time'    },
            ].map(f => (
              <div className="auth-feature" key={f.title}>
                <div className="auth-feature-icon" style={{ background: 'rgba(239,68,68,.15)' }}>{f.icon}</div>
                <div className="auth-feature-text">
                  <div className="af-title">{f.title}</div>
                  <div className="af-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-box">
          {/* Lock icon */}
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 className="auth-box-title">Admin Sign In</h2>
          <p className="auth-box-sub">Authorized personnel only. Unauthorized access is prohibited.</p>

          <div className="alert alert-warning" style={{ marginBottom: 24 }}>
            <span>⚠️</span>
            <div>
              <strong>Restricted area.</strong> All login attempts are recorded. 
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email <span className="req">*</span></label>
              <input className="form-control" type="email" placeholder="admin@nexus.com"
                value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password <span className="req">*</span></label>
              <div className="pw-wrap">
                <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Enter admin password"
                  value={form.password} onChange={set('password')} required autoComplete="current-password" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button className="btn btn-danger" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', fontSize: 14 }}>
              {loading
                ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff', width: 16, height: 16 }} /> Authenticating…</>
                : <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Sign In as Admin
                  </>
              }
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: 24 }}>
            <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              ← Back to user login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
