import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'

/**
 * useNotifications — polls the API every N seconds for new notifications.
 * Returns unread count + latest notifications, and a markRead function.
 *
 * Usage:
 *   const { unread, notifications, markRead } = useNotifications()
 */
export default function useNotifications(pollIntervalMs = 20000) {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]               = useState(0)
  const [loading, setLoading]             = useState(true)
  const intervalRef = useRef(null)

  const fetchAll = useCallback(async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/count'),
      ])
      const list = notifsRes.data?.data || []
      setNotifications(list)
      setUnread(countRes.data?.data?.count || 0)
    } catch {
      // silently fail — network might be briefly unavailable
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async () => {
    try {
      await api.post('/notifications/read')
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch {}
  }, [])

  useEffect(() => {
    fetchAll()
    intervalRef.current = setInterval(fetchAll, pollIntervalMs)
    return () => clearInterval(intervalRef.current)
  }, [fetchAll, pollIntervalMs])

  return { notifications, unread, loading, markRead, refetch: fetchAll }
}
