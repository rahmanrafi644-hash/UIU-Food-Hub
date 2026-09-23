import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { X, Minus, Plus, ShoppingBag, Clock, Star, Store } from 'lucide-react';

interface FoodDetailModalProps {
  item: FoodItem | null;
  onClose: () => void;
  onAddedToCart?: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, onClose, onAddedToCart }) => {
  const { addToCart, inventory } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!item) return null;

  // Retrieve fresh inventory count
  const liveItem = inventory.find((i) => i.id === item.id) || item;
  const isSoldOut = liveItem.stock <= 0;
  const maxAvailable = liveItem.stock;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      setErrorMsg(null);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxAvailable) {
      setQuantity(quantity + 1);
      setErrorMsg(null);
    } else {
      setErrorMsg(`Maximum available stock reached (${maxAvailable} portions).`);
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    const result = addToCart(liveItem, quantity);
    if (result.success) {
      onClose();
      if (onAddedToCart) onAddedToCart();
    } else {
      setErrorMsg(result.message || 'Cannot add requested quantity.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header Image with close button */}
        <div style={{ position: 'relative', width: '100%', height: 230, backgroundColor: '#E5E7EB' }}>
          <img
            src={liveItem.image}
            alt={liveItem.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            className="btn-icon-circle"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              zIndex: 10,
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              display: 'flex',
              gap: 8,
            }}
          >
            <StatusBadge status={liveItem.status} stock={liveItem.stock} />
          </div>
        </div>

        {/* Content Details */}
        <div style={{ padding: '20px 22px 24px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', marginBottom: 4 }}>
              <Store size={14} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{liveItem.outletName}</span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', letterSpacing: -0.5 }}>
              {liveItem.name}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> {liveItem.prepTimeMinutes} mins prep
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={14} fill="#FBBF24" color="#FBBF24" /> {liveItem.rating} (UIU Verified)
            </span>
            <span style={{ background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
              {liveItem.category}
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {liveItem.description}
          </p>

          {/* Price & Quantity Stepper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 18,
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>Total Price</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>৳</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>
                  {liveItem.price * quantity}
                </span>
                {quantity > 1 && (
                  <span style={{ fontSize: 11, color: 'var(--text-light)', marginLeft: 4 }}>
                    (৳{liveItem.price} each)
                  </span>
                )}
              </div>
            </div>

            {/* Stepper */}
            {!isSoldOut ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'var(--bg-card)',
                  padding: '6px 12px',
                  borderRadius: 9999,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    color: quantity <= 1 ? '#D1D5DB' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Minus size={16} />
                </button>

                <span style={{ fontSize: 15, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>
                  {quantity}
                </span>

                <button
                  onClick={handleIncrease}
                  disabled={quantity >= maxAvailable}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: quantity >= maxAvailable ? 'not-allowed' : 'pointer',
                    color: quantity >= maxAvailable ? '#D1D5DB' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>Out of Stock</span>
            )}
          </div>

          {errorMsg && (
            <p style={{ fontSize: 11, color: '#EF4444', textAlign: 'center', margin: '-4px 0' }}>
              {errorMsg}
            </p>
          )}

          {/* Add to Cart CTA */}
          <button
            className="btn-primary"
            disabled={isSoldOut}
            onClick={handleAddToCart}
            style={{ width: '100%', padding: '14px', fontSize: 15 }}
          >
            <ShoppingBag size={18} />
            {isSoldOut ? 'Item Currently Sold Out' : `Add ${quantity} to Order • ৳${liveItem.price * quantity}`}
          </button>
        </div>
      </div>
    </div>
  );
};
