import { useEffect } from 'react'

export default function Modal({ open, onClose, title, size = 'md', children }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const maxWidths = { sm: 400, md: 520, lg: 680, xl: 820 }

  return (
    <>
      {/* FIX: Backdrop is now completely outside the scrolling container. 
        This is locked to the viewport and will never scroll up to reveal a void.
      */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.62)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 9998, // Placed right below the modal content
        }} 
      />

      {/* Scrollable content area — clicks on empty space close modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
          style={{
            minHeight: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px 16px 60px',
            boxSizing: 'border-box',
          }}
        >
          {/* Modal card */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              width: '100%',
              maxWidth: maxWidths[size],
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              animation: 'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              // No maxHeight, no overflow — card grows with content
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px',
              borderBottom: '1px solid var(--border)',
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

            {/* Body */}
            <div style={{ padding: '22px' }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  )
}