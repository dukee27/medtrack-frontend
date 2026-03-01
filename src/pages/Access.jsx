import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, ShieldAlert, UserX, Users, Edit, Check, X,
  Send, Clock, AlertCircle, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getActiveCaregivers, updateCaregiverPermissions, revokeAccess,
  requestAccess, getPendingRequests, approveAccessRequest, rejectAccessRequest,
  getAccessiblePatients
} from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const PERMISSION_DEFINITIONS = [
  { id: 'MEDICATION_VIEW',   label: 'View Medications',  desc: 'Can see your active prescriptions.' },
  { id: 'MEDICATION_CREATE', label: 'Add Medications',   desc: 'Can add new medications to your cabinet.' },
  { id: 'MEDICATION_EDIT',   label: 'Edit Medications',  desc: 'Can update dosage, instructions, etc.' },
  { id: 'MEDICATION_DELETE', label: 'Archive Medications',desc: 'Can archive medications.' },
  { id: 'SCHEDULE_VIEW',     label: 'View Schedules',    desc: 'Can see when you take your doses.' },
  { id: 'SCHEDULE_EDIT',     label: 'Manage Schedules',  desc: 'Can change your intake schedules.' },
  { id: 'VIEW_HISTORY',      label: 'View History',      desc: 'Can see your adherence and activity logs.' },
  { id: 'VIEW_REPORTS',      label: 'View Reports',      desc: 'Can access low stock and expiry reports.' },
];

const RELATIONSHIP_TYPES = [
  'DAUGHTER', 'SON', 'SPOUSE', 'MOM', 'DAD', 'SIBLING', 'GUARDIAN', 'NURSE', 'OTHER'
];

