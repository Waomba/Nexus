import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

/**
 * useApi — fetch data from the NEXUS API with loading + error state
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi('/posts/feed')
 *   const { data, loading } = useApi('/users/1', { immediate: false })
 */
export default function useApi(endpoint, options = {}) {
  const { immediate = true, transform } = options
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async (overrideEndpoint) => {
    setLoading(true)
    setError(null)
    try {
      const r = await api.get(overrideEndpoint || endpoint)
      const raw = r.data?.data ?? r.data
      setData(transform ? transform(raw) : raw)
      return raw
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Request failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (immediate) fetch()
  }, [immediate, fetch])

  return { data, loading, error, refetch: fetch }
}

/**
 * usePost — submit data to the API
 */
export function usePost(endpoint) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const submit = async (data, overrideEndpoint) => {
    setLoading(true)
    setError(null)
    try {
      const r = await api.post(overrideEndpoint || endpoint, data)
      return r.data?.data ?? r.data
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Request failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
