import { useState, useRef, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Heart } from 'lucide-react'

const EMOJIS = [
  { emoji:'❤️', label:'Love'  },
  { emoji:'👍', label:'Like'  },
  { emoji:'😂', label:'Haha'  },
  { emoji:'😮', label:'Wow'   },
  { emoji:'😢', label:'Sad'   },
  { emoji:'😡', label:'Angry' },
]

export default function ReactionPicker({ postId, myEmoji, reactionCounts = [], onReacted }) {
  const [show,    setShow]    = useState(false)
  const [current, setCurrent] = useState(myEmoji || null)
  const [counts,  setCounts]  = useState(reactionCounts)
  const [hovered, setHovered] = useState(null)
  const [loading, setLoading] = useState(false)
  const ref   = useRef(null)
  const timer = useRef(null)

  /* close on outside click */
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const react = async emoji => {
    if (loading) return
    setShow(false)
    setLoading(true)

    /* optimistic update */
    const prev = current
    const isToggleOff = current === emoji
    setCurrent(isToggleOff ? null : emoji)
    setCounts(c => {
      let updated = c.map(r => ({ ...r, count: parseInt(r.count) }))
      /* remove old reaction */
      if (prev) updated = updated.map(r => r.emoji === prev ? { ...r, count: Math.max(0, r.count - 1) } : r)
      /* add new reaction */
      if (!isToggleOff) {
        const existing = updated.find(r => r.emoji === emoji)
        if (existing) updated = updated.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
        else updated = [...updated, { emoji, count: 1 }]
      }
      return updated.filter(r => r.count > 0)
    })

    try {
      const r = await api.post(`/posts/${postId}/react`, { emoji })
      const d = r.data.data
      setCurrent(d.reacted ? d.emoji : null)
      /* refresh real counts */
      api.get(`/posts/${postId}/reactions`)
        .then(r2 => setCounts(r2.data.data?.reactions || []))
        .catch(() => {})
      onReacted?.(d)
    } catch {
      /* rollback on error */
      setCurrent(prev)
      toast.error('Failed to react')
    } finally {
      setLoading(false)
    }
  }

  const total    = counts.reduce((s, r) => s + parseInt(r.count || 0), 0)
  const topEmoji = counts.sort((a,b) => b.count - a.count).slice(0,3).map(r => r.emoji)

  return (
    <div ref={ref} style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      <button
        className={`post-act-btn${current ? ' liked' : ''}`}
        onMouseEnter={() => { clearTimeout(timer.current); timer.current = setTimeout(() => setShow(true), 280) }}
        onMouseLeave={() => { clearTimeout(timer.current); timer.current = setTimeout(() => setShow(false), 380) }}
        onClick={() => current ? react(current) : react('❤️')}
        disabled={loading}
        style={{ gap:5, opacity: loading ? .7 : 1, transition:'opacity .15s' }}>
        {current
          ? <span style={{ fontSize:16, lineHeight:1 }}>{current}</span>
          : <Heart size={17} strokeWidth={1.8}/>
        }
        <span style={{ minWidth:16, textAlign:'left' }}>
          {total > 0 ? (
            <span style={{ display:'flex', alignItems:'center', gap:2 }}>
              {topEmoji.map((e,i) => <span key={i} style={{ fontSize:12 }}>{e}</span>)}
              <span style={{ marginLeft:1 }}>{total}</span>
            </span>
          ) : (
            current ? 'Liked' : 'Like'
          )}
        </span>
      </button>

      {/* Emoji picker popup */}
      {show && (
        <div
          onMouseEnter={() => clearTimeout(timer.current)}
          onMouseLeave={() => { timer.current = setTimeout(() => setShow(false), 380) }}
          style={{
            position:'absolute', bottom:'calc(100% + 10px)', left:0,
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:40, padding:'8px 10px',
            display:'flex', gap:4,
            boxShadow:'var(--shadow-lg)',
            zIndex:300, animation:'scaleIn .15s ease',
            transformOrigin:'bottom left',
          }}>
          {EMOJIS.map(({ emoji, label }) => (
            <button key={emoji} onClick={() => react(emoji)}
              onMouseEnter={() => setHovered(emoji)}
              onMouseLeave={() => setHovered(null)}
              title={label}
              style={{
                width:38, height:38, borderRadius:'50%', border:'none',
                background: current === emoji ? 'var(--primary-light)' : 'transparent',
                cursor:'pointer', fontSize:22,
                display:'flex', alignItems:'center', justifyContent:'center',
                transform: hovered === emoji ? 'scale(1.4) translateY(-5px)' : 'scale(1)',
                transition:'transform .14s ease',
              }}>
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
