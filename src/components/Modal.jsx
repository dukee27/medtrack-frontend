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
      {/* Layer 1: Fixed full-screen backdrop — never scrolls, always covers everything */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
        onClick={onClose}
      />

      {/* Layer 2: Scroll container — pointer-events:none so the void below the card
          passes clicks through to the backdrop above, which closes the modal */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9001,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 16px 40px',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100%',
        }}>
          {/* Card — re-enables pointer events */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              pointerEvents: 'all',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              width: '100%',
              maxWidth: maxWidths[size],
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
              animation: 'modalSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              marginBottom: 20,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px',
              borderBottom: '1px solid var(--border)',
              borderRadius: 'var(--radius) var(--radius) 0 0',
              background: 'var(--bg-card)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18, fontWeight: 600,
                color: 'var(--text)', margin: 0,
              }}>{title}</h2>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--bg-hover)', border: 'none',
                  color: 'var(--text-2)', cursor: 'pointer',
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-dim)'; e.currentTarget.style.color = 'var(--danger)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-2)' }}
              >×</button>
            </div>

            {/* Body — no maxHeight, no overflow, grows naturally with content */}
            <div style={{ padding: '22px' }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  )
}