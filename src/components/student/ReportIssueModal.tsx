import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportCategory } from '../../types';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose }) => {
  const { outlets, submitReport } = useApp();

  const [outletId, setOutletId] = useState(outlets[0]?.id || 'khans-kitchen');
  const [category, setCategory] = useState<ReportCategory>('Food quality');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    submitReport({
      outletId,
      category,
      description,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setDescription('');
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#EA580C" />
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Report an Issue</h3>
          </div>
          <button onClick={onClose} className="btn-icon-circle" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={44} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Report Submitted</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Campus vendor management and staff have been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Related Outlet
              </label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 13,
                }}
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 13,
                }}
              >
                <option value="Food quality">Food quality / taste</option>
                <option value="Missing item">Missing item in order</option>
                <option value="Long waiting time">Long waiting time</option>
                <option value="Payment issue">Payment verification issue</option>
                <option value="Other">Other cafeteria issue</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Description
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain what went wrong so the vendor team can resolve it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 14 }}
            >
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
