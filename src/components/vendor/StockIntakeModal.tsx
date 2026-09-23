import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PlusCircle, CheckCircle } from 'lucide-react';

interface StockIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItemId?: string;
}

export const StockIntakeModal: React.FC<StockIntakeModalProps> = ({
  isOpen,
  onClose,
  preselectedItemId,
}) => {
  const { inventory, outlets, addStockIntake } = useApp();

  const [selectedOutletId, setSelectedOutletId] = useState('khans-kitchen');
  const [selectedItemId, setSelectedItemId] = useState(
    preselectedItemId || 'kk-chicken-fry'
  );
  const [quantityPrepared, setQuantityPrepared] = useState<number>(20);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentOutletItems = inventory.filter((i) => i.outletId === selectedOutletId);
  const targetItem = inventory.find((i) => i.id === selectedItemId) || currentOutletItems[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItem || quantityPrepared <= 0) return;

    addStockIntake(targetItem.id, quantityPrepared);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
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
            <PlusCircle size={20} color="var(--primary)" />
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Vendor Stock Intake</h3>
          </div>
          <button onClick={onClose} className="btn-icon-circle" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Stock Updated!</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Added +{quantityPrepared} portions of {targetItem?.name}. Shared inventory is now live for all students.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Select Outlet
              </label>
              <select
                value={selectedOutletId}
                onChange={(e) => {
                  setSelectedOutletId(e.target.value);
                  const firstInOutlet = inventory.find((i) => i.outletId === e.target.value);
                  if (firstInOutlet) setSelectedItemId(firstInOutlet.id);
                }}
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
                Select Food Item
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 13,
                }}
              >
                {currentOutletItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Current Stock: {item.stock})
                  </option>
                ))}
              </select>
            </div>

            {targetItem && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  background: 'var(--bg-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current Stock Level</span>
                  <p style={{ fontSize: 16, fontWeight: 800 }}>{targetItem.stock} portions</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>After Adding</span>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
                    {targetItem.stock + (Number(quantityPrepared) || 0)} portions
                  </p>
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Batch Prepared (Units to Add)
              </label>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={quantityPrepared}
                onChange={(e) => setQuantityPrepared(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 14, marginTop: 4 }}
            >
              Confirm Stock Intake (+{quantityPrepared} portions)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
