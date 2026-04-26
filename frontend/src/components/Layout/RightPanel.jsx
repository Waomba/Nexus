import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { TrendingUp, Users, Hash, Trophy, CheckCircle, Zap } from 'lucide-react'

function UserChip({ user }) {
  const [following, setFollowing] = useState(false)
  const follow = async () => {
    try {
      if (following) await api.post(`/users/${user.id}/unfollow`)
      else await api.post(`/users/${user.id}/follow`)
      setFollowing(f => !f)
    } catch {}
  }
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
      <Link to={`/profile/${user.id}`} style={{ flexShrink:0 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary-dim)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, overflow:'hidden', border:'2px solid var(--border)' }}>
          {user.avatar ? <img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : user.name?.[0]}
        </div>
      </Link>
      <div style={{ flex:1, minWidth:0 }}>
        <Link to={`/profile/${user.id}`} style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', textDecoration:'none', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</Link>
        <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>@{user.username}</div>
      </div>
      <button onClick={follow}
        style={{ flexShrink:0, padding:'5px 12px', borderRadius:'var(--radius-pill)', border:`1.5px solid ${following ? 'var(--border)' : 'var(--primary)'}`, background: following ? 'var(--bg-input)' : 'var(--primary-light)', color: following ? 'var(--text-secondary)' : 'var(--primary)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)', transition:'all .15s' }}>
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

export default function RightPanel() {
  const [trending, setTrending] = useState([])
  const [people,   setPeople]   = useState([])
  const [myScore,  setMyScore]  = useState(null)

  useEffect(() => {
    api.get('/hashtags/trending').then(r => setTrending(r.data.data?.slice(0,5) || [])).catch(() => {})
    api.get('/reputation/leaderboard').then(r => setPeople(r.data.data?.slice(0,4) || [])).catch(() => {})
    api.get('/reputation/me').then(r => setMyScore(r.data.data)).catch(() => {})
  }, [])

  return (
    <div className="nx-ai-panel">

      {/* Trust Score widget */}
      {myScore && (
        <div className="nx-widget">
          <div className="nx-widget-header">
            <span className="nx-widget-title"><span className="dot"/>Your Score</span>
            <Link to="/leaderboard" style={{ fontSize:11.5, color:'var(--primary)', fontWeight:600 }}>Leaderboard</Link>
          </div>
          <div style={{ padding:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'var(--primary-dim)', border:'1px solid rgba(59,127,235,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Trophy size={20} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize:24, fontWeight:800, color:'var(--primary)', lineHeight:1 }}>{myScore.trust_score}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginTop:2 }}>Trust Score</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
              {[
                { label:'Posts',     val: myScore.clean_posts },
                { label:'Likes',     val: myScore.total_likes },
                { label:'Followers', val: myScore.followers   },
              ].map(({ label, val }) => (
                <div key={label} style={{ background:'var(--bg-input)', borderRadius:8, padding:'8px 4px', textAlign:'center' }}>
                  <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>{val ?? 0}</div>
                  <div style={{ fontSize:10.5, color:'var(--text-muted)', marginTop:1 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trending hashtags */}
      <div className="nx-widget">
        <div className="nx-widget-header">
          <span className="nx-widget-title"><TrendingUp size={13}/> Trending</span>
          <Link to="/hashtags" style={{ fontSize:11.5, color:'var(--primary)', fontWeight:600 }}>See all</Link>
        </div>
        <div style={{ padding:'8px 0 4px' }}>
          {trending.length === 0 ? (
            <p style={{ padding:'8px 14px', fontSize:13, color:'var(--text-muted)' }}>No trending topics yet</p>
          ) : trending.map((t, i) => (
            <Link key={t.tag} to={`/hashtags?tag=${t.tag}`}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', textDecoration:'none', transition:'background .13s' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'var(--primary-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Hash size={12} color="var(--primary)" />
                </div>
                <span style={{ fontSize:13.5, fontWeight:600, color:'var(--text-primary)' }}>#{t.tag}</span>
              </div>
              <span style={{ fontSize:11.5, color:'var(--text-muted)', fontWeight:500 }}>{t.post_count} posts</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Who to follow */}
      <div className="nx-widget">
        <div className="nx-widget-header">
          <span className="nx-widget-title"><Users size={13}/> Who to Follow</span>
          <Link to="/leaderboard" style={{ fontSize:11.5, color:'var(--primary)', fontWeight:600 }}>See all</Link>
        </div>
        <div>
          {people.length === 0 ? (
            <p style={{ padding:'12px 14px', fontSize:13, color:'var(--text-muted)' }}>No suggestions yet</p>
          ) : people.map(u => <UserChip key={u.id} user={u} />)}
        </div>
      </div>

      {/* System Status */}
      <div className="nx-widget">
        <div className="nx-widget-header">
          <span className="nx-widget-title"><Zap size={13}/> Platform Status</span>
        </div>
        <div style={{ padding:'10px 14px 12px', display:'flex', flexDirection:'column', gap:9 }}>
          {[
            { color:'var(--success)', text:'All systems operational' },
            { color:'var(--primary)', text:'AI moderation active'    },
            { color:'var(--success)', text:'Parental controls online' },
          ].map(({ color, text }) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-secondary)' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0 }}/>
              {text}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
