import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Hash, Users, Plus, Lock, Globe, Crown, Shield, Mic, X, ChevronRight, Settings } from 'lucide-react'

function RoleBadge({ role }) {
  const config = {
    owner:     { label:'Owner',     color:'#FFD700', bg:'rgba(255,215,0,.12)' },
    admin:     { label:'Admin',     color:'var(--nx-cyan)', bg:'var(--primary-dim)' },
    moderator: { label:'Mod',       color:'var(--nx-violet)', bg:'var(--primary-dim)' },
    member:    { label:'Member',    color:'var(--nx-text3)', bg:'var(--bg-hover)' },
  }
  const c = config[role] || config.member
  return <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:999, background:c.bg, color:c.color, border:`1px solid ${c.color}30` }}>{c.label}</span>
}

function GroupDetailModal({ group: g, onClose, currentUserId }) {
  const [members, setMembers] = useState(g.members || [])
  const [channels, setChannels] = useState([])
  const [newChannel, setNewChannel] = useState('')
  const [voiceActive, setVoiceActive] = useState(false)
  const [tab, setTab] = useState('members')

  const myRole = members.find(m => m.id == currentUserId)?.role || 'member'
  const canManage = ['owner','admin'].includes(myRole)

  useEffect(() => {
    api.get(`/groups/${g.id}/channels`).then(r => setChannels(r.data.data || [])).catch(() => {})
  }, [g.id])

  const setRole = async (memberId, role) => {
    try {
      await api.put(`/groups/${g.id}/members/${memberId}/role`, { role })
      setMembers(m => m.map(x => x.id === memberId ? { ...x, role } : x))
      toast.success('Role updated')
    } catch { toast.error('Failed') }
  }

  const createChannel = async () => {
    if (!newChannel.trim()) return
    try {
      const r = await api.post(`/groups/${g.id}/channels`, { name: newChannel.trim().toLowerCase().replace(/\s+/g, '-'), type: 'text' })
      setChannels(c => [...c, r.data.data])
      setNewChannel('')
      toast.success('Channel created')
    } catch { toast.error('Failed') }
  }

  const startVoice = async () => {
    try {
      await api.post(`/groups/${g.id}/voice`)
      setVoiceActive(true)
      toast.success('🎤 Voice room started!')
    } catch { toast.error('Failed') }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(6px)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'rgba(17,19,32,.98)', border:'1px solid var(--bg-hover)', borderRadius:'var(--radius-xl)', width:'100%', maxWidth:620, maxHeight:'85vh', display:'flex', flexDirection:'column', animation:'scaleIn .18s ease' }}>
        {/* Header */}
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--bg-input)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`hsl(${(g.id*47)%360},50%,20%)`, color:`hsl(${(g.id*47)%360},60%,70%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, flexShrink:0 }}>
            {g.name[0].toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:16, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
              {g.name}
              {canManage && <Crown size={13} color="#FFD700" />}
            </div>
            <div style={{ fontSize:12, color:'var(--nx-text3)' }}>{g.member_count} members · {g.is_private?'Private':'Public'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--nx-text2)', padding:4, display:'flex' }}><X size={20}/></button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--bg-hover)', padding:'0 20px', gap:2 }}>
          {['members','channels','voice'].map(t=>(
            <button key={t} onClick={() => setTab(t)} style={{ padding:'10px 14px', background:'none', border:'none', borderBottom:`2px solid ${tab===t?'var(--nx-cyan)':'transparent'}`, marginBottom:-1, color:tab===t?'var(--nx-cyan)':'var(--nx-text2)', fontWeight:tab===t?700:400, fontSize:13.5, cursor:'pointer', fontFamily:'var(--font)', transition:'all .15s', textTransform:'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
          {/* Members tab */}
          {tab==='members' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {members.map(m => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--nx-surface)', borderRadius:10, border:'1px solid var(--bg-hover)' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--accent-teal))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, overflow:'hidden', flexShrink:0 }}>
                    {m.avatar?<img src={m.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:m.name?.[0]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</div>
                    <div style={{ fontSize:11.5, color:'var(--nx-text3)' }}>@{m.username}</div>
                  </div>
                  <RoleBadge role={m.role} />
                  {canManage && m.id != currentUserId && m.role !== 'owner' && (
                    <select value={m.role} onChange={e => setRole(m.id, e.target.value)}
                      style={{ background:'var(--bg-input)', border:'1px solid var(--bg-hover)', borderRadius:6, color:'var(--nx-text2)', fontSize:11, padding:'3px 7px', cursor:'pointer', outline:'none', fontFamily:'var(--font)' }}>
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Channels tab */}
          {tab==='channels' && (
            <div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                {channels.map(ch => (
                  <div key={ch.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--nx-surface)', borderRadius:10, border:'1px solid var(--bg-hover)' }}>
                    <span style={{ fontSize:16 }}>{ch.type==='voice'?'🔊':ch.type==='media'?'📸':'#'}</span>
                    <span style={{ flex:1, fontSize:13.5, color:'var(--text-primary)', fontWeight:500 }}>{ch.name}</span>
                    {ch.unread>0 && <span className="badge badge-info" style={{fontSize:9}}>{ch.unread}</span>}
                    {ch.type==='voice'&&<span style={{fontSize:11,color:ch.active?'var(--nx-green)':'var(--nx-text3)'}}>{ch.active?'● Live':'● Offline'}</span>}
                  </div>
                ))}
              </div>
              {canManage && (
                <div style={{ display:'flex', gap:8 }}>
                  <input className="form-control" placeholder="new-channel-name" value={newChannel} onChange={e=>setNewChannel(e.target.value)} style={{ fontSize:13 }} onKeyDown={e=>{if(e.key==='Enter')createChannel()}} />
                  <button className="btn btn-primary btn-sm" onClick={createChannel}><Plus size={14}/></button>
                </div>
              )}
            </div>
          )}

          {/* Voice tab */}
          {tab==='voice' && (
            <div style={{ textAlign:'center', padding:'2rem' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background: voiceActive?'rgba(0,224,150,.15)':'var(--primary-dim)', border:`2px solid ${voiceActive?'var(--nx-green)':'rgba(124,77,255,.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', animation: voiceActive?'pulse 2s ease infinite':'none' }}>
                <Mic size={32} color={voiceActive?'var(--nx-green)':'var(--nx-violet)'} />
              </div>
              <p style={{ fontWeight:700, fontSize:16, color:'var(--text-primary)', marginBottom:6 }}>{voiceActive?'Voice Room Active':'Start a Voice Room'}</p>
              <p style={{ fontSize:13.5, color:'var(--nx-text3)', marginBottom:20 }}>{voiceActive?'Members can join and talk live':'Create an open voice channel for group members'}</p>
              <button className={`btn btn-lg ${voiceActive?'btn-secondary':'btn-primary'}`} onClick={()=>{if(voiceActive){setVoiceActive(false);toast('Voice room ended')}else startVoice()}}>
                <Mic size={16}/> {voiceActive?'End Voice Room':'Start Voice Room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Groups() {
  const [groups,   setGroups]   = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [tab,      setTab]      = useState('discover')
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form,     setForm]     = useState({ name:'', description:'', is_private:false })
  const [creating, setCreating] = useState(false)
  const [userId,   setUserId]   = useState(null)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('nexus_user') || '{}')
    setUserId(u.id)
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [all, mine] = await Promise.all([
        api.get('/groups').then(r => r.data.data || []),
        api.get('/groups/mine').then(r => r.data.data || []),
      ])
      setGroups(all); setMyGroups(mine)
    } catch { toast.error('Failed to load communities') }
    finally { setLoading(false) }
  }

  const createGroup = async e => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Group name is required')
    setCreating(true)
    try {
      const r = await api.post('/groups', { name: form.name.trim(), description: form.description.trim(), is_private: form.is_private ? 1 : 0 })
      toast.success('Community created! 🎉')
      setShowForm(false); setForm({ name:'', description:'', is_private:false })
      await loadAll(); setTab('yours')
    } catch(err) { toast.error(err.response?.data?.error || 'Failed to create group') }
    finally { setCreating(false) }
  }

  const joinGroup = async (g) => {
    try {
      const r = await api.post(`/groups/${g.id}/join`)
      const joined = r.data.data.joined
      toast.success(joined ? `Joined ${g.name}!` : `Left ${g.name}`)
      await loadAll()
    } catch { toast.error('Failed') }
  }

  const displayed = tab === 'discover' ? groups : myGroups

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'20px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:8 }}>
            <Hash size={22} color="var(--nx-cyan)"/> Communities
          </h1>
          <p style={{ fontSize:13, color:'var(--nx-text3)', marginTop:2 }}>Find and join communities that share your interests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15}/> Create
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="stream-card fade-in" style={{ padding:'20px 22px', marginBottom:16 }}>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14, color:'var(--text-primary)' }}>New Community</h3>
          <form onSubmit={createGroup}>
            <div className="form-group">
              <label className="form-label">Community Name <span className="req">*</span></label>
              <input className="form-control" placeholder="e.g. Nairobi Developers" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} style={{resize:'none'}} placeholder="What is this community about?" value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} />
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13.5, marginBottom:14, color:'var(--nx-text2)' }}>
              <input type="checkbox" checked={form.is_private} onChange={e => setForm(f => ({...f,is_private:e.target.checked}))} style={{ width:15, height:15 }}/>
              <Lock size={13}/> Private community (invite only)
            </label>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating?<span className="spinner" style={{width:14,height:14,borderTopColor:'#fff'}}/>:'Create Community'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--bg-input)', marginBottom:14, gap:4 }}>
        {[{ id:'discover', label:`Discover (${groups.length})` }, { id:'yours', label:`Mine (${myGroups.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'10px 16px', background:'none', border:'none', borderBottom:`2px solid ${tab===t.id?'var(--nx-cyan)':'transparent'}`, marginBottom:-1, color:tab===t.id?'var(--nx-cyan)':'var(--nx-text2)', fontWeight:tab===t.id?700:500, fontSize:13.5, cursor:'pointer', fontFamily:'var(--font)', transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
      ) : displayed.length === 0 ? (
        <div className="nx-feed-empty">
          <div className="nx-feed-empty-icon">🏘️</div>
          <div className="nx-feed-empty-title">{tab==='discover'?'No communities yet':'You haven\'t joined any'}</div>
          <p className="nx-feed-empty-sub">{tab==='discover'?'Be the first to create a community!':'Explore above and join some!'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {displayed.map(g => {
            const isMine = myGroups.some(m => m.id === g.id)
            return (
              <div key={g.id} className="stream-card" style={{ padding:'16px 18px', display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:52, height:52, borderRadius:14, background:`hsl(${(g.id*47)%360},50%,15%)`, color:`hsl(${(g.id*47)%360},60%,60%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, flexShrink:0 }}>
                  {g.name[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>{g.name}</span>
                    {g.is_private?<Lock size={12} color="var(--nx-text3)"/>:<Globe size={12} color="var(--nx-text3)"/>}
                    {g.role==='owner'&&<Crown size={13} color="#FFD700"/>}
                  </div>
                  {g.description&&<p style={{ fontSize:13, color:'var(--nx-text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>{g.description}</p>}
                  <div style={{ fontSize:12, color:'var(--nx-text3)', display:'flex', alignItems:'center', gap:6 }}>
                    <Users size={11}/> {g.member_count || 0} members
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {isMine && (
                    <button onClick={() => setSelected(g)} className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>
                      <Settings size={12}/> Manage
                    </button>
                  )}
                  <button onClick={() => joinGroup(g)} className={`btn btn-sm ${isMine?'btn-secondary':'btn-primary'}`} style={{ fontSize:12, minWidth:64 }}>
                    {isMine?'Leave':'Join'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && <GroupDetailModal group={selected} onClose={() => setSelected(null)} currentUserId={userId} />}
    </div>
  )
}
