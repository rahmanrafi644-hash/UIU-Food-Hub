import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupType, PaymentMethod } from '../../types';
import { X, Clock, Calendar, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, createOrder } = useApp();
  const navigate = useNavigate();

  type TimingPreset = 'ASAP' | '15m' | '20m' | '25m' | '30m' | '45m' | '60m' | 'custom';

  const [timingPreset, setTimingPreset] = useState<TimingPreset>('ASAP');
  const [customSlot, setCustomSlot] = useState('2:00 PM');
  const [pickupDate, setPickupDate] = useState('Today');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedPickupPin, setPlacedPickupPin] = useState<string | null>(null);
  const [placedPickupWindow, setPlacedPickupWindow] = useState<string | null>(null);
  const [placedPickupTime, setPlacedPickupTime] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetOutletId = cart[0]?.item.outletId || 'khans-kitchen';
  const targetOutletName = cart[0]?.item.outletName || "Khan's Kitchen";

  const getOffsetMinutes = (preset: TimingPreset): number => {
    switch (preset) {
      case 'ASAP': return 10;
      case '15m': return 15;
      case '20m': return 20;
      case '25m': return 25;
      case '30m': return 30;
      case '45m': return 45;
      case '60m': return 60;
      case 'custom': return 60;
    }
  };

  const getTargetTimeDisplay = () => {
    if (timingPreset === 'custom') {
      return customSlot;
    }
    const offset = getOffsetMinutes(timingPreset);
    const d = new Date(Date.now() + offset * 60000);
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m < 10 ? '0' + m : m} ${ap}`;
  };

  const getTargetWindowDisplay = () => {
    if (timingPreset === 'ASAP') {
      const end = new Date(Date.now() + 15 * 60000);
      let eh = end.getHours();
      const em = end.getMinutes();
      const eap = eh >= 12 ? 'PM' : 'AM';
      eh = eh % 12 || 12;
      return `Next 10–15 mins (by ${eh}:${em < 10 ? '0' + em : em} ${eap})`;
    }
    if (timingPreset === 'custom') {
      return `${customSlot} (±7 mins window)`;
    }
    const offset = getOffsetMinutes(timingPreset);
    const start = new Date(Date.now() + Math.max(0, offset - 5) * 60000);
    const end = new Date(Date.now() + (offset + 10) * 60000);
    const fmt = (d: Date) => {
      let h = d.getHours();
      const m = d.getMinutes();
      const ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m < 10 ? '0' + m : m} ${ap}`;
    };
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const offset = getOffsetMinutes(timingPreset);
    const isScheduled = timingPreset !== 'ASAP';
    const computedTargetTime = getTargetTimeDisplay();
    const computedWindow = getTargetWindowDisplay();

    const formattedPickupTime = timingPreset === 'ASAP'
      ? 'Within 15 mins (ASAP)'
      : `${computedTargetTime} (${timingPreset === '60m' ? 'In 1 hour' : `In ${offset}m`})`;

    const result = createOrder({
      outletId: targetOutletId,
      pickupType: isScheduled ? 'Schedule Pickup' : 'ASAP',
      pickupDate: isScheduled ? pickupDate : 'Today',
      pickupTime: formattedPickupTime,
      pickupWindow: computedWindow,
      pickupOffsetMinutes: offset,
      isScheduledAhead: isScheduled,
      slotSecured: true,
      paymentMethod,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success && result.orderId) {
      setPlacedOrderId(result.orderId);
      setPlacedPickupPin(result.pickupPin || null);
      setPlacedPickupWindow(computedWindow);
      setPlacedPickupTime(formattedPickupTime);
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

            {/* Pickup PIN Hero Callout */}
            {placedPickupPin && (
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1.5px solid #FDE68A',
                  borderRadius: 16,
                  padding: '12px 16px',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                  Your Pickup Verification PIN
                </span>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#92400E', letterSpacing: 3, margin: '2px 0' }}>
                  {placedPickupPin}
                </p>
                <span style={{ fontSize: 10, color: '#B45309' }}>
                  Show this 4-digit code to the vendor counter to collect your meal
                </span>
              </div>
            )}

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
                <strong>{placedPickupTime || (timingPreset === 'ASAP' ? 'Within 15 mins (ASAP)' : `${pickupDate} at ${customSlot}`)}</strong>
              </div>
              {placedPickupWindow && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Secured Window:</span>
                  <strong style={{ color: '#059669' }}>{placedPickupWindow}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment:</span>
                <strong>{paymentMethod} (Demo Paid)</strong>
              </div>
              {specialInstructions && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Note:</span>
                  <strong style={{ color: '#D97706' }}>{specialInstructions}</strong>
                </div>
              )}
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

            {/* Section 1: Flexible Campus Pickup Timing */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Flexible Pickup Timing
                </label>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 9999 }}>
                  Campus Slot Guaranteed
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                Order ahead during class and collect without standing in crowded cafeteria queues.
              </p>

              {/* Timing Preset Quick Select Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                {[
                  { id: 'ASAP', label: '⚡ ASAP', sub: '~10-15m' },
                  { id: '15m', label: '+15m', sub: 'Short Break' },
                  { id: '20m', label: '+20m', sub: 'Break' },
                  { id: '25m', label: '+25m', sub: 'Lab Pause' },
                  { id: '30m', label: '+30m', sub: 'Mid-Class' },
                  { id: '45m', label: '+45m', sub: 'Next Period' },
                  { id: '60m', label: '+1 Hour', sub: 'Class Ends' },
                  { id: 'custom', label: '🕒 Custom', sub: 'Pick Slot' },
                ].map((item) => {
                  const isSelected = timingPreset === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTimingPreset(item.id as TimingPreset)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 12,
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'var(--primary-light)' : 'var(--bg-app)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        textAlign: 'center',
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, opacity: isSelected ? 0.9 : 0.6 }}>
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Date & Hour picker if custom selected */}
              {timingPreset === 'custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10, background: 'var(--bg-app)', padding: 10, borderRadius: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Date</span>
                    <select
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        background: 'white',
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      <option value="Today">Today</option>
                      <option value="Tomorrow">Tomorrow</option>
                    </select>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Time Slot</span>
                    <select
                      value={customSlot}
                      onChange={(e) => setCustomSlot(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        background: 'white',
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      <option value="1:15 PM">1:15 PM</option>
                      <option value="1:30 PM">1:30 PM</option>
                      <option value="1:45 PM">1:45 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="2:15 PM">2:15 PM</option>
                      <option value="2:30 PM">2:30 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="3:30 PM">3:30 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="4:30 PM">4:30 PM</option>
                      <option value="5:00 PM">5:00 PM</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dynamic Slot Security & Freshness Guarantee Card */}
              <div
                style={{
                  background: timingPreset === 'ASAP' ? '#F0FDF4' : '#FFFBEB',
                  border: timingPreset === 'ASAP' ? '1px solid #BBF7D0' : '1.5px solid #FDE68A',
                  borderRadius: 14,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} color={timingPreset === 'ASAP' ? '#059669' : '#D97706'} />
                    <strong style={{ fontSize: 12, color: timingPreset === 'ASAP' ? '#065F46' : '#92400E' }}>
                      {timingPreset === 'ASAP' ? 'Immediate Express Queue' : 'Campus Break Slot Secured'}
                    </strong>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: timingPreset === 'ASAP' ? '#059669' : '#D97706' }}>
                    Target: {getTargetTimeDisplay()}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: timingPreset === 'ASAP' ? '#047857' : '#B45309' }}>
                  <span>Secured Window: </span>
                  <strong>{getTargetWindowDisplay()}</strong>
                </div>

                {timingPreset !== 'ASAP' && (
                  <p style={{ fontSize: 10, color: '#92400E', margin: '4px 0 0 0', lineHeight: 1.4, borderTop: '1px dashed #FDE68A', paddingTop: 4 }}>
                    ♨️ <strong>Freshness Hold:</strong> The kitchen will delay cooking until 10 mins prior to your pickup so your food is fresh and piping hot right when your class dismisses!
                  </p>
                )}
              </div>
            </div>

            {/* Special Instructions Note */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                Special Cooking Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Less spicy, no onions, extra tissue..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
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
