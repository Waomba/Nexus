import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { Shield, Clock, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function KidsFeed() {
  const { user } = useAuth()
  const [posts, setPosts]       = useState([])
  const [screenTime, setScreenTime] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/posts/explore').then(r => setPosts(r.data.data || [])),
      api.get('/parental/screen-time/status').then(r => setScreenTime(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false))

    // Track usage every minute
    const interval = setInterval(() => {
      api.post('/parental/screen-time/track', { minutes: 1 }).catch(() => {})
      api.get('/parental/screen-time/status').then(r => setScreenTime(r.data.data)).catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" />
    </div>
  )

  const pct = screenTime ? Math.min(100, Math.round((screenTime.used_time / screenTime.daily_limit) * 100)) : 0

  return (
    <div style={{ maxWidth:620, margin:'0 auto', padding:'2rem 1.5rem' }}>
      {/* Kids banner */}
      <div style={{ background:'linear-gradient(135deg, #1e3a8a, #1d4ed8)', borderRadius:'var(--radius)', padding:'1.25rem 1.5rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
        <Shield size={32} color="#93c5fd" />
        <div style={{ flex:1 }}>
          <h2 style={{ fontSize:'1.1rem', color:'#e0f2fe', marginBottom:'0.25rem' }}>Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
          <p style={{ fontSize:'0.85rem', color:'#93c5fd' }}>You're in Safe Mode — all content is checked for you.</p>
        </div>
        <Star size={20} color="#fbbf24" fill="#fbbf24" />
      </div>

      {/* Screen time widget */}
      {screenTime && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom:'0.75rem' }}>
            <div className="flex items-center gap-1"><Clock size={16} color="var(--kids-accent)"/><span style={{ fontWeight:600, fontSize:'0.9rem' }}>Screen Time</span></div>
            <span className="text-sm text-muted">{screenTime.used_time} / {screenTime.daily_limit} min</span>
          </div>
          <div style={{ background:'var(--nx-bg3)', borderRadius:999, height:8, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, background: pct > 80 ? 'var(--nx-red)' : 'var(--kids-accent)', height:'100%', borderRadius:999, transition:'width 0.5s' }}/>
          </div>
          {screenTime.limit_reached && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-sm)', padding:'0.75rem', marginTop:'0.75rem', fontSize:'0.85rem', color:'var(--nx-red)' }}>
              ⏰ You've reached your daily screen time limit. Ask a parent to adjust it.
            </div>
          )}
          {pct > 80 && !screenTime.limit_reached && (
            <p style={{ fontSize:'0.8rem', color:'var(--nx-orange)', marginTop:'0.5rem' }}>Almost at your daily limit!</p>
          )}
        </div>
      )}

      {/* Safe posts */}
      <h2 style={{ fontSize:'1.1rem', marginBottom:'1rem' }}>🌟 Today's Posts</h2>
      {posts.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--text2)' }}>No posts yet!</div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card fade-in" style={{ borderColor:'#1e3a8a' }}>
            <div className="flex items-center gap-1" style={{ marginBottom:'0.6rem' }}>
              <div className="avatar" style={{ width:34, height:34, fontSize:'0.85rem', background:'#1e3a8a', color:'#93c5fd' }}>
                {post.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#e0f2fe' }}>{post.name}</div>
                <div style={{ fontSize:'0.75rem', color:'#64a9d4' }}>@{post.username}</div>
              </div>
            </div>
            <p style={{ fontSize:'0.95rem', color:'#cce4f6', lineHeight:1.6 }}>{post.content}</p>
            {post.media && post.media_type === 'image' && (
              <img src={post.media} alt="" style={{ width:'100%', borderRadius:'var(--radius-sm)', marginTop:'0.75rem', maxHeight:300, objectFit:'cover' }}/>
            )}
          </div>
        ))
      )}
    </div>
  )
}
