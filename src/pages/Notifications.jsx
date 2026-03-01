import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Pill, ShieldCheck, RefreshCw, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  REFILL_REMINDER:     { icon: Pill,         color: 'var(--warning)', bg: 'var(--warning-dim)' },
  EXPIRY_WARNING:      { icon: AlertTriangle, color: 'var(--danger)',  bg: 'var(--danger-dim)' },
  LOW_STOCK:           { icon: Pill,         color: 'var(--warning)', bg: 'var(--warning-dim)' },
  ACCESS_REQUEST:      { icon: ShieldCheck,  color: 'var(--info)',    bg: 'var(--info-dim)' },
  ACCESS_APPROVED:     { icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-dim)' },
  ACCESS_REJECTED:     { icon: ShieldCheck,  color: 'var(--danger)',  bg: 'var(--danger-dim)' },
  ACCESS_REVOKED:      { icon: ShieldCheck,  color: 'var(--danger)',  bg: 'var(--danger-dim)' },
  PERMISSIONS_UPDATED: { icon: ShieldCheck,  color: 'var(--info)',    bg: 'var(--info-dim)' },
  MEDICATION_ADDED:    { icon: Pill,         color: 'var(--success)', bg: 'var(--success-dim)' },
  MEDICATION_EDITED:   { icon: Pill,         color: 'var(--info)',    bg: 'var(--info-dim)' },
  MEDICATION_DELETED:  { icon: Pill,         color: 'var(--danger)',  bg: 'var(--danger-dim)' },
  DEFAULT:             { icon: Bell,         color: 'var(--text-3)',  bg: 'var(--bg-hover)' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // FIX: Backend uses isRead field (DTO maps to isRead)
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">Alerts & Reminders</h1>
          <p className="text-text-2 mt-1">
            Stay on top of your health.
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full"
                style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
              style={{
                background: 'var(--success-dim)', color: 'var(--success)',
                border: '1px solid rgba(42,122,88,0.2)',
                cursor: markingAll ? 'not-allowed' : 'pointer',
                opacity: markingAll ? 0.6 : 1,
              }}
            >
              <CheckCheck size={16} />
              {markingAll ? 'Marking...' : 'Mark All Read'}
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl border transition-all hover:scale-105"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            title="Refresh"
          >
            <RefreshCw size={16} style={{ color: 'var(--text-2)' }} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="med-card empty-state">
          <Bell size={64} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-3)' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>You're all caught up!</h3>
          <p style={{ color: 'var(--text-2)' }}>No active alerts or reminders at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((note, index) => {
            const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.DEFAULT;
            const IconComp = config.icon;
            // FIX: DTO field is "read" (boolean) - Jackson maps isRead → read in JSON
            const isRead = note.read === true;

            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                key={note.id}
                className="med-card flex items-start justify-between gap-4"
                style={{
                  opacity: isRead ? 0.65 : 1,
                  borderLeft: isRead ? undefined : `4px solid ${config.color}`,
                  background: isRead ? 'var(--bg-card-2)' : 'var(--bg-card)',
                }}
              >
                <div className="flex gap-4">
                  <div
                    className="p-3 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: isRead ? 'var(--bg-hover)' : config.bg, color: isRead ? 'var(--text-3)' : config.color }}
                  >
                    <IconComp size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base leading-tight" style={{ color: isRead ? 'var(--text-2)' : 'var(--text)' }}>
                        {note.title}
                      </h3>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: config.color }} />
                      )}
                    </div>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {note.message}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider mt-2" style={{ color: 'var(--text-3)' }}>
                      {new Date(note.createdAt).toLocaleString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {!isRead && (
                  <button
                    onClick={() => handleMarkAsRead(note.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex-shrink-0"
                    style={{
                      background: 'var(--success-dim)', color: 'var(--success)',
                      border: '1px solid rgba(42,122,88,0.15)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--success)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--success-dim)'; e.currentTarget.style.color = 'var(--success)'; }}
                  >
                    <CheckCircle2 size={14} />
                    Read
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
