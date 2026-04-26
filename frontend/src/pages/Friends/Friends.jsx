import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Users, UserPlus, MessageCircle, Search, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function FriendCard({ user, onMessage }) {
  return (
    <div className="stream-card fade-in" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Link to={`/profile/${user.id}`} style={{ flexShrink: 0 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent-teal))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, overflow: 'hidden', border: '2px solid rgba(0,229,255,.2)' }}>
          {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.[0]}
        </div>
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/profile/${user.id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--nx-text)', textDecoration: 'none', display: 'block' }}>{user.name}</Link>
        <div style={{ fontSize: 12.5, color: 'var(--nx-text3)', marginTop: 2 }}>@{user.username}</div>
        {user.post_count !== undefined && (
          <div style={{ fontSize: 12, color: 'var(--nx-text3)', marginTop: 4, display: 'flex', gap: 12 }}>
            <span>⭐ {user.trust_score} trust</span>
            <span>📝 {user.post_count} posts</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Link to="/messages" className="btn btn-secondary btn-sm" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          <MessageCircle size={13} /> Message
        </Link>
        <Link to={`/profile/${user.id}`} className="btn btn-outline-primary btn-sm" style={{ fontSize: 12 }}>
          View
        </Link>
      </div>
    </div>
  )
}

function SuggestionCard({ user, onFollow }) {
  const [following, setFollowing] = useState(false)
  const follow = async () => {
    try {
      await api.post(`/users/${user.id}/follow`)
      setFollowing(true)
      toast.success(`Following ${user.name}!`)
      onFollow?.(user.id)
    } catch { toast.error('Failed') }
  }
  return (
    <div className="stream-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Link to={`/profile/${user.id}`} style={{ flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent-teal))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, overflow: 'hidden' }}>
          {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.[0]}
        </div>
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/profile/${user.id}`} style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--nx-text)', textDecoration: 'none' }}>{user.name}</Link>
        <div style={{ fontSize: 11.5, color: 'var(--nx-text3)' }}>@{user.username} · {user.follower_count || 0} followers</div>
      </div>
      <button onClick={follow} disabled={following}
        className={`btn btn-sm ${following ? 'btn-secondary' : 'btn-primary'}`} style={{ fontSize: 12, flexShrink: 0 }}>
        {following ? '✓ Following' : <><UserPlus size={12} /> Follow</>}
      </button>
    </div>
  )
}

export default function Friends() {
  const [friends,     setFriends]     = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [tab,         setTab]         = useState('friends')

  useEffect(() => {
    Promise.all([
      api.get('/friends').then(r => setFriends(r.data.data || [])),
      api.get('/friends/suggestions').then(r => setSuggestions(r.data.data || [])),
    ]).finally(() => setLoading(false))
  }, [])

  const filtered = friends.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--nx-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={22} color="var(--nx-cyan)" /> Friends
          </h1>
          <p style={{ fontSize: 13, color: 'var(--nx-text3)', marginTop: 2 }}>
            {friends.length} mutual connection{friends.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--nx-text3)' }} />
        <input className="form-control" style={{ paddingLeft: 36, borderRadius: 'var(--radius-pill)' }}
          placeholder="Search your friends…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bg-input)', marginBottom: 16, gap: 4 }}>
        {[
          { id: 'friends',     label: `Friends (${friends.length})` },
          { id: 'suggestions', label: `Suggestions (${suggestions.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--nx-cyan)' : 'transparent'}`, marginBottom: -1, color: tab === t.id ? 'var(--nx-cyan)' : 'var(--nx-text2)', fontWeight: tab === t.id ? 700 : 500, fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : tab === 'friends' ? (
        filtered.length === 0 ? (
          <div className="nx-feed-empty">
            <div className="nx-feed-empty-icon"><Users size={28} color="var(--nx-cyan)" /></div>
            <div className="nx-feed-empty-title">{search ? 'No friends found' : 'No friends yet'}</div>
            <p className="nx-feed-empty-sub">
              {search ? 'Try a different search term.' : 'Follow people and when they follow back, they become friends. Check the suggestions tab!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(f => <FriendCard key={f.id} user={f} />)}
          </div>
        )
      ) : (
        suggestions.length === 0 ? (
          <div className="nx-feed-empty">
            <div className="nx-feed-empty-icon"><Star size={28} color="var(--nx-cyan)" /></div>
            <div className="nx-feed-empty-title">No suggestions right now</div>
            <p className="nx-feed-empty-sub">Check back later — we'll suggest people based on shared interests.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map(u => <SuggestionCard key={u.id} user={u} onFollow={id => setSuggestions(s => s.filter(x => x.id !== id))} />)}
          </div>
        )
      )}
    </div>
  )
}
