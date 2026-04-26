import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, UserPlus, Bell, Repeat2, BarChart2, AtSign, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const TYPE_CONFIG = {
  like:     { icon: Heart,          color: '#E11D48', bg: '#FFF1F2', label: 'liked your post',          emoji: '❤️' },
  reaction: { icon: Heart,          color: '#E11D48', bg: '#FFF1F2', label: 'reacted to your post',     emoji: '😊' },
  comment:  { icon: MessageCircle,  color: '#8B5CF6', bg: '#EDE9FE', label: 'commented on your post',   emoji: '💬' },
  follow:   { icon: UserPlus,       color: '#10B981', bg: '#D1FAE5', label: 'started following you',    emoji: '👤' },
  message:  { icon: MessageCircle,  color: '#3B82F6', bg: '#DBEAFE', label: 'sent you a message',       emoji: '✉️' },
  repost:   { icon: Repeat2,        color: '#14B8A6', bg: '#CCFBF1', label: 'reposted your post',       emoji: '🔁' },
  poll_vote:{ icon: BarChart2,      color: '#F59E0B', bg: '#FEF3C7', label: 'voted on your poll',       emoji: '📊' },
  mention:  { icon: AtSign,         color: '#6366F1', bg: '#EEF2FF', label: 'mentioned you',            emoji: '@'  },
}

function NotifItem({ notif, onMarkRead }) {
  const cfg = TYPE_CONFIG[notif.type] || { icon: Bell, color: 'var(--primary)', bg: 'var(--primary-light)', label: notif.type, emoji: '🔔' }
  const Icon = cfg.icon
  const isUnread = !notif.is_read

  const getDescription = () => {
    const d = notif.data || {}
    switch (notif.type) {
      case 'reaction': return `reacted ${d.emoji || '❤️'} to your post`
      case 'message':  return `sent you a message: "${d.preview || '…'}"`
      default:         return cfg.label
    }
  }

  return (
    <div className="fade-in"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', background: isUnread ? 'rgba(79,70,229,.03)' : 'transparent', transition: 'background .2s', cursor: 'pointer' }}
      onClick={onMarkRead}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
      onMouseLeave={e => e.currentTarget.style.background = isUnread ? 'rgba(79,70,229,.03)' : 'transparent'}
    >
      {/* Icon circle */}
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
        <Icon size={18} color={cfg.color} />
        {notif.data?.emoji && notif.type === 'reaction' && (
          <div style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 14, lineHeight: 1 }}>{notif.data.emoji}</div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
          <strong>Someone</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{getDescription()}</span>
        </p>
        {notif.data?.preview && notif.type !== 'message' && (
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {notif.data.preview}
          </p>
        )}
        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : ''}
        </span>
      </div>

      {isUnread && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 5 }} />
      )}
    </div>
  )
}

export default function Notifications() {
  const [notifs,   setNotifs]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifs(r.data.data || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await api.post('/notifications/read').catch(() => {})
    setNotifs(n => n.map(x => ({ ...x, is_read: 1 })))
    toast.success('All marked as read')
  }

  const unreadCount = notifs.filter(n => !n.is_read).length

  const FILTERS = [
    { id: 'all',      label: 'All' },
    { id: 'unread',   label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { id: 'social',   label: 'Social' },
    { id: 'activity', label: 'Activity' },
  ]

  const filtered = notifs.filter(n => {
    if (filter === 'unread')   return !n.is_read
    if (filter === 'social')   return ['follow','like','reaction'].includes(n.type)
    if (filter === 'activity') return ['comment','message','repost','poll_vote'].includes(n.type)
    return true
  })

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: '20px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 16px' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={22} color="var(--primary)" /> Notifications
          </h1>
          {unreadCount > 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px', marginBottom: 0, gap: 2, overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: `2.5px solid ${filter === f.id ? 'var(--primary)' : 'transparent'}`, marginBottom: -1, color: filter === f.id ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: filter === f.id ? 700 : 500, fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap', transition: 'all .15s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--border)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🔔</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
            <p style={{ fontSize: 13.5 }}>
              {filter === 'unread' ? 'You have no unread notifications.' : 'When people interact with your posts, you\'ll see it here.'}
            </p>
          </div>
        ) : (
          filtered.map(n => (
            <NotifItem key={n.id} notif={n}
              onMarkRead={() => {
                if (!n.is_read) {
                  api.post('/notifications/read').catch(() => {})
                  setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x))
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
