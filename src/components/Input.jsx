import { useState } from 'react'

/* Reusable Input component with label, error state, optional helper text */
export default function Input({ label, error, helper, style = {}, containerStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 600, color: focused ? 'var(--accent)' : 'var(--text-2)',
          transition: 'color 0.15s', userSelect: 'none',
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          background: 'var(--bg-card-2)',
          border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '11px 14px',
          color: 'var(--text)',
          fontSize: 15,
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
          ...style,
        }}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
      {helper && !error && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{helper}</span>}
    </div>
  )
}

/* Select dropdown component */
export function Select({ label, error, children, style = {}, containerStyle = {}, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 600,
          color: focused ? 'var(--accent)' : 'var(--text-2)',
          transition: 'color 0.15s',
        }}>
          {label}
        </label>
      )}
      <select
        style={{
          background: 'var(--bg-card-2)',
          border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '11px 14px',
          color: 'var(--text)',
          fontSize: 15,
          outline: 'none',
          width: '100%',
          cursor: 'pointer',
          boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
    </div>
  )
}

/* Textarea component */
export function Textarea({ label, error, style = {}, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: focused ? 'var(--accent)' : 'var(--text-2)', transition: 'color 0.15s' }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          background: 'var(--bg-card-2)',
          border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '11px 14px',
          color: 'var(--text)',
          fontSize: 15,
          outline: 'none',
          width: '100%',
          resize: 'vertical',
          minHeight: 80,
          fontFamily: 'var(--font-body)',
          lineHeight: 1.5,
          boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
    </div>
  )
}
