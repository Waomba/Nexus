import { useNavigate, useLocation } from 'react-router-dom'
import {
  PenSquare, Film, Briefcase, BarChart2, Shield,
  Zap, Upload, Hash, Heart, Bookmark
} from 'lucide-react'

const TOOLS = [
  { icon: PenSquare, tip: 'New Post',    action: 'post',    primary: true },
  { icon: Film,      tip: 'New Story',   action: 'story' },
  null, // divider
  { icon: Briefcase, tip: 'Post Task',   route: '/tasks'   },
  { icon: Hash,      tip: 'Trending',    route: '/hashtags' },
  { icon: Heart,     tip: 'Friends',     route: '/friends'  },
  { icon: Bookmark,  tip: 'Saved Notes', route: '/saved'    },
  null,
  { icon: BarChart2, tip: 'Analytics',   route: '/leaderboard' },
  { icon: Shield,    tip: 'Parental',    route: '/parental' },
]

export default function LeftToolbox({ onCreate }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <div className="nx-toolbox">
      {TOOLS.map((tool, i) => {
        if (!tool) return <div key={i} className="nx-tool-divider" />
        const { icon: Icon, tip, action, route, primary } = tool
        const isActive = route && location.pathname === route
        return (
          <button
            key={tip}
            className={`nx-tool-btn${primary ? ' primary' : ''}${isActive ? ' active' : ''}`}
            onClick={() => {
              if (action) onCreate?.(action)
              else if (route) navigate(route)
            }}
            title={tip}
          >
            <Icon size={20} />
            <span className="nx-tool-tip">{tip}</span>
          </button>
        )
      })}
    </div>
  )
}
