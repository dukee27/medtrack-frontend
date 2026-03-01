import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { Moon, Sun } from 'lucide-react'

// Password strength checker
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: 'var(--border)' }
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { score, label: 'Very weak', color: 'var(--danger)' }
  if (score === 2) return { score, label: 'Weak', color: 'var(--warning)' }
  if (score === 3) return { score, label: 'Fair', color: '#B8860B' }
  if (score === 4) return { score, label: 'Good', color: 'var(--success)' }
  return { score, label: 'Strong', color: 'var(--success)' }
}

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', phoneNumber: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const { register, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const strength = getPasswordStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (strength.score < 2) e.password = 'Password is too weak — add uppercase letters, numbers, or symbols'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const { confirmPassword, ...payload } = form
    const result = await register(payload)
    if (result.success) {
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } else {
      toast.error(result.message)
    }
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors(er => ({ ...er, [key]: null }))
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    background: 'var(--bg-card)',
    border: `1.5px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 10, padding: '12px 16px',
    color: 'var(--text)', fontSize: 15, outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  })

  const onFocus = (e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }
  const onBlur  = (e) => { e.target.style.borderColor = errors[e.target.name] ? 'var(--danger)' : 'var(--border)'; e.target.style.boxShadow = 'none' }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
    }}>
      {/* Subtle background shapes */}
      <div style={{
        position: 'fixed', top: '-150px', right: '-150px',
        width: 400, height: 400, borderRadius: '50%',
        background: 'var(--accent-dim)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-100px', left: '-100px',
        width: 300, height: 300, borderRadius: '50%',
        background: 'var(--accent-dim)', pointerEvents: 'none',
      }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: 24, right: 24,
          background: 'var(--bg-card)', border: '1.5px solid var(--border)',
          borderRadius: 8, padding: '8px 14px',
          color: 'var(--text-2)', cursor: 'pointer', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        {theme === 'light' ? <><Moon size={14} style={{ marginRight: 4 }} />Dark</> : <><Sun size={14} style={{ marginRight: 4 }} />Light</>}
      </button>

      <div style={{ width: '100%', maxWidth: 500, animation: 'fadeInUp 0.4s ease', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: 'var(--text-inv)',
          }}>✚</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30, fontWeight: 700, color: 'var(--text)',
            letterSpacing: '-0.5px', marginBottom: 8,
          }}>Create your account</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 16, padding: 32,
          boxShadow: 'var(--shadow-md)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>First Name *</label>
                <input name="firstName" value={form.firstName} onChange={set('firstName')} placeholder="John" required style={inputStyle(errors.firstName)} onFocus={onFocus} onBlur={onBlur} />
                {errors.firstName && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.firstName}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={set('lastName')} placeholder="Doe" style={inputStyle(false)} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Email address *</label>
              <input type="email" name="email" value={form.email} onChange={set('email')} placeholder="john@example.com" required style={inputStyle(errors.email)} onFocus={onFocus} onBlur={onBlur} />
              {errors.email && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Phone Number <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+1 555 0100" style={inputStyle(false)} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Password with strength meter */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 8 characters"
                  required
                  style={inputStyle(errors.password)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: 4,
                  }}
                >{showPassword ? '🙈' : '👁'}</button>
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength.score ? strength.color : 'var(--border)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                    {strength.score < 3 && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> — add uppercase letters, numbers, or special characters</span>}
                  </div>
                </div>
              )}
              {errors.password && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Confirm Password *</label>
              <input
                type="password" name="confirmPassword"
                value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="••••••••" required
                style={inputStyle(errors.confirmPassword)}
                onFocus={onFocus} onBlur={onBlur}
              />
              {errors.confirmPassword && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, padding: '14px',
                borderRadius: 10,
                background: 'var(--accent)',
                color: 'var(--text-inv)',
                fontWeight: 700, fontSize: 16, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = '' }}
            >
              {loading && <span className="spinner" style={{ width: 18, height: 18 }} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
          Your health information is encrypted and private. We never share your data.
        </p>
      </div>
    </div>
  )
}
