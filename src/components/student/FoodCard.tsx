import React from 'react';
import { FoodItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Plus, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FoodCardProps {
  item: FoodItem;
  onSelect: (item: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onSelect }) => {
  const { addToCart } = useApp();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.stock > 0) {
      addToCart(item, 1);
    }
  };

  const isSoldOut = item.stock <= 0;

  return (
    <div
      className="card-base card-hover"
      onClick={() => onSelect(item)}
      style={{
        cursor: 'pointer',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        opacity: isSoldOut ? 0.7 : 1,
      }}
    >
      {/* Food Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 120,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#E5E7EB',
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            // Fallback image if network fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Rating or Popular Pill */}
        {item.popular && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'rgba(246, 137, 32, 0.95)',
              color: 'white',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 9999,
              letterSpacing: 0.4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            POPULAR
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Star size={10} fill="#FBBF24" color="#FBBF24" />
          {item.rating}
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </h4>
        </div>

        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.outletName}</span>

        {/* Stock Status Badge */}
        <div style={{ marginTop: 2, marginBottom: 4 }}>
          <StatusBadge status={item.status} stock={item.stock} />
        </div>

        {/* Bottom Price & Add CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>৳</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{item.price}</span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            title={isSoldOut ? 'Sold out' : 'Add to Cart'}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: isSoldOut ? '#E5E7EB' : 'var(--primary)',
              color: isSoldOut ? '#9CA3AF' : 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isSoldOut ? 'not-allowed' : 'pointer',
              boxShadow: isSoldOut ? 'none' : '0 4px 10px rgba(246, 137, 32, 0.3)',
              transition: 'transform 0.2s',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
