import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import {
  MapPin, Globe, Calendar, MessageCircle,
  Camera, MoreHorizontal, Menu, Shield,
  Check, Edit3, Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

/* ── Avatar helper ───────────────────────────────────────── */
export function Avatar({ user, size = 36 }) {
  return user?.avatar
    ? <img src={user.avatar} alt={user.name}
        style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, display:'block' }} />
    : <div style={{ width:size, height:size, borderRadius:'50%',
        background:'linear-gradient(135deg,var(--primary),var(--accent-teal))',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:700, fontSize:size*.38, flexShrink:0 }}>
        {user?.name?.[0]?.toUpperCase() || '?'}
      </div>
}

/* ── Post grid (Media tab) ───────────────────────────────── */
function PostGrid({ posts }) {
  if (posts.length === 0)
    return <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text-muted)' }}>Nothing here yet</div>
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
      {posts.map(p => (
        <div key={p.id} style={{ aspectRatio:'1', position:'relative', overflow:'hidden',
          background:'var(--bg-input)', cursor:'pointer' }}
          onMouseEnter={e => { const o = e.currentTarget.querySelector('.hov'); if (o) o.style.opacity='1' }}
          onMouseLeave={e => { const o = e.currentTarget.querySelector('.hov'); if (o) o.style.opacity='0' }}>
          {p.media && p.media_type === 'image'
            ? <img src={p.media} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                justifyContent:'center', padding:10 }}>
                <p style={{ fontSize:11, color:'var(--text-secondary)', textAlign:'center', lineHeight:1.4,
                  overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box',
                  WebkitLineClamp:4, WebkitBoxOrient:'vertical' }}>{p.content}</p>
              </div>
          }
          <div className="hov" style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:18,
            opacity:0, transition:'opacity .18s' }}>
            <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>❤️ {p.likes || 0}</span>
            <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>💬 {p.comment_count || 0}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── User list (Followers / Following tabs) ──────────────── */
