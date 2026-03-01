/* Card and StatCard components */
export default function Card({ children, style = {}, hover = false, ...props }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 24,
        boxShadow: 'var(--shadow)',
        transition: hover ? 'border-color 0.2s, transform 0.2s, box-shadow 0.2s' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--border-light)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export function StatCard({ icon, label, value, color = 'var(--accent)', subtitle, delay = 0 }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '22px 24px',
      animation: `fadeInUp 0.4s ease ${delay}s both`,
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)', color, lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>{label}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{subtitle}</div>}
    </div>
  )
}
