import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Pill, Calendar, Users,
  History, Bell, LogOut, ChevronLeft,
  Settings, ShieldCheck, Archive, Building2,
  FileBarChart2, Moon, Sun, UserCircle, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUnreadNotificationCount, getProfile } from '../services/api';
import PatientSwitcher from './PatientSwitcher';

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout, updateUserCache } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getUnreadNotificationCount();
        setUnreadCount(res.data.data || 0);
      } catch (err) { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real name if not yet in cache
  useEffect(() => {
    if (!user?.firstName) {
      getProfile()
        .then(res => {
          const data = res.data?.data || res.data || {};
          if (data.firstName || data.lastName) {
            updateUserCache({ firstName: data.firstName, lastName: data.lastName, email: data.email });
          }
        })
        .catch(() => {});
    }
  }, []);

  const menuItems = [
    { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/medications',    icon: Pill,            label: 'Medications' },
    { path: '/schedules',      icon: Calendar,        label: 'Schedules' },
    { path: '/reports',        icon: FileBarChart2,   label: 'Reports' },
    { path: '/access',         icon: ShieldAlert,     label: 'Permissions' },
    { path: '/organizations',  icon: Building2,       label: 'Buckets' },
    { path: '/logs',           icon: History,         label: 'Activity Log' },
    { path: '/archived',       icon: Archive,         label: 'Archive' },
  ];

  const bottomItems = [
    { path: '/profile',  icon: UserCircle, label: 'Profile' },
    { path: '/settings', icon: Settings,   label: 'Settings' },
  ];

  const isDark = theme === 'dark';

  const sidebarBg    = isDark ? '#1A1714'  : '#FFFFFF';
  const sidebarBorder= isDark ? '#2E2A26'  : '#EDE8E0';
  const textMain     = isDark ? '#F0EBE3'  : '#221F1D';
  const textMuted    = isDark ? '#8A837C'  : '#7A736D';
  const hoverBg      = isDark ? '#26221E'  : '#F5F0EA';
  const activeBg     = isDark ? 'var(--accent)' : 'var(--accent)';
  const dividerColor = isDark ? '#2E2A26'  : '#EDE8E0';

  const NavItem = ({ path, icon: Icon, label, badge }) => {
    const isActive = location.pathname === path ||
      (path !== '/dashboard' && location.pathname.startsWith(path));
    return (
      <Link to={path} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          title={isCollapsed ? label : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10,
            transition: 'all 0.15s',
            cursor: 'pointer',
            background: isActive ? activeBg : 'transparent',
            color: isActive ? '#fff' : textMuted,
            fontWeight: isActive ? 600 : 500,
            fontSize: 14,
            position: 'relative',
          }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hoverBg; if (!isActive) e.currentTarget.style.color = textMain; }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; if (!isActive) e.currentTarget.style.color = textMuted; }}
        >
          <Icon size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          {badge > 0 && (
            <span style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--danger)', color: '#fff',
              borderRadius: 20, fontSize: 10, fontWeight: 700,
              padding: '1px 6px', minWidth: 16, textAlign: 'center',
            }}>{badge > 9 ? '9+' : badge}</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: isCollapsed ? 68 : 240 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{
          minWidth: isCollapsed ? 68 : 240,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          height: '100vh', position: 'sticky', top: 0,
          display: 'flex', flexDirection: 'column',
          zIndex: 50,
          boxShadow: isDark ? 'none' : '2px 0 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Collapse Toggle */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          style={{
            position: 'absolute', right: -11, top: 28,
            width: 22, height: 22,
            background: 'var(--accent)', color: '#fff',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: `2px solid ${sidebarBg}`, zIndex: 100,
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ChevronLeft size={13} />
        </div>

        {/* Branding */}
        <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px var(--accent-glow)',
          }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 17, fontWeight: 700, color: textMain, whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}
              >
                MedTrack
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Section label */}
        {!isCollapsed && (
          <div style={{ padding: '4px 16px 6px', fontSize: 10, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Navigation
          </div>
        )}

        {/* Main Nav */}
        <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {menuItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: '8px', borderTop: `1px solid ${dividerColor}` }}>
          {!isCollapsed && (
            <div style={{ padding: '0 4px 4px', fontSize: 10, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Account
            </div>
          )}
          {bottomItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}

          {/* Theme toggle */}
          <div
            onClick={toggleTheme}
            title={isCollapsed ? 'Toggle theme' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10,
              cursor: 'pointer', color: textMuted, fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = textMain; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; }}
          >
            {isDark ? <Sun size={18} style={{ flexShrink: 0 }} /> : <Moon size={18} style={{ flexShrink: 0 }} />}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ whiteSpace: 'nowrap' }}>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <div
            onClick={logout}
            title={isCollapsed ? 'Sign out' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10,
              cursor: 'pointer', color: 'var(--danger)', fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-dim)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ whiteSpace: 'nowrap' }}>
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* Header */}
        <header style={{
          height: 60, position: 'sticky', top: 0, zIndex: 40,
          borderBottom: `1px solid ${dividerColor}`,
          padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isDark ? 'rgba(26,23,20,0.92)' : 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(10px)',
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: textMuted }}>
              Welcome back,{' '}
              <span style={{ fontWeight: 700, color: textMain }}>{user?.firstName || 'Friend'}</span>
            </p>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 1, color: isDark ? '#5A524C' : '#A19A94' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Patient Switcher */}
            <PatientSwitcher />
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => navigate('/notifications')}
                title="Notifications"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: `1px solid ${dividerColor}`,
                  background: isDark ? '#26221E' : '#F5F0EA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.15s', color: textMuted,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dividerColor; e.currentTarget.style.color = textMuted; }}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 17, height: 17, borderRadius: '50%',
                    background: 'var(--danger)', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${isDark ? '#1A1714' : '#fff'}`,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Avatar */}
            <div
              onClick={() => navigate('/profile')}
              title="Profile"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px var(--accent-glow)',
                fontSize: 13, fontWeight: 700, color: '#fff',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase() || ''}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-container fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}