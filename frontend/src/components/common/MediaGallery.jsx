import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react'

export default function MediaGallery({ items = [], startIndex = 0, onClose }) {
  const [index, setIndex]   = useState(startIndex)
  const [zoom,  setZoom]    = useState(1)
  const [pan,   setPan]     = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)

  const current = items[index]

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
      if (e.key === '+')           setZoom(z => Math.min(z + 0.25, 4))
      if (e.key === '-')           setZoom(z => Math.max(z - 0.25, 0.5))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [index])

  const prev = () => { if (index > 0) { setIndex(i => i - 1); resetZoom() } }
  const next = () => { if (index < items.length - 1) { setIndex(i => i + 1); resetZoom() } }
  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  if (!current) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,.6), transparent)', zIndex: 10 }}>
        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>
          {index + 1} / {items.length}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} style={iconBtn}><ZoomOut size={18} /></button>
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} style={iconBtn}><ZoomIn size={18} /></button>
          <button onClick={() => { const a = document.createElement('a'); a.href = current.url; a.download = ''; a.click() }} style={iconBtn}><Download size={18} /></button>
          <button onClick={onClose} style={{ ...iconBtn, marginLeft: 8 }}><X size={20} /></button>
        </div>
      </div>

      {/* Prev */}
      {index > 0 && (
        <button onClick={prev} style={{ ...navBtn, left: 16 }}><ChevronLeft size={28} /></button>
      )}

      {/* Media */}
      <div style={{ maxWidth: '90vw', maxHeight: '85vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {current.type === 'video' ? (
          <video src={current.url} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
        ) : (
          <img
            src={current.url}
            alt={current.alt || ''}
            style={{
              maxWidth: '90vw', maxHeight: '85vh',
              objectFit: 'contain', borderRadius: 8,
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transition: dragging ? 'none' : 'transform .2s ease',
              cursor: zoom > 1 ? 'grab' : 'default',
              userSelect: 'none',
            }}
            onMouseDown={e => { if (zoom > 1) { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }) } }}
            onMouseMove={e => { if (dragging && dragStart) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onDoubleClick={() => { if (zoom === 1) setZoom(2); else resetZoom() }}
            draggable={false}
          />
        )}
      </div>

      {/* Next */}
      {index < items.length - 1 && (
        <button onClick={next} style={{ ...navBtn, right: 16 }}><ChevronRight size={28} /></button>
      )}

      {/* Caption */}
      {current.caption && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,.7), transparent)', color: '#fff', fontSize: 14, textAlign: 'center' }}>
          {current.caption}
        </div>
      )}

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,.6)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, maxWidth: '80vw', overflowX: 'auto' }}>
          {items.map((item, i) => (
            <button key={i} onClick={() => { setIndex(i); resetZoom() }}
              style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: `2.5px solid ${i === index ? '#fff' : 'transparent'}`, padding: 0, cursor: 'pointer', background: '#000' }}>
              {item.type === 'video'
                ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>▶</div>
                : <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const iconBtn = {
  width: 36, height: 36, borderRadius: '50%', border: 'none',
  background: 'var(--border-strong)', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'background .15s',
}

const navBtn = {
  position: 'absolute', width: 48, height: 48, borderRadius: '50%',
  border: 'none', background: 'var(--border-strong)', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', zIndex: 10, transition: 'background .15s',
}
