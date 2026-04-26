import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import PostCard from '../../components/Post/PostCard'
import { Hash, TrendingUp, Flame } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Hashtags() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag')

  const [trending, setTrending] = useState([])
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    api.get('/hashtags/trending').then(r => setTrending(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeTag) return
    setLoading(true)
    api.get(`/hashtags/posts?tag=${encodeURIComponent(activeTag)}`)
      .then(r => setPosts(r.data.data || []))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [activeTag])

  const selectTag = tag => {
    setSearchParams({ tag })
    setPosts([])
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <TrendingUp size={22} color="var(--primary)" /> Trending
      </h1>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>Popular hashtags and topics right now</p>

      {/* Trending tags grid */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Flame size={16} color="var(--nx-orange)" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Trending Hashtags</span>
        </div>
        {trending.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>No hashtags yet — create posts with #hashtags to see them here!</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {trending.map(t => (
              <button key={t.tag} onClick={() => selectTag(t.tag)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 999,
                  background: activeTag === t.tag ? 'var(--primary)' : 'var(--bg)',
                  color: activeTag === t.tag ? '#fff' : 'var(--text-primary)',
                  border: `1.5px solid ${activeTag === t.tag ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
                  fontFamily: 'var(--font)', transition: 'all .15s',
                }}>
                <Hash size={12} />
                {t.tag}
                <span style={{ fontSize: 11, opacity: .7, marginLeft: 2 }}>{t.post_count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posts for selected tag */}
      {activeTag && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hash size={18} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>#{activeTag}</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{posts.length} posts</p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No posts with #{activeTag} yet
            </div>
          ) : (
            posts.map(p => <PostCard key={p.id} post={p} />)
          )}
        </>
      )}

      {!activeTag && trending.length > 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <Hash size={32} style={{ margin: '0 auto 10px', opacity: .4 }} />
          <p>Click a hashtag above to see related posts</p>
        </div>
      )}
    </div>
  )
}
