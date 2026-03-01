import React, { useState, useEffect } from 'react';
import { getMyActivityLogs } from '../services/api';
import { History, User, Activity, Clock, Pill, ShieldCheck, Building2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatient } from '../context/PatientContext';

// Color and icon by action type
const ACTION_CONFIG = {
  CREATE:           { color: 'var(--success)', bg: 'var(--success-dim)', label: 'Added' },
  UPDATE:           { color: 'var(--info)',    bg: 'var(--info-dim)',    label: 'Updated' },
  DELETE:           { color: 'var(--danger)',  bg: 'var(--danger-dim)', label: 'Archived' },
  RESTORE:          { color: 'var(--accent)',  bg: 'var(--accent-dim)', label: 'Restored' },
  APPROVE:          { color: 'var(--success)', bg: 'var(--success-dim)', label: 'Approved' },
  REJECT:           { color: 'var(--danger)',  bg: 'var(--danger-dim)', label: 'Rejected' },
  REVOKE:           { color: 'var(--danger)',  bg: 'var(--danger-dim)', label: 'Revoked' },
  PERMISSION_CHANGE:{ color: 'var(--warning)', bg: 'var(--warning-dim)', label: 'Permissions' },
  LOGIN:            { color: 'var(--text-3)',  bg: 'var(--bg-hover)',   label: 'Login' },
  REGISTER:         { color: 'var(--accent)',  bg: 'var(--accent-dim)', label: 'Registered' },
};

const ENTITY_ICONS = {
  MEDICATION:     Pill,
  ACCESS_CONTROL: ShieldCheck,
  ORGANIZATION:   Building2,
  DEFAULT:        Activity,
};

function groupByDate(logs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups = { Today: [], Yesterday: [], 'Last Week': [], Earlier: [] };
  logs.forEach(log => {
    const d = new Date(log.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups['Today'].push(log);
    else if (d.getTime() === yesterday.getTime()) groups['Yesterday'].push(log);
    else if (d >= lastWeek) groups['Last Week'].push(log);
    else groups['Earlier'].push(log);
  });
  return groups;
}

export default function Logs() {
  const { activePatientId, activePatient } = usePatient();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [activePatientId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // When viewing as caregiver, pass patientId to get the patient's own activity logs
      const res = activePatientId
        ? await import('../services/api').then(api => api.getPatientActivityLogs(activePatientId))
        : await getMyActivityLogs();
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Log fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const grouped = groupByDate(logs);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">
            {activePatient ? `${activePatient.patientFirstName || 'Patient'}'s Activity Log` : 'Account Activity'}
          </h1>
          <p className="text-text-2 mt-1">A transparent, tamper-proof log of all changes to your health records.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-full border transition-all hover:scale-105"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          title="Refresh"
        >
          <RefreshCw size={18} style={{ color: 'var(--text-2)' }} />
        </button>
      </div>

      <div className="med-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-3)' }}>
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No activity recorded yet.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Actions on your account will appear here.</p>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([group, groupLogs]) => {
              if (groupLogs.length === 0) return null;
              return (
                <div key={group} className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md"
                      style={{ color: 'var(--text-3)', background: 'var(--bg-hover)' }}>
                      {group}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>

                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {groupLogs.map((log, index) => {
                      const actionCfg = ACTION_CONFIG[log.actionType] || ACTION_CONFIG.CREATE;
                      const EntityIcon = ENTITY_ICONS[log.entityType] || ENTITY_ICONS.DEFAULT;
                      // FIX: uses correct DTO fields (actorFirstName, actorLastName, etc.)
                      const isSelf = log.actorId === log.targetUserId;

                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          key={log.id}
                          className="py-3.5 flex items-start gap-4 px-2 rounded-lg transition-colors"
                          style={{ cursor: 'default' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Entity icon */}
                          <div
                            className="mt-0.5 p-2.5 rounded-lg flex-shrink-0"
                            style={{ background: actionCfg.bg, color: actionCfg.color }}
                          >
                            <EntityIcon size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <p className="font-medium text-sm leading-snug" style={{ color: 'var(--text)' }}>
                                {log.readableMessage}
                              </p>
                              <span className="text-xs flex-shrink-0 font-medium" style={{ color: 'var(--text-3)' }}>
                                {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {!isSelf && (
                                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                                  <User size={10} />
                                  {log.actorFirstName} {log.actorLastName}
                                </span>
                              )}
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: actionCfg.bg, color: actionCfg.color }}
                              >
                                {actionCfg.label}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: 'var(--bg-hover)', color: 'var(--text-3)' }}>
                                {log.entityType?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}