export default function Access() {
  const [caregivers, setCaregivers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [accessiblePatients, setAccessiblePatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permission modal
  const [selectedAccess, setSelectedAccess] = useState(null);
  const [activePermissions, setActivePermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ patientEmail: '', relationship: 'OTHER' });
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [caregiverRes, pendingRes, patientsRes] = await Promise.allSettled([
        getActiveCaregivers(),
        getPendingRequests(),
        getAccessiblePatients(),
      ]);
      if (caregiverRes.status === 'fulfilled') setCaregivers(caregiverRes.value.data.data || []);
      if (pendingRes.status === 'fulfilled') setPendingRequests(pendingRes.value.data.data || []);
      if (patientsRes.status === 'fulfilled') setAccessiblePatients(patientsRes.value.data.data || []);
    } catch (err) {
      console.error('Failed to load access data', err);
    } finally {
      setLoading(false);
    }
  };

  const openPermissionModal = (access) => {
    setSelectedAccess(access);
    setActivePermissions(access.permissions || []);
  };

  const togglePermission = (permId) => {
    setActivePermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      await updateCaregiverPermissions(selectedAccess.id, activePermissions);
      setCaregivers(caregivers.map(c =>
        c.id === selectedAccess.id ? { ...c, permissions: activePermissions } : c
      ));
      setSelectedAccess(null);
      toast.success('Permissions updated successfully');
    } catch (err) {
      toast.error('Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async (id, name) => {
    if (window.confirm(`Are you sure you want to revoke access for ${name}?`)) {
      try {
        await revokeAccess(id);
        setCaregivers(caregivers.filter(c => c.id !== id));
        toast.success(`Access revoked for ${name}`);
      } catch (err) {
        toast.error('Failed to revoke access');
      }
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await requestAccess(inviteForm);
      setShowInviteModal(false);
      setInviteForm({ patientEmail: '', relationship: 'OTHER' });
      toast.success('Access request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setIsInviting(false);
    }
  };

  const handleApprove = async (req) => {
    try {
      await approveAccessRequest(req.id, { permissions: ['MEDICATION_VIEW', 'SCHEDULE_VIEW'] });
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      await fetchAll();
      toast.success(`Approved access for ${req.caregiverFirstName || req.caregiverEmail}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (req) => {
    if (!window.confirm(`Reject access request from ${req.caregiverFirstName || req.caregiverEmail}?`)) return;
    try {
      await rejectAccessRequest(req.id);
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      toast.success('Request rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  // FIX: Use correct DTO fields (caregiverFirstName/LastName instead of caregiverEmail only)
  const getCaregiverDisplayName = (access) => {
    if (access.caregiverFirstName) {
      return `${access.caregiverFirstName} ${access.caregiverLastName || ''}`.trim();
    }
    return access.caregiverEmail;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text)' }}>Care Circle</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>
            Manage who has access to your health records and what they can do.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-full shadow-sm transition-all"
          style={{ background: 'var(--info)', color: 'white' }}
        >
          <Users size={18} /> Request / Invite Access
        </button>
      </div>

      {/* Info banner */}
      <div className="p-4 rounded-xl flex items-start gap-3"
        style={{ background: 'var(--info-dim)', border: '1px solid rgba(31,114,163,0.2)' }}>
        <ShieldCheck size={20} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm font-medium" style={{ color: 'var(--info)' }}>
          You are in full control. Granularly restrict what each caregiver can see or do, and revoke access at any time.
        </p>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
            Pending Requests
            <span className="ml-2 text-sm px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}>
              {pendingRequests.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="med-card flex flex-col gap-4"
                style={{ borderLeft: '4px solid var(--warning)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full" style={{ background: 'var(--warning-dim)' }}>
                    <Clock size={18} style={{ color: 'var(--warning)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      {req.caregiverFirstName || req.caregiverEmail}
                      {req.caregiverLastName ? ` ${req.caregiverLastName}` : ''}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--warning)' }}>
                      {req.relationship?.replace(/_/g, ' ')} · Pending
                    </p>
                    {req.caregiverEmail && req.caregiverFirstName && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{req.caregiverEmail}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => handleApprove(req)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg text-white transition-all"
                    style={{ background: 'var(--success)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Check size={15} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all"
                    style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Caregivers */}
      <div>
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
          People With Access
          {caregivers.length > 0 && (
            <span className="ml-2 text-sm px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--success-dim)', color: 'var(--success)' }}>
              {caregivers.length} active
            </span>
          )}
        </h2>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-info border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : caregivers.length === 0 ? (
          <div className="med-card empty-state">
            <ShieldAlert size={56} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-3)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Private & Secure</h3>
            <p style={{ color: 'var(--text-2)', maxWidth: 360, margin: '0 auto' }}>
              No one currently has access to your account. Invite a family member or doctor to coordinate your care.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caregivers.map((access, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }}
                key={access.id}
                className="med-card flex flex-col justify-between relative overflow-hidden"
                style={{ borderLeft: '4px solid var(--info)' }}
              >
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold"
                  style={{ background: 'var(--success-dim)', color: 'var(--success)' }}>
                  <Check size={10} /> Active
                </div>

                <div>
                  {/* FIX: Display full name using correct DTO fields */}
                  <h3 className="font-bold text-lg pr-20" style={{ color: 'var(--text)' }}>
                    {getCaregiverDisplayName(access)}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider mt-0.5 mb-1"
                    style={{ color: 'var(--info)' }}>
                    {access.relationship?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{access.caregiverEmail}</p>

                  {/* Permissions */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>
                      Granted Permissions
                    </p>
                    {access.permissions?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {access.permissions.map(p => {
                          const def = PERMISSION_DEFINITIONS.find(d => d.id === p);
                          return def ? (
                            <span key={p} className="text-xs px-2 py-0.5 rounded-md font-medium"
                              style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                              {def.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm italic" style={{ color: 'var(--text-3)' }}>No permissions granted.</p>
                    )}
                  </div>

                  {access.createdAt && (
                    <p className="text-xs mt-3" style={{ color: 'var(--text-3)' }}>
                      Access since {new Date(access.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => openPermissionModal(access)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors"
                    style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Edit size={14} /> Edit Permissions
                  </button>
                  <button
                    onClick={() => handleRevoke(access.id, getCaregiverDisplayName(access))}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors"
                    style={{ border: '1px solid rgba(203,67,53,0.2)', color: 'var(--danger)' }}
                    title="Revoke Access"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <UserX size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Patients I Have Access To */}
      {accessiblePatients.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
            Patients I Have Access To
            <span className="ml-2 text-sm px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--info-dim)', color: 'var(--info)' }}>
              {accessiblePatients.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accessiblePatients.map((access, index) => {
              const name = `${access.patientFirstName || ''} ${access.patientLastName || ''}`.trim() || access.patientEmail;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }}
                  key={access.id}
                  className="med-card flex flex-col justify-between relative overflow-hidden"
                  style={{ borderLeft: '4px solid var(--accent)' }}
                >
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    <Eye size={10} /> Caregiver
                  </div>
                  <div>
                    <h3 className="font-bold text-lg pr-24" style={{ color: 'var(--text)' }}>{name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider mt-0.5 mb-1" style={{ color: 'var(--accent)' }}>
                      {access.relationship?.replace(/_/g, ' ')}
                    </p>
                    {access.patientEmail && access.patientFirstName && (
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{access.patientEmail}</p>
                    )}
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>
                        My Permissions
                      </p>
                      {access.permissions?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {access.permissions.map(p => {
                            const def = PERMISSION_DEFINITIONS.find(d => d.id === p);
                            return def ? (
                              <span key={p} className="text-xs px-2 py-0.5 rounded-md font-medium"
                                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-dim)' }}>
                                {def.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-sm italic" style={{ color: 'var(--text-3)' }}>No permissions granted yet.</p>
                      )}
                    </div>
                    {access.createdAt && (
                      <p className="text-xs mt-3" style={{ color: 'var(--text-3)' }}>
                        Access since {new Date(access.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* INVITE / REQUEST ACCESS MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title="Request Access to a Patient">
            <form onSubmit={handleInvite} className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Enter the email of the patient you want to request access for. They will receive a notification to approve.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>
                  Patient Email Address *
                </label>
                <input
                  type="email" required
                  value={inviteForm.patientEmail}
                  onChange={e => setInviteForm({...inviteForm, patientEmail: e.target.value})}
                  className="w-full p-3 rounded-xl focus:outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
                  placeholder="patient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>
                  Your Relationship *
                </label>
                <select
                  value={inviteForm.relationship}
                  onChange={e => setInviteForm({...inviteForm, relationship: e.target.value})}
                  className="w-full p-3 rounded-xl focus:outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
                >
                  {RELATIONSHIP_TYPES.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isInviting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-colors flex items-center justify-center gap-2"
                  style={{ background: 'var(--info)', opacity: isInviting ? 0.7 : 1 }}>
                  <Send size={16} />
                  {isInviting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* PERMISSIONS MODAL */}
      <AnimatePresence>
        {selectedAccess && (
          <Modal open={!!selectedAccess} onClose={() => setSelectedAccess(null)} title="Manage Permissions">
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Toggle what <span className="font-bold" style={{ color: 'var(--text)' }}>
                  {getCaregiverDisplayName(selectedAccess)}
                </span> is allowed to do on your account.
              </p>
              <div className="space-y-2.5">
                {PERMISSION_DEFINITIONS.map(perm => {
                  const isEnabled = activePermissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                      style={{
                        background: isEnabled ? 'var(--success-dim)' : 'var(--bg-card-2)',
                        borderColor: isEnabled ? 'rgba(42,122,88,0.3)' : 'var(--border)',
                      }}
                    >
                      <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isEnabled ? 'var(--success)' : 'var(--bg-card)',
                          border: isEnabled ? 'none' : '1.5px solid var(--border)',
                        }}>
                        {isEnabled && <Check size={12} strokeWidth={3} color="white" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm"
                          style={{ color: isEnabled ? 'var(--success)' : 'var(--text-2)' }}>
                          {perm.label}
                        </h4>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{perm.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedAccess(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
                  Cancel
                </button>
                <button onClick={handleSavePermissions} disabled={isSaving}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-colors shadow-sm"
                  style={{ background: 'var(--accent)', opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}