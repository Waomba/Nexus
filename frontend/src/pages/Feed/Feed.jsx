import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import PostCard from '../../components/Post/PostCard'
import StoriesBar from '../../components/Story/StoriesBar'
import { FeedSkeleton } from '../../components/common/Skeletons'
import { Plus, RefreshCw, TrendingUp, Clock } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function Feed() {
  const { user } = useAuth()
  const [posts,     setPosts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing,setRefreshing]= useState(false)
  const [mode,      setMode]      = useState('pulse') // pulse | trending
  const [page,      setPage]      = useState(1)
  const [hasMore,   setHasMore]   = useState(true)
  const [compose,   setCompose]   = useState('')
  const [posting,   setPosting]   = useState(false)

  const load = useCallback(async (reset = false) => {
    const p = reset ? 1 : page
    if (reset) setLoading(true)
    try {
      const ep = mode === 'trending' ? '/posts/explore' : '/posts/feed'
      const r = await api.get(`${ep}?page=${p}&limit=12`)
      const newPosts = r.data.data || []
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts])
      setHasMore(newPosts.length >= 12)
      if (!reset) setPage(p + 1)
    } catch { toast.error('Failed to load feed') }
    finally { setLoading(false) }
  }, [mode, page])

  useEffect(() => { load(true) }, [mode])

  const refresh = async () => {
    setRefreshing(true)
    setPage(1)
    await load(true)
    setRefreshing(false)
    toast.success('Feed refreshed!', { icon: '✨' })
  }

  const quickPost = async () => {
    if (!compose.trim()) return
    setPosting(true)
    try {
      const r = await api.post('/posts', { content: compose })
      setPosts(prev => [r.data.data, ...prev])
      setCompose('')
      toast.success('Posted!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setPosting(false) }
  }

  const onDelete = id => setPosts(prev => prev.filter(p => p.id !== id))

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'20px 0' }}>

      {/* Medicore-style greeting */}
      <div style={{ padding:'0 0 20px' }}>
        <h1 className="nx-greeting">{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
        <p className="nx-greeting-sub">Here's what's happening in your network today.</p>
      </div>

      {/* Stories */}
      <StoriesBar />

      {/* Feed mode tabs + refresh */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div className="tabs" style={{ marginBottom:0, flex:1, borderBottom:'none' }}>
          <button
            onClick={() => setMode('pulse')}
            className={`tab-item${mode === 'pulse' ? ' active' : ''}`}
            style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Clock size={14}/> Latest
          </button>
          <button
            onClick={() => setMode('trending')}
            className={`tab-item${mode === 'trending' ? ' active' : ''}`}
            style={{ display:'flex', alignItems:'center', gap:6 }}>
            <TrendingUp size={14}/> Trending
          </button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={refreshing}
          style={{ gap:5 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin .7s linear infinite' : 'none' }}/>
        </button>
      </div>

      {/* Quick compose — Medicore card style */}
      <div className="nx-compose" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--primary-dim)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, overflow:'hidden', flexShrink:0, border:'2px solid var(--border)' }}>
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : user?.name?.[0]}
          </div>
          <textarea
            className="nx-compose-input"
            rows={compose.length > 80 ? 3 : 1}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'there'}?`}
            value={compose}
            onChange={e => setCompose(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) quickPost() }}
            style={{ flex:1, minHeight:38 }}
          />
        </div>
        {compose.trim() && (
          <div className="nx-compose-actions" style={{ justifyContent:'space-between' }}>
            <span style={{ fontSize:12, color: compose.length > 480 ? 'var(--danger)' : 'var(--text-muted)' }}>
              {compose.length}/500
            </span>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setCompose('')}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={quickPost} disabled={posting || !compose.trim()}>
                {posting ? <span className="spinner" style={{width:13,height:13,borderTopColor:'#fff'}}/> : <><Plus size={13}/> Post</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <FeedSkeleton count={4}/>
      ) : posts.length === 0 ? (
        <div className="nx-feed-empty">
          <div className="nx-feed-empty-icon">📭</div>
          <div className="nx-feed-empty-title">Your feed is empty</div>
          <p className="nx-feed-empty-sub">Follow people or post something to get started!</p>
        </div>
      ) : (
        <>
          {posts.map(p => (
            <PostCard key={p.id} post={p} onDelete={onDelete} />
          ))}
          {hasMore && (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <button className="btn btn-secondary" onClick={() => { setPage(page + 1); load() }}>
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
