import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Play, Eye, Plus, X, Upload, TrendingUp, Clock } from 'lucide-react'
import FileUploader from '../../components/common/FileUploader'
import { Avatar } from '../../components/Post/PostCard'
import { formatDistanceToNow } from 'date-fns'
import MediaGallery from '../../components/common/MediaGallery'

function VideoCard({ video, onClick }) {
  return (
    <div onClick={() => onClick(video)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {video.thumbnail
          ? <img src={video.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ fontSize: 32, opacity: .5 }}>🎬</div>
        }
        {/* Play overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(79,70,229,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={22} fill="white" color="white" />
          </div>
        </div>
        {/* Duration badge */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.75)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>
          VIDEO
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar user={{ name: video.name, avatar: video.avatar }} size={20} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.username}</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <Eye size={11} /> {(video.views || 0).toLocaleString()}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
          {video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix: true }) : ''}
        </div>
      </div>
    </div>
  )
}

export default function Videos() {
  const { user } = useAuth()
  const [videos,    setVideos]    = useState([])
  const [playing,   setPlaying]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [tab,       setTab]       = useState('trending')
  const [form,      setForm]      = useState({ title: '', description: '', media: '', thumbnail: '' })
  const [submitting,setSubmitting]= useState(false)

  useEffect(() => {
    api.get('/videos')
      .then(r => setVideos(r.data.data || []))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [])

  const submitVideo = async e => {
    e.preventDefault()
    if (!form.title || !form.media) return toast.error('Title and video upload required')
    setSubmitting(true)
    try {
      const r = await api.post('/videos', form)
      if (r.data.data) setVideos(v => [r.data.data, ...v])
      setShowForm(false)
      setForm({ title: '', description: '', media: '', thumbnail: '' })
      toast.success('Video uploaded!')
    } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSubmitting(false) }
  }

  const displayed = tab === 'trending'
    ? [...videos].sort((a, b) => b.views - a.views)
    : [...videos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Videos</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>{videos.length} videos on NEXUS</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Upload size={15} /> Upload Video
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div className="card fade-in" style={{ padding: '20px 22px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Upload New Video</h3>
          <form onSubmit={submitVideo}>
            <div className="form-group">
              <label className="form-label">Title <span className="req">*</span></label>
              <input className="form-control" placeholder="Give your video a title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Video URL <span className="req">*</span></label>
                <input className="form-control" placeholder="https://…/video.mp4" value={form.media} onChange={e => setForm(f => ({ ...f, media: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input className="form-control" placeholder="https://…/thumb.jpg" value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} placeholder="What's this video about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : 'Upload'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[{ id: 'trending', icon: TrendingUp, label: 'Trending' }, { id: 'latest', icon: Clock, label: 'Latest' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16/9', background: 'var(--bg)' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ height: 13, background: 'var(--bg)', borderRadius: 4, marginBottom: 8, width: '80%' }} />
                <div style={{ height: 11, background: 'var(--bg)', borderRadius: 4, width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎬</div>
          <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>No videos yet</p>
          <p>Upload the first video to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {displayed.map(v => <VideoCard key={v.id} video={v} onClick={setPlaying} />)}
        </div>
      )}

      {/* Video player modal */}
      {playing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setPlaying(null) }}>
          <div style={{ width: '100%', maxWidth: 860, background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playing.title}</h3>
              <button onClick={() => setPlaying(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', marginLeft: 10 }}><X size={20} /></button>
            </div>
            <video src={playing.media} controls autoPlay style={{ width: '100%', maxHeight: 480, background: '#000', display: 'block' }} />
            <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar user={{ name: playing.name, avatar: playing.avatar }} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{playing.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>@{playing.username} · {(playing.views || 0).toLocaleString()} views</div>
              </div>
            </div>
            {playing.description && <p style={{ padding: '0 18px 14px', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{playing.description}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
