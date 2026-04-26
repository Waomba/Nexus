import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../utils/api'
import {
  Search, Plus, ChevronDown, Home, Compass, MessageCircle, Hash,
  Users, Heart, Bookmark, Video, Briefcase, Bell, User, LogOut,
  Settings, Shield, Trophy, Calendar, X, Film, AlignLeft,
  BarChart2, Menu, Moon, Sun, SlidersHorizontal
} from 'lucide-react'

const NAV_ITEMS = [
  { to:'/',              icon:Home,          label:'Feed',          section:'main'    },
  { to:'/explore',       icon:Compass,       label:'Explore',       section:'main'    },
  { to:'/messages',      icon:MessageCircle, label:'Messages',      section:'main'    },
  { to:'/videos',        icon:Video,         label:'Videos',        section:'main'    },
  { to:'/tasks',         icon:Briefcase,     label:'Tasks',         section:'main'    },
  { to:'/events',        icon:Calendar,      label:'Events',        section:'main'    },
  { to:'/groups',        icon:Users,         label:'Communities',   section:'main'    },
  { to:'/friends',       icon:Heart,         label:'Friends',       section:'main'    },
  { to:'/bookmarks',     icon:Bookmark,      label:'Saved',         section:'main'    },
  { to:'/hashtags',      icon:Hash,          label:'Trending',      section:'main'    },
  { to:'/saved',         icon:AlignLeft,     label:'Notes',         section:'main'    },
  { to:'/notifications', icon:Bell,          label:'Notifications', section:'account' },
  { to:null,             icon:User,          label:'Profile',       section:'account', isProfile:true },
  { to:'/leaderboard',   icon:Trophy,        label:'Leaderboard',   section:'account' },
  { to:'/parental',      icon:Shield,        label:'Parental',      section:'account' },
  { to:'/settings',      icon:Settings,      label:'Settings',      section:'account' },
]

const CREATE_ITEMS = [
  { icon:'✍️', label:'New Post',    action:'post'  },
  { icon:'📸', label:'New Story',   action:'story' },
  { icon:'📊', label:'New Poll',    action:'poll'  },
  { icon:'🎬', label:'New Video',   action:'video' },
  { icon:'💼', label:'Post Task',   action:'task'  },
  { icon:'📅', label:'New Event',   action:'event' },
]

