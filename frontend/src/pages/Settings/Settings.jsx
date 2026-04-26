import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  User, Lock, Shield, Bell, Palette, HardDrive, Settings as SettingsIcon,
  LogOut, ChevronRight, Moon, Sun, Key, Smartphone, Globe, Zap, Camera,
  Wifi, SlidersHorizontal, Eye, Phone, Users, Ban, Trash2, Download,
  Volume2,  MessageCircle, Heart, UserPlus, Check, Signal
} from 'lucide-react'

// ── Reusable toggle switch ────────────────────────────────────
function Toggle({ value, onChange, size = 'md' }) {
  const w = size === 'sm' ? 38 : 46
  const h = size === 'sm' ? 22 : 26
  const d = size === 'sm' ? 16 : 20
  const t = size === 'sm' ? 3 : 3
  return (
    <button onClick={() => onChange(!value)} type="button"
      style={{ width: w, height: h, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, position: 'relative', transition: 'background .25s', background: value ? 'linear-gradient(90deg,var(--nx-violet),var(--nx-cyan))' : 'var(--border-strong)' }}>
      <div style={{ width: d, height: d, borderRadius: '50%', background: '#fff', position: 'absolute', top: t, left: value ? w - d - t : t, transition: 'left .22s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
    </button>
  )
}

// ── Settings row ──────────────────────────────────────────────
function Row({ label, sub, right, onClick, border = true }) {
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: border ? '1px solid var(--nx-surface)' : 'none', cursor: onClick ? 'pointer' : 'default', gap: 10, transition: 'opacity .15s' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '.8' }}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--nx-text)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--nx-text3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right || (onClick && <ChevronRight size={15} color="var(--nx-text3)" style={{ flexShrink: 0 }} />)}
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────
function Section({ title, children, accent }) {
  return (
    <div style={{ background: accent ? `linear-gradient(135deg, rgba(124,77,255,.08), rgba(0,229,255,.05))` : 'var(--nx-surface)', border: `1px solid ${accent ? 'rgba(0,229,255,.15)' : 'var(--bg-input)'}`, borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: 12 }}>
      {title && <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--nx-text)', marginBottom: 12 }}>{title}</h3>}
      {children}
    </div>
  )
}

