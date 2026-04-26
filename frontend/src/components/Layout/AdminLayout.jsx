import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, Flag, FileText, Activity, LogOut, BarChart2 } from 'lucide-react'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/admin/login') }

  const navItems = [
    { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/admin/users',      icon: Users,           label: 'Users'      },
    { to: '/admin/reports',    icon: Flag,            label: 'Reports'    },
    { to: '/admin/moderation', icon: FileText,        label: 'Moderation' },
    { to: '/admin/analytics',  icon: BarChart2,       label: 'Analytics'  },
    { to: '/admin/logs',       icon: Activity,        label: 'Logs'       },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo" style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>NEXUS Admin</div>
        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/admin'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="nav-item w-full" style={{ color: 'var(--nx-red)', marginTop: 'auto' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="admin-content"><Outlet /></main>
    </div>
  )
}
