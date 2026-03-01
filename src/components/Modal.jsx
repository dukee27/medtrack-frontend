import { useEffect } from 'react'

export default function Modal({ open, onClose, title, size = 'md', children }) {
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [open])

  if (!open) return null

  const maxWidths = { sm: 400, md: 520, lg: 680, xl: 820 }

  return (
    <>
      {/* Layer 1: Fixed full-screen dark backdrop — never moves */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
      }} onClick={onClose} />

      {/* Layer 2: Fixed full-screen scroll container */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9001,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '24px 16px',
          // pointer-events only on the card, not the void below
          pointerEvents: 'none',
        }}
      >
        {/* Center wrapper */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100%',
        }}>
          {/* The actual modal card */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              pointerEvents: 'all',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              width: '100%',
              maxWidth: maxWidths[size],
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              animation: 'modalIn 0.2s ease',
              marginBottom: 24,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1.5px solid var(--border)',
              borderRadius: 'var(--radius) var(--radius) 0 0',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18, fontWeight: 600,
                color: 'var(--text)', margin: 0,
              }}>{title}</h2>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--bg-hover)', border: 'none', color: 'var(--text-2)',
                  cursor: 'pointer', width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              >×</button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px' }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </>
  )
}