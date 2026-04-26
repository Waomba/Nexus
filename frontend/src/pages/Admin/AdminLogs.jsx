import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { Activity } from 'lucide-react'

const ACTION_COLORS = {
  registered: 'badge-success', logged_in: 'badge-primary', created_post: 'badge-primary',
  uploaded_video: 'badge-warning', created_task: 'badge-success', sent_message: 'badge-success',
  reported_content: 'badge-danger', banned_user: 'badge-danger', linked_child: 'badge-warning',
}

export default function AdminLogs() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/logs').then(r => setLogs(r.data.data || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize:'1.4rem', marginBottom:'0.25rem' }}>Activity Logs</h1>
      <p className="text-muted text-sm" style={{ marginBottom:'1.5rem' }}>Full audit trail of platform activity</p>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{margin:'0 auto'}}/></div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table>
            <thead><tr><th>User</th><th>Action</th><th>Details</th><th>Time</th></tr></thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{log.name}</div>
                    <div className="text-muted text-xs">@{log.username}</div>
                  </td>
                  <td>
                    <span className={`badge ${ACTION_COLORS[log.action] || 'badge-primary'}`}>
                      {log.action.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="text-sm text-muted">{log.details || '—'}</td>
                  <td className="text-xs text-muted">{log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix:true }) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