function UserList({ users, me }) {
  if (users.length === 0)
    return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>Nobody here yet</div>
  return (
    <div>
      {users.map(u => (
        <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px',
          borderBottom:'1px solid var(--border)', transition:'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}>
          <Link to={`/profile/${u.id}`}><Avatar user={u} size={44}/></Link>
          <div style={{ flex:1, minWidth:0 }}>
            <Link to={`/profile/${u.id}`} style={{ fontWeight:600, fontSize:14.5,
              color:'var(--text-primary)', textDecoration:'none', display:'block',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</Link>
            <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>@{u.username}</div>
          </div>
          {me?.id !== u.id && (
            <button className="btn btn-sm btn-outline-primary" style={{ fontSize:12 }}
              onClick={() => api.post(`/users/${u.id}/follow`)
                .then(() => toast.success(`Following ${u.name}`)).catch(() => {})}>
              Follow
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Post feed list ──────────────────────────────────────── */
function PostFeed({ posts }) {
  if (posts.length === 0)
    return <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No posts yet</div>
  return (
    <div>
      {posts.map(p => (
        <div key={p.id} style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)',
          transition:'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}>
          <p style={{ fontSize:14.5, color:'var(--text-primary)', lineHeight:1.65,
            marginBottom: p.media ? 10 : 0, whiteSpace:'pre-wrap' }}>{p.content}</p>
          {p.media && p.media_type === 'image' && (
            <img src={p.media} alt="" style={{ width:'100%', maxHeight:280, objectFit:'cover',
              borderRadius:12, border:'1px solid var(--border)', display:'block' }}
              onError={e => e.target.style.display = 'none'} />
          )}
          <div style={{ display:'flex', gap:20, marginTop:10, color:'var(--text-muted)', fontSize:13 }}>
            <span>❤️ {p.likes || 0}</span>
            <span>💬 {p.comment_count || 0}</span>
            <span style={{ marginLeft:'auto' }}>
              {p.created_at ? format(new Date(p.created_at), 'MMM d, yyyy') : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const TABS = [
  { id:'posts',     label:'Posts'           },
  { id:'replies',   label:'Posts & Replies' },
  { id:'media',     label:'Media'           },
  { id:'followers', label:'Followers'       },
  { id:'following', label:'Following'       },
]

/* ════════════════════════════════════════════════════════════
   MAIN PROFILE COMPONENT
════════════════════════════════════════════════════════════ */
export default function Profile() {
  const { id }      = useParams()
  const { user:me } = useAuth()
  const navigate    = useNavigate()

  const [data,      setData]     = useState(null)
  const [loading,   setLoading]  = useState(true)
  const [following, setFollowing]= useState(false)
  const [tab,       setTab]      = useState('posts')
  const [editing,   setEditing]  = useState(false)
  const [showMore,  setShowMore] = useState(false)
  const [editForm,  setEditForm] = useState({ name:'', bio:'', location:'', website:'' })
  const [uploadingAv, setUA]     = useState(false)
  const tabsRef = useRef(null)

  useEffect(() => {
    setLoading(true); setTab('posts'); setEditing(false)
    api.get(`/users/${id}`)
      .then(r => {
        const d = r.data.data
        setData(d)
        setFollowing(d.isFollowing)
        setEditForm({
          name:     d.user.name     || '',
          bio:      d.user.bio      || '',
          location: d.user.location || '',
          website:  d.user.website  || '',
        })
        api.post(`/profile-views/${id}`).catch(() => {})
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleFollow = async () => {
    try {
      if (following) await api.post(`/users/${id}/unfollow`)
      else           await api.post(`/users/${id}/follow`)
      setFollowing(f => !f)
      toast.success(following ? 'Unfollowed' : 'Following!')
    } catch { toast.error('Failed') }
  }

  const saveEdit = async () => {
    try {
      await api.put('/users/me', editForm)
      setData(d => ({ ...d, user: { ...d.user, ...editForm } }))
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to save') }
  }

  const handleCoverUpload = async file => {
    const fd = new FormData(); fd.append('file', file)
    try {
      const r   = await api.post('/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      const url = r.data.data?.url
      await api.put('/users/me', { cover_photo: url })
      setData(d => ({ ...d, user: { ...d.user, cover_photo: url } }))
      toast.success('Cover updated!')
    } catch { toast.error('Upload failed') }
  }

  const handleAvatarUpload = async file => {
    const fd = new FormData(); fd.append('file', file)
    setUA(true)
    try {
      const r   = await api.post('/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      const url = r.data.data?.url
      await api.post('/auth/update-avatar', { avatar: url })
      setData(d => ({ ...d, user: { ...d.user, avatar: url } }))
      toast.success('Photo updated!')
    } catch { toast.error('Upload failed') }
    setUA(false)
  }

  /* ── Loading skeleton ──────────────────────────────────── */
  if (loading) return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      <div style={{ height:200, background:'var(--bg-input)' }}/>
      <div style={{ padding:'0 20px' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--bg-input)',
          marginTop:-40, border:'4px solid var(--bg-card)', marginBottom:14 }}/>
        <div style={{ height:18, width:160, background:'var(--bg-input)', borderRadius:6, marginBottom:8 }}/>
        <div style={{ height:13, width:100, background:'var(--bg-input)', borderRadius:6 }}/>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
      <p style={{ fontSize:16, fontWeight:600 }}>Profile not found</p>
    </div>
  )

  const { user:profile, followers, following:followingList, posts } = data
  const isMe      = me?.id == profile.id
  const bioText   = profile.bio || ''
  const PREVIEW_LEN = 120
  const bioShown  = showMore || bioText.length <= PREVIEW_LEN
    ? bioText : bioText.slice(0, PREVIEW_LEN) + '…'

  /* ── Reusable floating icon button on cover ─────────────── */
  const CoverBtn = ({ onClick, left, right, top = 14, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        position:'absolute', top, zIndex:10,
        ...(left  != null ? { left  } : {}),
        ...(right != null ? { right } : {}),
        width:36, height:36, borderRadius:'50%',
        background:'rgba(0,0,0,.42)',
        backdropFilter:'blur(8px)',
        WebkitBackdropFilter:'blur(8px)',
        border:'1px solid rgba(255,255,255,.22)',
        color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', transition:'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.68)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.42)'}>
      {children}
    </button>
  )

  /* ── RENDER ────────────────────────────────────────────── */
  return (
    <div style={{
      maxWidth:640, margin:'0 auto',
      background:'var(--bg-card)', minHeight:'100vh',
      borderLeft:'1px solid var(--border)',
      borderRight:'1px solid var(--border)',
    }}>

      {/* ══════════════════════════════════════════════════
          COVER PHOTO
          ≡ Hamburger  top-left  (goes back)
          ⋮ Three dots top-right (share / options)
          Both float ON TOP of the cover image
      ══════════════════════════════════════════════════ */}
      <div style={{
        position:'relative', height:200, overflow:'hidden',
        background:'linear-gradient(135deg,#1d4ed8 0%,#3B7FEB 40%,#0ea5e9 70%,#0DCCB1 100%)',
      }}>

        {/* Cover image (if set) */}
        {profile.cover_photo && (
          <img
            src={profile.cover_photo}
            alt="Cover photo"
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          />
        )}

        {/* ≡ Hamburger — top LEFT */}
        <CoverBtn left={14} top={14} title="Back" onClick={() => navigate(-1)}>
          <Menu size={18} strokeWidth={2.2}/>
        </CoverBtn>

        {/* ⋮ Three dots — top RIGHT */}
        <CoverBtn right={14} top={14} title="Options"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Profile link copied!')
          }}>
          <MoreHorizontal size={18} strokeWidth={2.2}/>
        </CoverBtn>

        {/* 📷 Cover edit button — bottom right, own profile only */}
        {isMe && (
          <label
            title="Change cover photo"
            style={{
              position:'absolute', bottom:12, right:14, zIndex:10,
              width:32, height:32, borderRadius:'50%',
              background:'rgba(0,0,0,.45)',
              backdropFilter:'blur(6px)',
              WebkitBackdropFilter:'blur(6px)',
              border:'1px solid rgba(255,255,255,.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'#fff', transition:'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.72)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.45)'}>
            <ImageIcon size={15}/>
            <input type="file" accept="image/*" style={{ display:'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f) }}/>
          </label>
        )}
      </div>
      {/* END COVER */}

      {/* ══════════════════════════════════════════════════
          PROFILE INFO
      ══════════════════════════════════════════════════ */}
      <div style={{ padding:'0 20px 4px' }}>

        {/* Avatar row — overlaps cover by 44px */}
        <div style={{
          display:'flex', alignItems:'flex-end',
          justifyContent:'space-between',
          marginTop:-44, marginBottom:14,
        }}>

          {/* Avatar circle */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{
              width:84, height:84, borderRadius:'50%',
              border:'4px solid var(--bg-card)',
              overflow:'hidden',
              background:'linear-gradient(135deg,var(--primary),var(--accent-teal))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:30, fontWeight:800, color:'#fff',
              boxShadow:'0 2px 12px rgba(0,0,0,.18)',
            }}>
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                : profile.name?.[0]
              }
            </div>

            {/* Camera edit button on avatar */}
            {isMe && (
              <label
                title="Change profile photo"
                style={{
                  position:'absolute', bottom:2, right:2,
                  width:28, height:28, borderRadius:'50%',
                  background:'var(--primary)',
                  border:'3px solid var(--bg-card)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', color:'#fff', transition:'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}>
                <Camera size={13}/>
                <input type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }}/>
              </label>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:8, paddingBottom:4, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {isMe ? (
              <button
                onClick={() => setEditing(e => !e)}
                style={{
                  height:36, padding:'0 18px', borderRadius:999,
                  border:'1.5px solid var(--border)', background:'none',
                  color:'var(--text-primary)', fontWeight:700, fontSize:13.5,
                  cursor:'pointer', fontFamily:'var(--font)',
                  display:'flex', alignItems:'center', gap:6, transition:'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <Edit3 size={13}/> {editing ? 'Cancel' : 'Edit profile'}
              </button>
            ) : (
              <>
                <Link to="/messages"
                  style={{
                    width:36, height:36, borderRadius:'50%',
                    border:'1.5px solid var(--border)', background:'none',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'var(--text-primary)', transition:'all .15s', textDecoration:'none',
                  }}>
                  <MessageCircle size={17}/>
                </Link>
                <button
                  onClick={toggleFollow}
                  style={{
                    height:36, padding:'0 20px', borderRadius:999,
                    background: following ? 'none' : 'var(--text-primary)',
                    color:      following ? 'var(--text-primary)' : 'var(--bg-card)',
                    fontWeight:700, fontSize:14,
                    cursor:'pointer', fontFamily:'var(--font)',
                    border: following ? '1.5px solid var(--border)' : 'none',
                    transition:'all .15s',
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                  {following ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name + handle */}
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <h2 style={{
              fontSize:20, fontWeight:800, color:'var(--text-primary)',
              letterSpacing:'-.03em', margin:0, lineHeight:1.2,
            }}>{profile.name}</h2>
            {profile.is_verified == 1 && (
              <span style={{
                width:20, height:20, borderRadius:'50%', background:'var(--primary)',
                display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <Check size={12} color="#fff" strokeWidth={3}/>
              </span>
            )}
          </div>
          <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:2 }}>
            @{profile.username}
          </div>
        </div>

        {/* Bio */}
        {!editing && bioText && (
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:14.5, color:'var(--text-secondary)', lineHeight:1.65, marginBottom:4 }}>
              {bioShown}
            </p>
            {bioText.length > PREVIEW_LEN && (
              <button
                onClick={() => setShowMore(s => !s)}
                style={{
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--primary)', fontSize:13.5, fontWeight:600,
                  fontFamily:'var(--font)', padding:0,
                }}>
                {showMore ? 'Show less' : 'View More'}
              </button>
            )}
          </div>
        )}

        {/* Meta info */}
        {!editing && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 16px', marginBottom:12 }}>
            {profile.location && (
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13.5, color:'var(--text-muted)' }}>
                <MapPin size={13}/> {profile.location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', gap:5, fontSize:13.5,
                  color:'var(--primary)', textDecoration:'none', fontWeight:500 }}>
                <Globe size={13}/> {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {profile.created_at && (
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13.5, color:'var(--text-muted)' }}>
                <Calendar size={13}/> Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
              </span>
            )}
            {profile.trust_score != null && (
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13.5, color:'var(--text-muted)' }}>
                <Shield size={13}/> {profile.trust_score} trust
              </span>
            )}
          </div>
        )}

        {/* Following / Followers count */}
        <div style={{ display:'flex', gap:20, marginBottom:14 }}>
          <button
            onClick={() => setTab('following')}
            style={{
              background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font)',
              fontSize:14.5, color:'var(--text-primary)', padding:0,
              display:'flex', gap:4, alignItems:'baseline', transition:'opacity .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <strong style={{ fontWeight:700 }}>{followingList.length}</strong>
            <span style={{ color:'var(--text-muted)' }}>Following</span>
          </button>
          <button
            onClick={() => setTab('followers')}
            style={{
              background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font)',
              fontSize:14.5, color:'var(--text-primary)', padding:0,
              display:'flex', gap:4, alignItems:'baseline', transition:'opacity .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <strong style={{ fontWeight:700 }}>{followers.length}</strong>
            <span style={{ color:'var(--text-muted)' }}>Followers</span>
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{
            background:'var(--bg-input)', borderRadius:14, padding:16, marginBottom:16,
            border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:12,
          }}>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Name</label>
                <input className="form-control" value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name:e.target.value }))}/>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="City, Country" value={editForm.location}
                  onChange={e => setEditForm(f => ({ ...f, location:e.target.value }))}/>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Bio</label>
              <textarea className="form-control" rows={3} style={{ resize:'none' }} maxLength={200}
                value={editForm.bio}
                onChange={e => setEditForm(f => ({ ...f, bio:e.target.value }))}/>
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Website</label>
              <input className="form-control" placeholder="https://yoursite.com" value={editForm.website}
                onChange={e => setEditForm(f => ({ ...f, website:e.target.value }))}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save changes</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          TABS — sticky, underline style
      ══════════════════════════════════════════════════ */}
      <div
        ref={tabsRef}
        style={{
          position:'sticky', top:0, zIndex:40,
          background:'var(--bg-card)',
          borderBottom:'1px solid var(--border)',
          display:'flex', overflowX:'auto', scrollbarWidth:'none',
        }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex:'0 0 auto', padding:'14px 16px',
              border:'none', background:'none',
              fontFamily:'var(--font)', fontSize:14,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor:'pointer',
              borderBottom:`3px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
              transition:'all .15s', whiteSpace:'nowrap', minHeight:48,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB CONTENT
      ══════════════════════════════════════════════════ */}
      <div>
        {tab === 'posts'     && <PostFeed posts={posts}/>}
        {tab === 'replies'   && <PostFeed posts={posts}/>}
        {tab === 'media'     && <PostGrid posts={posts.filter(p => p.media && p.media_type === 'image')}/>}
        {tab === 'followers' && <UserList users={followers} me={me}/>}
        {tab === 'following' && <UserList users={followingList} me={me}/>}
      </div>

    </div>
  )
}
