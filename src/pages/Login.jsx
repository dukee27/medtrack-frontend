import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Moon, Sun, Eye, EyeOff, ArrowRight, ShieldCheck, Pill, Bell, Users, Clock } from 'lucide-react'

const FEATURES = [
  { icon: Pill,  label: 'Medication cabinet', sub: 'Track every prescription in one place' },
  { icon: Bell,  label: 'Smart reminders',    sub: 'Refill & expiry alerts automatically' },
  { icon: Users, label: 'Caregiver sharing',  sub: 'Grant access to family or doctors' },
  { icon: Clock, label: 'Dose scheduling',    sub: 'Never miss a dose again' },
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

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

  // --- UPDATED DEMO LOGIN FUNCTION ---
  const handleDemoLogin = async (e) => {
    e.preventDefault();
    // Replace these with an actual user in your live database!
    const demoEmail = "demo12@medtracker.com"; 
    const demoPassword = "DemoUser123@!";
    
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      toast.success('Logged in as Demo User!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Failed to log in demo account');
    }
  };

  const panelBg    = isDark ? 'linear-gradient(160deg, #162a1f 0%, #0d1f15 100%)' : 'linear-gradient(160deg, #eef7f1 0%, #ddf0e5 100%)'
  const headColor  = isDark ? '#ddf0e5' : '#0d2818'
  const subColor   = isDark ? 'rgba(200,235,215,0.6)' : 'rgba(13,40,24,0.55)'
  const iconBg     = isDark ? 'rgba(82,183,136,0.12)' : 'rgba(42,122,88,0.1)'
  const iconBorder = isDark ? 'rgba(82,183,136,0.22)' : 'rgba(42,122,88,0.18)'
  const iconColor  = isDark ? '#52B788' : '#2A7A58'
  const panelBorder= isDark ? 'rgba(82,183,136,0.1)' : 'rgba(42,122,88,0.1)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── LEFT PANEL ── soft, airy, not overwhelming */}
      <div
        className="login-left"
        style={{
          width: '42%', flexShrink: 0,
          background: panelBg,
          borderRight: `1px solid ${panelBorder}`,
          display: 'flex', flexDirection: 'column',
          padding: '52px 48px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Single soft glow blob — subtle depth, not a pattern */}
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: 360, height: 360, borderRadius: '50%',
          background: isDark ? 'rgba(82,183,136,0.06)' : 'rgba(42,122,88,0.07)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 72 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: iconBg,
            border: `1.5px solid ${iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={19} color={iconColor} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: headColor }}>
            MedTrack
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32, fontWeight: 700, lineHeight: 1.25,
          color: headColor, marginBottom: 12, letterSpacing: '-0.4px',
        }}>
          Your Health,<br />Organized.
        </h1>
        <p style={{
          fontSize: 14, lineHeight: 1.7,
          color: subColor, marginBottom: 48, maxWidth: 270,
        }}>
          Track medications, manage schedules, and stay on top of your health.
        </p>

        {/* Features — generous spacing, clean two-line items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, flex: 1 }}>
          {FEATURES.map(({ icon: Icon, label, sub }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0, marginTop: 1,
                background: iconBg,
                border: `1px solid ${iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} color={iconColor} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: headColor, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: subColor, lineHeight: 1.5 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{ marginTop: 48 }}>
          <p style={{ fontSize: 11, color: subColor, letterSpacing: '0.03em' }}>
            Trusted by patients &amp; caregivers worldwide
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 32px', position: 'relative', overflowY: 'auto',
      }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'var(--bg-card-2)', border: '1.5px solid var(--border)',
            borderRadius: 8, padding: '7px 13px', color: 'var(--text-2)',
            cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {isDark ? <><Sun size={13} /> Light</> : <><Moon size={13} /> Dark</>}
        </button>

        {/* Mobile-only logo */}
        <div className="login-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>MedTrack</span>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>WELCOME BACK</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.2, margin: 0 }}>
              Sign in to<br /><span style={{ color: 'var(--accent)' }}>MedTrack</span>
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>Email address</label>
              <input
                type="email" required placeholder="your@email.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 16px', color: 'var(--text)', fontSize: 15, outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
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
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 46px 13px 16px', color: 'var(--text)', fontSize: 15, outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Main Submit Button */}
              <button
                type="submit" disabled={loading}
                style={{ padding: '14px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1, transition: 'filter 0.15s, transform 0.1s' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = '' }}
              >
                {loading && <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              {/* NEW: Try Live Demo Button */}
              <button 
                type="button" 
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors"
                style={{ borderRadius: 10, fontSize: 15, padding: '13px' }}
              >
                Try Live Demo
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>Don't have an account?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Register CTA — always prominent */}
          <Link to="/register" style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 10, border: '1.5px solid var(--accent)', color: 'var(--accent)', fontWeight: 600, fontSize: 15, background: 'var(--accent-dim)', cursor: 'pointer', transition: 'filter 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.06)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              Create a free account <ArrowRight size={15} />
            </div>
          </Link>

          <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
            Your health data is encrypted and private.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}