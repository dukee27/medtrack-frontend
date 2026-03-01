/* Button component - adapts to light/dark theme via CSS variables */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  style = {},
  ...props
}) {
  const sizes = {
    sm: { padding: '7px 16px', fontSize: 13, borderRadius: 7 },
    md: { padding: '10px 22px', fontSize: 15, borderRadius: 9 },
    lg: { padding: '14px 32px', fontSize: 16, borderRadius: 10 },
  }

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-inv)',
      border: 'none',
      boxShadow: '0 2px 8px var(--accent-glow)',
    },
    secondary: {
      background: 'var(--bg-card-2)',
      color: 'var(--text)',
      border: '1.5px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-2)',
      border: '1.5px solid var(--border)',
    },
    danger: {
      background: 'var(--danger-dim)',
      color: 'var(--danger)',
      border: '1.5px solid var(--danger)',
    },
    success: {
      background: 'var(--success-dim)',
      color: 'var(--success)',
      border: '1.5px solid var(--success)',
    },
  }

  return (
    <button
      disabled={loading || props.disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
        opacity: loading || props.disabled ? 0.65 : 1,
        transition: 'all 0.18s ease',
        width: fullWidth ? '100%' : undefined,
        letterSpacing: '-0.01em',
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={e => {
        if (!loading && !props.disabled) {
          e.currentTarget.style.filter = 'brightness(1.08)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = ''
        e.currentTarget.style.transform = ''
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      {...props}
    >
      {loading && (
        <span style={{
          width: 15, height: 15,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
        }} />
      )}
      {children}
    </button>
  )
}
