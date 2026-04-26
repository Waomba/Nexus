import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{ top: 70 }}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13.5,
              borderRadius: 10,
              boxShadow: 'var(--shadow-md)',
              maxWidth: 380,
            },
            success: { iconTheme: { primary: '#00C875', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#FF3B5C', secondary: '#fff' } },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
)
