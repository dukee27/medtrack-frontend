import { useState, useEffect } from 'react';
import { getMyActivityLogs } from '../services/api';
import { Plus, Pencil, Trash2, CheckCircle2, Ban, FileText } from 'lucide-react';

// Paste this component inside Profile.jsx and render it in a new tab!
export function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyActivityLogs()
      .then(res => setLogs(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getLogIcon = (action) => {
    switch(action) {
      case 'CREATE': return <Plus size={18} />;
      case 'UPDATE': return <Pencil size={18} />;
      case 'DELETE': return <Trash2 size={18} />;
      case 'APPROVED': return <CheckCircle2 size={18} />;
      case 'REVOKE': return <Ban size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card-2)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Account Activity Log</h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>A secure, uneditable history of actions taken by you or your caregivers.</p>
      </div>
      
      {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading audit trail...</div> : 
       logs.length === 0 ? <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>No activity recorded yet.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {logs.map(log => (
            <div key={log.id} style={{ display: 'flex', gap: 16, padding: '20px 32px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 20, width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getLogIcon(log.actionType)}
              </div>
              <div>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>{log.readableMessage}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 13, color: 'var(--text-3)' }}>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span style={{ fontWeight: 600 }}>System: {log.entityType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}