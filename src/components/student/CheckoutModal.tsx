import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupType, PaymentMethod } from '../../types';
import { X, Clock, Calendar, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, createOrder } = useApp();
  const navigate = useNavigate();

  const [pickupType, setPickupType] = useState<PickupType>('ASAP');
  const [pickupDate, setPickupDate] = useState('Today');
  const [pickupTime, setPickupTime] = useState('1:30 PM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetOutletId = cart[0]?.item.outletId || 'khans-kitchen';
  const targetOutletName = cart[0]?.item.outletName || "Khan's Kitchen";

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = createOrder({
      outletId: targetOutletId,
      pickupType,
      pickupDate: pickupType === 'Schedule Pickup' ? pickupDate : undefined,
      pickupTime: pickupType === 'Schedule Pickup' ? pickupTime : 'Within 15 mins (ASAP)',
      paymentMethod,
    });

    setIsSubmitting(false);

    if (result.success && result.orderId) {
      setPlacedOrderId(result.orderId);
    } else {
      setErrorMsg(result.error || 'Failed to place order. Please check inventory.');
    }
  };

  const handleFinish = () => {
    onClose();
    navigate('/orders');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* If Order Placed Success */}
        {placedOrderId ? (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                margin: '0 auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              Order Placed Successfully!
            </h3>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Order ID: <strong style={{ color: 'var(--primary)' }}>#{placedOrderId}</strong>
            </p>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 20,
                textAlign: 'left',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Outlet:</span>
                <strong>{targetOutletName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Pickup:</span>
                <strong>{pickupType === 'ASAP' ? 'ASAP (~15 mins)' : `${pickupDate} at ${pickupTime}`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment:</span>
                <strong>{paymentMethod} (Demo Paid)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Total:</span>
                <strong style={{ color: 'var(--primary)', fontSize: 14 }}>৳{cartTotal}</strong>
              </div>
            </div>

            <p style={{ fontSize: 11, color: '#059669', marginBottom: 20, fontWeight: 600 }}>
              Live inventory has been automatically deducted. The kitchen is preparing your order.
            </p>

            <button className="btn-primary" onClick={handleFinish} style={{ width: '100%', padding: 14 }}>
              Track My Order
            </button>
          </div>
        ) : (
          <div>
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
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Checkout</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{targetOutletName}</span>
              </div>
              <button onClick={onClose} className="btn-icon-circle" style={{ width: 32, height: 32 }}>
                <X size={16} />
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  borderRadius: 12,
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Pickup Preference */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
                Pickup Preference
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setPickupType('ASAP')}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 14,
                    border: pickupType === 'ASAP' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: pickupType === 'ASAP' ? 'var(--primary-light)' : 'var(--bg-app)',
                    color: pickupType === 'ASAP' ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Clock size={18} />
                  <span>ASAP</span>
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>Ready in 15 mins</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPickupType('Schedule Pickup')}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 14,
                    border: pickupType === 'Schedule Pickup' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: pickupType === 'Schedule Pickup' ? 'var(--primary-light)' : 'var(--bg-app)',
                    color: pickupType === 'Schedule Pickup' ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Calendar size={18} />
                  <span>Schedule</span>
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>Pick time slot</span>
                </button>
              </div>

              {pickupType === 'Schedule Pickup' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Date</span>
                    <select
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)',
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      <option value="Today">Today</option>
                      <option value="Tomorrow">Tomorrow</option>
                    </select>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Time Slot</span>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)',
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      <option value="1:15 PM">1:15 PM</option>
                      <option value="1:30 PM">1:30 PM</option>
                      <option value="1:45 PM">1:45 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="2:30 PM">2:30 PM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Demo Payment Method */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>
                Select Payment Method
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {(['bKash', 'Nagad', 'Rocket', 'Cash'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: paymentMethod === method ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: paymentMethod === method ? 'var(--primary-light)' : 'var(--bg-app)',
                      color: paymentMethod === method ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Demo Payment Notice Banner */}
              <div className="demo-banner-box">
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <strong>Demo payment</strong> — no real financial transaction will occur. This prototype is for UIU academic evaluation.
                </span>
              </div>
            </div>

            {/* Section 3: Summary */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: 'var(--bg-muted)',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                <span style={{ fontWeight: 700 }}>৳{cartTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Campus Service Fee:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>৳0 (Free for UIU)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  fontWeight: 800,
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary)' }}>৳{cartTotal}</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              className="btn-primary"
              disabled={isSubmitting || cart.length === 0}
              onClick={handleConfirmOrder}
              style={{ width: '100%', padding: 14, fontSize: 15 }}
            >
              {isSubmitting ? 'Confirming...' : `Confirm & Place Order • ৳${cartTotal}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
