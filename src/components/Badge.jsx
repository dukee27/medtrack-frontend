/* Medication type and status badge */
const PALETTE = {
  TABLET:      { bg: 'rgba(45,106,79,0.1)',   color: '#2D6A4F', border: 'rgba(45,106,79,0.3)' },
  CAPSULE:     { bg: 'rgba(100,80,160,0.1)',  color: '#6450A0', border: 'rgba(100,80,160,0.3)' },
  SYRUP:       { bg: 'rgba(184,92,0,0.1)',    color: '#B85C00', border: 'rgba(184,92,0,0.3)' },
  INJECTION:   { bg: 'rgba(192,57,43,0.1)',   color: '#C0392B', border: 'rgba(192,57,43,0.3)' },
  DROPS:       { bg: 'rgba(26,107,158,0.1)',  color: '#1A6B9E', border: 'rgba(26,107,158,0.3)' },
  INHALER:     { bg: 'rgba(52,120,150,0.1)',  color: '#347896', border: 'rgba(52,120,150,0.3)' },
  POWDER:      { bg: 'rgba(130,90,40,0.1)',   color: '#825A28', border: 'rgba(130,90,40,0.3)' },
  OTHER:       { bg: 'rgba(120,120,120,0.1)', color: '#707070', border: 'rgba(120,120,120,0.3)' },
  ONGOING:     { bg: 'rgba(45,106,79,0.1)',   color: '#2D6A4F', border: 'rgba(45,106,79,0.3)' },
  COMPLETED:   { bg: 'rgba(26,107,158,0.1)',  color: '#1A6B9E', border: 'rgba(26,107,158,0.3)' },
  STOPPED:     { bg: 'rgba(192,57,43,0.1)',   color: '#C0392B', border: 'rgba(192,57,43,0.3)' },
  DAILY:       { bg: 'rgba(45,106,79,0.1)',   color: '#2D6A4F', border: 'rgba(45,106,79,0.3)' },
  WEEKLY:      { bg: 'rgba(100,80,160,0.1)',  color: '#6450A0', border: 'rgba(100,80,160,0.3)' },
  EVERY_N_DAYS:{ bg: 'rgba(184,92,0,0.1)',   color: '#B85C00', border: 'rgba(184,92,0,0.3)' },
  AS_NEEDED:   { bg: 'rgba(120,120,120,0.1)', color: '#707070', border: 'rgba(120,120,120,0.3)' },
}

// Dark mode palette (slightly brighter colors)
const PALETTE_DARK = {
  TABLET:      { bg: 'rgba(82,183,136,0.15)',  color: '#52B788', border: 'rgba(82,183,136,0.3)' },
  CAPSULE:     { bg: 'rgba(180,140,255,0.15)', color: '#B48CFF', border: 'rgba(180,140,255,0.3)' },
  SYRUP:       { bg: 'rgba(244,162,97,0.15)',  color: '#F4A261', border: 'rgba(244,162,97,0.3)' },
  INJECTION:   { bg: 'rgba(224,112,112,0.15)', color: '#E07070', border: 'rgba(224,112,112,0.3)' },
  DROPS:       { bg: 'rgba(91,163,204,0.15)',  color: '#5BA3CC', border: 'rgba(91,163,204,0.3)' },
  INHALER:     { bg: 'rgba(100,180,200,0.15)', color: '#64B4C8', border: 'rgba(100,180,200,0.3)' },
  POWDER:      { bg: 'rgba(200,160,80,0.15)',  color: '#C8A050', border: 'rgba(200,160,80,0.3)' },
  OTHER:       { bg: 'rgba(160,160,160,0.15)', color: '#A0A0A0', border: 'rgba(160,160,160,0.3)' },
  ONGOING:     { bg: 'rgba(82,183,136,0.15)',  color: '#52B788', border: 'rgba(82,183,136,0.3)' },
  COMPLETED:   { bg: 'rgba(91,163,204,0.15)',  color: '#5BA3CC', border: 'rgba(91,163,204,0.3)' },
  STOPPED:     { bg: 'rgba(224,112,112,0.15)', color: '#E07070', border: 'rgba(224,112,112,0.3)' },
  DAILY:       { bg: 'rgba(82,183,136,0.15)',  color: '#52B788', border: 'rgba(82,183,136,0.3)' },
  WEEKLY:      { bg: 'rgba(180,140,255,0.15)', color: '#B48CFF', border: 'rgba(180,140,255,0.3)' },
  EVERY_N_DAYS:{ bg: 'rgba(244,162,97,0.15)', color: '#F4A261', border: 'rgba(244,162,97,0.3)' },
  AS_NEEDED:   { bg: 'rgba(160,160,160,0.15)', color: '#A0A0A0', border: 'rgba(160,160,160,0.3)' },
}

export default function Badge({ label, type, size = 'sm' }) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const palette = isDark ? PALETTE_DARK : PALETTE
  const c = palette[type] || palette[label] || { bg: 'rgba(120,120,120,0.1)', color: '#707070', border: 'rgba(120,120,120,0.3)' }
  const displayLabel = label?.replace(/_/g, ' ')
  return (
    <span style={{
      display: 'inline-block',
      padding: size === 'sm' ? '2px 10px' : '4px 14px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 13,
      fontWeight: 600,
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {displayLabel}
    </span>
  )
}
