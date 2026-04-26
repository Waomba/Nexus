import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../../utils/api'
import NexusHeader from './NexusHeader'
import NexusFooter from './NexusFooter'
import CreateModal  from './CreateModal'
import LeftToolbox  from './LeftToolbox'
import RightPanel   from './RightPanel'
import {
  Home, Compass, MessageCircle, Video, Briefcase, Calendar,
  Users, Heart, Bookmark, Hash, AlignLeft, Bell, User,
  Trophy, Shield, Settings, LogOut, Search
} from 'lucide-react'

const SIDEBAR_NAV = [
  { to:'/',              icon:Home,          label:'Feed'          },
  { to:'/explore',       icon:Compass,       label:'Explore'       },
  { to:'/search',        icon:Search,        label:'Search'        },
  { to:'/messages',      icon:MessageCircle, label:'Messages',  badge:true },
  { to:'/notifications', icon:Bell,          label:'Notifications',badge:true },
  { to:'/videos',        icon:Video,         label:'Videos'        },
  { to:'/tasks',         icon:Briefcase,     label:'Tasks'         },
  { to:'/events',        icon:Calendar,      label:'Events'        },
  { to:'/groups',        icon:Users,         label:'Communities'   },
  { to:'/friends',       icon:Heart,         label:'Friends'       },
  { to:'/bookmarks',     icon:Bookmark,      label:'Saved'         },
  { to:'/hashtags',      icon:Hash,          label:'Trending'      },
  { to:'/saved',         icon:AlignLeft,     label:'Notes'         },
  null,
  { to:'/leaderboard',   icon:Trophy,        label:'Leaderboard'   },
  { to:'/parental',      icon:Shield,        label:'Parental'      },
  { to:'/settings',      icon:Settings,      label:'Settings'      },
]

const FULL_WIDTH_PATHS  = ['/messages']
const THREE_PANEL_PATHS = ['/', '/explore', '/hashtags', '/bookmarks', '/groups', '/leaderboard', '/friends', '/saved']

function Sidebar({ user, unread, onLogout }) {
  const profileTo = user?.id ? `/profile/${user.id}` : '/login'
  return (
    <aside className="nx-sidebar">
      {/* Logo */}
      <NavLink to="/" className="nx-sidebar-logo">
        <div className="nx-logo-mark">N</div>
        <span className="nx-logo-name">NEXUS</span>
      </NavLink>

      {/* Nav */}
      <nav className="nx-sidebar-nav">
        {SIDEBAR_NAV.map((item, i) => {
          if (!item) return <div key={i} style={{ height:1, background:'var(--border)', margin:'6px 0' }}/>
          const { to, icon:Icon, label, badge } = item
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nx-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon"><Icon size={18} strokeWidth={1.8}/></span>
              <span>{label}</span>
              {badge && unread > 0 && <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>}
            </NavLink>
          )
        })}
        {/* Profile link */}
        <NavLink to={profileTo}
          className={({ isActive }) => `nx-nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon"><User size={18} strokeWidth={1.8}/></span>
          <span>My Profile</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="nx-sidebar-footer">
        {user && (
          <div className="nx-sidebar-user">
            <div className="s-av">
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : user.name?.[0]
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="s-name">{user.name}</div>
              <div className="s-role">@{user.username}</div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="nx-nav-item"
          style={{ color:'var(--danger)', width:'100%', background:'none', border:'none', cursor:'pointer', marginBottom:0 }}>
          <span className="nav-icon"><LogOut size={18} strokeWidth={1.8}/></span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [unread,      setUnread]     = useState(0)
  const [createMode,  setCreateMode] = useState(null)

  useEffect(() => {
    const fetch = () =>
      api.get('/notifications/count').then(r => setUnread(r.data.data?.count || 0)).catch(() => {})
    fetch()
    const iv = setInterval(fetch, 30000)
    return () => clearInterval(iv)
  }, [])

  const path         = location.pathname
  const isFullWidth  = FULL_WIDTH_PATHS.some(p => path.startsWith(p))
  const isThreePanel = THREE_PANEL_PATHS.some(p => path === p || (p !== '/' && path.startsWith(p)))
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="nx-shell">
      {/* Sidebar */}
      <Sidebar user={user} unread={unread} onLogout={handleLogout} />

      {/* Top header */}
      <NexusHeader unread={unread} onOpenCreate={mode => setCreateMode(mode)} />

      {/* Main content */}
      <main className="nx-main">
        {isFullWidth ? (
          <Outlet />
        ) : isThreePanel ? (
          <div className="nx-three-panel">
            <div className="nx-left-panel" style={{ display:'none' }}>
              <LeftToolbox onCreate={mode => setCreateMode(mode)} />
            </div>
            <div style={{ minWidth:0 }}>
              <Outlet />
            </div>
            <div className="nx-right-panel">
              <RightPanel />
            </div>
          </div>
        ) : (
          <div style={{ maxWidth:760, margin:'0 auto', padding:'clamp(16px,2.5vw,24px)' }}>
            <Outlet />
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <NexusFooter userId={user?.id} unread={unread} />

      {/* Create modal */}
      {createMode && (
        <CreateModal
          mode={createMode}
          onClose={() => setCreateMode(null)}
          onCreated={() => setCreateMode(null)}
        />
      )}
    </div>
  )
}
