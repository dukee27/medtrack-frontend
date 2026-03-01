import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Moon, Sun, ShieldCheck, Eye, EyeOff, ArrowRight, Pill, Bell, Users, Clock } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [tab, setTab] = useState('login') // 'login' | 'register' — shows inline hint
  const { login, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const isDark = theme === 'dark'
  const accent = isDark ? '#52B788' : '#2A7A58'

  const features = [
    { icon: Pill,    text: 'Medication cabinet tracking' },
    { icon: Bell,    text: 'Smart refill & expiry reminders' },
    { icon: Users,   text: 'Caregiver access sharing' },
    { icon: Clock,   text: 'Dose schedule management' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', position: 'relative' }}>

      {/* ── Left panel (hidden on mobile) ── */}
      <div className="login-left" style={{
        width: '44%', flexShrink: 0,
        background: `linear-gradient(160deg, ${accent} 0%, ${isDark ? '#1a5c3a' : '#1a5c3a'} 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', color: '#fff' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>MedTrack</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            Your Health,<br />Organized.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 40, maxWidth: 300 }}>
            Track medications, manage schedules, and stay on top of your health — all in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="#fff" />
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* New user CTA at bottom of left panel */}
          <div style={{ marginTop: 56, padding: '18px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 12, fontWeight: 500 }}>
              New to MedTrack?
            </p>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', color: accent, borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Create a free account <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 32px', position: 'relative', overflowY: 'auto' }}>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--bg-card-2)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '7px 12px', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {isDark ? <><Sun size={13} /> Light</> : <><Moon size={13} /> Dark</>}
        </button>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="login-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>MedTrack</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Welcome back</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 0 }}>
              Sign in to<br /><span style={{ color: accent }}>MedTrack</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>Email address</label>
              <input
                type="email" required placeholder="your@email.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                style={{ width: '100%', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 16px', color: 'var(--text)', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 48px 13px 16px', color: 'var(--text)', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 10, background: accent, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)' }}
              onMouseLeave={e => e.currentTarget.style.filter = ''}>
              {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>New to MedTrack?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Register CTA — always visible */}
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 10, border: `1.5px solid ${accent}`, color: accent, fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.15s', background: 'var(--accent-dim)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
            >
              Create a free account <ArrowRight size={16} />
            </div>
          </Link>

          <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
            Your health data is encrypted and private.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}