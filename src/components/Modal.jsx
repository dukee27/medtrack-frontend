import { useEffect } from 'react'

export default function Modal({ open, onClose, title, size = 'md', children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const maxWidths = { sm: 400, md: 520, lg: 680, xl: 820 }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '20px 16px',
        /* center when content is short, scroll when tall */
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {/* inner wrapper centers vertically when there's room */}
      <div style={{ width: '100%', maxWidth: maxWidths[size], margin: 'auto' }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '100%',
            animation: 'fadeInUp 0.22s ease',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1.5px solid var(--border)',
            position: 'sticky', top: 0,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius) var(--radius) 0 0',
            zIndex: 1,
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
                fontSize: 20, transition: 'background 0.15s', flexShrink: 0,
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
  )
}