import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, size = 'md', children }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open) return
    // Save scroll position, lock body
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
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        ref={scrollRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)',
          width: '100%',
          maxWidth: maxWidths[size],
          maxHeight: 'calc(100svh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          animation: 'modalIn 0.2s ease',
        }}
      >
        {/* Sticky header inside the flex column */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1.5px solid var(--border)',
          flexShrink: 0,
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
              background: 'var(--bg-hover)', border: 'none', color: 'var(--text-2)',
              cursor: 'pointer', width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, transition: 'background 0.15s', flexShrink: 0, lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          >×</button>
        </div>

        {/* Scrollable body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          WebkitOverflowScrolling: 'touch',
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  )
}