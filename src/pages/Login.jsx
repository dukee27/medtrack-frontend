import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Moon, Sun } from 'lucide-react'

// Decorative pill shapes used in the left panel
const PillDecoration = ({ top, left, size, rotate, opacity, color }) => (
  <div style={{
    position: 'absolute', top, left,
    width: size, height: size / 2,
    borderRadius: size,
    background: `linear-gradient(135deg, ${color}40, ${color}20)`,
    border: `1.5px solid ${color}30`,
    transform: `rotate(${rotate}deg)`,
    opacity,
  }} />
)

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const accentColor = theme === 'dark' ? '#52B788' : '#2D6A4F'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* ─── Left panel — illustration ─── */}
      <div style={{
        width: '45%',
        background: accentColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      className="login-panel"
      >
        {/* Decorative pill shapes */}
        <PillDecoration top="8%"  left="10%"  size={80}  rotate={-30} opacity={0.6} color="#fff" />
        <PillDecoration top="15%" left="55%"  size={50}  rotate={20}  opacity={0.4} color="#fff" />
        <PillDecoration top="35%" left="-5%"  size={120} rotate={-15} opacity={0.3} color="#fff" />
        <PillDecoration top="55%" left="65%"  size={70}  rotate={45}  opacity={0.5} color="#fff" />
        <PillDecoration top="70%" left="20%"  size={90}  rotate={-45} opacity={0.4} color="#fff" />
        <PillDecoration top="80%" left="50%"  size={110} rotate={30}  opacity={0.3} color="#fff" />
        <PillDecoration top="88%" left="-10%" size={60}  rotate={15}  opacity={0.5} color="#fff" />

        {/* Cross pattern background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', color: '#fff' }}>
          {/* Large cross/plus icon */}
          <div style={{
            width: 90, height: 90, borderRadius: 24,
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, margin: '0 auto 28px',
            backdropFilter: 'blur(8px)',
          }}>✚</div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 38, fontWeight: 700,
            color: '#fff', lineHeight: 1.2, marginBottom: 16,
          }}>
            Your Health,<br />Organized.
          </h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7, maxWidth: 300, margin: '0 auto',
          }}>
            Track medications, manage schedules, and stay on top of your health — all in one place.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {[
              'Medication cabinet tracking',
              'Smart refill reminders',
              'Caregiver access sharing',
              'Expiry date alerts',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)', fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right panel — form ─── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        position: 'relative',
      }}>
        {/* Theme toggle top-right */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute', top: 24, right: 24,
            background: 'var(--bg-card-2)', border: '1.5px solid var(--border)',
            borderRadius: 8, padding: '8px 14px',
            color: 'var(--text-2)', cursor: 'pointer',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {theme === 'light' ? <><Moon size={14} style={{ marginRight: 4 }} />Dark</> : <><Sun size={14} style={{ marginRight: 4 }} />Light</>}
        </button>

        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.4s ease' }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>Welcome back</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 34, fontWeight: 700,
              color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.2,
              marginBottom: 10,
            }}>Sign in to<br /><span style={{ color: 'var(--accent)' }}>MedTrack</span></h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 10, padding: '13px 16px',
                  color: 'var(--text)', fontSize: 16, outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 10, padding: '13px 48px 13px 16px',
                    color: 'var(--text)', fontSize: 16, outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                    fontSize: 15, padding: 4,
                  }}
                >{showPassword ? '🙈' : '👁'}</button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: '14px',
                borderRadius: 10,
                background: 'var(--accent)',
                color: 'var(--text-inv)',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = '' }}
            >
              {loading && <span className="spinner" style={{ width: 18, height: 18 }} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer note */}
          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
            By signing in, you agree to our terms of service.<br />
            Your health data is encrypted and private.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
