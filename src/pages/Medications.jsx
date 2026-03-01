import React, { useState, useEffect, useCallback } from 'react';
import { Pill, Plus, Trash2, Edit2, AlertCircle, AlertTriangle, Clock, RefreshCw, CheckCircle, CheckCheck, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMedication, archiveMedication, getMedicationSuggestions, updateMedication, logDoseTaken, getDoseLogs } from '../services/api';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { usePatient } from '../context/PatientContext';

const MED_TYPES = ['PILL', 'CAPSULE', 'LIQUID', 'INJECTION', 'TOPICAL', 'INHALER', 'PATCH', 'OTHER'];

const EMPTY_FORM = {
  name: '', dosage: '', type: 'PILL', quantity: '',
  doctorName: '', instructions: '', brandName: '',
  startDate: '', endDate: '', expiryDate: ''
};

// ─── MedForm is OUTSIDE Medications to prevent re-mounting on every keystroke ───
function MedForm({ formData, setFormData, onSubmit, onCancel, isSubmitting, submitLabel }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    if (value.length >= 2) {
      try {
        const res = await getMedicationSuggestions(value);
        setSuggestions(res.data.data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (med) => {
    setFormData(prev => ({
      ...prev,
      name: med.name,
      dosage: med.dosage || prev.dosage,
      type: med.type || prev.type,
      doctorName: med.doctorName || prev.doctorName,
      brandName: med.brandName || prev.brandName,
      instructions: med.instructions || prev.instructions,
    }));
    setShowSuggestions(false);
  };

  const inputStyle = {
    border: '1.5px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text)',
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Name with suggestions */}
      <div style={{ position: 'relative' }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
          Medication Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={handleNameChange}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          style={inputStyle}
          placeholder="e.g. Lisinopril"
          autoComplete="off"
        />
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', zIndex: 50, width: '100%', marginTop: 4,
                borderRadius: 12, boxShadow: 'var(--shadow-md)',
                background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                maxHeight: 200, overflowY: 'auto',
              }}
            >
              <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                Previously Used
              </div>
              {suggestions.map((sug) => (
                <div key={sug.id} onMouseDown={() => handleSelectSuggestion(sug)}
                  style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{sug.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{sug.dosage}{sug.doctorName ? ` · Dr. ${sug.doctorName.replace(/^Dr\.?\s*/i, '')}` : ''}</p>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-hover)', color: 'var(--text-3)', fontWeight: 600 }}>Autofill</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dosage + Quantity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Dosage *</label>
          <input
            type="text" required value={formData.dosage}
            onChange={e => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
            style={inputStyle} placeholder="e.g. 10mg"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Quantity *</label>
          <input
            type="number" required min="0" value={formData.quantity}
            onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            style={inputStyle} placeholder="e.g. 30"
          />
        </div>
      </div>

      {/* Type + Brand */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {MED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Brand Name</label>
          <input
            type="text" value={formData.brandName}
            onChange={e => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
            style={inputStyle} placeholder="e.g. Zestril"
          />
        </div>
      </div>

      {/* Doctor */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Prescribing Doctor</label>
        <input
          type="text" value={formData.doctorName}
          onChange={e => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
          style={inputStyle} placeholder="Dr. Smith"
        />
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        {[{ key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' }, { key: 'expiryDate', label: 'Expiry Date' }].map(({ key, label }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{label}</label>
            <input
              type="date" value={formData[key]}
              onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
              style={{ ...inputStyle, padding: '10px 10px', fontSize: 13 }}
            />
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Instructions</label>
        <textarea
          rows={2} value={formData.instructions}
          onChange={e => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
          style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
          placeholder="e.g. Take with food"
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
        <button
          type="button" onClick={onCancel}
          style={{
            flex: 1, padding: '12px', borderRadius: 10, fontWeight: 600, fontSize: 14,
            border: '1.5px solid var(--border)', color: 'var(--text)', background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit" disabled={isSubmitting}
          style={{
            flex: 1, padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            background: 'var(--accent)', color: '#fff', border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Medications() {
  const { activePatientId, activePatient, hasPermission } = usePatient();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [logsModal, setLogsModal] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  const [takingId, setTakingId] = useState(null);
  const [recentlyTaken, setRecentlyTaken] = useState(new Set());

  const canCreate = !activePatient || hasPermission('MEDICATION_CREATE');
  const canEdit   = !activePatient || hasPermission('MEDICATION_EDIT');
  const canDelete = !activePatient || hasPermission('MEDICATION_DELETE');

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/medication${activePatientId ? `?patientId=${activePatientId}` : ''}`);
      setMedications(res.data.data || []);
      setRecentlyTaken(new Set());
    } catch (err) {
      console.error('Failed to fetch medications', err);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  }, [activePatientId]);

  useEffect(() => { fetchMedications(); }, [fetchMedications]);

  const handleTakeDose = async (med) => {
    if (!canEdit) { toast.error('No permission to log doses for this patient.'); return; }
    if (recentlyTaken.has(med.id)) return;
    setTakingId(med.id);
    setRecentlyTaken(prev => new Set([...prev, med.id]));
    try {
      await logDoseTaken(med.id, activePatientId);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      toast.success(<div><p style={{ fontWeight: 700 }}>Dose logged</p><p style={{ fontSize: 12, opacity: 0.8 }}>{med.name} · {time}</p></div>);
      setTimeout(fetchMedications, 600);
    } catch (err) {
      setRecentlyTaken(prev => { const s = new Set(prev); s.delete(med.id); return s; });
      toast.error(err.response?.data?.message || 'Failed to log dose');
    } finally {
      setTakingId(null);
    }
  };

  const openDoseLogs = async (med) => {
    setLogsModal({ med, logs: [] });
    setLogsLoading(true);
    try {
      const res = await getDoseLogs(med.id, activePatientId);
      setLogsModal({ med, logs: res.data.data || [] });
    } catch {
      setLogsModal({ med, logs: [] });
    } finally {
      setLogsLoading(false);
    }
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setIsAddModalOpen(true);
  };

  const openEdit = (med) => {
    setFormData({
      name: med.name || '',
      dosage: med.dosage || '',
      type: med.type || 'PILL',
      quantity: med.quantityLeft ?? '',
      doctorName: med.doctorName || '',
      instructions: med.instructions || '',
      brandName: med.brandName || '',
      startDate: med.startDate || '',
      endDate: med.endDate || '',
      expiryDate: med.expiryDate || '',
    });
    setEditingMed(med);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createMedication(formData, activePatientId);
      setIsAddModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchMedications();
      toast.success('Medication added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateMedication(editingMed.id, {
        ...formData,
        quantity: formData.quantity !== '' ? Number(formData.quantity) : undefined,
      }, activePatientId);
      setEditingMed(null);
      setFormData(EMPTY_FORM);
      fetchMedications();
      toast.success('Medication updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id, name) => {
    if (!window.confirm(`Archive "${name}"? It will be moved to the Archive and can be restored.`)) return;
    try {
      await archiveMedication(id, 'User archived from cabinet', activePatientId);
      setMedications(prev => prev.filter(m => m.id !== id));
      toast.success(`"${name}" archived`);
    } catch {
      toast.error('Failed to archive medication');
    }
  };

  const isExpiringSoon = (d) => { if (!d) return false; const days = Math.ceil((new Date(d) - new Date()) / 86400000); return days <= 30 && days >= 0; };
  const isExpired = (d) => { if (!d) return false; return new Date(d) < new Date(); };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text)' }}>
            {activePatient ? `${activePatient.patientFirstName || 'Patient'}'s Medication Cabinet` : 'Medication Cabinet'}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>
            Manage {activePatient ? 'their' : 'your'} active prescriptions and supplements.
            {medications.length > 0 && <span className="ml-2 font-semibold" style={{ color: 'var(--accent)' }}>{medications.length} active</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMedications} className="p-2.5 rounded-xl border transition-all"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} title="Refresh">
            <RefreshCw size={17} style={{ color: 'var(--text-2)' }} />
          </button>
          {canCreate && (
            <button onClick={openAdd}
              className="flex items-center gap-2 px-6 py-2.5 font-semibold rounded-full shadow-sm text-sm text-white"
              style={{ background: 'var(--accent)' }}>
              <Plus size={18} /> Add Medication
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full mx-auto" />
        </div>
      ) : medications.length === 0 ? (
        <div className="med-card empty-state">
          <Pill size={56} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-3)' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Cabinet is empty</h3>
          <p style={{ color: 'var(--text-2)', maxWidth: 360, margin: '0 auto' }}>
            {activePatient ? `${activePatient.patientFirstName || 'This patient'} has no active medications.` : 'Add your first medication to start tracking.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {medications.map((med, index) => {
            const expired = isExpired(med.expiryDate);
            const expiringSoon = isExpiringSoon(med.expiryDate);
            const lowStock = med.quantityLeft <= 5;
            const isTaken = recentlyTaken.has(med.id);
            const isLoading = takingId === med.id;

            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                key={med.id}
                className="med-card flex flex-col justify-between"
                style={{ borderLeft: isTaken ? '4px solid var(--success)' : undefined }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl" style={{ background: isTaken ? 'var(--success-dim)' : 'var(--accent-dim)', color: isTaken ? 'var(--success)' : 'var(--accent)' }}>
                        {isTaken ? <CheckCheck size={22} /> : <Pill size={22} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--text)' }}>{med.name}</h3>
                        {med.brandName && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{med.brandName}</p>}
                        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-2)' }}>{med.dosage}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{
                      background: lowStock ? 'var(--danger-dim)' : 'var(--success-dim)',
                      color: lowStock ? 'var(--danger)' : 'var(--success)',
                    }}>{med.quantityLeft} left</span>
                  </div>

                  <div className="space-y-1.5 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    {med.doctorName && (
                      <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                        <AlertCircle size={12} style={{ color: 'var(--info)' }} /> Dr. {med.doctorName.replace(/^Dr\.?\s*/i, '')}
                      </p>
                    )}
                    {med.expiryDate && (
                      <p className="text-xs flex items-center gap-2" style={{ color: expired ? 'var(--danger)' : expiringSoon ? 'var(--warning)' : 'var(--text-2)' }}>
                        <Clock size={12} />
                        {expired ? 'Expired: ' : 'Expires: '}{new Date(med.expiryDate).toLocaleDateString()}
                        {expiringSoon && !expired && <AlertTriangle size={11} />}
                      </p>
                    )}
                    {lowStock && <p className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block" style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>Low stock — refill soon</p>}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
                  {canEdit && (
                    <button onClick={() => handleTakeDose(med)} disabled={isLoading || isTaken}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all"
                      style={{
                        background: isTaken ? 'var(--success-dim)' : 'var(--accent)',
                        color: isTaken ? 'var(--success)' : '#fff',
                        cursor: isTaken ? 'default' : 'pointer',
                        border: isTaken ? '1.5px solid rgba(42,122,88,0.3)' : 'none',
                        opacity: isLoading ? 0.7 : 1,
                      }}>
                      {isLoading
                        ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Logging...</>
                        : isTaken
                          ? <><CheckCheck size={16} /> Dose Logged!</>
                          : <><CheckCircle size={16} /> Take Dose</>}
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => openDoseLogs(med)}
                      className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg flex-1 transition-colors"
                      style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <History size={13} /> History
                    </button>
                    {canEdit && (
                      <button onClick={() => openEdit(med)}
                        className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg flex-1 transition-colors"
                        style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Edit2 size={13} /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleArchive(med.id, med.name)}
                        className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg flex-1 transition-colors"
                        style={{ color: 'var(--danger)', border: '1px solid rgba(203,67,53,0.2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-dim)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Trash2 size={13} /> Archive
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <Modal open={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setFormData(EMPTY_FORM); }} title="Add New Medication">
          <MedForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAdd}
            onCancel={() => { setIsAddModalOpen(false); setFormData(EMPTY_FORM); }}
            isSubmitting={isSubmitting}
            submitLabel="Save Medication"
          />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editingMed && (
        <Modal open={!!editingMed} onClose={() => { setEditingMed(null); setFormData(EMPTY_FORM); }} title={`Edit: ${editingMed.name}`}>
          <MedForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            onCancel={() => { setEditingMed(null); setFormData(EMPTY_FORM); }}
            isSubmitting={isSubmitting}
            submitLabel="Update Medication"
          />
        </Modal>
      )}

      {/* DOSE HISTORY MODAL */}
      {logsModal && (
        <Modal open={!!logsModal} onClose={() => setLogsModal(null)} title={`Dose History: ${logsModal.med.name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
              <span>{logsModal.med.dosage} · {logsModal.med.quantityLeft} remaining</span>
              {logsModal.logs.length > 0 && <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{logsModal.logs.length} log{logsModal.logs.length !== 1 ? 's' : ''}</span>}
            </div>
            {logsLoading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 10 }}>Loading history...</p>
              </div>
            ) : logsModal.logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <History size={40} style={{ color: 'var(--text-3)', opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>No doses logged yet</p>
                <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>Use "Take Dose" to start tracking.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                {logsModal.logs.map((log, i) => {
                  const takenAt = log.takenAt ? new Date(log.takenAt) : null;
                  const isToday = takenAt && takenAt.toDateString() === new Date().toDateString();
                  return (
                    <motion.div key={log.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, marginBottom: 6,
                        background: isToday ? 'var(--success-dim)' : 'var(--bg-card-2)',
                        border: `1px solid ${isToday ? 'rgba(42,122,88,0.2)' : 'var(--border)'}`,
                      }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: log.status === 'TAKEN' ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {log.status === 'TAKEN' ? <CheckCheck size={16} color="#fff" /> : <X size={16} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          {log.status === 'TAKEN' ? 'Dose Taken' : `Skipped${log.skippedReason ? `: ${log.skippedReason}` : ''}`}
                        </p>
                        {takenAt && (
                          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                            {isToday ? 'Today' : takenAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {' · '}{takenAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      {isToday && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: 'var(--success)', color: '#fff', fontWeight: 700 }}>Today</span>}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}