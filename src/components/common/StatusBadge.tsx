import React from 'react';
import { StockStatus } from '../../types';

interface StatusBadgeProps {
  status: StockStatus;
  stock?: number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, stock, className = '' }) => {
  if (status === 'Sold Out' || stock === 0) {
    return (
      <span className={`status-pill sold-out ${className}`}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }}></span>
        Sold Out
      </span>
    );
  }

  if (status === 'Low Stock' || (stock !== undefined && stock <= 8)) {
    return (
      <span className={`status-pill low-stock ${className}`}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D97706' }}></span>
        Low Stock {stock !== undefined ? `(${stock})` : ''}
      </span>
    );
  }

  return (
    <span className={`status-pill available ${className}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }}></span>
      Available {stock !== undefined ? `(${stock})` : ''}
    </span>
  );
};
