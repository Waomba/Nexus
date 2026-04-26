import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Shield, Clock, Link, BarChart2, User, AlertTriangle } from 'lucide-react'
import { Avatar } from '../../components/Post/PostCard'

function ScreenTimeBar({ used, limit }) {
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const color = pct >= 100 ? 'var(--nx-red)' : pct >= 80 ? 'var(--nx-orange)' : 'var(--nx-green)'
  return (
    <div>
      <div className="flex justify-between text-sm" style={{ marginBottom: '0.4rem' }}>
        <span>{used} min used</span>
        <span className="text-muted">{limit} min limit</span>
      </div>
      <div style={{ background: 'var(--nx-bg3)', borderRadius: 999, height: 8 }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 999, transition: 'width 0.5s' }} />
      </div>
      <p className="text-xs text-muted" style={{ marginTop: '0.3rem' }}>{pct}% of daily limit used</p>
    </div>
  )
}

export default function ParentalControls() {
  const [children, setChildren]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [linkId, setLinkId]       = useState('')
  const [linking, setLinking]     = useState(false)
  const [selected, setSelected]   = useState(null)
  const [activity, setActivity]   = useState(null)
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [newLimit, setNewLimit]   = useState('')
  const [settingLimit, setSettingLimit] = useState(false)

  const load = async () => {
    try {
      const r = await api.get('/parental/children')
      setChildren(r.data.data || [])
    } catch { toast.error('Failed to load children') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const linkChild = async () => {
    if (!linkId.trim()) return toast.error('Enter a child user ID')
    setLinking(true)
    try {
      await api.post('/parental/link', { child_id: parseInt(linkId) })
      toast.success('Child account linked!')
      setLinkId('')
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to link') }
    finally { setLinking(false) }
  }

  const loadActivity = async (child) => {
    setSelected(child)
    setActivity(null)
    setLoadingActivity(true)
    try {
      const r = await api.get(`/parental/children/${child.id}/activity`)
      setActivity(r.data.data)
    } catch { toast.error('Failed to load activity') }
    finally { setLoadingActivity(false) }
  }

  const setScreenTimeLimit = async (childId) => {
    const mins = parseInt(newLimit)
    if (!mins || mins < 10) return toast.error('Minimum 10 minutes')
    setSettingLimit(true)
    try {
      await api.post('/parental/screen-time', { child_id: childId, minutes: mins })
      toast.success('Screen time limit updated!')
      setNewLimit('')
      load()
    } catch { toast.error('Failed to set limit') }
    finally { setSettingLimit(false) }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div className="flex items-center gap-1" style={{ marginBottom: '0.5rem' }}>
        <Shield size={24} color="var(--nx-cyan)" />
        <h1 style={{ fontSize: '1.5rem' }}>Parental Controls</h1>
      </div>
      <p className="text-muted text-sm" style={{ marginBottom: '2rem' }}>
        Manage your children's accounts, screen time, and activity.
      </p>

      {/* Link child */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="flex items-center gap-1" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
          <Link size={16} color="var(--nx-cyan)" /> Link a Child Account
        </h3>
        <p className="text-muted text-sm" style={{ marginBottom: '0.75rem' }}>
          Enter the user ID of your child's NEXUS account to link it for parental controls.
        </p>
        <div className="flex gap-1">
          <input
            className="input"
            type="number"
            placeholder="Child's user ID (e.g. 5)"
            value={linkId}
            onChange={e => setLinkId(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={linkChild} disabled={linking}>
            {linking ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Link Account'}
          </button>
        </div>
        <p className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
          💡 The child can find their user ID on their profile page URL (/profile/ID)
        </p>
      </div>

      {/* Children list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : children.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
          <Shield size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ marginBottom: '0.5rem' }}>No child accounts linked yet</p>
          <p className="text-sm">Link a child account above to start managing their experience</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {children.map(child => (
            <div key={child.id} className="card" style={{ cursor: 'pointer', borderColor: selected?.id === child.id ? 'var(--nx-violet)' : 'var(--border)' }}
              onClick={() => loadActivity(child)}>
              <div className="flex items-center gap-1" style={{ marginBottom: '1rem' }}>
                <Avatar user={child} size={42} />
                <div>
                  <div style={{ fontWeight: 600 }}>{child.name}</div>
                  <div className="text-muted text-xs">@{child.username}</div>
                </div>
                <span className="badge badge-success" style={{ marginLeft: 'auto' }}>🛡 Kids Mode</span>
              </div>

              {child.screen_time && (
                <ScreenTimeBar used={child.screen_time.used_time} limit={child.screen_time.daily_limit} />
              )}

              {child.screen_time?.used_time >= child.screen_time?.daily_limit && (
                <div className="flex items-center gap-1" style={{ marginTop: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--nx-red)' }}>
                  <AlertTriangle size={13} /> Daily limit reached
                </div>
              )}

              {/* Set screen time */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem' }}>Set Daily Limit (minutes)</label>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    className="input"
                    type="number"
                    min="10"
                    max="720"
                    placeholder={child.screen_time?.daily_limit || 120}
                    value={selected?.id === child.id ? newLimit : ''}
                    onChange={e => { setSelected(child); setNewLimit(e.target.value) }}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    onClick={() => { setSelected(child); setScreenTimeLimit(child.id) }}
                    disabled={settingLimit}
                  >
                    Set
                  </button>
                </div>
              </div>

              <button
                className="btn btn-ghost w-full"
                style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}
                onClick={e => { e.stopPropagation(); loadActivity(child) }}
              >
                <BarChart2 size={14} /> View Activity
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Activity panel */}
      {selected && (
        <div className="card fade-in">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            Activity Report — {selected.name}
          </h3>

          {loadingActivity ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : activity ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Screen time history */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text2)' }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                  Screen Time (7 days)
                </h4>
                {activity.screenTime.length === 0 ? (
                  <p className="text-muted text-sm">No screen time data yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {activity.screenTime.map(day => (
                      <div key={day.date}>
                        <div className="flex justify-between text-sm" style={{ marginBottom: '0.25rem' }}>
                          <span>{new Date(day.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-muted">{day.used_time}/{day.daily_limit} min</span>
                        </div>
                        <div style={{ background: 'var(--nx-bg3)', borderRadius: 999, height: 6 }}>
                          <div style={{ width: `${Math.min(100, Math.round((day.used_time / day.daily_limit) * 100))}%`, background: 'var(--kids-accent)', height: '100%', borderRadius: 999 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity log */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text2)' }}>
                  <User size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                  Recent Actions
                </h4>
                {activity.logs.length === 0 ? (
                  <p className="text-muted text-sm">No activity yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 260, overflowY: 'auto' }}>
                    {activity.logs.map((log, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                        <span style={{ textTransform: 'capitalize' }}>{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-muted text-xs">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
