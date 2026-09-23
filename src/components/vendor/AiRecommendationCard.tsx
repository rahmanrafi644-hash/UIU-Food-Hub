import React, { useState } from 'react';
import { AiDemandRecommendationItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, CheckCircle, PlusCircle, Check, X } from 'lucide-react';

interface AiRecommendationCardProps {
  item: AiDemandRecommendationItem;
  onActionComplete?: () => void;
}

export const AiRecommendationCard: React.FC<AiRecommendationCardProps> = ({
  item,
  onActionComplete,
}) => {
  const { applyAiRestockRecommendation, inventory } = useApp();
  const [isApproved, setIsApproved] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);

  // Look up latest live stock
  const liveStockItem = inventory.find(
    (i) => i.name.toLowerCase().trim() === item.item.toLowerCase().trim()
  );
  const currentLiveStock = liveStockItem ? liveStockItem.stock : item.currentStock;

  const handleApprove = () => {
    applyAiRestockRecommendation(item.item, item.outlet, item.recommendedRefill);
    setIsApproved(true);
    if (onActionComplete) onActionComplete();
  };

  const handleIgnore = () => {
    setIsIgnored(true);
    if (onActionComplete) onActionComplete();
  };

  if (isIgnored) {
    return null;
  }

  const isHighRisk = item.risk === 'HIGH SHORTAGE RISK' || currentLiveStock <= 8;

  return (
    <div
      className="card-base"
      style={{
        border: isHighRisk ? '1px solid #FED7AA' : '1px solid var(--border-subtle)',
        background: isHighRisk ? '#FFFBF5' : 'var(--bg-card)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: isHighRisk ? '0 6px 20px rgba(246, 137, 32, 0.08)' : 'var(--shadow-sm)',
      }}
    >
      {/* Risk Badge & Item Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.outlet}</span>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
            {item.item}
          </h3>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
            padding: '4px 8px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: isHighRisk ? '#FEF2F2' : '#FFFBEB',
            color: isHighRisk ? '#DC2626' : '#D97706',
            border: isHighRisk ? '1px solid #FECACA' : '1px solid #FDE68A',
          }}
        >
          <AlertTriangle size={12} />
          {isHighRisk ? 'HIGH SHORTAGE RISK' : 'MODERATE RISK'}
        </span>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          background: 'rgba(255,255,255,0.7)',
          padding: 10,
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 600 }}>Current Stock</span>
          <p style={{ fontSize: 15, fontWeight: 800, color: currentLiveStock <= 8 ? '#DC2626' : 'var(--text-main)' }}>
            {currentLiveStock}
          </p>
        </div>

        <div>
          <span style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 600 }}>Expected Demand</span>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
            {item.expectedDemand}
          </p>
        </div>

        <div>
          <span style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 600 }}>AI Refill Rec.</span>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>
            +{item.recommendedRefill}
          </p>
        </div>
      </div>

      {/* Reasoning */}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>
        <strong>AI Insight:</strong> {item.reason}
      </p>

      {/* Action States */}
      {isApproved ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 12,
            background: '#ECFDF5',
            color: '#065F46',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <CheckCircle size={16} color="#10B981" />
          <span>
            Restock approved! +{item.recommendedRefill} portions added. New stock: {currentLiveStock} ({liveStockItem?.status}).
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleApprove}
            style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
          >
            <Check size={16} /> Add Recommended Stock (+{item.recommendedRefill})
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleIgnore}
            style={{ padding: '10px 14px', fontSize: 13 }}
            title="Ignore recommendation"
          >
            <X size={16} /> Ignore
          </button>
        </div>
      )}
    </div>
  );
};
