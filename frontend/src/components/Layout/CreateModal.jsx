import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { X, Image, Send, Film, BarChart2, Plus, Trash2, Globe, Users, Lock } from 'lucide-react'
import { Avatar } from '../Post/PostCard'
import FileUploader from '../common/FileUploader'

const VISIBILITY_OPTIONS = [
  { value:'public',  icon:<Globe size={13}/>,  label:'Public',   sub:'Anyone can see this' },
  { value:'friends', icon:<Users size={13}/>,  label:'Friends',  sub:'Your followers only' },
  { value:'only_me', icon:<Lock size={13}/>,   label:'Only Me',  sub:'Only you can see this' },
]

export default function CreateModal({ mode = 'post', onClose, onCreated }) {
  const { user } = useAuth()
  const isStory  = mode === 'story'

  const [content,    setContent]    = useState('')
  const [mediaUrl,   setMediaUrl]   = useState('')
  const [mediaType,  setMediaType]  = useState('none')
  const [caption,    setCaption]    = useState('')
  const [showMedia,  setShowMedia]  = useState(isStory)
  const [showPoll,   setShowPoll]   = useState(false)
  const [pollQ,      setPollQ]      = useState('')
  const [pollOpts,   setPollOpts]   = useState(['', ''])
  const [loading,    setLoading]    = useState(false)
  const [charCount,  setCharCount]  = useState(0)
  const [visibility, setVisibility] = useState('public')
  const [showVis,    setShowVis]    = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const MAX_CHARS = 500

  const handleContent = e => {
    const v = e.target.value
    if (v.length <= MAX_CHARS) { setContent(v); setCharCount(v.length) }
  }

  const handleUploaded = (url, type) => {
    setMediaUrl(url || '')
    setMediaType(url ? type : 'none')
    setUploading(false)
  }

  /* ── Handle direct file input (drag or click) ─────────── */
  const handleFileChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const r   = await api.post('/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      const url = r.data.data?.url
      if (!url) throw new Error('No URL returned')
      const type = file.type.startsWith('video') ? 'video' : 'image'
      setMediaUrl(url)
      setMediaType(type)
      toast.success('Media uploaded! ✅')
    } catch {
      toast.error('Upload failed — try again')
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    if (isStory) {
      if (!mediaUrl.trim()) return toast.error('Upload an image or video for your story')
      setLoading(true)
      try {
        await api.post('/stories', { media:mediaUrl, caption, media_type:mediaType })
        toast.success('Story posted! 🌟 Visible for 24 hours')
        onCreated?.(); onClose()
      } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
      finally { setLoading(false) }
    } else {
      if (!content.trim()) return toast.error('Write something first')
      setLoading(true)
      try {
        const r = await api.post('/posts', {
          content,
          media:       mediaUrl   || undefined,
          media_type:  mediaType  !== 'none' ? mediaType : undefined,
          visibility,
        })
        const postId = r.data.data?.id

        /* Attach poll if created */
        if (showPoll && pollQ.trim() && pollOpts.filter(o => o.trim()).length >= 2 && postId) {
          await api.post('/polls', {
            post_id:  postId,
            question: pollQ.trim(),
            options:  pollOpts.filter(o => o.trim()),
          }).catch(() => {})
        }

        toast.success(
          visibility === 'public'  ? '⚡ Published publicly!' :
          visibility === 'friends' ? '👥 Shared with friends!' :
          '🔒 Saved privately!'
        )
        onCreated?.(r.data.data); onClose()
      } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
      finally { setLoading(false) }
    }
  }

  const charPct   = (charCount / MAX_CHARS) * 100
  const charColor = charPct > 90 ? 'var(--danger)' : charPct > 75 ? 'var(--warning)' : 'var(--primary)'
  const setPollOpt   = (i, v) => setPollOpts(o => o.map((x, idx) => idx === i ? v : x))
  const removePollOpt = i => { if (pollOpts.length > 2) setPollOpts(o => o.filter((_, idx) => idx !== i)) }

  const currentVis = VISIBILITY_OPTIONS.find(v => v.value === visibility)

  return (
    <div className="nx-create-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="nx-create-modal" style={{ maxWidth:560 }}>

        {/* ── HEADER ───────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, display:'flex', alignItems:'center',
              justifyContent:'center',
              background: isStory ? 'rgba(245,158,11,.12)' : 'var(--primary-dim)',
              border:`1px solid ${isStory ? 'rgba(245,158,11,.3)' : 'rgba(59,127,235,.25)'}` }}>
              {isStory ? <Film size={16} color="var(--warning)"/> : <Send size={15} color="var(--primary)"/>}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>
                {isStory ? 'New Story' : 'Create Post'}
              </div>
              <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>
                {isStory ? 'Visible for 24 hours' : 'Share with your network'}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer',
              color:'var(--text-muted)', padding:6, borderRadius:8,
              display:'flex', transition:'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <X size={20}/>
          </button>
        </div>

{/* ── BODY ─────────────────────────────────────── */}
<div style={{ padding:'18px 20px' }}>

  {/* User row + visibility selector */}
  {!isStory && (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>

      <Avatar user={user} size={42} />

      {/* IMPORTANT: relative parent for dropdown */}
      <div style={{ flex:1, position:'relative' }}>

        <div style={{ fontWeight:700, fontSize:14.5, color:'var(--text-primary)' }}>
          {user?.name}
        </div>

        {/* Visibility Button */}
        <button
          onClick={() => setShowVis(s => !s)}
          style={{
            display:'flex',
            alignItems:'center',
            gap:5,
            background:'var(--bg-input)',
            border:'1px solid var(--border)',
            borderRadius:'var(--radius-pill, 999px)',
            padding:'3px 10px',
            cursor:'pointer',
            fontFamily:'var(--font)',
            fontSize:12,
            fontWeight:600,
            color:'var(--text-secondary)',
            transition:'all .15s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {currentVis.icon}
          {currentVis.label}
          <span style={{ fontSize:10 }}>▾</span>
        </button>

        {/* Dropdown */}
        {showVis && (
          <div
            style={{
              position:'absolute',
              top:'calc(100% + 6px)',
              left:0,
              background:'var(--bg-card)',
              border:'1px solid var(--border)',
              borderRadius:12,
              boxShadow:'var(--shadow-lg)',
              minWidth:200,
              padding:6,
              zIndex:500,
              animation:'fadeDown .15s ease'
            }}
          >
            {VISIBILITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setVisibility(opt.value);
                  setShowVis(false);
                }}
                style={{
                  display:'flex',
                  alignItems:'center',
                  gap:10,
                  width:'100%',
                  padding:'10px 12px',
                  border:'none',
                  background: visibility === opt.value ? 'var(--primary-light)' : 'none',
                  borderRadius:8,
                  cursor:'pointer',
                  fontFamily:'var(--font)',
                  textAlign:'left',
                  transition:'background .13s'
                }}
                onMouseEnter={e => {
                  if (visibility !== opt.value)
                    e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={e => {
                  if (visibility !== opt.value)
                    e.currentTarget.style.background = 'none';
                }}
              >
                <span
                  style={{
                    width:30,
                    height:30,
                    borderRadius:'50%',
                    background: visibility === opt.value
                      ? 'var(--primary-dim)'
                      : 'var(--bg-input)',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color: visibility === opt.value
                      ? 'var(--primary)'
                      : 'var(--text-secondary)',
                    flexShrink:0
                  }}
                >
                  {opt.icon}
                </span>

                <div>
                  <div style={{
                    fontWeight:600,
                    fontSize:13.5,
                    color: visibility === opt.value
                      ? 'var(--primary)'
                      : 'var(--text-primary)'
                  }}>
                    {opt.label}
                  </div>

                  <div style={{
                    fontSize:11.5,
                    color:'var(--text-muted)',
                    marginTop:1
                  }}>
                    {opt.sub}
                  </div>
                </div>

                {visibility === opt.value && (
                  <span style={{ marginLeft:'auto', color:'var(--primary)', fontWeight:700 }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  )}

  {/* Textarea */}
  {!isStory && (
    <div style={{ position:'relative', marginBottom:4 }}>

      <textarea
        autoFocus
        placeholder="What's on your mind? Use #hashtags to reach more people…"
        value={content}
        onChange={handleContent}
        rows={4}
        style={{
          width:'100%',
          resize:'none',
          fontSize:15.5,
          border:'none',
          background:'transparent',
          outline:'none',
          fontFamily:'var(--font)',
          color:'var(--text-primary)',
          lineHeight:1.65
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) submit();
        }}
      />

      {charCount > 0 && (
        <div style={{
          position:'absolute',
          bottom:8,
          right:0,
          display:'flex',
          alignItems:'center',
          gap:4
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="11" cy="11" r="9" fill="none" stroke="var(--border)" strokeWidth="2"/>
            <circle
              cx="11"
              cy="11"
              r="9"
              fill="none"
              stroke={charColor}
              strokeWidth="2"
              strokeDasharray={`${(charPct/100)*56.5} 56.5`}
              strokeLinecap="round"
            />
          </svg>

          {charCount > MAX_CHARS * 0.9 && (
            <span style={{ fontSize:11, color:charColor, fontWeight:700 }}>
              {MAX_CHARS - charCount}
            </span>
          )}
        </div>
      )}

    </div>
  )}

</div>

          {/* Story caption */}
          {isStory && (
            <textarea
              style={{ width:'100%', resize:'none', fontSize:14, border:'none',
                background:'transparent', outline:'none', fontFamily:'var(--font)',
                color:'var(--text-primary)', lineHeight:1.65, marginBottom:8 }}
              placeholder="Write a caption for your story…"
              rows={2} value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={200}
            />
          )}

          {/* ── MEDIA UPLOAD ──────────────────────────────
              Real file picker — no URL pasting.
              Shows preview once uploaded.
          ──────────────────────────────────────────────── */}
          {(isStory || showMedia) && (
            <div style={{ marginBottom:14 }}>
              {!mediaUrl ? (
                <label
                  style={{ display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', gap:10,
                    border:`2px dashed ${uploading ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius:12, padding:'28px 20px',
                    background: uploading ? 'var(--primary-dim)' : 'var(--bg-input)',
                    cursor:'pointer', transition:'all .2s', textAlign:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-dim)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = uploading ? 'var(--primary)' : 'var(--border)'; e.currentTarget.style.background = uploading ? 'var(--primary-dim)' : 'var(--bg-input)' }}>
                  {uploading ? (
                    <>
                      <span className="spinner" style={{ width:28, height:28 }}/>
                      <span style={{ fontSize:13.5, color:'var(--primary)', fontWeight:600 }}>Uploading…</span>
                    </>
                  ) : (
                    <>
                      <div style={{ width:48, height:48, borderRadius:12,
                        background:'var(--primary-light)', display:'flex',
                        alignItems:'center', justifyContent:'center' }}>
                        <Image size={22} color="var(--primary)"/>
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>
                          Click to upload a photo or video
                        </div>
                        <div style={{ fontSize:12.5, color:'var(--text-muted)', marginTop:3 }}>
                          JPG, PNG, GIF, MP4 · Max 50MB
                        </div>
                      </div>
                    </>
                  )}
                  <input type="file" accept="image/*,video/*"
                    style={{ display:'none' }} onChange={handleFileChange}/>
                </label>
              ) : (
                /* Preview uploaded media */
                <div style={{ position:'relative', borderRadius:12, overflow:'hidden',
                  border:'1px solid var(--border)' }}>
                  {mediaType === 'video'
                    ? <video src={mediaUrl} controls
                        style={{ width:'100%', maxHeight:240, display:'block', background:'#000' }}/>
                    : <img src={mediaUrl} alt="Preview"
                        style={{ width:'100%', maxHeight:280, objectFit:'cover', display:'block' }}
                        onError={e => e.target.src = ''}/>
                  }
                  <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5,
                      background:'rgba(34,197,94,.9)', borderRadius:999,
                      padding:'4px 10px', fontSize:12, fontWeight:700, color:'#fff' }}>
                      ✓ Uploaded
                    </div>
                    <button onClick={() => { setMediaUrl(''); setMediaType('none') }}
                      style={{ width:28, height:28, borderRadius:'50%',
                        background:'rgba(0,0,0,.65)', border:'none', color:'#fff',
                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <X size={14}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Poll builder */}
          {showPoll && !isStory && (
            <div style={{ background:'var(--bg-input)', borderRadius:12,
              padding:'14px 16px', marginBottom:14, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                <BarChart2 size={14} color="var(--primary)"/>
                <span style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>Poll</span>
                <button onClick={() => setShowPoll(false)}
                  style={{ marginLeft:'auto', background:'none', border:'none',
                    cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                  <X size={14}/>
                </button>
              </div>
              <input className="form-control" style={{ marginBottom:8, fontSize:13 }}
                placeholder="Ask your question…" value={pollQ}
                onChange={e => setPollQ(e.target.value)}/>
              {pollOpts.map((opt, i) => (
                <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                  <input className="form-control" style={{ fontSize:13 }}
                    placeholder={`Option ${i + 1}`} value={opt}
                    onChange={e => setPollOpt(i, e.target.value)}/>
                  {pollOpts.length > 2 && (
                    <button onClick={() => removePollOpt(i)}
                      style={{ background:'none', border:'none', color:'var(--danger)',
                        cursor:'pointer', padding:'0 8px', display:'flex', alignItems:'center' }}>
                      <Trash2 size={14}/>
                    </button>
                  )}
                </div>
              ))}
              {pollOpts.length < 4 && (
                <button onClick={() => setPollOpts(o => [...o, ''])}
                  className="btn btn-secondary btn-sm" style={{ fontSize:12, marginTop:2 }}>
                  <Plus size={12}/> Add option
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ───────────────────────────────────── */}
        <div style={{ padding:'10px 20px 16px', borderTop:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
          {!isStory ? (
            <div style={{ display:'flex', gap:4 }}>
              <button
                onClick={() => { setShowMedia(s => !s); setShowPoll(false) }}
                style={{ display:'flex', alignItems:'center', gap:5,
                  background: showMedia ? 'var(--primary-dim)' : 'none',
                  border:'none', cursor:'pointer', padding:'7px 10px', borderRadius:8,
                  fontFamily:'var(--font)',
                  color: showMedia ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize:12.5, fontWeight:500, transition:'all .15s' }}
                onMouseEnter={e => { if (!showMedia) e.currentTarget.style.background='var(--bg-hover)' }}
                onMouseLeave={e => { if (!showMedia) e.currentTarget.style.background='none' }}>
                <Image size={15}/> Photo/Video
              </button>
              <button
                onClick={() => { setShowPoll(s => !s); setShowMedia(false) }}
                style={{ display:'flex', alignItems:'center', gap:5,
                  background: showPoll ? 'var(--primary-dim)' : 'none',
                  border:'none', cursor:'pointer', padding:'7px 10px', borderRadius:8,
                  fontFamily:'var(--font)',
                  color: showPoll ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize:12.5, fontWeight:500, transition:'all .15s' }}
                onMouseEnter={e => { if (!showPoll) e.currentTarget.style.background='var(--bg-hover)' }}
                onMouseLeave={e => { if (!showPoll) e.currentTarget.style.background='none' }}>
                <BarChart2 size={15}/> Poll
              </button>
            </div>
          ) : <div/>}

          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {!isStory && (
              <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>Ctrl+Enter</span>
            )}
            <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={submit}
              disabled={loading || (isStory ? !mediaUrl : !content.trim())}
              className="btn btn-primary btn-sm"
              style={{ minWidth:100 }}>
              {loading
                ? <span className="spinner" style={{ width:14, height:14, borderTopColor:'#fff' }}/>
                : isStory ? '📖 Share Story' : '⚡ Publish'
              }
            </button>
          </div>
        </div>
      </div>
  )
}
