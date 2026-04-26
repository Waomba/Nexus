import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../utils/api'
import { Avatar } from '../../components/Post/PostCard'
import { Search, User, FileText, Briefcase, Video, X } from 'lucide-react'

function Section({ icon: Icon, label, count, children }) {
  if (!count) return null
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, paddingBottom:8, borderBottom:'1px solid var(--border)' }}>
        <Icon size={14} color="var(--primary)" />
        <span style={{ fontWeight:700, fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text-secondary)' }}>{label}</span>
        <span className="badge badge-primary" style={{ marginLeft:'auto' }}>{count}</span>
      </div>
      {children}
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery]   = useState(searchParams.get('q') || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (query.length < 2) { setResults(null); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await api.get(`/search?q=${encodeURIComponent(query)}`)
        setResults(r.data.data)
        setSearchParams({ q: query }, { replace: true })
      } catch { setResults(null) }
      finally { setLoading(false) }
    }, 350)
    return () => clearTimeout(timerRef.current)
  }, [query])

  const hasResults = results && (results.users?.length || results.posts?.length || results.tasks?.length || results.videos?.length)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Search</h1>
      <div style={{ position:'relative', marginBottom:24 }}>
        <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
        <input ref={inputRef} className="form-control" style={{ paddingLeft:42, paddingRight:42, borderRadius:'var(--radius-pill)', fontSize:15 }}
          placeholder="Search people, posts, tasks, videos…"
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && (
          <button onClick={() => setQuery('')} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
            <X size={16} />
          </button>
        )}
      </div>
      {loading && <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }} /></div>}
      {!loading && query.length < 2 && (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-secondary)' }}>
          <Search size={40} style={{ margin:'0 auto 1rem', opacity:.3 }} />
          <p>Type at least 2 characters to search</p>
        </div>
      )}
      {!loading && query.length >= 2 && results && !hasResults && (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-secondary)' }}>
          <p style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>No results for "{query}"</p>
          <p style={{ fontSize:13.5 }}>Try different keywords</p>
        </div>
      )}
      {!loading && results && (
        <div className="fade-in">
          <Section icon={User} label="People" count={results.users?.length}>
            {results.users?.map(u => (
              <Link key={u.id} to={`/profile/${u.id}`} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, marginBottom:4, textDecoration:'none', transition:'background .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <Avatar user={u} size={44} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{u.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>@{u.username}</div>
                  {u.bio && <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.bio}</div>}
                </div>
                <span className="badge badge-muted">Trust {u.trust_score}</span>
              </Link>
            ))}
          </Section>
          <Section icon={FileText} label="Posts" count={results.posts?.length}>
            {results.posts?.map(p => (
              <div key={p.id} className="card" style={{ marginBottom:8, padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <Avatar user={{ name:p.name, avatar:p.avatar }} size={26} />
                  <span style={{ fontWeight:600, fontSize:13 }}>{p.name}</span>
                  <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-muted)' }}>❤️ {p.likes}</span>
                </div>
                <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.6 }}>
                  {p.content?.length > 160 ? p.content.slice(0,160)+'…' : p.content}
                </p>
              </div>
            ))}
          </Section>
          <Section icon={Briefcase} label="Tasks" count={results.tasks?.length}>
            {results.tasks?.map(t => (
              <div key={t.id} className="card" style={{ marginBottom:8, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:600, fontSize:14 }}>{t.title}</span>
                  {t.budget > 0 && <span className="badge badge-success">${parseFloat(t.budget).toFixed(2)}</span>}
                </div>
                <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:4 }}>
                  {t.description?.slice(0,100)}{t.description?.length > 100 ? '…' : ''}
                </p>
              </div>
            ))}
          </Section>
          <Section icon={Video} label="Videos" count={results.videos?.length}>
            {results.videos?.map(v => (
              <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, marginBottom:4 }}>
                <div style={{ width:60, height:42, background:'var(--bg)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                  {v.thumbnail ? <img src={v.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🎬'}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13.5 }}>{v.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{v.username} · {v.views} views</div>
                </div>
              </div>
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}
