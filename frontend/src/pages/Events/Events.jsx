import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Calendar, MapPin, Users, Globe, Plus, Clock } from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'

function EventCard({ event, onRsvp }) {
  const { user } = useAuth()
  const myStatus = event.attendees?.find(a => a.id == user?.id)?.status
  const going = event.going_count || 0

  return (
    <div className="card fade-in" style={{ marginBottom: 14, overflow: 'hidden' }}>
      {event.cover && (
        <img src={event.cover} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{event.title}</h3>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <Calendar size={13} color="var(--primary)" />
                {format(new Date(event.start_time), 'EEE, MMM d · h:mm a')}
              </span>
              {event.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  {event.is_online ? <Globe size={13} color="var(--teal)" /> : <MapPin size={13} color="var(--nx-orange)" />}
                  {event.is_online ? 'Online' : event.location}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <Users size={13} />
                {going} going
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12, flexShrink: 0 }}>
            {event.is_online && <span className="badge badge-teal">Online</span>}
            {isPast(new Date(event.start_time)) && <span className="badge badge-muted">Ended</span>}
          </div>
        </div>
        {event.description && (
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
            {event.description.length > 120 ? event.description.slice(0, 120) + '…' : event.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
              {event.name?.[0]}
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>by <strong>{event.name}</strong></span>
          </div>
          {!isPast(new Date(event.start_time)) && (
            <div style={{ display: 'flex', gap: 6 }}>
              {['going','interested'].map(s => (
                <button key={s} onClick={() => onRsvp(event.id, s)}
                  className={`btn btn-sm ${myStatus === s ? 'btn-primary' : 'btn-secondary'}`}>
                  {s === 'going' ? '✓ Going' : '★ Interested'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', location: '', start_time: '', end_time: '', is_online: false, max_attendees: '', cover: '' })
  const [submitting, setSubmitting] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  useEffect(() => {
    api.get('/events').then(r => setEvents(r.data.data || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const rsvp = async (eventId, status) => {
    try {
      await api.post(`/events/${eventId}/rsvp`, { status })
      toast.success(status === 'going' ? "You're going! 🎉" : "Marked as interested!")
    } catch { toast.error('Failed') }
  }

  const createEvent = async e => {
    e.preventDefault()
    if (!form.title || !form.start_time) return toast.error('Title and start time are required')
    setSubmitting(true)
    try {
      const r = await api.post('/events', { ...form, is_online: form.is_online ? 1 : 0 })
      toast.success('Event created!')
      setShowForm(false)
      api.get('/events').then(r => setEvents(r.data.data || []))
    } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSubmitting(false) }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Events</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Discover and join events near you</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> Create Event
        </button>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 20, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Create New Event</h3>
          <form onSubmit={createEvent}>
            <div className="form-group">
              <label className="form-label">Event Title <span className="req">*</span></label>
              <input className="form-control" placeholder="Give your event a name" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" placeholder="What's this event about?" value={form.description} onChange={set('description')} rows={3} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time <span className="req">*</span></label>
                <input className="form-control" type="datetime-local" value={form.start_time} onChange={set('start_time')} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input className="form-control" type="datetime-local" value={form.end_time} onChange={set('end_time')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="Venue or address" value={form.location} onChange={set('location')} />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input className="form-control" placeholder="https://…" value={form.cover} onChange={set('cover')} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                <input type="checkbox" checked={form.is_online} onChange={set('is_online')} style={{ width: 16, height: 16 }} />
                Online event
              </label>
              <div style={{ flex: 1 }}>
                <input className="form-control" type="number" placeholder="Max attendees (optional)" value={form.max_attendees} onChange={set('max_attendees')} min={1} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> : 'Create Event'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p style={{ fontWeight: 600, marginBottom: 6 }}>No upcoming events</p>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Create the first one for your community!</p>
        </div>
      ) : (
        events.map(ev => <EventCard key={ev.id} event={ev} onRsvp={rsvp} />)
      )}
    </div>
  )
}
