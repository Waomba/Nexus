import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { Avatar } from '../../components/Post/PostCard'
import { Trophy, Star, TrendingUp, Users, FileText, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_COLORS = ['#F59E0B', '#94A3B8', '#CD7C2F']

export default function Leaderboard() {
  const [users,   setUsers]   = useState([])
  const [myScore, setMyScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reputation/leaderboard').then(r => setUsers(r.data.data || [])),
      api.get('/reputation/me').then(r => setMyScore(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={24} color="var(--warning)" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Leaderboard</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 2 }}>Top users ranked by trust score</p>
        </div>
      </div>

      {/* My score card */}
      {myScore && (
        <div className="card fade-in" style={{ marginBottom: 20, padding: '18px 20px', background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderColor: 'rgba(79,70,229,.2)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--primary)', marginBottom: 12 }}>
            ⭐ Your Stats
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
            {[
              { icon: Star,     label: 'Trust Score',    val: myScore.trust_score },
              { icon: FileText, label: 'Posts',          val: myScore.clean_posts },
              { icon: Heart,    label: 'Likes Received', val: myScore.total_likes },
              { icon: Users,    label: 'Followers',      val: myScore.followers },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,.7)', borderRadius: 10, padding: '10px 6px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{val ?? 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How trust works */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <TrendingUp size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Trust score</strong> increases when you post quality content, gain followers, and receive likes. It decreases when your content is reported.
        </p>
      </div>

      {/* Rankings */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {users.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No users yet</div>
          )}
          {users.map((u, i) => (
            <Link key={u.id} to={`/profile/${u.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>

              {/* Rank */}
              <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
                {i < 3
                  ? <span style={{ fontSize: 22 }}>{MEDALS[i]}</span>
                  : <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>
                }
              </div>

              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar user={u} size={44} />
                {i < 3 && (
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: MEDAL_COLORS[i], border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                    {i === 0 ? '👑' : i === 1 ? '⭐' : '✦'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{u.username} · {u.follower_count || 0} followers · {u.post_count || 0} posts</div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: i < 3 ? MEDAL_COLORS[i] : 'var(--text-primary)', fontFamily: 'var(--font)' }}>
                  {u.trust_score}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>trust</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
