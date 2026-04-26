import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { UserX, UserCheck, Search } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.data || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const ban = async id => {
    if (!confirm('Ban this user?')) return
    try { await api.post(`/admin/users/${id}/ban`); setUsers(u => u.map(x => x.id===id ? {...x,is_active:0} : x)); toast.success('User banned') }
    catch { toast.error('Failed') }
  }

  const unban = async id => {
    try { await api.post(`/admin/users/${id}/unban`); setUsers(u => u.map(x => x.id===id ? {...x,is_active:1} : x)); toast.success('User unbanned') }
    catch { toast.error('Failed') }
  }

  const filtered = users.filter(u => !query || u.name?.toLowerCase().includes(query.toLowerCase()) || u.username?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <h1 style={{ fontSize:'1.4rem', marginBottom:'0.25rem' }}>User Management</h1>
      <p className="text-muted text-sm" style={{ marginBottom:'1.5rem' }}>Manage all platform users</p>

      <div style={{ position:'relative', marginBottom:'1.5rem', maxWidth:320 }}>
        <Search size={14} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }}/>
        <input className="input" style={{ paddingLeft:'2.25rem' }} placeholder="Search users…" value={query} onChange={e => setQuery(e.target.value)}/>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{margin:'0 auto'}}/></div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Trust</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{u.name}</div>
                    <div className="text-muted text-xs">@{u.username}</div>
                  </td>
                  <td className="text-sm text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="text-sm">{u.trust_score}</td>
                  <td>
                    {u.role !== 'admin' && (
                      u.is_active
                        ? <button className="btn btn-danger" style={{fontSize:'0.8rem', padding:'0.3rem 0.75rem'}} onClick={() => ban(u.id)}><UserX size={13}/> Ban</button>
                        : <button className="btn btn-primary" style={{fontSize:'0.8rem', padding:'0.3rem 0.75rem'}} onClick={() => unban(u.id)}><UserCheck size={13}/> Unban</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
