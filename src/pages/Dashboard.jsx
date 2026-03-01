import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardData, logDoseTaken } from '../services/api';
import { Pill, CheckCircle2, Clock, Plus, ShieldCheck, Activity, Users, CheckCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { activePatientId, activePatient, hasPermission } = usePatient();
  const [data, setData] = useState({ todayMedications: [], adherenceScore: 100, patientName: '' });
  const [loading, setLoading] = useState(true);
  // Track which med IDs have been taken this session (optimistic UI)
  const [takenIds, setTakenIds] = useState(new Set());
  const [takingId, setTakingId] = useState(null); // which one is in-flight

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardData(activePatientId);
      setData(res.data.data);
      // Reset taken state when switching patients
      setTakenIds(new Set());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [activePatientId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleTakeDose = async (med) => {
    if (takenIds.has(med.medicationId)) return; // already logged
    if (!hasPermission('MEDICATION_EDIT') && activePatient) {
      toast.error("You don't have permission to log doses for this patient.");
      return;
    }

    setTakingId(med.medicationId);
    // Optimistic UI — mark as taken immediately
    setTakenIds(prev => new Set([...prev, med.medicationId]));

    try {
      await logDoseTaken(med.medicationId, activePatientId);
      const medName = med.medicationName;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      toast.success(
        <div>
          <p style={{ fontWeight: 700, marginBottom: 2 }}>Dose logged</p>
          <p style={{ fontSize: 12, opacity: 0.8 }}>{medName} · {time}</p>
        </div>
      );
      // Refresh to get updated quantity
      setTimeout(fetchDashboard, 800);
    } catch (err) {
      // Rollback optimistic update on error
      setTakenIds(prev => { const s = new Set(prev); s.delete(med.medicationId); return s; });
      const msg = err.response?.data?.message || 'Failed to log dose';
      toast.error(msg);
    } finally {
      setTakingId(null);
    }
  };

  // SVG Circular Progress Calculation
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.adherenceScore / 100) * circumference;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isViewingPatient = !!activePatient;
  const canLogDose = !isViewingPatient || hasPermission('MEDICATION_EDIT');
  const totalDoses = data.todayMedications.length;
  const takenCount = takenIds.size;
  
  // Prefer name from API; fall back to access record fields
  const resolvedPatientName = data.patientName ||
    (activePatient
      ? (`${activePatient.patientFirstName || ''} ${activePatient.patientLastName || ''}`).trim() || activePatient.patientEmail
      : 'Friend');

  return (
    <div className="space-y-8">

      {/* Patient context banner */}
      <AnimatePresence>
        {isViewingPatient && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: 'var(--info-dim)',
              border: '1px solid rgba(31,114,163,0.3)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <Users size={16} style={{ color: 'var(--info)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--info)' }}>
              You are viewing <strong>{resolvedPatientName}'s</strong> dashboard as their caregiver.
              {!canLogDose && <span style={{ marginLeft: 8, opacity: 0.75 }}>You can view but not log doses (no Edit permission).</span>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="hero-banner flex flex-col md:flex-row items-center justify-between shadow-md"
      >
        <div className="z-10 relative">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {isViewingPatient ? `${resolvedPatientName}'s Dashboard` : `Good morning, ${resolvedPatientName || 'Friend'}!`}
          </h1>
          <p className="text-white/80 text-lg">
            {data.adherenceScore >= 80
              ? "Doing great staying on track this week."
              : "Let's get back on track with health goals today."}
          </p>
          {/* Today's progress */}
          {totalDoses > 0 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                height: 6, width: 160, background: 'rgba(255,255,255,0.2)',
                borderRadius: 10, overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(takenCount / totalDoses) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  style={{ height: '100%', background: '#fff', borderRadius: 10 }}
                />
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                {takenCount}/{totalDoses} doses today
              </span>
            </div>
          )}
        </div>

        {/* Adherence Ring */}
        <div className="z-10 flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 mt-6 md:mt-0">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/20" />
              <motion.circle
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={circumference}
                className="text-white drop-shadow-md"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold font-display">{data.adherenceScore}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">Weekly</p>
            <p className="text-lg font-bold">Adherence</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 2. TODAY'S DOSES */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text">Today's Schedule</h2>
            <span className="px-3 py-1 bg-accent-dim text-accent rounded-full text-sm font-bold">
              {data.todayMedications.length} Doses
            </span>
          </div>

          {data.todayMedications.length === 0 ? (
            <div className="med-card empty-state">
              <div className="w-20 h-20 bg-bg-hover rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill size={40} className="text-text-3" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">All clear!</h3>
              <p className="text-text-2 mb-6">No medications scheduled for today.</p>
              {!isViewingPatient && (
                <Link to="/medications" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-full shadow-md hover:bg-accent-2 transition-colors">
                  <Plus size={20} /> Add Medication
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {data.todayMedications.map((med, index) => {
                const isTaken = takenIds.has(med.medicationId);
                const isLoading = takingId === med.medicationId;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }}
                    key={`${med.medicationId}-${med.intakeTime}`}
                    className="med-card flex items-center justify-between"
                    style={{
                      borderLeft: `4px solid ${isTaken ? 'var(--success)' : 'var(--accent)'}`,
                      opacity: isTaken ? 0.75 : 1,
                      transition: 'all 0.3s',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: isTaken ? 'var(--success-dim)' : 'var(--accent-dim)',
                          color: isTaken ? 'var(--success)' : 'var(--accent)',
                        }}
                      >
                        {isTaken ? <CheckCheck size={22} /> : <Pill size={22} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-text" style={{ textDecoration: isTaken ? 'line-through' : 'none', opacity: isTaken ? 0.6 : 1 }}>
                          {med.medicationName}
                        </h3>
                        <p className="text-text-2 text-sm">{med.dosage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-text flex items-center gap-1">
                          <Clock size={16} className="text-text-3" />
                          {typeof med.intakeTime === 'string'
                            ? med.intakeTime.substring(0, 5)
                            : med.intakeTime}
                        </p>
                        <p className="text-xs text-text-3 font-medium uppercase tracking-wider">
                          {med.intakeTiming?.replace(/_/g, ' ')}
                        </p>
                      </div>

                      {/* Take Dose Button */}
                      <AnimatePresence mode="wait">
                        {isTaken ? (
                          <motion.div
                            key="done"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            style={{
                              width: 42, height: 42, borderRadius: '50%',
                              background: 'var(--success)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <CheckCircle2 size={22} color="#fff" />
                          </motion.div>
                        ) : (
                          <motion.button
                            key="take"
                            initial={{ scale: 1 }} whileTap={{ scale: 0.92 }}
                            onClick={() => handleTakeDose(med)}
                            disabled={isLoading || !canLogDose}
                            title={canLogDose ? 'Mark as taken' : 'No permission to log doses'}
                            style={{
                              width: 42, height: 42, borderRadius: '50%',
                              border: canLogDose ? '2.5px solid var(--accent)' : '2.5px solid var(--border)',
                              background: 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: canLogDose ? 'pointer' : 'not-allowed',
                              color: canLogDose ? 'var(--accent)' : 'var(--text-3)',
                              transition: 'all 0.2s',
                              opacity: isLoading ? 0.6 : 1,
                            }}
                            onMouseEnter={e => { if (canLogDose) { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = canLogDose ? 'var(--accent)' : 'var(--text-3)'; }}
                          >
                            {isLoading
                              ? <div style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                              : <CheckCircle2 size={22} />
                            }
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* All done celebration */}
          <AnimatePresence>
            {totalDoses > 0 && takenCount === totalDoses && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  padding: '14px 20px', borderRadius: 16,
                  background: 'var(--success-dim)', border: '1.5px solid rgba(42,122,88,0.3)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <CheckCheck size={22} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>All doses taken for today</p>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {isViewingPatient ? `${resolvedPatientName} has` : "You've"} completed all medications for today.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. QUICK ACTIONS */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-text">Quick Actions</h2>

          <Link to="/medications" className="med-card flex items-center gap-4 hover:bg-accent-dim hover:border-accent block">
            <div className="p-3 bg-accent text-white rounded-xl shadow-sm"><Plus size={24} /></div>
            <div>
              <h4 className="font-bold text-text">{isViewingPatient ? "View Medications" : "Add Medication"}</h4>
              <p className="text-sm text-text-2">{isViewingPatient ? "See their cabinet" : "Log a new prescription"}</p>
            </div>
          </Link>

          <Link to="/access" className="med-card flex items-center gap-4 hover:bg-info-dim hover:border-info block">
            <div className="p-3 bg-info text-white rounded-xl shadow-sm"><ShieldCheck size={24} /></div>
            <div>
              <h4 className="font-bold text-text">Manage Access</h4>
              <p className="text-sm text-text-2">View caregivers & permissions</p>
            </div>
          </Link>

          <Link to="/logs" className="med-card flex items-center gap-4 hover:bg-warning-dim hover:border-warning block">
            <div className="p-3 bg-warning text-white rounded-xl shadow-sm"><Activity size={24} /></div>
            <div>
              <h4 className="font-bold text-text">View Activity</h4>
              <p className="text-sm text-text-2">Check recent account changes</p>
            </div>
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}