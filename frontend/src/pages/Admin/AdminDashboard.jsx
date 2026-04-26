import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Users, FileText, Video, Briefcase, Flag, Shield, MessageSquare, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function StatCard({ icon: Icon, label, value, color = 'var(--nx-cyan)' }) {
  return (
    <div className="stat-card fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
        <span className="text-muted text-sm">{label}</span>
        <Icon size={18} color={color} />
      </div>
      <div className="stat-value">{value?.toLocaleString() ?? 0}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding:'3rem', textAlign:'center' }}><div className="spinner" style={{margin:'0 auto'}}/></div>
  if (!data) return null

  const { stats, recentUsers, recentLogs } = data

  const statCards = [
    { icon: Users,        label:'Total Users',       value: stats.total_users,     color:'var(--nx-cyan)' },
    { icon: FileText,     label:'Total Posts',       value: stats.total_posts,     color:'var(--nx-green)'   },
    { icon: Video,        label:'Total Videos',      value: stats.total_videos,    color:'var(--nx-orange)'  },
    { icon: Briefcase,    label:'Total Tasks',       value: stats.total_tasks,     color:'#38bdf8'        },
    { icon: MessageSquare,label:'Messages',          value: stats.total_messages,  color:'#a78bfa'        },
    { icon: Flag,         label:'Pending Reports',   value: stats.pending_reports, color:'var(--nx-red)'     },
    { icon: Shield,       label:'Kids Accounts',     value: stats.kids_accounts,   color:'var(--nx-green)'   },
    { icon: TrendingUp,   label:'New Today',         value: stats.new_users_today, color:'var(--nx-cyan)' },
  ]

  return (
    <div>
      <h1 style={{ fontSize:'1.6rem', marginBottom:'0.25rem' }}>Dashboard</h1>
      <p className="text-muted text-sm" style={{ marginBottom:'2rem' }}>Platform overview and activity</p>

      <div className="stats-grid">
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Recent users */}
        <div className="card">
          <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Recent Users</h3>
          {recentUsers.map(u => (
            <div key={u.id} className="flex justify-between items-center" style={{ padding:'0.5rem 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{u.name}</div>
                <div className="text-muted text-xs">@{u.username} · {u.role}</div>
              </div>
              <span className="text-muted text-xs">{u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix:true }) : ''}</span>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="card">
          <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Recent Activity</h3>
          {recentLogs.map((log, i) => (
            <div key={i} style={{ padding:'0.5rem 0', borderBottom:'1px solid var(--border)' }}>
              <div className="flex justify-between">
                <span style={{ fontSize:'0.85rem' }}><strong>{log.username}</strong> {log.action.replace(/_/g,' ')}</span>
                <span className="text-muted text-xs">{log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix:true }) : ''}</span>
              </div>
              {log.details && <p className="text-muted text-xs" style={{ marginTop:'0.15rem' }}>{log.details}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
