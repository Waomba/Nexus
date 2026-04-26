import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Trash2, Flag } from 'lucide-react'

export default function AdminModeration() {
  const [tab, setTab]         = useState('posts')
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = async t => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/flagged/${t}`)
      setItems(r.data.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(tab) }, [tab])

  const deleteItem = async id => {
    if (!confirm('Permanently delete this content?')) return
    try {
      await api.delete(`/admin/${tab}/${id}`)
      setItems(i => i.filter(x => x.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      <h1 style={{ fontSize:'1.4rem', marginBottom:'0.25rem' }}>Content Moderation</h1>
      <p className="text-muted text-sm" style={{ marginBottom:'1.5rem' }}>Review and remove flagged content</p>

      <div className="flex gap-1" style={{ marginBottom:'1.5rem' }}>
        {['posts','videos','tasks'].map(t => (
          <button key={t} onClick={() => setTab(t)} className="btn"
            style={{ background: tab===t ? 'var(--accent-glow)' : 'transparent', color: tab===t ? 'var(--nx-cyan)' : 'var(--text2)', border:'1px solid', borderColor: tab===t ? 'var(--nx-violet)' : 'var(--border)', textTransform:'capitalize' }}>
            <Flag size={14}/> {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{margin:'0 auto'}}/></div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text2)' }}>
          ✅ No flagged {tab} — all clear!
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {items.map(item => (
            <div key={item.id} className="card fade-in" style={{ borderColor:'rgba(239,68,68,0.3)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom:'0.5rem' }}>
                <div>
                  <span className="badge badge-danger" style={{ marginRight:'0.5rem' }}>🚩 Flagged</span>
                  <span className="text-muted text-xs">by {item.username || item.name} · #{item.id}</span>
                </div>
                <button className="btn btn-danger" style={{fontSize:'0.8rem', padding:'0.35rem 0.75rem'}} onClick={() => deleteItem(item.id)}>
                  <Trash2 size={13}/> Delete
                </button>
              </div>
              {tab === 'posts' && <p style={{ fontSize:'0.9rem' }}>{item.content}</p>}
              {tab === 'videos' && (
                <div>
                  <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{item.title}</p>
                  {item.description && <p className="text-muted text-sm">{item.description}</p>}
                </div>
              )}
              {tab === 'tasks' && (
                <div>
                  <p style={{ fontWeight:600, fontSize:'0.9rem' }}>{item.title}</p>
                  <p className="text-muted text-sm">{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
