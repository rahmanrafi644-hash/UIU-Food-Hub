import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedCheckout }) => {
  const { cart, updateCartQuantity, removeFromCart, cartSubtotal, clearCart } = useApp();

  if (!isOpen) return null;

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Your Food Cart</h3>
            <span
              style={{
                fontSize: 11,
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 9999,
              }}
            >
              {totalCount} items
            </span>
          </div>

          <button onClick={onClose} className="btn-icon-circle" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {/* Cart Items List */}
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--bg-muted)',
                margin: '0 auto 12px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-light)',
              }}
            >
              <ShoppingBag size={28} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Your cart is empty</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Explore campus food outlets to add delicious meals.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.map((cartItem) => (
              <div
                key={cartItem.item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  borderRadius: 16,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Thumb */}
                <img
                  src={cartItem.item.image}
                  alt={cartItem.item.name}
                  style={{ width: 54, height: 54, borderRadius: 12, objectFit: 'cover' }}
                />

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {cartItem.item.name}
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {cartItem.item.outletName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>৳</span>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>
                      {cartItem.item.price * cartItem.quantity}
                    </span>
                  </div>
                </div>

                {/* Stepper */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg-card)',
                    padding: '4px 8px',
                    borderRadius: 9999,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    <Minus size={14} />
                  </button>

                  <span style={{ fontSize: 13, fontWeight: 800, minWidth: 16, textAlign: 'center' }}>
                    {cartItem.quantity}
                  </span>

                  <button
                    onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(cartItem.item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Clear Cart link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 11,
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear all items
              </button>
            </div>

            {/* Subtotal & Checkout CTA */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total (Demo)</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 700 }}>৳</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>
                    {cartSubtotal}
                  </span>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                style={{ width: '100%', padding: '14px', fontSize: 15 }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
