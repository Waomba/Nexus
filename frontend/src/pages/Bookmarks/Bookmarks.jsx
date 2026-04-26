import { useState, useEffect } from 'react'
import api from '../../utils/api'
import PostCard from '../../components/Post/PostCard'
import { Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Bookmarks() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookmarks').then(r => setPosts(r.data.data || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const handleDelete = id => setPosts(prev => prev.filter(p => p.id !== id))

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bookmark size={22} color="var(--primary)" fill="var(--primary)" /> Saved Posts
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 3 }}>Posts you've bookmarked for later</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bookmark size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p style={{ fontWeight: 600, marginBottom: 6 }}>No saved posts yet</p>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Tap the bookmark icon on any post to save it here.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>{posts.length} saved post{posts.length !== 1 ? 's' : ''}</p>
          {posts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
        </>
      )}
    </div>
  )
}
