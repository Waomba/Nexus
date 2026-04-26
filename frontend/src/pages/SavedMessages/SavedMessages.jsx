import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Bookmark, Plus, Trash2, Send, Image } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import FileUploader from '../../components/common/FileUploader'

export default function SavedMessages() {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [content,  setContent]  = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [showMedia,setShowMedia]= useState(false)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    api.get('/saved-messages')
      .then(r => setMessages(r.data.data || []))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const r = await api.post('/saved-messages', { content, media: mediaUrl || undefined })
      setMessages(m => [r.data.data, ...m])
      setContent(''); setMediaUrl(''); setShowMedia(false)
      toast.success('Saved! 📌')
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const del = async id => {
    await api.delete(`/saved-messages/${id}`).catch(() => {})
    setMessages(m => m.filter(x => x.id !== id))
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-dim)', border: '1px solid rgba(0,229,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bookmark size={20} color="var(--nx-cyan)" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--nx-text)' }}>Saved Messages</h1>
          <p style={{ fontSize: 12.5, color: 'var(--nx-text3)', marginTop: 1 }}>Your personal notes and saved content</p>
        </div>
      </div>

      {/* Compose */}
      <div className="stream-card" style={{ padding: '14px 16px', marginBottom: 16 }}>
        <textarea
          className="form-control" style={{ border: 'none', background: 'transparent', resize: 'none', fontSize: 14.5, outline: 'none', padding: 0, marginBottom: 4 }}
          placeholder="Save a note, link, idea…" rows={3} value={content} onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) save() }}
        />
        {showMedia && (
          <div style={{ marginBottom: 10 }}>
            <FileUploader accept="both" onUploaded={(url) => setMediaUrl(url || '')} compact />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--nx-surface)', paddingTop: 10 }}>
          <button onClick={() => setShowMedia(s => !s)} style={{ background: showMedia ? 'var(--primary-dim)' : 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: 8, color: showMedia ? 'var(--nx-cyan)' : 'var(--nx-text2)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontFamily: 'var(--font)', transition: 'all .15s' }}>
            <Image size={14} /> Attach
          </button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || !content.trim()} style={{ gap: 5 }}>
            {saving ? <span className="spinner" style={{ width: 13, height: 13, borderTopColor: '#fff' }} /> : <><Send size={12} /> Save</>}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : messages.length === 0 ? (
        <div className="nx-feed-empty">
          <div className="nx-feed-empty-icon"><Bookmark size={28} color="var(--nx-cyan)" /></div>
          <div className="nx-feed-empty-title">Nothing saved yet</div>
          <p className="nx-feed-empty-sub">Use this as your personal notepad — ideas, links, reminders, anything.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map(m => (
            <div key={m.id} className="stream-card fade-in" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <p style={{ fontSize: 14.5, color: 'var(--nx-text)', lineHeight: 1.65, flex: 1, margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                <button onClick={() => del(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nx-text3)', padding: 4, borderRadius: 6, display: 'flex', flexShrink: 0, transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--nx-red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--nx-text3)'}>
                  <Trash2 size={15} />
                </button>
              </div>
              {m.media && (
                <img src={m.media} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginTop: 10, display: 'block' }} onError={e => e.target.style.display = 'none'} />
              )}
              <div style={{ fontSize: 11, color: 'var(--nx-text3)', marginTop: 8 }}>
                {m.created_at ? formatDistanceToNow(new Date(m.created_at), { addSuffix: true }) : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
