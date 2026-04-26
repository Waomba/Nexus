import { useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { BarChart2 } from 'lucide-react'

export function PollCard({ poll, options, total, voted, myVote, onVote }) {
  const [localVoted, setLocalVoted]   = useState(voted)
  const [localOpts,  setLocalOpts]    = useState(options)
  const [localTotal, setLocalTotal]   = useState(total)
  const [myOptId,    setMyOptId]      = useState(myVote)
  const [voting,     setVoting]       = useState(false)

  const vote = async optionId => {
    if (localVoted || voting) return
    setVoting(true)
    try {
      const r = await api.post(`/polls/${poll.id}/vote`, { option_id: optionId })
      const d = r.data.data
      setLocalOpts(d.options)
      setLocalTotal(d.total)
      setLocalVoted(true)
      setMyOptId(optionId)
      onVote?.(d)
    } catch(err) { toast.error(err.response?.data?.error || 'Vote failed') }
    finally { setVoting(false) }
  }

  return (
    <div style={{ margin: '12px 0', padding: '14px 16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <BarChart2 size={15} color="var(--primary)" />
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{poll.question}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {localOpts.map(opt => {
          const pct = localVoted ? opt.pct : 0
          const isChosen = myOptId === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => vote(opt.id)}
              disabled={localVoted || voting}
              style={{
                position: 'relative',
                padding: '10px 14px',
                borderRadius: 8,
                border: `2px solid ${isChosen ? 'var(--primary)' : 'var(--border)'}`,
                background: 'var(--bg-card)',
                cursor: localVoted ? 'default' : 'pointer',
                overflow: 'hidden',
                textAlign: 'left',
                fontFamily: 'var(--font)',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Progress bar */}
              {localVoted && (
                <div style={{
                  position: 'absolute', inset: 0, left: 0, top: 0,
                  width: `${pct}%`, background: isChosen ? 'rgba(79,70,229,.12)' : 'rgba(0,0,0,.04)',
                  transition: 'width 0.5s ease', borderRadius: 6,
                }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: 13.5, fontWeight: isChosen ? 700 : 500, color: isChosen ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {isChosen && '✓ '}{opt.text}
                </span>
                {localVoted && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: isChosen ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        {localTotal} {localTotal === 1 ? 'vote' : 'votes'}{' '}
        {poll.expires_at && `· Ends ${new Date(poll.expires_at).toLocaleDateString()}`}
      </div>
    </div>
  )
}

export function CreatePollInline({ postId, onCreated }) {
  const [question, setQuestion]   = useState('')
  const [options,  setOptions]    = useState(['', ''])
  const [loading,  setLoading]    = useState(false)

  const addOption = () => { if (options.length < 4) setOptions(o => [...o, '']) }
  const setOpt = (i, v) => setOptions(o => o.map((x, idx) => idx === i ? v : x))

  const submit = async () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return toast.error('Question and at least 2 options required')
    setLoading(true)
    try {
      await api.post('/polls', { post_id: postId, question, options: options.filter(o => o.trim()) })
      toast.success('Poll added!')
      onCreated?.()
    } catch(err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ marginTop: 12, padding: '14px 16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <BarChart2 size={14} color="var(--primary)" /> Add Poll
      </div>
      <input className="form-control" style={{ marginBottom: 8 }} placeholder="Ask a question…" value={question} onChange={e => setQuestion(e.target.value)} />
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input className="form-control" placeholder={`Option ${i + 1}`} value={opt} onChange={e => setOpt(i, e.target.value)} />
          {options.length > 2 && (
            <button onClick={() => setOptions(o => o.filter((_, idx) => idx !== i))}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0 8px', fontSize: 18 }}>×</button>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {options.length < 4 && (
          <button className="btn btn-secondary btn-sm" onClick={addOption}>+ Add option</button>
        )}
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading} style={{ marginLeft: 'auto' }}>
          {loading ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> : 'Create Poll'}
        </button>
      </div>
    </div>
  )
}
