import React, { useState, useEffect } from 'react';
import { Building2, Home, Plus, Users, ShieldAlert, ArrowRight, Activity, UserPlus, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyOrganizations, createOrganization, getOrganizationMembers, addOrganizationMember, removeOrganizationMember } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const ORG_ROLES = ['ADMIN', 'MEMBER', 'VIEWER', 'DOCTOR', 'NURSE', 'CAREGIVER'];

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Members modal
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [formData, setFormData] = useState({ name: '', type: 'HOME' });

  useEffect(() => { fetchOrganizations(); }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await getMyOrganizations();
      setOrganizations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch organizations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrganization(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', type: 'HOME' });
      fetchOrganizations();
      toast.success('Bucket created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMembersModal = async (org) => {
    setSelectedOrg(org);
    setLoadingMembers(true);
    try {
      const res = await getOrganizationMembers(org.id);
      setMembers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load members');
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsAddingMember(true);
    try {
      await addOrganizationMember(selectedOrg.id, addMemberForm);
      const res = await getOrganizationMembers(selectedOrg.id);
      setMembers(res.data.data || []);
      setAddMemberForm({ email: '', role: 'MEMBER' });
      setShowAddMember(false);
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (member, name) => {
    // Prevent removing yourself (the owner/admin)
    if (member.role === 'ADMIN') {
      toast.error('Cannot remove the bucket owner/admin.');
      return;
    }
    if (!window.confirm(`Remove ${name} from this bucket?`)) return;
    try {
      await removeOrganizationMember(selectedOrg.id, member.id);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      toast.success(`${name} removed`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove member';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text)' }}>Care Buckets</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>
            Shared environments for family homes or clinical hospital settings.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-full shadow-sm transition-all text-white"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={18} /> Create New Bucket
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : organizations.length === 0 ? (
        <div className="med-card empty-state">
          <Building2 size={56} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-3)' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>No active buckets</h3>
          <p style={{ color: 'var(--text-2)', maxWidth: 360, margin: '0 auto' }}>
            Create a shared Home bucket for your family, or a Hospital bucket to coordinate with medical staff.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
              key={org.id}
              className="med-card flex flex-col justify-between"
              style={{ borderTop: `4px solid ${org.type === 'HOSPITAL' ? 'var(--info)' : 'var(--accent)'}` }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl"
                    style={{
                      background: org.type === 'HOSPITAL' ? 'var(--info-dim)' : 'var(--success-dim)',
                      color: org.type === 'HOSPITAL' ? 'var(--info)' : 'var(--success)'
                    }}>
                    {org.type === 'HOSPITAL' ? <Building2 size={22} /> : <Home size={22} />}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: org.type === 'HOSPITAL' ? 'var(--info-dim)' : 'var(--success-dim)',
                      color: org.type === 'HOSPITAL' ? 'var(--info)' : 'var(--success)'
                    }}>
                    {org.type} MODE
                  </span>
                </div>

                <h3 className="font-bold text-xl" style={{ color: 'var(--text)' }}>{org.name}</h3>
                {/* FIX: Using DTO fields ownerFirstName/ownerLastName */}
                <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-2)' }}>
                  Managed by {org.ownerFirstName || 'Admin'} {org.ownerLastName || ''}
                </p>

                <div className="space-y-2 mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {org.type === 'HOSPITAL' ? (
                    <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                      <ShieldAlert size={15} style={{ color: 'var(--info)' }} /> Strict Audit Logging Enabled
                    </p>
                  ) : (
                    <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                      <Users size={15} style={{ color: 'var(--accent)' }} /> Shared Family Visibility
                    </p>
                  )}
                  {/* FIX: Using memberCount from DTO */}
                  <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                    <Activity size={15} style={{ color: 'var(--warning)' }} />
                    {org.memberCount || 1} Active Member{(org.memberCount || 1) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => openMembersModal(org)}
                className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg transition-colors text-sm"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-2)'; }}
              >
                Manage Members <ArrowRight size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE BUCKET MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Organization Bucket">
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>Bucket Name *</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-xl focus:outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
                  placeholder="e.g. Smith Family Setup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-2)' }}>Environment Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'HOME', Icon: Home, color: 'var(--accent)', desc: 'Flexible sharing for family & caretakers.' },
                    { value: 'HOSPITAL', Icon: Building2, color: 'var(--info)', desc: 'Strict RBAC, mandatory audit logging.' },
                  ].map(({ value, Icon, color, desc }) => (
                    <div
                      key={value}
                      onClick={() => setFormData({...formData, type: value})}
                      className="cursor-pointer p-4 border rounded-xl transition-all"
                      style={{
                        borderColor: formData.type === value ? color : 'var(--border)',
                        background: formData.type === value ? `color-mix(in srgb, ${color} 8%, var(--bg-card))` : 'var(--bg-card-2)',
                      }}
                    >
                      <Icon size={22} style={{ color: formData.type === value ? color : 'var(--text-3)' }} />
                      <h4 className="font-bold mt-2 text-sm" style={{ color: formData.type === value ? color : 'var(--text-2)' }}>{value}</h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white shadow-sm"
                  style={{ background: 'var(--accent)', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Creating...' : 'Create Bucket'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* MEMBERS MODAL */}
      <AnimatePresence>
        {selectedOrg && (
          <Modal open={!!selectedOrg} onClose={() => { setSelectedOrg(null); setShowAddMember(false); }}
            title={`${selectedOrg.name} — Members`} size="lg">
            <div className="space-y-4">
              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                          {member.userFirstName} {member.userLastName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {member.userEmail} · <span className="font-semibold">{member.role}</span>
                          {!member.approved && ' · Pending Approval'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.approved ? (
                          <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}>Pending</span>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member, `${member.userFirstName} ${member.userLastName}`)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--danger)' }}
                          title="Remove member"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add member */}
              {!showAddMember ? (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  style={{ border: '1.5px dashed var(--border)', color: 'var(--text-2)' }}
                >
                  <UserPlus size={16} /> Add Member
                </button>
              ) : (
                <form onSubmit={handleAddMember} className="space-y-3 p-4 rounded-xl"
                  style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Add New Member</p>
                  <input
                    type="email" required
                    value={addMemberForm.email}
                    onChange={e => setAddMemberForm({...addMemberForm, email: e.target.value})}
                    placeholder="member@email.com"
                    className="w-full p-2.5 rounded-lg text-sm focus:outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
                  />
                  <select
                    value={addMemberForm.role}
                    onChange={e => setAddMemberForm({...addMemberForm, role: e.target.value})}
                    className="w-full p-2.5 rounded-lg text-sm focus:outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
                  >
                    {ORG_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowAddMember(false)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold"
                      style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
                    <button type="submit" disabled={isAddingMember}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'var(--accent)', opacity: isAddingMember ? 0.7 : 1 }}>
                      {isAddingMember ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
