import React, { useState, useEffect } from 'react';
import { getArchivedMedications, restoreMedication } from '../services/api';
import { ArchiveRestore, AlertCircle, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatient } from '../context/PatientContext';

export default function Archived() {
  const { activePatientId, activePatient, hasPermission } = usePatient();
  const [archivedMeds, setArchivedMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    fetchArchived();
  }, [activePatientId]);

  const fetchArchived = async () => {
    try {
      const res = await getArchivedMedications(activePatientId || '');
      setArchivedMeds(res.data.data);
    } catch (err) {
      console.error("Failed to fetch archived meds", err);
    } finally {
      setLoading(false);
    }
  };

  const canRestore = !activePatient || hasPermission('MEDICATION_EDIT');

  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      await restoreMedication(id, activePatientId || '');
      setArchivedMeds(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Failed to restore", err);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">
            {activePatient ? `${activePatient.patientFirstName || 'Patient'}'s Archived Items` : 'Archived Items'}
          </h1>
          <p className="text-text-2">Items here are soft-deleted and can be safely restored.</p>
        </div>
      </div>

      <div className="bg-warning-dim border border-warning/30 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="text-warning flex-shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-warning font-medium">
          For compliance and safety, health records are never permanently erased. You can view your deleted history and restore items at any time.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : archivedMeds.length === 0 ? (
        <div className="med-card empty-state">
          <ArchiveRestore size={64} className="mx-auto mb-4 text-text-3 opacity-30" />
          <h3 className="text-xl font-bold text-text mb-2">Trash is empty</h3>
          <p className="text-text-2">No archived medications found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedMeds.map((med) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              key={med.id} 
              className="med-card flex flex-col justify-between relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                Archived
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-100 rounded-full text-gray-500">
                    <Pill size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-500 line-through decoration-gray-400">{med.name}</h3>
                    <p className="text-sm text-text-3">{med.dosage}</p>
                  </div>
                </div>
                {med.doctorName && (
                  <p className="text-sm text-text-2 mb-4">Prescribed by: {med.doctorName}</p>
                )}
              </div>

              <button
                onClick={() => canRestore && handleRestore(med.id)}
                disabled={restoringId === med.id || !canRestore}
                title={!canRestore ? 'No permission to restore medications' : undefined}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-accent-dim text-accent font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors"
                style={{ opacity: !canRestore ? 0.4 : 1, cursor: !canRestore ? 'not-allowed' : 'pointer' }}
              >
                {restoringId === med.id ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <><ArchiveRestore size={18} /> {canRestore ? 'Restore to Cabinet' : 'View Only'}</>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}