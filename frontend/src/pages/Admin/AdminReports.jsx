import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('pending')

  const load = status => {
    setLoading(true)
    api.get(`/admin/reports?status=${status}`).then(r => setReports(r.data.data || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }

  useEffect(() => { load(tab) }, [tab])

  const resolve = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status })
      setReports(r => r.filter(x => x.id !== id))
      toast.success('Report updated')
    } catch { toast.error('Failed') }
  }

  const TYPE_COLORS = { post:'badge-primary', message:'badge-warning', video:'badge-success', task:'badge-success', user:'badge-danger' }

  return (
    <div>
      <h1 style={{ fontSize:'1.4rem', marginBottom:'0.25rem' }}>Reports</h1>
      <p className="text-muted text-sm" style={{ marginBottom:'1.5rem' }}>Review user-submitted reports</p>

      <div className="flex gap-1" style={{ marginBottom:'1.5rem' }}>
        {['pending','reviewed','dismissed'].map(t => (
          <button key={t} onClick={() => setTab(t)} className="btn"
            style={{ background: tab===t ? 'var(--accent-glow)' : 'transparent', color: tab===t ? 'var(--nx-cyan)' : 'var(--text2)', border:'1px solid', borderColor: tab===t ? 'var(--nx-violet)' : 'var(--border)', textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{margin:'0 auto'}}/></div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text2)' }}>No {tab} reports</div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table>
            <thead><tr><th>Reporter</th><th>Type</th><th>Content ID</th><th>Reason</th><th>Time</th>{tab==='pending' && <th>Actions</th>}</tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.reporter_name}</div>
                    <div className="text-muted text-xs">@{r.reporter_username}</div>
                  </td>
                  <td><span className={`badge ${TYPE_COLORS[r.content_type] || 'badge-primary'}`}>{r.content_type}</span></td>
                  <td className="text-sm">#{r.content_id}</td>
                  <td className="text-sm" style={{ maxWidth:220 }}>{r.reason}</td>
                  <td className="text-xs text-muted">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix:true }) : ''}</td>
                  {tab==='pending' && (
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-primary" style={{fontSize:'0.8rem', padding:'0.3rem 0.6rem'}} onClick={() => resolve(r.id,'reviewed')}><Check size={13}/></button>
                        <button className="btn btn-ghost" style={{fontSize:'0.8rem', padding:'0.3rem 0.6rem'}} onClick={() => resolve(r.id,'dismissed')}><X size={13}/></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
