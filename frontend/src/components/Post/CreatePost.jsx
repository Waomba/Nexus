import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Send, Link as LinkIcon, Upload } from 'lucide-react'
import { Avatar } from '../Post/PostCard'
import FileUploader from '../common/FileUploader'

export default function CreatePost({ onCreated }) {
  const { user } = useAuth()
  const [content, setContent]       = useState('')
  const [mediaUrl, setMediaUrl]     = useState('')
  const [mediaType, setMediaType]   = useState('none')
  const [loading, setLoading]       = useState(false)
  const [mediaMode, setMediaMode]   = useState(null) // null | 'url' | 'upload'

  const handleUploaded = (url, type) => {
    setMediaUrl(url || '')
    setMediaType(url ? type : 'none')
  }

  const submit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const r = await api.post('/posts', {
        content,
        media: mediaUrl || undefined,
        media_type: mediaType,
      })
      toast.success('Posted!')
      setContent(''); setMediaUrl(''); setMediaType('none'); setMediaMode(null)
      onCreated?.(r.data.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div className="flex gap-1" style={{ marginBottom: '0.75rem' }}>
        <Avatar user={user} size={38} />
        <textarea
          className="input textarea"
          placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || ''}?`}
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ flex: 1, minHeight: 76, resize: 'none' }}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submit() }}
        />
      </div>

      {/* Media — URL mode */}
      {mediaMode === 'url' && (
        <div className="flex gap-1" style={{ marginBottom: '0.75rem' }}>
          <input
            className="input"
            placeholder="Paste image or video URL…"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
            style={{ flex: 1 }}
          />
          <select className="input" value={mediaType} onChange={e => setMediaType(e.target.value)} style={{ width: 100 }}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      )}

      {/* Media — upload mode */}
      {mediaMode === 'upload' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <FileUploader onUploaded={handleUploaded} accept="both" label="" />
        </div>
      )}

      {/* Preview uploaded */}
      {mediaUrl && mediaMode !== 'upload' && (
        <div style={{ marginBottom: '0.75rem' }}>
          {mediaType === 'image'
            ? <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
            : <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 220, borderRadius: 'var(--radius-sm)' }} />
          }
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          <button
            className={`action-btn ${mediaMode === 'url' ? 'liked' : ''}`}
            onClick={() => setMediaMode(m => m === 'url' ? null : 'url')}
            title="Paste URL"
          >
            <LinkIcon size={15} /> URL
          </button>
          <button
            className={`action-btn ${mediaMode === 'upload' ? 'liked' : ''}`}
            onClick={() => setMediaMode(m => m === 'upload' ? null : 'upload')}
            title="Upload file"
          >
            <Upload size={15} /> Upload
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted">Ctrl+Enter</span>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={loading || !content.trim()}
          >
            {loading
              ? <span className="spinner" style={{ width: 16, height: 16 }} />
              : <><Send size={15} /> Post</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
