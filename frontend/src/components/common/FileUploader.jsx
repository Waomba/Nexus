import { useState, useRef, useCallback } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Upload, X, CheckCircle, Image, Film } from 'lucide-react'

/**
 * FileUploader — real drag-and-drop file upload
 * Calls POST /api/upload, returns { url, media_type }
 *
 * Props:
 *   onUploaded(url, media_type) — called when upload completes
 *   accept — 'image' | 'video' | 'both'
 *   label  — field label text
 *   compact — smaller inline version
 */
export default function FileUploader({ onUploaded, accept = 'both', label, compact = false }) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState(null)  // { url, type }
  const [uploaded,  setUploaded]  = useState(null)  // server URL
  const [progress,  setProgress]  = useState(0)
  const inputRef = useRef(null)

  const accept_attr = accept === 'image'
    ? 'image/jpeg,image/png,image/gif,image/webp'
    : accept === 'video'
    ? 'video/mp4,video/webm,video/ogg,video/quicktime'
    : 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg,video/quicktime'

  const uploadFile = useCallback(async file => {
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) return toast.error('Unsupported file type')
    if (accept === 'image' && !isImage) return toast.error('Only images allowed here')
    if (accept === 'video' && !isVideo) return toast.error('Only videos allowed here')
    if (file.size > 50 * 1024 * 1024) return toast.error('File too large — max 50MB')

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview({ url: objectUrl, type: isImage ? 'image' : 'video' })
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Use XMLHttpRequest for progress tracking
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload')

        const token = localStorage.getItem('nexus_token')
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90))
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)) }
            catch { reject(new Error('Invalid response')) }
          } else {
            try { reject(new Error(JSON.parse(xhr.responseText)?.error || 'Upload failed')) }
            catch { reject(new Error('Upload failed')) }
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.send(formData)
      })

      setProgress(100)
      const { url, media_type } = result.data
      setUploaded(url)
      onUploaded?.(url, media_type)
      toast.success('File uploaded!')
    } catch(err) {
      toast.error(err.message || 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }, [accept, onUploaded])

  const onDrop = e => {
    e.preventDefault()
    setDragging(false)
    uploadFile(e.dataTransfer.files?.[0])
  }

  const clear = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null); setUploaded(null); setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
    onUploaded?.(null, null)
  }

  if (compact && uploaded) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:'var(--primary-dim)', border:'1px solid rgba(0,229,255,.2)', borderRadius:'var(--radius-md)' }}>
        {preview?.type === 'image' ? <Image size={14} color="var(--nx-cyan)"/> : <Film size={14} color="var(--nx-cyan)"/>}
        <span style={{ fontSize:12.5, color:'var(--nx-cyan)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>File uploaded ✓</span>
        <button onClick={clear} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--nx-text2)', display:'flex', padding:0 }}><X size={14}/></button>
      </div>
    )
  }

  return (
    <div>
      {label && <label className="form-label" style={{ marginBottom:'0.5rem' }}>{label}</label>}

      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--nx-cyan)' : 'rgba(0,229,255,.2)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: compact ? '1rem' : '2rem',
            textAlign: 'center', cursor: 'pointer',
            background: dragging ? 'var(--primary-dim)' : 'rgba(0,229,255,.03)',
            transition: 'all .2s',
          }}
        >
          <div style={{ width:48, height:48, borderRadius:14, background:'var(--primary-dim)', border:'1px solid rgba(124,77,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <Upload size={22} color="var(--nx-violet)" />
          </div>
          <p style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:4 }}>
            {dragging ? 'Drop it here!' : 'Drop file or click to browse'}
          </p>
          <p style={{ fontSize:12.5, color:'var(--nx-text3)' }}>
            {accept === 'image' ? 'JPEG, PNG, GIF, WebP' : accept === 'video' ? 'MP4, WebM, OGG' : 'Images or Videos'} — max 50MB
          </p>
          <input ref={inputRef} type="file" accept={accept_attr} style={{ display:'none' }}
            onChange={e => uploadFile(e.target.files?.[0])} />
        </div>
      ) : (
        <div style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--bg-hover)', position:'relative' }}>
          {preview.type === 'image'
            ? <img src={preview.url} alt="" style={{ width:'100%', maxHeight:260, objectFit:'cover', display:'block' }} />
            : <video src={preview.url} controls style={{ width:'100%', maxHeight:240, display:'block', background:'#000' }} />
          }

          {/* Upload progress overlay */}
          {uploading && (
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
              <div style={{ width:'60%', height:4, background:'var(--border-strong)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg, var(--nx-violet), var(--nx-cyan))', width:`${progress}%`, transition:'width .3s ease', borderRadius:99 }}/>
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{progress}% uploading…</span>
            </div>
          )}

          {/* Top-right controls */}
          <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:6 }}>
            {uploaded && !uploading && (
              <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(0,224,150,.9)', borderRadius:999, padding:'4px 10px', fontSize:12, fontWeight:700, color:'#fff' }}>
                <CheckCircle size={12}/> Uploaded
              </div>
            )}
            <button onClick={clear} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.65)', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={14}/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
