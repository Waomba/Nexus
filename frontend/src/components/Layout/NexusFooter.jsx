import { NavLink } from 'react-router-dom'
import { Home, Compass, MessageCircle, Bell, User } from 'lucide-react'

const TABS = [
  { to:'/',          icon:Home,          label:'Home',     end:true   },
  { to:'/explore',   icon:Compass,       label:'Explore'             },
  { to:'/messages',  icon:MessageCircle, label:'Messages', badge:true },
  { to:'/notifications', icon:Bell,      label:'Alerts',   badge:true },
  { to:null,         icon:User,          label:'Me',       isProfile:true },
]

export default function NexusFooter({ userId, unread = 0 }) {
  return (
    <nav className="nx-footer">
      {TABS.map(({ to, icon:Icon, label, end, badge, isProfile }) => {
        const href = isProfile ? (userId ? `/profile/${userId}` : '/login') : to
        return (
          <NavLink
            key={label}
            to={href}
            end={end}
            className={({ isActive }) => `nx-tab${isActive ? ' active' : ''}`}
          >
            <span className="nx-tab-icon">
              <Icon size={20} strokeWidth={1.8}/>
              {badge && unread > 0 && (
                <span className="nx-tab-badge">{unread > 99 ? '99+' : unread}</span>
              )}
            </span>
            <span className="nx-tab-label">{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
