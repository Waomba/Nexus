import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'

function StoryRing({ group, onClick, isOwn }) {
  const initial = group.name?.[0]?.toUpperCase() || '?'
  return (
    <button onClick={() => onClick(group)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', minWidth: 64 }}>
      <div style={{
        width: 58, height: 58, borderRadius: '50%', padding: 2, flexShrink: 0,
        background: group.has_unseen
          ? 'linear-gradient(135deg, #4F46E5, #0EA5E9)'
          : isOwn ? 'var(--border)' : '#CBD5E1',
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2.5px solid white', overflow: 'hidden', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
          {group.avatar
            ? <img src={group.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initial}
        </div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
        {isOwn ? 'Your story' : group.username}
      </span>
    </button>
  )
}

function StoryViewer({ group, onClose, onNext, onPrev, hasPrev, hasNext }) {
  const [idx, setIdx] = useState(0)
  const story = group.stories[idx]
  const pct = ((idx + 1) / group.stories.length) * 100

  useEffect(() => {
    api.post(`/stories/${story.id}/view`).catch(() => {})
    const t = setTimeout(() => {
      if (idx < group.stories.length - 1) setIdx(i => i + 1)
      else if (hasNext) onNext()
      else onClose()
    }, 5000)
    return () => clearTimeout(t)
  }, [idx, story.id])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div style={{ width: 380, maxHeight: '90vh', position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#111' }}>
        {/* Progress bars */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
          {group.stories.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }}>
              <div style={{ height: '100%', borderRadius: 2, background: '#fff', width: i < idx ? '100%' : i === idx ? `${pct}%` : '0%', transition: i === idx ? 'none' : undefined }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ position: 'absolute', top: 28, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid white', overflow: 'hidden', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
            {story.avatar ? <img src={story.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : story.name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{story.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>@{story.username}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>

        {/* Media */}
        {story.media_type === 'video'
          ? <video src={story.media} autoPlay muted style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
          : <img src={story.media} alt="" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
        }

        {/* Caption */}
        {story.caption && (
          <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, color: '#fff', fontSize: 14, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {story.caption}
          </div>
        )}

        {/* Nav areas */}
        <div onClick={() => { if (idx > 0) setIdx(i => i - 1); else if (hasPrev) onPrev(); }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', cursor: 'pointer' }} />
        <div onClick={() => { if (idx < group.stories.length - 1) setIdx(i => i + 1); else if (hasNext) onNext(); else onClose(); }}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', cursor: 'pointer' }} />
      </div>

      {hasPrev && <button onClick={onPrev} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={22} /></button>}
      {hasNext && <button onClick={onNext} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><ChevronRight size={22} /></button>}
    </div>
  )
}

export default function StoriesBar({ onNewStory }) {
  const { user } = useAuth()
  const [groups, setGroups]       = useState([])
  const [viewing, setViewing]     = useState(null) // index into groups
  const [showAdd, setShowAdd]     = useState(false)
  const [storyUrl, setStoryUrl]   = useState('')
  const [caption, setCaption]     = useState('')
  const [posting, setPosting]     = useState(false)

  useEffect(() => {
    api.get('/stories/feed').then(r => setGroups(r.data.data || [])).catch(() => {})
  }, [])

  const postStory = async e => {
    e.preventDefault()
    if (!storyUrl.trim()) return toast.error('Add a media URL')
    setPosting(true)
    try {
      await api.post('/stories', { media: storyUrl, caption, media_type: storyUrl.match(/\.(mp4|webm|ogg)/i) ? 'video' : 'image' })
      toast.success('Story posted! Visible for 24 hours.')
      setShowAdd(false); setStoryUrl(''); setCaption('')
      api.get('/stories/feed').then(r => setGroups(r.data.data || []))
    } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setPosting(false) }
  }

  return (
    <>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {/* Add story button */}
          <button onClick={() => setShowAdd(s => !s)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', minWidth: 64 }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--primary-light)', border: '2px dashed var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={22} color="var(--primary)" />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Add story</span>
          </button>

          {/* Story rings */}
          {groups.map((g, i) => (
            <StoryRing key={g.user_id} group={g} onClick={() => setViewing(i)} isOwn={g.user_id == user?.id} />
          ))}

          {groups.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8, color: 'var(--text-muted)', fontSize: 13 }}>
              No stories yet — be the first!
            </div>
          )}
        </div>

        {/* Add story form */}
        {showAdd && (
          <form onSubmit={postStory} style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input className="form-control" placeholder="Image or video URL…" value={storyUrl} onChange={e => setStoryUrl(e.target.value)} style={{ flex: 2 }} required />
              <input className="form-control" placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} style={{ flex: 2 }} maxLength={200} />
              <button className="btn btn-primary btn-sm" type="submit" disabled={posting}>
                {posting ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : 'Post'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Story viewer */}
      {viewing !== null && groups[viewing] && (
        <StoryViewer
          group={groups[viewing]}
          onClose={() => setViewing(null)}
          onNext={() => setViewing(i => i < groups.length - 1 ? i + 1 : null)}
          onPrev={() => setViewing(i => i > 0 ? i - 1 : null)}
          hasNext={viewing < groups.length - 1}
          hasPrev={viewing > 0}
        />
      )}
    </>
  )
}
