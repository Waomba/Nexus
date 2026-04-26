import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('NEXUS Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', padding: '2rem'
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              An unexpected error occurred. Please refresh the page or return to the feed.
            </p>
            {this.state.error && (
              <details style={{ marginBottom: '1.5rem', textAlign: 'left', background: 'var(--nx-bg3)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>Error details</summary>
                <pre style={{ fontSize: '0.75rem', color: 'var(--nx-red)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              >
                Go to Feed
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
