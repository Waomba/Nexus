import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle, Share2, Trash2, Flag, Bookmark,
  MoreHorizontal, Repeat2, Quote
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import ReactionPicker from './ReactionPicker'
import MediaGallery from '../common/MediaGallery'
import { PollCard } from './PollCard'

/* ── Avatar ──────────────────────────────────────────────── */
export function Avatar({ user, size = 36 }) {
  return user?.avatar
    ? <img src={user.avatar} alt=""
        style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, display:'block' }} />
    : <div style={{ width:size, height:size, borderRadius:'50%',
        background:'var(--primary-light)', color:'var(--primary)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:700, fontSize:size*.36, flexShrink:0,
        border:'1px solid var(--border)' }}>
        {user?.name?.[0]?.toUpperCase() || '?'}
      </div>
}

/* ── Hashtag text renderer ───────────────────────────────── */
function HashtagText({ text }) {
  if (!text) return null
  const parts = text.split(/(#\w+)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('#')
          ? <Link key={i} to={`/hashtags?tag=${part.slice(1)}`}
              style={{ color:'var(--primary)', fontWeight:500, textDecoration:'none' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              {part}
            </Link>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

/* ── Visibility badge ────────────────────────────────────── */
function VisibilityBadge({ visibility }) {
  const map = {
    public:   { icon:'🌐', label:'Public'  },
    friends:  { icon:'👥', label:'Friends' },
    only_me:  { icon:'🔒', label:'Only me' },
  }
  const v = map[visibility] || map.public
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3,
      fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>
      {v.icon} {v.label}
    </span>
  )
}

/* ── Quote post modal ────────────────────────────────────── */
function QuoteModal({ post, onClose, onQuoted }) {
  const [text,    setText]   = useState('')
  const [loading, setLoading]= useState(false)

  const submit = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      await api.post('/reposts/quote', { post_id: post.id, quote: text })
      toast.success('Quote posted!')
      onQuoted?.(); onClose()
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
      zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--bg-card)', borderRadius:16, width:'100%', maxWidth:520, padding:20 }}>
        <h3 style={{ marginBottom:14, fontSize:15, fontWeight:700 }}>Quote post</h3>
        <textarea className="form-control" rows={3} placeholder="Add your thoughts…"
          value={text} onChange={e => setText(e.target.value)}
          style={{ resize:'none', marginBottom:12 }} autoFocus />
        <div style={{ border:'1.5px solid var(--border)', borderRadius:10,
          padding:'10px 14px', marginBottom:14, background:'var(--bg-input)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
            <Avatar user={{ name:post.name, avatar:post.avatar }} size={22}/>
            <span style={{ fontWeight:600, fontSize:12.5 }}>{post.name}</span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>@{post.username}</span>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>
            {post.content?.slice(0,120)}{post.content?.length > 120 ? '…' : ''}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading || !text.trim()}>
            {loading ? <span className="spinner" style={{ width:14, height:14, borderTopColor:'#fff' }}/> : 'Quote'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   POST CARD
════════════════════════════════════════════════════════════ */
export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()

  const [bookmarked,      setBookmarked]      = useState(!!post.bookmarked)
  const [showComments,    setShowComments]    = useState(false)
  const [comments,        setComments]        = useState([])
  const [commentText,     setCommentText]     = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [showMenu,        setShowMenu]        = useState(false)
  const [reposted,        setReposted]        = useState(false)
  const [showQuote,       setShowQuote]       = useState(false)
  const [showRepostMenu,  setShowRepostMenu]  = useState(false)
  const [gallery,         setGallery]         = useState(null)
  const [poll,            setPoll]            = useState(null)
  const [imgError,        setImgError]        = useState(false)

  const menuRef   = useRef(null)
  const repostRef = useRef(null)

  /* Load poll if exists */
  useEffect(() => {
    if (post.id) {
      api.get(`/polls/${post.id}`)
        .then(r => { if (r.data.data?.poll) setPoll(r.data.data) })
        .catch(() => {})
    }
  }, [post.id])

  /* Close menus on outside click */
  useEffect(() => {
    const h = e => {
      if (menuRef.current   && !menuRef.current.contains(e.target))   setShowMenu(false)
      if (repostRef.current && !repostRef.current.contains(e.target)) setShowRepostMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* Bookmark */
  const toggleBookmark = async () => {
    const prev = bookmarked
    setBookmarked(!prev) /* optimistic */
    try {
      const r = await api.post('/bookmarks/toggle', { post_id: post.id })
      setBookmarked(r.data.data.bookmarked)
      toast.success(r.data.data.bookmarked ? '🔖 Saved' : 'Removed', { duration:1200 })
    } catch {
      setBookmarked(prev) /* rollback */
      toast.error('Failed')
    }
  }

  /* Comments */
  const loadComments = async () => {
    if (showComments) { setShowComments(false); return }
    setLoadingComments(true)
    try {
      const r = await api.get(`/posts/${post.id}/comments`)
      setComments(r.data.data || [])
      setShowComments(true)
    } catch { toast.error('Could not load comments') }
    finally { setLoadingComments(false) }
  }

  const addComment = async e => {
    e.preventDefault()
    if (!commentText.trim()) return
    const optimistic = {
      id: Date.now(), content: commentText,
      name: user.name, username: user.username, avatar: user.avatar,
      created_at: new Date().toISOString(),
    }
    setComments(c => [...c, optimistic])
    setCommentText('')
    try {
      await api.post(`/posts/${post.id}/comments`, { content: commentText })
    } catch {
      setComments(c => c.filter(x => x.id !== optimistic.id))
      toast.error('Failed to comment')
    }
  }

  /* Delete */
  const deletePost = async () => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${post.id}`)
      toast.success('Deleted')
      onDelete?.(post.id)
    } catch { toast.error('Failed') }
  }

  /* Report */
  const reportPost = async () => {
    try {
      await api.post('/reports', { content_type:'post', content_id:post.id, reason:'Inappropriate content' })
      toast.success('Reported — thanks!')
    } catch { toast.error('Failed') }
    setShowMenu(false)
  }

  /* Repost */
  const handleRepost = async () => {
    setShowRepostMenu(false)
    try {
      const r = await api.post('/reposts', { post_id: post.id })
      setReposted(r.data.data.reposted)
      toast.success(r.data.data.reposted ? '🔁 Reposted' : 'Repost removed', { duration:1200 })
    } catch { toast.error('Failed') }
  }

  /* Share */
  const sharePost = () => {
    const url = `${window.location.origin}/profile/${post.user_id}`
    if (navigator.share) {
      navigator.share({ title: post.name, text: post.content, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!', { duration:1200 })
    }
  }

  const time = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix:true })
    : ''

  const isMyPost = user?.id == post.user_id

  return (
    <>
      <div className="post-card-v3">

        {/* ── HEADER ─────────────────────────────────────── */}
        <div className="post-header">
          <Link to={`/profile/${post.user_id}`} style={{ flexShrink:0 }}>
            <Avatar user={{ name:post.name, avatar:post.avatar }} size={42}/>
          </Link>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
              <Link to={`/profile/${post.user_id}`}
                style={{ fontWeight:700, fontSize:14.5, color:'var(--text-primary)', textDecoration:'none' }}>
                {post.name}
              </Link>
              {post.is_verified == 1 && (
                <span style={{ width:15, height:15, background:'var(--primary)', borderRadius:'50%',
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontSize:8, color:'#fff', fontWeight:800, flexShrink:0 }}>✓</span>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:1, flexWrap:'wrap' }}>
              <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>
                @{post.username} · {time}
              </span>
              {post.visibility && <VisibilityBadge visibility={post.visibility}/>}
            </div>
          </div>

          {/* ⋮ Three-dot menu */}
          <div ref={menuRef} style={{ position:'relative' }}>
            <button onClick={() => setShowMenu(s => !s)}
              style={{ background:'none', border:'none', cursor:'pointer',
                color:'var(--text-muted)', padding:6, borderRadius:8,
                display:'flex', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-muted)' }}>
              <MoreHorizontal size={17}/>
            </button>
            {showMenu && (
              <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)',
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:12, boxShadow:'var(--shadow-lg)',
                minWidth:175, padding:4, zIndex:200, animation:'fadeDown .15s ease' }}>
                <button onClick={() => { sharePost(); setShowMenu(false) }} style={menuStyle}>
                  <Share2 size={14}/> Share post
                </button>
                <button onClick={() => { toggleBookmark(); setShowMenu(false) }} style={menuStyle}>
                  <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'}/>
                  {bookmarked ? 'Remove bookmark' : 'Save post'}
                </button>
                <div style={{ height:1, background:'var(--border)', margin:'3px 0' }}/>
                {isMyPost
                  ? <button onClick={() => { deletePost(); setShowMenu(false) }}
                      style={{ ...menuStyle, color:'var(--danger)' }}>
                      <Trash2 size={14}/> Delete post
                    </button>
                  : <button onClick={reportPost} style={{ ...menuStyle, color:'var(--danger)' }}>
                      <Flag size={14}/> Report post
                    </button>
                }
              </div>
            )}
          </div>
        </div>

        {/* ── BODY TEXT ──────────────────────────────────── */}
        {post.content && (
          <div className="post-body">
            <HashtagText text={post.content}/>
          </div>
        )}

        {/* ── MEDIA (image / video) ───────────────────────
            If the image errors out we hide gracefully.
            Click to open fullscreen lightbox.
        ─────────────────────────────────────────────────── */}
        {post.media && !imgError && (
          post.media_type === 'video'
            ? <video src={post.media} controls className="post-media-vid"/>
            : <img
                src={post.media}
                alt="Post media"
                className="post-media"
                style={{ cursor:'zoom-in' }}
                onClick={() => setGallery([{ url:post.media, type:'image', caption:post.content?.slice(0,80) }])}
                onError={() => setImgError(true)}
              />
        )}

        {/* ── POLL ───────────────────────────────────────── */}
        {poll && (
          <div style={{ padding:'0 16px' }}>
            <PollCard {...poll}/>
          </div>
        )}

        {/* ── ACTIONS ────────────────────────────────────── */}
        <div className="post-actions">
          {/* Like / Reaction */}
          <ReactionPicker
            postId={post.id}
            myEmoji={post.my_reaction || null}
            reactionCounts={post.reaction_counts || []}
          />

          {/* Comment */}
          <button className="post-act-btn" onClick={loadComments}>
            <MessageCircle size={17} strokeWidth={1.8}/>
            <span>{post.comment_count || 0}</span>
            {loadingComments && <span className="spinner" style={{ width:12, height:12, marginLeft:2 }}/>}
          </button>

          {/* Repost */}
          <div ref={repostRef} style={{ position:'relative' }}>
            <button
              className={`post-act-btn${reposted ? ' liked' : ''}`}
              style={reposted ? { color:'var(--success)' } : {}}
              onClick={() => setShowRepostMenu(s => !s)}>
              <Repeat2 size={17} strokeWidth={1.8}/>
            </button>
            {showRepostMenu && (
              <div style={{ position:'absolute', left:0, top:'calc(100% + 4px)',
                background:'var(--bg-card)', border:'1px solid var(--border)',
                borderRadius:12, boxShadow:'var(--shadow-lg)',
                minWidth:160, padding:4, zIndex:200, animation:'fadeDown .15s ease' }}>
                <button onClick={handleRepost} style={menuStyle}>
                  <Repeat2 size={14}/> {reposted ? 'Undo repost' : 'Repost'}
                </button>
                <button onClick={() => { setShowRepostMenu(false); setShowQuote(true) }} style={menuStyle}>
                  <Quote size={14}/> Quote post
                </button>
              </div>
            )}
          </div>

          {/* Share */}
          <button className="post-act-btn" onClick={sharePost}>
            <Share2 size={17} strokeWidth={1.8}/>
          </button>

          {/* Bookmark */}
          <button
            className={`post-act-btn${bookmarked ? ' saved' : ''}`}
            onClick={toggleBookmark}
            style={{ marginLeft:'auto' }}>
            <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 2 : 1.8}/>
          </button>
        </div>

        {/* ── COMMENTS ───────────────────────────────────── */}
        {showComments && (
          <div style={{ padding:'0 14px 14px', borderTop:'1px solid var(--border)' }}>
            <div style={{ maxHeight:300, overflowY:'auto', paddingTop:12,
              display:'flex', flexDirection:'column', gap:8 }}>
              {comments.length === 0 && (
                <p style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', padding:'8px 0' }}>
                  No comments yet — be the first! 💬
                </p>
              )}
              {comments.map(c => (
                <div key={c.id} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <Avatar user={{ name:c.name, avatar:c.avatar }} size={28}/>
                  <div style={{ flex:1, background:'var(--bg-input)', borderRadius:12, padding:'8px 12px' }}>
                    <span style={{ fontWeight:600, fontSize:13 }}>{c.name} </span>
                    <span style={{ fontSize:13.5 }}>{c.content}</span>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>
                      {c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix:true }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment form */}
            <form onSubmit={addComment}
              style={{ display:'flex', gap:8, marginTop:10, alignItems:'center' }}>
              <Avatar user={user} size={30}/>
              <input
                className="form-control"
                style={{ flex:1, borderRadius:'var(--radius-pill)', height:36,
                  fontSize:13, background:'var(--bg-input)' }}
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" type="submit"
                disabled={!commentText.trim()}
                style={{ borderRadius:'var(--radius-pill)', padding:'0 16px' }}>
                Post
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {gallery && <MediaGallery items={gallery} onClose={() => setGallery(null)}/>}
      {/* Quote modal */}
      {showQuote && <QuoteModal post={post} onClose={() => setShowQuote(false)} onQuoted={() => {}}/>}
    </>
  )
}

const menuStyle = {
  display:'flex', alignItems:'center', gap:8,
  padding:'9px 12px', width:'100%', background:'none',
  border:'none', cursor:'pointer', fontSize:13.5,
  color:'var(--text-secondary)', borderRadius:8,
  fontFamily:'var(--font)', transition:'background .15s', textAlign:'left',
}