export default function NexusHeader({ unread=0, onOpenCreate }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [searchVal,  setSearchVal]  = useState('')
  const [searchRes,  setSearchRes]  = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showMenu,   setShowMenu]   = useState(false)
  const [sidebarOpen,setSidebarOpen]= useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  const searchTimer = useRef(null)
  const menuRef     = useRef(null)
  const createRef   = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setShowMenu(false); setShowCreate(false); setSidebarOpen(false)
    setSearchVal(''); setSearchRes(null)
  }, [location.pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
      if (createRef.current && !createRef.current.contains(e.target)) setShowCreate(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Toggle mobile sidebar
  useEffect(() => {
    const sidebar = document.querySelector('.nx-sidebar')
    if (sidebar) {
      if (sidebarOpen) sidebar.classList.add('open')
      else sidebar.classList.remove('open')
    }
  }, [sidebarOpen])

  // Live search
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!searchVal.trim()) { setSearchRes(null); return }
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await api.get(`/search?q=${encodeURIComponent(searchVal)}`)
        setSearchRes(r.data.data)
      } catch { setSearchRes(null) }
    }, 320)
  }, [searchVal])

  const themeIcon = theme === 'dark' ? <Moon size={16}/> : theme === 'light' ? <Sun size={16}/> : <SlidersHorizontal size={16}/>
  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'adaptive' : 'dark'
  const profileTo = user?.id ? `/profile/${user.id}` : '/login'
  const mainNav   = NAV_ITEMS.filter(n => n.section === 'main')
  const acctNav   = NAV_ITEMS.filter(n => n.section === 'account')

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:199 }} />
      )}

      <header className={`nx-header${scrolled ? ' scrolled' : ''}`}
        style={{ boxShadow: scrolled ? 'var(--shadow-sm)' : 'none' }}>

        {/* Mobile hamburger */}
        <button className="nx-icon-btn"
          style={{ display:'none' }}
          id="nx-hamburger"
          onClick={() => setSidebarOpen(s => !s)}>
          <Menu size={18} />
        </button>

        {/* Search */}
        <div className="nx-search">
          <span className="nx-search-icon"><Search size={15}/></span>
          <input
            className="nx-search-input"
            placeholder="Search NEXUS…"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => searchVal && setSearchRes(searchRes)}
          />
          {searchVal && (
            <button onClick={() => { setSearchVal(''); setSearchRes(null) }}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:0 }}>
              <X size={14}/>
            </button>
          )}
          {searchRes && (
            <div className="nx-search-drop">
              {searchRes.users?.length > 0 && (
                <>
                  <div className="nx-search-section">People</div>
                  {searchRes.users.slice(0,3).map(u => (
                    <NavLink key={u.id} to={`/profile/${u.id}`} className="nx-search-item">
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--primary-dim)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, overflow:'hidden', flexShrink:0 }}>
                        {u.avatar ? <img src={u.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : u.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13.5 }}>{u.name}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)' }}>@{u.username}</div>
                      </div>
                    </NavLink>
                  ))}
                </>
              )}
              {searchRes.posts?.length > 0 && (
                <>
                  <div className="nx-search-section">Posts</div>
                  {searchRes.posts.slice(0,2).map(p => (
                    <div key={p.id} className="nx-search-item" onClick={() => { setSearchVal(''); setSearchRes(null) }}>
                      <AlignLeft size={14} color="var(--text-muted)"/>
                      <span style={{ fontSize:13.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.content?.slice(0,50)}…</span>
                    </div>
                  ))}
                </>
              )}
              {(!searchRes.users?.length && !searchRes.posts?.length) && (
                <div style={{ padding:'12px 14px', fontSize:13, color:'var(--text-muted)' }}>No results for "{searchVal}"</div>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="nx-actions">
          {/* Theme toggle */}
          <button className="nx-icon-btn" title={`Switch to ${nextTheme}`} onClick={() => setTheme(nextTheme)}>
            {themeIcon}
          </button>

          {/* Notifications */}
          <NavLink to="/notifications" className={({ isActive }) => `nx-icon-btn${isActive ? ' active' : ''}`}>
            <Bell size={17}/>
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </NavLink>

          {/* Create button */}
          <div style={{ position:'relative' }} ref={createRef}>
            <button className="nx-create-btn" onClick={() => setShowCreate(s => !s)}>
              <Plus size={16}/>
              <span>Create</span>
              <ChevronDown size={13} style={{ opacity:.7 }}/>
            </button>
            {showCreate && (
              <div className="nx-dropdown nx-create-drop">
                <div className="nx-drop-label">What's on your mind?</div>
                {CREATE_ITEMS.map(({ icon, label, action }) => (
                  <button key={action} className="nx-drop-item"
                    onClick={() => { onOpenCreate?.(action); setShowCreate(false) }}>
                    <span className="nx-drop-item-icon" style={{ background:'var(--primary-dim)', fontSize:16 }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User menu */}
          <div style={{ position:'relative' }} ref={menuRef}>
            <button className="nx-user-avatar" onClick={() => setShowMenu(s => !s)}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : user?.name?.[0]
              }
            </button>
            {showMenu && (
              <div className="nx-dropdown nx-menu-drop">
                {/* User info */}
                <div className="nx-menu-user">
                  <div className="nx-menu-avatar">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      : user?.name?.[0]
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="nx-menu-uname">{user?.name}</div>
                    <div className="nx-menu-handle">@{user?.username}</div>
                  </div>
                  {unread > 0 && <span className="nx-menu-badge">{unread}</span>}
                </div>

                {/* Nav grid (main items) */}
                <div className="nx-menu-section-label">Navigate</div>
                <div className="nx-menu-grid">
                  {mainNav.slice(0,8).map(({ to, icon:Icon, label }) => (
                    <NavLink key={to} to={to} end={to==='/'} className={({ isActive }) => `nx-menu-item${isActive ? ' active' : ''}`}>
                      <Icon size={14}/> {label}
                    </NavLink>
                  ))}
                </div>

                <div className="nx-drop-divider"/>

                {/* Account items */}
                <NavLink to={profileTo} className="nx-menu-item">
                  <User size={14}/> My Profile
                </NavLink>
                <NavLink to="/settings" className="nx-menu-item">
                  <Settings size={14}/> Settings
                </NavLink>
                <NavLink to="/notifications" className="nx-menu-item">
                  <Bell size={14}/> Notifications {unread > 0 && <span className="nx-menu-badge" style={{ marginLeft:'auto' }}>{unread}</span>}
                </NavLink>
                <NavLink to="/leaderboard" className="nx-menu-item">
                  <Trophy size={14}/> Leaderboard
                </NavLink>

                <div className="nx-drop-divider"/>

                {/* Theme quick-toggle */}
                <div className="nx-menu-section-label">Theme</div>
                <div style={{ display:'flex', gap:4, padding:'0 6px 6px' }}>
                  {['dark','light','adaptive'].map(t => (
                    <button key={t} onClick={() => setTheme(t)}
                      style={{ flex:1, padding:'7px 4px', borderRadius:8, border:`1.5px solid ${theme===t ? 'var(--primary)' : 'var(--border)'}`, background: theme===t ? 'var(--primary-light)' : 'var(--bg-input)', color: theme===t ? 'var(--primary)' : 'var(--text-muted)', cursor:'pointer', fontFamily:'var(--font)', fontSize:11, fontWeight:theme===t ? 700 : 400, transition:'all .15s', textAlign:'center' }}>
                      {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '⚙️'}<br/>
                      <span style={{ textTransform:'capitalize' }}>{t}</span>
                    </button>
                  ))}
                </div>

                <div className="nx-drop-divider"/>
                <button className="nx-menu-item danger" onClick={() => { logout(); navigate('/login') }}>
                  <LogOut size={14}/> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CSS for hamburger on mobile */}
      <style>{`
        @media (max-width: 768px) {
          #nx-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
