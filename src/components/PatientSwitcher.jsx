import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ChevronDown, X, UserCircle, ShieldCheck, Eye } from 'lucide-react'
import { usePatient } from '../context/PatientContext'

const PERMISSION_LABELS = {
  MEDICATION_VIEW: 'View Meds',
  MEDICATION_CREATE: 'Add Meds',
  MEDICATION_EDIT: 'Edit Meds',
  MEDICATION_DELETE: 'Archive',
  SCHEDULE_VIEW: 'View Schedule',
  SCHEDULE_EDIT: 'Edit Schedule',
  VIEW_HISTORY: 'History',
  VIEW_REPORTS: 'Reports',
}

export default function PatientSwitcher() {
  const { activePatient, accessiblePatients, switchToPatient, switchToSelf, loadingPatients } = usePatient()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (accessiblePatients.length === 0 && !activePatient) return null

  const patientName = activePatient
    ? `${activePatient.patientFirstName || ''} ${activePatient.patientLastName || ''}`.trim() || activePatient.patientEmail
    : null

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 100 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 24,
          border: activePatient ? '1.5px solid var(--info)' : '1.5px solid var(--border)',
          background: activePatient ? 'var(--info-dim)' : 'var(--bg-card)',
          color: activePatient ? 'var(--info)' : 'var(--text-2)',
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        <Users size={15} />
        {activePatient ? (
          <span>Viewing: <strong style={{ color: 'var(--info)' }}>{patientName}</strong></span>
        ) : (
          <span>Switch Patient</span>
        )}
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              minWidth: 300, maxWidth: 360,
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 16,
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '12px 16px 10px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <ShieldCheck size={15} style={{ color: 'var(--info)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Care Circle
              </span>
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {/* Own account option */}
              <div
                onClick={() => { switchToSelf(); setOpen(false) }}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: !activePatient ? 'var(--accent-dim)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (activePatient) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (activePatient) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: !activePatient ? 'var(--accent)' : 'var(--bg-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <UserCircle size={18} style={{ color: !activePatient ? '#fff' : 'var(--text-3)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>My Account</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>View your own medications</p>
                </div>
                {!activePatient && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: 'var(--accent)', color: '#fff', fontWeight: 700,
                  }}>Active</span>
                )}
              </div>

              {loadingPatients ? (
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--info)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                </div>
              ) : accessiblePatients.length === 0 ? (
                <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No patients accessible yet.</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Request access via Care Circle.</p>
                </div>
              ) : (
                accessiblePatients.map(access => {
                  const name = `${access.patientFirstName || ''} ${access.patientLastName || ''}`.trim() || access.patientEmail
                  const isSelected = activePatient?.patientId === access.patientId
                  const permCount = access.permissions?.length ?? 0
                  return (
                    <div
                      key={access.id}
                      onClick={() => { switchToPatient(access); setOpen(false) }}
                      style={{
                        padding: '12px 16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        background: isSelected ? 'var(--info-dim)' : 'transparent',
                        borderTop: '1px solid var(--border)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: isSelected ? 'var(--info)' : 'var(--bg-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 14, fontWeight: 700,
                        color: isSelected ? '#fff' : 'var(--text-2)',
                      }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                          {isSelected && (
                            <span style={{
                              fontSize: 10, padding: '2px 8px', borderRadius: 20,
                              background: 'var(--info)', color: '#fff', fontWeight: 700, flexShrink: 0,
                            }}>Active</span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                          {access.relationship?.replace(/_/g, ' ')} · {permCount} permission{permCount !== 1 ? 's' : ''}
                        </p>
                        {/* Permission pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                          {access.permissions?.slice(0, 4).map(p => (
                            <span key={p} style={{
                              fontSize: 9, padding: '1px 6px', borderRadius: 8,
                              background: 'var(--bg-hover)', color: 'var(--text-3)',
                              border: '1px solid var(--border)', fontWeight: 600,
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                              {PERMISSION_LABELS[p] || p}
                            </span>
                          ))}
                          {(access.permissions?.length ?? 0) > 4 && (
                            <span style={{ fontSize: 9, color: 'var(--text-3)', padding: '1px 0' }}>
                              +{access.permissions.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {activePatient && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px' }}>
                <button
                  onClick={() => { switchToSelf(); setOpen(false) }}
                  style={{
                    width: '100%', padding: '8px', borderRadius: 10,
                    border: '1px solid var(--danger)', color: 'var(--danger)',
                    background: 'transparent', cursor: 'pointer', fontSize: 13,
                    fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-dim)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={14} /> Exit Patient View
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}