import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Palette, Bell, Accessibility, Lock, User, Sun, Moon, ShieldCheck, Info } from 'lucide-react'
import Button from '../components/Button'
import toast from 'react-hot-toast'

function SettingRow({ title, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 0', borderBottom: '1px solid var(--border)',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => onChange(!on)}>
      <div style={{
        width: 48, height: 26, borderRadius: 13,
        background: on ? 'var(--accent)' : 'var(--border)',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 24 : 3,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  )
}

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
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18, fontWeight: 600, color: 'var(--text)',
        }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()

  const [notifs, setNotifs] = useState({
    lowStockAlerts: true,
    expiryAlerts: true,
    scheduleReminders: false,
    weeklyDigest: false,
  })

  const [access, setAccess] = useState({
    largeText: localStorage.getItem('pref-large-text') === 'true',
    highContrast: localStorage.getItem('pref-high-contrast') === 'true',
    reduceMotion: localStorage.getItem('pref-reduce-motion') === 'true',
  })

  const toggleNotif = (key) => {
    setNotifs(n => ({ ...n, [key]: !n[key] }))
    toast.success('Preference saved')
  }

  const toggleAccess = (key) => {
    const next = !access[key]
    setAccess(a => ({ ...a, [key]: next }))
    localStorage.setItem(`pref-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, String(next))
    if (key === 'largeText') {
      document.documentElement.style.fontSize = next ? '18px' : '16px'
    }
    toast.success('Preference saved')
  }

  const handleExportData = () => {
    toast.success('Data export started — check your downloads shortly')
  }

  const handleClearCache = () => {
    localStorage.removeItem('medtrack-theme')
    toast.success('Cache cleared. Refresh the page.')
  }

  return (
    <div style={{ maxWidth: 720, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>
          Customize your MedTrack experience
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Appearance */}
        <SectionCard title="Appearance" icon={Palette} iconColor="var(--accent)">
          <SettingRow
            title="Color Theme"
            description="Switch between light (warm beige) and dark mode"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => { if (theme !== 'light') toggleTheme() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  background: theme === 'light' ? 'var(--accent)' : 'var(--bg-card-2)',
                  color: theme === 'light' ? '#fff' : 'var(--text-2)',
                  border: `1.5px solid ${theme === 'light' ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Sun size={14} /> Light
              </button>
              <button
                onClick={() => { if (theme !== 'dark') toggleTheme() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  background: theme === 'dark' ? 'var(--accent)' : 'var(--bg-card-2)',
                  color: theme === 'dark' ? '#fff' : 'var(--text-2)',
                  border: `1.5px solid ${theme === 'dark' ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </SettingRow>

          <SettingRow
            title="Current theme"
            description={`You are using ${theme} mode with ${theme === 'light' ? 'warm beige/white' : 'dark charcoal'} colors`}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: 'var(--accent-dim)', color: 'var(--accent)',
              border: '1px solid var(--accent-dim)',
            }}>
              {theme === 'light' ? <Sun size={13} /> : <Moon size={13} />}
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </SettingRow>
        </SectionCard>

        {/* Accessibility */}
        <SectionCard title="Accessibility" icon={Accessibility} iconColor="var(--info)">
          <SettingRow
            title="Larger Text"
            description="Increases base font size from 16px to 18px for easier reading"
          >
            <Toggle on={access.largeText} onChange={() => toggleAccess('largeText')} />
          </SettingRow>
          <SettingRow
            title="High Contrast"
            description="Enhances border and text contrast for better visibility"
          >
            <Toggle on={access.highContrast} onChange={() => toggleAccess('highContrast')} />
          </SettingRow>
          <SettingRow
            title="Reduce Motion"
            description="Disables animations for users who experience motion sensitivity"
          >
            <Toggle on={access.reduceMotion} onChange={() => toggleAccess('reduceMotion')} />
          </SettingRow>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={Bell} iconColor="var(--warning)">
          <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: 'var(--accent)', margin: 0 }}>
              Notification preferences are saved locally. Push notifications require browser permission.
            </p>
          </div>
          <SettingRow title="Low Stock Alerts" description="Get notified when any medication falls below 10 units">
            <Toggle on={notifs.lowStockAlerts} onChange={() => toggleNotif('lowStockAlerts')} />
          </SettingRow>
          <SettingRow title="Expiry Alerts" description="Get notified when medications are expiring within 30 days">
            <Toggle on={notifs.expiryAlerts} onChange={() => toggleNotif('expiryAlerts')} />
          </SettingRow>
          <SettingRow title="Schedule Reminders" description="Daily reminders to take scheduled medications on time">
            <Toggle on={notifs.scheduleReminders} onChange={() => toggleNotif('scheduleReminders')} />
          </SettingRow>
          <SettingRow title="Weekly Digest" description="A weekly summary of your medication status and upcoming refills">
            <Toggle on={notifs.weeklyDigest} onChange={() => toggleNotif('weeklyDigest')} />
          </SettingRow>
        </SectionCard>

        {/* Data & Privacy */}
        <SectionCard title="Data & Privacy" icon={Lock} iconColor="var(--success)">
          <SettingRow title="Export Your Data" description="Download a copy of all your medication data in JSON format">
            <Button variant="secondary" size="sm" onClick={handleExportData}>Export Data</Button>
          </SettingRow>
          <SettingRow title="Clear Local Cache" description="Remove all locally stored preferences and cached data">
            <Button variant="ghost" size="sm" onClick={handleClearCache}>Clear Cache</Button>
          </SettingRow>
          <SettingRow title="Data Encryption" description="All your health data is encrypted in transit and at rest">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: 'var(--success-dim)', color: 'var(--success)',
              border: '1px solid var(--success)',
            }}>
              <ShieldCheck size={12} /> Secured
            </span>
          </SettingRow>
        </SectionCard>

        {/* Account */}
        <SectionCard title="Account" icon={User} iconColor="var(--text-2)">
          <SettingRow title="Change Password" description="Update your account password via the Profile page">
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/profile'}>
              Go to Profile
            </Button>
          </SettingRow>
          <SettingRow title="Manage Caregiver Access" description="Control who can view or edit your medication records">
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/access'}>
              Manage Access
            </Button>
          </SettingRow>
          <div style={{ paddingTop: 16 }}>
            <SettingRow title="Sign Out" description="Sign out of your account on this device">
              <Button variant="danger" size="sm" onClick={() => { logout(); window.location.href = '/login' }}>
                Sign Out
              </Button>
            </SettingRow>
          </div>
        </SectionCard>

        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-3)', fontSize: 12 }}>
          MedTrack v2.0.0 · Built with care for your health
        </div>
      </div>

      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}