// ── Select row ────────────────────────────────────────────────
function SelectRow({ label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--nx-surface)', gap: 10 }}>
      <span style={{ fontSize: 14, color: 'var(--nx-text)', flex: 1 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--nx-text2)', fontSize: 13, padding: '5px 10px', cursor: 'pointer', outline: 'none', fontFamily: 'var(--font)' }}>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  )
}

const SIDEBAR = [
  { id: 'general',     icon: User,           label: 'General'         },
  { id: 'account',     icon: SettingsIcon,   label: 'Account'         },
  { id: 'privacy',     icon: Shield,         label: 'Privacy & Security'},
  { id: 'notifications',icon: Bell,          label: 'Notifications'   },
  { id: 'appearance',  icon: Palette,        label: 'Appearance'      },
  { id: 'data',        icon: HardDrive,      label: 'Data & Storage'  },
  { id: 'advanced',    icon: SlidersHorizontal, label: 'Advanced'     },
  { id: 'esim',        icon: Signal,         label: 'eSIM'            },
]

export default function Settings() {
  const { user }           = useAuth()
  const { theme, setTheme, isDark, isAdaptive } = useTheme()
  const navigate           = useNavigate()
  const [tab, setTab]      = useState('general')

  // Profile form
  const [profile,  setProfile]  = useState({ name: user?.name || '', bio: user?.bio || '', location: user?.location || '' })
  const [savingP,  setSavingP]  = useState(false)

  // Password
  const [pw,     setPw]     = useState({ current: '', new_password: '', confirm: '' })
  const [savingPw,setSavingPw] = useState(false)

  // Privacy
  const [privacy, setPrivacy] = useState({ last_seen: 'everyone', profile_photo: 'everyone', phone_number: 'nobody', who_can_call: 'everyone', who_can_add_groups: 'everyone' })
  const [blocked, setBlocked] = useState([])

  // Sessions
  const [sessions, setSessions] = useState([])

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({ messages: true, posts: true, follows: true, sounds: true, vibration: true, show_previews: true })

  // Appearance
  const [appearance, setAppearance] = useState({ font_size: 'medium', accent_color: 'cyan', bubble_style: 'rounded' })

  // 2FA
  const [twoFAOn, setTwoFAOn] = useState(!!user?.two_fa_enabled)

  useEffect(() => {
    if (tab === 'privacy')  { api.get('/privacy').then(r => setPrivacy(r.data.data || privacy)).catch(()=>{}); api.get('/blocked').then(r => setBlocked(r.data.data || [])).catch(()=>{}) }
    if (tab === 'privacy')  api.get('/sessions').then(r => setSessions(r.data.data || [])).catch(()=>{})
    if (tab === 'notifications') api.get('/notification-prefs').then(r => { const d=r.data.data; if(d) setNotifPrefs({messages:!!d.messages,posts:!!d.posts,follows:!!d.follows,sounds:!!d.sounds,vibration:!!d.vibration,show_previews:!!d.show_previews}) }).catch(()=>{})
    if (tab === 'appearance') api.get('/appearance').then(r => { const d=r.data.data; if(d) setAppearance(prev=>({...prev,...d})) }).catch(()=>{})
  }, [tab])

  const saveProfile = async () => {
    setSavingP(true)
    try { await api.put('/users/me', profile); toast.success('Profile updated!') }
    catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSavingP(false) }
  }

  const savePassword = async () => {
    if (!pw.current || !pw.new_password) return toast.error('Fill all fields')
    if (pw.new_password !== pw.confirm) return toast.error('Passwords do not match')
    if (pw.new_password.length < 6) return toast.error('Minimum 6 characters')
    setSavingPw(true)
    try { await api.post('/auth/change-password', { current_password: pw.current, new_password: pw.new_password }); toast.success('Password changed!'); setPw({ current:'',new_password:'',confirm:'' }) }
    catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSavingPw(false) }
  }

  const savePrivacy = async updates => {
    const newP = { ...privacy, ...updates }
    setPrivacy(newP)
    await api.put('/privacy', updates).catch(()=>{})
  }

  const saveNotifPref = async updates => {
    const newP = { ...notifPrefs, ...updates }
    setNotifPrefs(newP)
    await api.put('/notification-prefs', updates).catch(()=>{})
  }

  const saveAppearance = async updates => {
    const newA = { ...appearance, ...updates }
    setAppearance(newA)
    await api.put('/appearance', updates).catch(()=>{})
  }

  const unblock = async id => {
    await api.delete(`/block/${id}`).catch(()=>{})
    setBlocked(b => b.filter(x => x.id !== id))
    toast.success('Unblocked')
  }

  const revokeSession = async id => {
    await api.delete(`/sessions/${id}`).catch(()=>{})
    setSessions(s => s.filter(x => x.id !== id))
    toast.success('Session revoked')
  }

  const toggle2FA = async () => {
    try { const r = await api.post('/auth/toggle-2fa'); setTwoFAOn(r.data.data.two_fa_enabled); toast.success(r.data.message) }
    catch(err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const ACCENT_COLORS = [
    { id: 'cyan',   color: 'var(--primary)' },
    { id: 'violet', color: 'var(--nx-violet)' },
    { id: 'green',  color: 'var(--success)' },
    { id: 'orange', color: '#FF8A00' },
    { id: 'pink',   color: '#FF4FC8' },
    { id: 'red',    color: '#FF3B5C' },
  ]

  const VISIBILITY_OPTIONS = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'Contacts' },
    { value: 'nobody',   label: 'Nobody'   },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 0, minHeight: 'calc(100vh - 128px)' }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
        <div style={{ borderRight: '1px solid var(--bg-hover)', padding: '20px 0', background: 'rgba(255,255,255,.01)' }}>
          <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--bg-hover)', marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--nx-text)' }}>Settings</h2>
            <p style={{ fontSize: 12, color: 'var(--nx-text3)', marginTop: 2 }}>Manage your account</p>
          </div>
          {SIDEBAR.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%', border: 'none', background: tab === id ? 'rgba(0,229,255,.08)' : 'none', color: tab === id ? 'var(--nx-cyan)' : 'var(--nx-text2)', fontWeight: tab === id ? 600 : 400, fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s', textAlign: 'left', borderLeft: `3px solid ${tab === id ? 'var(--nx-cyan)' : 'transparent'}` }}
              onMouseEnter={e => { if (tab !== id) { e.currentTarget.style.background = 'var(--nx-surface)'; e.currentTarget.style.color = 'var(--nx-text)' }}}
              onMouseLeave={e => { if (tab !== id) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--nx-text2)' }}}>
              <Icon size={16} /> {label}
              {id === 'esim' && <span className="badge badge-warning" style={{ marginLeft: 'auto', fontSize: 9 }}>Soon</span>}
            </button>
          ))}
          <div style={{ margin: '16px 16px 0', borderTop: '1px solid var(--bg-hover)', paddingTop: 12 }}>
            <button onClick={() => { if (confirm('Log out?')) { localStorage.clear(); navigate('/login') } }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', width: '100%', border: 'none', background: 'none', color: 'var(--nx-red)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────── */}
        <div style={{ padding: '24px 24px', overflowY: 'auto' }}>

          {/* GENERAL */}
          {tab === 'general' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--nx-text)' }}>General Settings</h2>
              <p style={{ color: 'var(--nx-text3)', fontSize: 13.5, marginBottom: 20 }}>Manage your profile and account details.</p>

              {/* Profile card */}
              <Section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--bg-hover)' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent-teal))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, overflow: 'hidden', border: '2px solid rgba(0,229,255,.2)' }}>
                      {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.name?.[0]}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--nx-text)' }}>{user?.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--nx-text3)' }}>@{user?.username} <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--nx-green)', boxShadow: '0 0 6px var(--nx-green)', marginLeft: 4 }} /></div>
                  </div>
                  <Link to={`/profile/${user?.id}`} className="btn btn-secondary btn-sm">View Profile</Link>
                </div>
                <Row label="Email" sub={user?.email} right={<ChevronRight size={15} color="var(--nx-text3)" />} />
                <Row label="Password" sub="Reset your password" onClick={() => setTab('account')} border={false} />
              </Section>

              {/* Notifications quick */}
              <Section title="Notifications">
                <Row label="Message Notifications" right={<Toggle value={notifPrefs.messages} onChange={v => saveNotifPref({ messages: v })} />} />
                <Row label="Post Notifications" right={<Toggle value={notifPrefs.posts} onChange={v => saveNotifPref({ posts: v })} />} />
                <Row label="Notification Sounds" right={<Toggle value={notifPrefs.sounds} onChange={v => saveNotifPref({ sounds: v })} />} border={false} />
              </Section>

              {/* Camera/Media */}
              <Section title="📷 Camera & Media">
                <Row label="Auto-download media on Wi-Fi" right={<Toggle value size="sm" onChange={() => toast('Setting saved')} />} />
                <Row label="Save media to device" right={<Toggle value={false} size="sm" onChange={() => toast('Setting saved')} />} border={false} />
              </Section>
            </div>
          )}

          {/* ACCOUNT */}
          {tab === 'account' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--nx-text)' }}>Account</h2>
              <p style={{ color: 'var(--nx-text3)', fontSize: 13.5, marginBottom: 20 }}>Edit your profile information and credentials.</p>

              <Section title="Profile Information">
                {[['name','Full Name','Your display name'],['bio','Bio','About you'],['location','Location','City, Country']].map(([k,l,ph])=>(
                  <div className="form-group" key={k}>
                    <label className="form-label">{l}</label>
                    {k==='bio'
                      ?<textarea className="form-control" rows={2} style={{resize:'none',minHeight:68}} placeholder={ph} value={profile[k]} onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))}/>
                      :<input className="form-control" placeholder={ph} value={profile[k]} onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))}/>
                    }
                  </div>
                ))}
                <button className="btn btn-primary" onClick={saveProfile} disabled={savingP}>
                  {savingP ? <span className="spinner" style={{width:14,height:14,borderTopColor:'#fff'}}/> : 'Save Changes'}
                </button>
              </Section>

              <Section title="Change Password">
                {[['current','Current Password'],['new_password','New Password'],['confirm','Confirm New Password']].map(([k,l])=>(
                  <div className="form-group" key={k}>
                    <label className="form-label">{l}</label>
                    <input className="form-control" type="password" placeholder="••••••••" value={pw[k]} onChange={e=>setPw(p=>({...p,[k]:e.target.value}))}/>
                  </div>
                ))}
                <button className="btn btn-primary" onClick={savePassword} disabled={savingPw}>
                  {savingPw ? <span className="spinner" style={{width:14,height:14,borderTopColor:'#fff'}}/> : <><Key size={14}/> Update Password</>}
                </button>
              </Section>

              <Section title="Two-Step Verification">
                <Row label="Two-Step Verification" sub={twoFAOn ? 'An extra code is required at login' : 'Add an extra layer of security'} right={<Toggle value={twoFAOn} onChange={toggle2FA} />} border={false} />
              </Section>
            </div>
          )}

          {/* PRIVACY & SECURITY */}
          {tab === 'privacy' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--nx-text)' }}>Privacy & Security</h2>
              <p style={{ color: 'var(--nx-text3)', fontSize: 13.5, marginBottom: 20 }}>Control who can see your information and contact you.</p>

              <Section title="Who can see…">
                <SelectRow label="Last Seen" value={privacy.last_seen} options={VISIBILITY_OPTIONS} onChange={v => savePrivacy({ last_seen: v })} />
                <SelectRow label="Profile Photo" value={privacy.profile_photo} options={VISIBILITY_OPTIONS} onChange={v => savePrivacy({ profile_photo: v })} />
                <SelectRow label="Phone Number" value={privacy.phone_number} options={VISIBILITY_OPTIONS} onChange={v => savePrivacy({ phone_number: v })} />
              </Section>

              <Section title="Who can…">
                <SelectRow label="Call You" value={privacy.who_can_call} options={VISIBILITY_OPTIONS} onChange={v => savePrivacy({ who_can_call: v })} />
                <SelectRow label="Add You to Groups" value={privacy.who_can_add_groups} options={VISIBILITY_OPTIONS} onChange={v => savePrivacy({ who_can_add_groups: v })} />
              </Section>

              <Section title={`Blocked Users (${blocked.length})`}>
                {blocked.length === 0 ? (
                  <p style={{ fontSize: 13.5, color: 'var(--nx-text3)', padding: '4px 0' }}>No blocked users</p>
                ) : (
                  blocked.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--nx-surface)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--border)', color: 'var(--nx-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                        {b.name?.[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--nx-text)' }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--nx-text3)' }}>@{b.username}</div>
                      </div>
                      <button className="btn btn-sm btn-secondary" onClick={() => unblock(b.id)} style={{ fontSize: 12 }}>Unblock</button>
                    </div>
                  ))
                )}
              </Section>

              <Section title="Active Sessions">
                <p style={{ fontSize: 13, color: 'var(--nx-text3)', marginBottom: 12 }}>Devices currently logged into your account.</p>
                {sessions.length === 0 && <p style={{ fontSize: 13.5, color: 'var(--nx-text3)' }}>No sessions found</p>}
                {sessions.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--nx-surface)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.is_current ? 'var(--primary-dim)' : 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Smartphone size={16} color={s.is_current ? 'var(--nx-cyan)' : 'var(--nx-text2)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--nx-text)' }}>
                        {s.device_name} {s.is_current && <span className="badge badge-success" style={{ fontSize: 9, marginLeft: 4 }}>Current</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--nx-text3)' }}>{s.ip_address || 'Unknown IP'} · {s.device_type}</div>
                    </div>
                    {!s.is_current && (
                      <button className="btn btn-sm btn-danger" onClick={() => revokeSession(s.id)} style={{ fontSize: 11 }}>Revoke</button>
                    )}
                  </div>
                ))}
                {sessions.length > 1 && (
                  <button className="btn btn-danger btn-sm" style={{ marginTop: 12 }} onClick={async () => {
                    await api.delete('/sessions').catch(()=>{})
                    setSessions(s => s.filter(x => x.is_current))
                    toast.success('All other sessions revoked')
                  }}>
                    Revoke All Other Sessions
                  </button>
                )}
              </Section>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--nx-text)' }}>Notifications</h2>
              <p style={{ color: 'var(--nx-text3)', fontSize: 13.5, marginBottom: 20 }}>Choose what you get notified about.</p>

              <Section title="Alert Types">
                {[
                  { key: 'messages', label: 'Messages',         sub: 'New direct messages' },
                  { key: 'posts',    label: 'Post Activity',    sub: 'Likes, comments, reposts' },
                  { key: 'follows',  label: 'New Followers',    sub: 'When someone follows you' },
                ].map(({ key, label, sub }, i, arr) => (
                  <Row key={key} label={label} sub={sub} border={i < arr.length - 1} right={<Toggle value={notifPrefs[key]} onChange={v => saveNotifPref({ [key]: v })} />} />
                ))}
              </Section>

              <Section title="Sound & Vibration">
                <Row label="Notification Sounds" sub="Play a sound for new alerts" right={<Toggle value={notifPrefs.sounds} onChange={v => saveNotifPref({ sounds: v })} />} />
                <Row label="Vibration" sub="Vibrate on mobile devices" right={<Toggle value={notifPrefs.vibration} onChange={v => saveNotifPref({ vibration: v })} />} />
                <Row label="Message Preview" sub="Show content in notifications" border={false} right={<Toggle value={notifPrefs.show_previews} onChange={v => saveNotifPref({ show_previews: v })} />} />
              </Section>
            </div>
          )}

          {/* APPEARANCE */}
          {tab === 'appearance' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--nx-text)' }}>Appearance</h2>
              <p style={{ color: 'var(--nx-text3)', fontSize: 13.5, marginBottom: 20 }}>Make NEXUS look exactly how you want.</p>

              <Section title="Theme">
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>Choose how NEXUS looks. Adaptive automatically follows your device setting.</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {[
                    { id:'dark',     label:'Dark',     icon:'🌙', sub:'Deep Charcoal' },
                    { id:'light',    label:'Light',    icon:'☀️', sub:'Pure White'    },
                    { id:'adaptive', label:'Adaptive', icon:'⚙️', sub:'Follows device' },
                  ].map(({ id, label, icon, sub }) => (
                    <button key={id} onClick={() => setTheme(id)}
                      style={{ padding:'14px 10px', borderRadius:'var(--radius-lg)', border:`2px solid ${theme===id?'var(--primary)':'var(--border)'}`, background: theme===id?'var(--primary-dim)':'var(--bg-input)', cursor:'pointer', fontFamily:'var(--font)', transition:'all .2s', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color: theme===id?'var(--primary)':'var(--text-primary)', marginBottom:2 }}>{label}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{sub}</div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:10 }}>
                  Currently: <strong style={{ color:'var(--text-secondary)' }}>{theme === 'adaptive' ? 'Adaptive (follows system)' : theme === 'dark' ? 'Dark mode' : 'Light mode'}</strong>
                </p>
              </Section>

              <Section title="Accent Color">
                <p style={{ fontSize: 13, color: 'var(--nx-text3)', marginBottom: 12 }}>Choose your highlight colour</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {ACCENT_COLORS.map(({ id, color }) => (
                    <button key={id} onClick={() => saveAppearance({ accent_color: id })}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: color, border: `2.5px solid ${appearance.accent_color === id ? '#fff' : 'transparent'}`, cursor: 'pointer', transition: 'transform .15s, border-color .15s', transform: appearance.accent_color === id ? 'scale(1.15)' : 'scale(1)', flexShrink: 0 }}
                      title={id}>
                      {appearance.accent_color === id && <Check size={14} color="#fff" style={{ display: 'block', margin: '5px auto 0' }} />}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Font Size">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['small','medium','large'].map(s => (
                    <button key={s} onClick={() => saveAppearance({ font_size: s })}
                      className={`btn btn-sm ${appearance.font_size === s ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontSize: s === 'small' ? 11 : s === 'medium' ? 13 : 15 }}>
                      Aa
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--nx-text3)', marginTop: 8 }}>Small · Medium · Large</p>
              </Section>

              <Section title="Message Bubble Style">
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'rounded', label: 'Rounded', radius: 18 },
                    { id: 'sharp',   label: 'Sharp',   radius: 4  },
                    { id: 'minimal', label: 'Minimal', radius: 8  },
                  ].map(({ id, label, radius }) => (
                    <button key={id} onClick={() => saveAppearance({ bubble_style: id })}
                      style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${appearance.bubble_style === id ? 'var(--nx-cyan)' : 'var(--bg-hover)'}`, background: appearance.bubble_style === id ? 'var(--primary-dim)' : 'var(--nx-surface)', cursor: 'pointer', color: appearance.bubble_style === id ? 'var(--nx-cyan)' : 'var(--nx-text2)', fontFamily: 'var(--font)', transition: 'all .15s' }}>
                      <div style={{ background: appearance.bubble_style === id ? 'var(--nx-cyan)' : 'var(--border-strong)', borderRadius: radius, height: 20, marginBottom: 6 }} />
                      <div style={{ fontSize: 11.5, fontWeight: appearance.bubble_style === id ? 700 : 400 }}>{label}</div>
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* DATA & STORAGE */}
          {tab === 'data' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--nx-text)' }}>Data & Storage</h2>
              <p style={{ color: 'var(--nx-text3)', fontSize: 13.5, marginBottom: 20 }}>Manage your storage and downloaded data.</p>

              <Section title="Storage Usage">
                {[
                  { label: 'Photos & Videos', size: '124 MB', pct: 62, color: 'var(--nx-cyan)' },
                  { label: 'Messages',         size: '38 MB',  pct: 19, color: 'var(--nx-violet)' },
                  { label: 'Documents',        size: '12 MB',  pct: 6,  color: 'var(--nx-green)' },
                  { label: 'Other',            size: '26 MB',  pct: 13, color: 'var(--nx-orange)' },
                ].map(({ label, size, pct, color }) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5 }}>
                      <span style={{ color: 'var(--nx-text)' }}>{label}</span>
                      <span style={{ color: 'var(--nx-text3)' }}>{size}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--bg-hover)', display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--nx-text)' }}>Total used</span>
                  <span style={{ color: 'var(--nx-cyan)', fontWeight: 700 }}>200 MB</span>
                </div>
              </Section>

              <Section title="Auto-Delete">
                <SelectRow label="Auto-delete messages after" value="never"
                  options={[{ value:'never',label:'Never'},{value:'1w',label:'1 Week'},{value:'1m',label:'1 Month'},{value:'3m',label:'3 Months'}]}
                  onChange={v => toast(`Auto-delete set to ${v}`)} />
                <SelectRow label="Auto-delete media after" value="never"
                  options={[{ value:'never',label:'Never'},{value:'1w',label:'1 Week'},{value:'1m',label:'1 Month'}]}
                  onChange={v => toast(`Media auto-delete set to ${v}`)} />
              </Section>

              <Section>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => toast('Clearing cache…', { icon: '🗑️' })}>
                    <Trash2 size={15} /> Clear Cache
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => toast('Preparing your data export…', { icon: '📦' })}>
                    <Download size={15} /> Download My Data
                  </button>
                </div>
              </Section>
            </div>
          )}

          {/* ADVANCED */}
          {tab === 'advanced' && (
            <div className="fade-in">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--nx-text)' }}>Advanced Settings</h2>
              <p style={{ color: 'var(--nx-text3)', fontSize: 13.5, marginBottom: 20 }}>Power-user controls and experimental features.</p>

              <Section title="Experimental Features">
                {[
                  { label: 'AI-Powered Feed Ranking', sub: 'Use AI to personalise your Nexus stream' },
                  { label: 'Animated Stickers',       sub: 'Show animated stickers in messages' },
                  { label: 'Voice Messages',           sub: 'Enable voice message recording (beta)' },
                ].map(({ label, sub }, i, arr) => (
                  <Row key={label} label={label} sub={sub} border={i < arr.length - 1}
                    right={<Toggle value={false} size="sm" onChange={() => toast(`${label} toggled`)} />} />
                ))}
              </Section>

              <Section title="Network & Proxy">
                <Row label="Use Proxy" sub="Connect through a custom proxy server" onClick={() => toast('Proxy settings coming soon', { icon: '🌐' })} />
                <Row label="Low Data Mode" sub="Reduce data usage on mobile" border={false} right={<Toggle value={false} size="sm" onChange={() => toast('Low data mode toggled')} />} />
              </Section>

              <Section title="Developer">
                <Row label="Debug Mode" sub="Show technical information in the app" right={<Toggle value={false} size="sm" onChange={() => toast('Debug mode toggled')} />} />
                <Row label="API Version" sub="NEXUS Platform API v2.0" border={false} />
              </Section>
            </div>
          )}

          {/* eSIM */}
          {tab === 'esim' && (
            <div className="fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, background: 'linear-gradient(135deg, var(--primary-dim), var(--primary-dim))', border: '1px solid rgba(0,229,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Signal size={36} color="var(--nx-cyan)" />
              </div>
              <div className="badge badge-warning" style={{ margin: '0 auto 14px', display: 'inline-flex' }}>Coming Soon</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--nx-text)', marginBottom: 10 }}>NEXUS eSIM</h2>
              <p style={{ color: 'var(--nx-text2)', fontSize: 14.5, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 24px' }}>
                Stay connected anywhere with NEXUS eSIM. Instant activation in 180+ countries, no physical SIM needed. Data-only and voice plans available.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 420, margin: '0 auto 24px', textAlign: 'left' }}>
                {[['🌍', '180+ Countries', 'Global coverage'],['⚡', 'Instant', 'Activate in seconds'],['💰', 'Best Rates', 'No roaming fees']].map(([icon,t,s])=>(
                  <div key={t} style={{ background: 'var(--nx-surface)', borderRadius: 12, padding: '14px 12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--nx-text)', marginBottom: 2 }}>{t}</div>
                    <div style={{ fontSize: 12, color: 'var(--nx-text3)' }}>{s}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" onClick={() => toast('We\'ll notify you when eSIM launches! 📱', { icon: '🎉' })}>
                Notify Me When Available
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — AI ASSISTANT ───────────────────── */}
        <div style={{ borderLeft: '1px solid var(--bg-hover)', padding: '20px 18px', background: 'rgba(255,255,255,.01)', overflowY: 'auto' }}>
          {/* AI Brain */}
          <div style={{ background: 'linear-gradient(135deg, rgba(124,77,255,.2), rgba(0,229,255,.1))', border: '1px solid rgba(0,229,255,.2)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🧠</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--nx-text)', marginBottom: 4 }}>Smart Assistant</div>
            <p style={{ fontSize: 12.5, color: 'var(--nx-text3)', lineHeight: 1.5, marginBottom: 14 }}>Your personalized AI assistant.</p>
            {[
              { label: 'Focus Mode', sub: 'Reduce Distractions' },
              { label: 'Turbo Mode', sub: 'Maximize Performance' },
              { label: 'Privacy Mode', sub: 'Increase Protection' },
            ].map(({ label, sub }) => (
              <button key={label} onClick={() => toast(`${label} activated!`, { icon: '⚡' })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'var(--bg-hover)', border: '1px solid var(--bg-hover)', borderRadius: 8, padding: '9px 12px', marginBottom: 6, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(0,229,255,.1)'; e.currentTarget.style.borderColor='rgba(0,229,255,.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.borderColor='var(--bg-hover)' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--nx-text)' }}>{label}</span>
                <span style={{ fontSize: 11, color: 'var(--nx-text3)' }}>{sub} ›</span>
              </button>
            ))}
            <button className="btn btn-primary w-100" style={{ marginTop: 6 }} onClick={() => toast('NEXUS AI coming soon! 🤖', { icon: '🧠' })}>
              💬 Ask NEXUS AI
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ background: 'var(--nx-surface)', border: '1px solid var(--bg-input)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--nx-text3)', marginBottom: 12 }}>Account Health</div>
            {[
              { label: 'Trust Score', val: user?.trust_score || 0, color: 'var(--nx-cyan)', max: 1000 },
              { label: 'Profile Complete', val: 75, color: 'var(--nx-violet)', max: 100, suffix: '%' },
              { label: 'Security Level', val: twoFAOn ? 90 : 40, color: twoFAOn ? 'var(--nx-green)' : 'var(--nx-orange)', max: 100, suffix: '%' },
            ].map(({ label, val, color, max, suffix }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12.5 }}>
                  <span style={{ color: 'var(--nx-text2)' }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{val}{suffix || ''}</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${(val / max) * 100}%`, background: color, borderRadius: 99, transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
