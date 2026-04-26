import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import { Send, Search, ArrowLeft, MoreHorizontal, Phone, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

function Avatar({ user, size=42, online=false }) {
  return (
    <div style={{position:'relative',flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:'50%',background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.36,fontWeight:700,overflow:'hidden'}}>
        {user?.avatar?<img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:user?.name?.[0]}
      </div>
      {online && <div style={{width:11,height:11,background:'var(--success)',border:'2px solid var(--bg-card)',borderRadius:'50%',position:'absolute',bottom:1,right:1}}/>}
    </div>
  )
}

function formatMsgDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isToday(d))     return format(d,'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d,'MMM d')
}

function formatSepDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d,'MMMM d, yyyy')
}

export default function Messages() {
  const { user } = useAuth()
  const [convs,       setConvs]       = useState([])
  const [activeConv,  setActiveConv]  = useState(null)
  const [messages,    setMessages]    = useState([])
  const [text,        setText]        = useState('')
  const [loading,     setLoading]     = useState(true)
  const [sending,     setSending]     = useState(false)
  const [searchQ,     setSearchQ]     = useState('')
  const [userSearch,  setUserSearch]  = useState([])
  const [searching,   setSearching]   = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const bottomRef  = useRef(null)
  const pollRef    = useRef(null)
  const inputRef   = useRef(null)

  const loadConvs = useCallback(async () => {
    try { const r = await api.get('/messages'); setConvs(r.data.data||[]) }
    catch {} finally { setLoading(false) }
  }, [])

  const loadMessages = useCallback(async convId => {
    try { const r = await api.get(`/messages/${convId}`); setMessages(r.data.data||[]) }
    catch {}
  }, [])

  useEffect(() => { loadConvs() }, [loadConvs])

  useEffect(() => {
    clearInterval(pollRef.current)
    if (activeConv) {
      loadMessages(activeConv.conversation_id)
      pollRef.current = setInterval(() => loadMessages(activeConv.conversation_id), 4000)
    }
    return () => clearInterval(pollRef.current)
  }, [activeConv?.conversation_id, loadMessages])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  useEffect(() => {
    if (!searchQ.trim()) { setUserSearch([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try { const r = await api.get(`/users/search?q=${encodeURIComponent(searchQ)}`); setUserSearch(r.data.data||[]) }
      catch {} finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [searchQ])

  const openConv = conv => {
    setActiveConv(conv); setShowSidebar(false); setSearchQ(''); setUserSearch([])
    inputRef.current?.focus()
  }

  const startNew = async u => {
    try {
      const r = await api.post('/messages', { receiver_id:u.id, content:'👋 Hey!' })
      const convId = r.data.data.conversation_id
      await loadConvs()
      setActiveConv({ conversation_id:convId, other_user_id:u.id, name:u.name, username:u.username, avatar:u.avatar })
      setShowSidebar(false)
    } catch { toast.error('Failed') }
  }

  const sendMsg = async () => {
    if (!text.trim() || !activeConv || sending) return
    setSending(true)
    const optimistic = { id:Date.now(), sender_id:user.id, content:text, created_at:new Date().toISOString() }
    setMessages(m=>[...m, optimistic])
    const sent = text; setText('')
    try {
      await api.post('/messages', { receiver_id:activeConv.other_user_id, content:sent })
      loadConvs()
    } catch { toast.error('Failed'); setMessages(m=>m.filter(x=>x.id!==optimistic.id)) }
    finally { setSending(false) }
  }

  const handleKey = e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }

  // Group messages by date
  const grouped = []
  let lastDate = null
  messages.forEach(msg => {
    const d = msg.created_at ? format(new Date(msg.created_at),'yyyy-MM-dd') : ''
    if (d !== lastDate) { grouped.push({ type:'sep', date:msg.created_at, key:`sep-${d}` }); lastDate=d }
    grouped.push({ type:'msg', ...msg })
  })

  const filteredConvs = convs.filter(c =>
    !searchQ || c.name?.toLowerCase().includes(searchQ.toLowerCase()) || c.username?.toLowerCase().includes(searchQ.toLowerCase())
  )

  return (
    <div className="msg-layout" style={{height:'calc(100vh - 128px)'}}>
      {/* Sidebar */}
      <aside className={`msg-sidebar${showSidebar||!activeConv?' show':''}`} style={{display:'flex'}}>
        <div className="msg-sidebar-header">
          <div className="msg-sidebar-title">Messages</div>
          <div className="msg-search">
            <Search size={13} className="icon"/>
            <input placeholder="Search or start a new chat…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
          </div>
        </div>

        <div className="msg-list">
          {/* User search results */}
          {searchQ && userSearch.length>0 && (
            <>
              <div style={{padding:'8px 18px 4px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text-muted)'}}>Start conversation</div>
              {userSearch.slice(0,5).map(u=>(
                <div key={u.id} className="msg-conv" onClick={()=>startNew(u)}>
                  <Avatar user={u} size={44}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="msg-conv-name">{u.name}</div>
                    <div className="msg-conv-last">@{u.username}</div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" style={{fontSize:11,padding:'4px 10px',flexShrink:0}} onClick={e=>{e.stopPropagation();startNew(u)}}>Message</button>
                </div>
              ))}
              <div style={{height:1,background:'var(--border)',margin:'4px 18px'}}/>
            </>
          )}

          {loading ? (
            Array(5).fill(0).map((_,i)=>(
              <div key={i} style={{display:'flex',gap:12,padding:'14px 18px',borderBottom:'1px solid rgba(0,0,0,.04)'}}>
                <div style={{width:46,height:46,borderRadius:'50%',background:'var(--bg)',flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{height:12,background:'var(--bg)',borderRadius:4,marginBottom:8,width:'55%'}}/>
                  <div style={{height:11,background:'var(--bg)',borderRadius:4,width:'80%'}}/>
                </div>
              </div>
            ))
          ) : filteredConvs.length===0 && !searchQ ? (
            <div style={{padding:'3rem 1.5rem',textAlign:'center',color:'var(--text-muted)'}}>
              <div style={{fontSize:32,marginBottom:10}}>💬</div>
              <div style={{fontWeight:600,fontSize:14,color:'var(--text-secondary)',marginBottom:4}}>No conversations yet</div>
              <div style={{fontSize:13}}>Search for someone above to start chatting</div>
            </div>
          ) : (
            filteredConvs.map(conv=>(
              <div key={conv.conversation_id}
                className={`msg-conv${activeConv?.conversation_id===conv.conversation_id?' active':''}${conv.unread>0?' unread':''}`}
                onClick={()=>openConv(conv)}>
                <Avatar user={{name:conv.name,avatar:conv.avatar}} size={46} online={Math.random()>.5}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                    <span className="msg-conv-name">{conv.name}</span>
                    <span className="msg-conv-time">{formatMsgDate(conv.last_time)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span className="msg-conv-last">{conv.last_message||'Start chatting'}</span>
                    {conv.unread>0 && <span className="msg-conv-unread">{conv.unread}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      {activeConv ? (
        <div className="msg-chat">
          {/* Chat header */}
          <div className="msg-chat-header">
            <button onClick={()=>setShowSidebar(true)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',display:'flex',marginRight:4,padding:6,borderRadius:8}} className="btn-icon">
              <ArrowLeft size={18}/>
            </button>
            <Avatar user={{name:activeConv.name,avatar:activeConv.avatar}} size={38} online/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>{activeConv.name}</div>
              <div style={{fontSize:12,color:'var(--success)',fontWeight:500}}>● Online</div>
            </div>
            <div style={{display:'flex',gap:4}}>
              <button className="btn btn-ghost btn-icon" title="Voice call" onClick={()=>toast('Voice calls coming soon',{icon:'📞'})}><Phone size={17}/></button>
              <button className="btn btn-ghost btn-icon" title="Video call" onClick={()=>toast('Video calls coming soon',{icon:'📹'})}><Video size={17}/></button>
              <button className="btn btn-ghost btn-icon"><MoreHorizontal size={17}/></button>
            </div>
          </div>

          {/* Messages */}
          <div className="msg-chat-messages">
            {messages.length===0 && (
              <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
                <div style={{fontSize:36,marginBottom:10}}>👋</div>
                <p style={{fontSize:14,fontWeight:500}}>Say hi to {activeConv.name}!</p>
              </div>
            )}
            {grouped.map((item,i) => {
              if (item.type==='sep') return (
                <div key={item.key} className="msg-date-sep">{formatSepDate(item.date)}</div>
              )
              const mine = item.sender_id==user.id
              const showAvatar = !mine && (i===0||grouped[i-1]?.sender_id!==item.sender_id||grouped[i-1]?.type==='sep')
              return (
                <div key={item.id} className={`msg-bubble-wrap ${mine?'mine':'theirs'}`} style={{marginBottom:2}}>
                  <div style={{display:'flex',alignItems:'flex-end',gap:8,flexDirection:mine?'row-reverse':'row'}}>
                    {!mine && (
                      <div style={{width:28,flexShrink:0}}>
                        {showAvatar && <Avatar user={{name:activeConv.name,avatar:activeConv.avatar}} size={28}/>}
                      </div>
                    )}
                    <div>
                      <div className={`msg-bubble ${mine?'mine':'theirs'}`}>{item.content}</div>
                    </div>
                  </div>
                  <div className="msg-bubble-time" style={{textAlign:mine?'right':'left',marginLeft:mine?0:36}}>
                    {item.created_at ? format(new Date(item.created_at),'h:mm a') : ''}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="msg-input-bar">
            <textarea
              ref={inputRef}
              className="msg-input"
              placeholder={`Message ${activeConv.name}…`}
              value={text}
              onChange={e=>setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              style={{height:'auto'}}
            />
            <button className="msg-send-btn" onClick={sendMsg} disabled={!text.trim()||sending}>
              <Send size={17} strokeWidth={2}/>
            </button>
          </div>
        </div>
      ) : (
        <div className="msg-empty">
          <div className="msg-empty-icon">💬</div>
          <div className="msg-empty-title">Your Messages</div>
          <p style={{fontSize:14,color:'var(--text-muted)',maxWidth:280}}>Select a conversation on the left, or search for someone to start a new chat.</p>
        </div>
      )}
    </div>
  )
}
