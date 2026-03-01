import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile, changePassword } from '../services/api'
import { User, Mail, Lock, Eye, EyeOff, Save, KeyRound, BadgeCheck, AlertCircle } from 'lucide-react'
import Button from '../components/Button'
import toast from 'react-hot-toast'

function SectionCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      boxShadow: 'var(--shadow)',
      animation: 'fadeInUp 0.35s ease both',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
        paddingBottom: 16, borderBottom: '1.5px solid var(--border)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--bg-hover)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={17} style={{ color: iconColor || 'var(--text-2)' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function StyledInput({ type = 'text', value, onChange, placeholder, readOnly, suffix }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: '100%',
          background: readOnly ? 'var(--bg-card-2)' : 'var(--bg-card)',
          border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 10, padding: suffix ? '12px 44px 12px 14px' : '12px 14px',
          color: readOnly ? 'var(--text-2)' : 'var(--text)',
          fontSize: 15, outline: 'none',
          boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          cursor: readOnly ? 'not-allowed' : 'text',
        }}
        onFocus={() => !readOnly && setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {suffix && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          {suffix}
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, updateUserCache } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nameForm, setNameForm] = useState({ firstName: '', lastName: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProfile()
      .then(res => {
        const data = res.data?.data || res.data || {}
        setProfile(data)
        setNameForm({ firstName: data.firstName || '', lastName: data.lastName || '' })
        updateUserCache({ firstName: data.firstName, lastName: data.lastName, email: data.email })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveName = async () => {
    if (!nameForm.firstName.trim()) { toast.error('First name is required'); return }
    setSaving(true)
    try {
      await updateProfile(nameForm)
      updateUserCache({ firstName: nameForm.firstName, lastName: nameForm.lastName })
      setProfile(p => ({ ...p, ...nameForm }))
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error('Please fill in all password fields'); return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match'); return
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters'); return
    }
    setChangingPw(true)
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPw(false)
    }
  }

  const initials = (
    (nameForm.firstName?.charAt(0) || '').toUpperCase() +
    (nameForm.lastName?.charAt(0) || '').toUpperCase()
  ) || (user?.email?.charAt(0)?.toUpperCase() || '?')

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '24px 0', maxWidth: 680, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>
          Manage your personal information and account security
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Personal Info */}
        <SectionCard title="Personal Information" icon={User} iconColor="var(--accent)">
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: '#fff',
              boxShadow: '0 4px 16px var(--accent-glow)',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                {nameForm.firstName || nameForm.lastName
                  ? `${nameForm.firstName} ${nameForm.lastName}`.trim()
                  : 'Your Name'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{profile?.email || user?.email}</p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginTop: 6, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'var(--success-dim)', color: 'var(--success)',
              }}>
                <BadgeCheck size={11} /> Active Account
              </span>
            </div>
          </div>

          <FieldRow label="First Name">
            <StyledInput
              value={nameForm.firstName}
              onChange={e => setNameForm(f => ({ ...f, firstName: e.target.value }))}
              placeholder="Enter your first name"
            />
          </FieldRow>
          <FieldRow label="Last Name">
            <StyledInput
              value={nameForm.lastName}
              onChange={e => setNameForm(f => ({ ...f, lastName: e.target.value }))}
              placeholder="Enter your last name"
            />
          </FieldRow>
          <FieldRow label="Email Address">
            <StyledInput
              type="email"
              value={profile?.email || user?.email || ''}
              readOnly
              suffix={<Mail size={16} style={{ color: 'var(--text-3)' }} />}
            />
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5 }}>Email cannot be changed. Contact support if needed.</p>
          </FieldRow>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={handleSaveName} loading={saving} style={{ gap: 8, display: 'flex', alignItems: 'center' }}>
              <Save size={15} /> Save Changes
            </Button>
          </div>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password" icon={Lock} iconColor="var(--warning)">
          <div style={{ marginBottom: 20, padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <AlertCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: 'var(--accent)', margin: 0 }}>
              Choose a strong password of at least 8 characters, including a number and a symbol.
            </p>
          </div>
          <FieldRow label="Current Password">
            <StyledInput
              type={showCurrent ? 'text' : 'password'}
              value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter current password"
              suffix={
                <button type="button" onClick={() => setShowCurrent(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </FieldRow>
          <FieldRow label="New Password">
            <StyledInput
              type={showNew ? 'text' : 'password'}
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Enter new password"
              suffix={
                <button type="button" onClick={() => setShowNew(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </FieldRow>
          <FieldRow label="Confirm New Password">
            <StyledInput
              type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
            />
            {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
              <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5 }}>Passwords do not match</p>
            )}
          </FieldRow>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={handleChangePassword} loading={changingPw} style={{ gap: 8, display: 'flex', alignItems: 'center' }}>
              <KeyRound size={15} /> Update Password
            </Button>
          </div>
        </SectionCard>

        {/* Account Details */}
        <SectionCard title="Account Details" icon={BadgeCheck} iconColor="var(--info)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { label: 'Email', value: profile?.email || user?.email || '—' },
              { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Role', value: profile?.role || 'User' },
              { label: 'Status', value: 'Active' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '14px 16px',
                background: 'var(--bg-card-2)',
                borderRadius: 10,
                border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          button { white-space: nowrap; }
        }
      `}</style>
    </div>
  )
}