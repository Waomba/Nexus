import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { TrendingUp, Users, FileText, Briefcase } from 'lucide-react'

// Simple bar chart using pure SVG — no dependencies needed
function BarChart({ data, color = 'var(--nx-violet)', label = '' }) {
  if (!data || data.length === 0) return <p className="text-muted text-sm">No data</p>
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 480, H = 140, BAR_W = Math.max(12, Math.floor((W - 40) / data.length) - 6), PAD = 40

  return (
    <div>
      {label && <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>{label}</p>}
      <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={PAD} y1={H - H * t} x2={W} y2={H - H * t}
            stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4" />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const bh  = Math.max(2, (d.value / max) * H)
          const x   = PAD + i * (BAR_W + 6)
          const y   = H - bh
          return (
            <g key={i}>
              <rect x={x} y={y} width={BAR_W} height={bh} rx="4"
                fill={color} opacity="0.85">
                <title>{d.label}: {d.value}</title>
              </rect>
              {/* Value label */}
              {d.value > 0 && (
                <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle"
                  fontSize="10" fill="var(--text2)">{d.value}</text>
              )}
              {/* X label */}
              <text x={x + BAR_W / 2} y={H + 16} textAnchor="middle"
                fontSize="9" fill="var(--text2)">{d.label}</text>
            </g>
          )
        })}
        {/* Y axis */}
        <line x1={PAD} y1={0} x2={PAD} y2={H} stroke="var(--border)" strokeWidth="1" />
        <text x={PAD - 4} y={H / 2} textAnchor="end" dominantBaseline="middle"
          fontSize="9" fill="var(--text2)">{Math.round(max / 2)}</text>
        <text x={PAD - 4} y={4} textAnchor="end" fontSize="9" fill="var(--text2)">{max}</text>
        <text x={PAD - 4} y={H} textAnchor="end" fontSize="9" fill="var(--text2)">0</text>
      </svg>
    </div>
  )
}

// Donut chart
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1
  const r = 46, cx = size / 2, cy = size / 2
  let angle = -Math.PI / 2

  const arcs = segments.map(seg => {
    const ratio = seg.value / total
    const sweep = ratio * 2 * Math.PI
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    return { ...seg, path: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`, ratio }
  })

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill={arc.color} opacity="0.9">
            <title>{arc.label}: {arc.value} ({Math.round(arc.ratio * 100)}%)</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--bg2)" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fill="var(--text)">{total}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span className="text-muted">{s.label}</span>
            <span style={{ fontWeight: 600, marginLeft: 'auto' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
  if (!data) return null

  const { stats, recentLogs } = data

  // Build activity chart from logs
  const actionCounts = {}
  recentLogs.forEach(l => {
    const action = l.action.replace(/_/g, ' ')
    actionCounts[action] = (actionCounts[action] || 0) + 1
  })
  const activityData = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label: label.replace('created ', '').replace('logged ', 'login'), value }))

  const contentData = [
    { label: 'Posts',   value: stats.total_posts,   color: 'var(--nx-violet)'  },
    { label: 'Videos',  value: stats.total_videos,  color: 'var(--nx-orange)'  },
    { label: 'Tasks',   value: stats.total_tasks,   color: '#38bdf8'        },
    { label: 'Messages',value: stats.total_messages,color: '#a78bfa'        },
  ]

  const userSegments = [
    { label: 'Regular',  value: stats.total_users - stats.kids_accounts - 1, color: 'var(--nx-violet)' },
    { label: 'Kids',     value: stats.kids_accounts, color: 'var(--nx-green)'  },
    { label: 'Admins',   value: 1,                   color: '#f59e0b'       },
  ]

  const moderationData = [
    { label: 'Pending reports', value: stats.pending_reports, color: 'var(--nx-red)'    },
    { label: 'Flagged posts',   value: stats.flagged_posts,   color: 'var(--nx-orange)' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Analytics</h1>
      <p className="text-muted text-sm" style={{ marginBottom: '2rem' }}>Platform-wide statistics and trends</p>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: Users,    label: 'Total Users',  value: stats.total_users,    color: 'var(--nx-cyan)' },
          { icon: FileText, label: 'Total Posts',  value: stats.total_posts,    color: 'var(--nx-green)'   },
          { icon: TrendingUp,label:'New Today',    value: stats.new_users_today,color: 'var(--nx-orange)'  },
          { icon: Briefcase,label: 'Open Tasks',   value: stats.total_tasks,    color: '#38bdf8'        },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card">
            <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
              <span className="text-muted text-sm">{label}</span>
              <Icon size={16} color={color} />
            </div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Activity chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Recent Activity Breakdown</h3>
          <BarChart data={activityData} color="var(--nx-violet)" />
        </div>

        {/* Content donut */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Content Distribution</h3>
          <DonutChart segments={contentData} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* User types */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>User Types</h3>
          <DonutChart segments={userSegments} />
        </div>

        {/* Moderation */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Moderation Queue</h3>
          {moderationData.every(d => d.value === 0) ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--nx-green)', fontSize: '0.9rem' }}>
              ✅ All clear — no pending items
            </div>
          ) : (
            <DonutChart segments={moderationData} />
          )}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="flex justify-between text-sm" style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.08)', borderRadius: 6 }}>
              <span>🚩 Pending Reports</span>
              <strong style={{ color: 'var(--nx-red)' }}>{stats.pending_reports}</strong>
            </div>
            <div className="flex justify-between text-sm" style={{ padding: '0.5rem', background: 'rgba(249,115,22,0.08)', borderRadius: 6 }}>
              <span>⚠️ Flagged Posts</span>
              <strong style={{ color: 'var(--nx-orange)' }}>{stats.flagged_posts}</strong>
            </div>
            <div className="flex justify-between text-sm" style={{ padding: '0.5rem', background: 'rgba(59,130,246,0.08)', borderRadius: 6 }}>
              <span>🛡️ Kids Accounts</span>
              <strong style={{ color: 'var(--kids-accent)' }}>{stats.kids_accounts}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
