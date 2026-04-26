import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Briefcase, Plus, MapPin, DollarSign, Clock } from 'lucide-react'
import { Avatar } from '../../components/Post/PostCard'
import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS = { open:'badge-success', assigned:'badge-warning', completed:'badge-primary', cancelled:'badge-danger' }

function TaskCard({ task, onReport }) {
  return (
    <div className="card fade-in" style={{ marginBottom:'1rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom:'0.5rem' }}>
        <span className={`badge ${STATUS_COLORS[task.status] || 'badge-primary'}`}>{task.status}</span>
        <span className="text-muted text-xs">{task.created_at ? formatDistanceToNow(new Date(task.created_at), { addSuffix:true }) : ''}</span>
      </div>
      <h3 style={{ fontSize:'1rem', marginBottom:'0.4rem' }}>{task.title}</h3>
      <p className="text-muted text-sm" style={{ marginBottom:'0.75rem' }}>{task.description}</p>
      <div className="flex gap-2" style={{ flexWrap:'wrap' }}>
        {task.location && <span className="flex items-center gap-1 text-sm text-muted"><MapPin size={13}/> {task.location}</span>}
        {task.budget > 0 && <span className="flex items-center gap-1 text-sm text-muted"><DollarSign size={13}/> {parseFloat(task.budget).toFixed(2)}</span>}
      </div>
      <hr className="divider" />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Avatar user={{ name: task.name, avatar: task.avatar }} size={26} />
          <span className="text-sm">{task.name}</span>
        </div>
        <button className="action-btn text-xs" onClick={() => onReport(task.id)}>Report</button>
      </div>
    </div>
  )
}

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks]     = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [tab, setTab]         = useState('browse')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ title:'', description:'', location:'', budget:'' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/tasks').then(r => setTasks(r.data.data || [])),
      api.get('/tasks/mine').then(r => setMyTasks(r.data.data || [])),
    ]).catch(() => toast.error('Failed to load tasks')).finally(() => setLoading(false))
  }, [])

  const submitTask = async e => {
    e.preventDefault()
    if (!form.title || !form.description) return toast.error('Title and description required')
    setSubmitting(true)
    try {
      const r = await api.post('/tasks', form)
      setMyTasks(t => [r.data.data, ...t])
      setTasks(t => [r.data.data, ...t])
      setShowForm(false)
      setForm({ title:'', description:'', location:'', budget:'' })
      toast.success('Task posted!')
      setTab('mine')
    } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSubmitting(false) }
  }

  const report = async id => {
    try {
      await api.post('/reports', { content_type:'task', content_id:id, reason:'Inappropriate task' })
      toast.success('Reported')
    } catch { toast.error('Failed') }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}/status`, { status })
      setMyTasks(t => t.map(x => x.id === id ? { ...x, status } : x))
      toast.success('Status updated')
    } catch { toast.error('Failed') }
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'2rem 1.5rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:'1.5rem' }}>Tasks & Gigs</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={16}/> Post Task
        </button>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom:'1.5rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>Post a Task</h3>
          <form onSubmit={submitTask}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="input" placeholder="What do you need done?" value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input textarea" placeholder="Describe the task in detail…" value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} required/>
            </div>
            <div className="flex gap-1">
              <div className="form-group" style={{ flex:1 }}>
                <label className="form-label">Location</label>
                <input className="input" placeholder="City or area" value={form.location} onChange={e => setForm(f => ({...f,location:e.target.value}))}/>
              </div>
              <div className="form-group" style={{ flex:1 }}>
                <label className="form-label">Budget ($)</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.budget} onChange={e => setForm(f => ({...f,budget:e.target.value}))}/>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? <span className="spinner" style={{width:16,height:16}}/> : 'Post Task'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1" style={{ marginBottom:'1.5rem' }}>
        {[['browse','Browse Tasks'],['mine','My Tasks']].map(([t,label]) => (
          <button key={t} onClick={() => setTab(t)} className="btn"
            style={{ background: tab===t ? 'var(--accent-glow)' : 'transparent', color: tab===t ? 'var(--nx-cyan)' : 'var(--text2)', border:'1px solid', borderColor: tab===t ? 'var(--nx-violet)' : 'var(--border)' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{margin:'0 auto'}}/></div>
      ) : tab === 'browse' ? (
        tasks.length === 0
          ? <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text2)' }}>No tasks posted yet</div>
          : tasks.map(t => <TaskCard key={t.id} task={t} onReport={report}/>)
      ) : (
        myTasks.length === 0
          ? <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text2)' }}>You haven't posted any tasks yet</div>
          : myTasks.map(task => (
              <div key={task.id} className="card fade-in" style={{ marginBottom:'1rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom:'0.5rem' }}>
                  <h3 style={{ fontSize:'1rem' }}>{task.title}</h3>
                  <span className={`badge ${STATUS_COLORS[task.status] || 'badge-primary'}`}>{task.status}</span>
                </div>
                <p className="text-muted text-sm" style={{ marginBottom:'0.75rem' }}>{task.description}</p>
                {task.status === 'open' && (
                  <div className="flex gap-1">
                    <button className="btn btn-ghost" style={{fontSize:'0.8rem'}} onClick={() => updateStatus(task.id,'assigned')}>Mark Assigned</button>
                    <button className="btn btn-primary" style={{fontSize:'0.8rem'}} onClick={() => updateStatus(task.id,'completed')}>Complete</button>
                    <button className="btn btn-danger" style={{fontSize:'0.8rem'}} onClick={() => updateStatus(task.id,'cancelled')}>Cancel</button>
                  </div>
                )}
              </div>
            ))
      )}
    </div>
  )
}
