import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { ChatDrawerModal } from '../../components/chat/ChatDrawerModal';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  Filter,
  Phone,
  User,
  Calendar,
  KeyRound,
  MessageSquare,
  AlertCircle,
  Store,
} from 'lucide-react';

export const VendorOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, verifyPickupPin, activeVendorOutlet, outlets } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [activePinOrder, setActivePinOrder] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [chatOutletId, setChatOutletId] = useState<string | null>(null);
  const [chatOrderId, setChatOrderId] = useState<string | undefined>(undefined);

  const currentOutlet = activeVendorOutlet || outlets[0];

  // Scoped to current branch
  const filteredOrders = orders.filter((o) => {
    const matchesOutlet = o.outletId === currentOutlet.id;
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesOutlet && matchesStatus;
  });

  const handleVerifyPin = (orderId: string) => {
    const result = verifyPickupPin(orderId, pinInput);
    if (result.success) {
      setActivePinOrder(null);
      setPinInput('');
      setPinError(null);
    } else {
      setPinError(result.error || 'Incorrect PIN code.');
    }
  };

  return (
    <div className="app-main">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', marginBottom: 2 }}>
          <Store size={15} />
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
            {currentOutlet.name}
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Branch Orders</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Manage kitchen prep, student pickup PIN verification & live chats
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 4,
          background: 'var(--bg-muted)',
          padding: 4,
          borderRadius: 14,
        }}
      >
        {(['All', 'Placed', 'Preparing', 'Ready', 'Completed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '6px 2px',
              borderRadius: 10,
              border: 'none',
              background: statusFilter === st ? 'white' : 'transparent',
              color: statusFilter === st ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No orders match the selected filters for {currentOutlet.name}.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="card-base" style={{ padding: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>
                      #{order.id}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-light)' }}>•</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Pickup PIN: </span>
                    <span
                      style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        padding: '1px 6px',
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 12,
                        letterSpacing: 1,
                      }}
                    >
                      {order.pickupPin}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                    {order.studentName}
                  </h4>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    background:
                      order.status === 'Ready'
                        ? '#ECFDF5'
                        : order.status === 'Preparing'
                        ? '#FFFBEB'
                        : order.status === 'Placed'
                        ? '#EFF6FF'
                        : '#F3F4F6',
                    color:
                      order.status === 'Ready'
                        ? '#059669'
                        : order.status === 'Preparing'
                        ? '#D97706'
                        : order.status === 'Placed'
                        ? '#2563EB'
                        : '#4B5563',
                  }}
                >
                  {order.status}
                </span>
              </div>

              {/* Items List */}
              <div
                style={{
                  background: 'var(--bg-app)',
                  padding: 10,
                  borderRadius: 12,
                  fontSize: 12,
                  marginBottom: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {order.items.map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <strong>{i.quantity}x</strong> {i.item.name}
                    </span>
                    <span style={{ fontWeight: 700 }}>৳{i.item.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Special Instructions Note if provided */}
              {order.specialInstructions && (
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    fontSize: 11,
                    color: '#92400E',
                    marginBottom: 10,
                  }}
                >
                  <strong>Special Note:</strong> &ldquo;{order.specialInstructions}&rdquo;
                </div>
              )}

              {/* Order Meta */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                }}
              >
                <span>
                  Pickup: <strong>{order.pickupTime}</strong>
                </span>
                <span>
                  Payment: <strong>{order.paymentMethod} (Demo)</strong>
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>
                  Total: ৳{order.total}
                </span>
              </div>

              {/* Action Buttons to Advance Status */}
              <div style={{ display: 'flex', gap: 6 }}>
                {order.status === 'Placed' && (
                  <button
                    className="btn-primary"
                    onClick={() => updateOrderStatus(order.id, 'Preparing')}
                    style={{ flex: 1, padding: '10px', fontSize: 12 }}
                  >
                    <ChefHat size={14} /> Start Preparing
                  </button>
                )}

                {order.status === 'Preparing' && (
                  <button
                    className="btn-primary"
                    onClick={() => updateOrderStatus(order.id, 'Ready')}
                    style={{ flex: 1, padding: '10px', fontSize: 12, background: '#059669' }}
                  >
                    <CheckCircle2 size={14} /> Mark Ready for Pickup
                  </button>
                )}

                {order.status === 'Ready' && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setActivePinOrder(order.id);
                      setPinInput('');
                      setPinError(null);
                    }}
                    style={{ flex: 1, padding: '10px', fontSize: 12, background: '#1E1E24' }}
                  >
                    <KeyRound size={14} /> Verify PIN & Hand Over
                  </button>
                )}

                {order.status === 'Completed' && (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#059669',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      margin: '0 auto',
                    }}
                  >
                    <CheckCircle2 size={14} /> Order Fulfilled & Handed Over
                  </span>
                )}

                {/* Message Student Button */}
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setChatOutletId(order.outletId);
                    setChatOrderId(order.id);
                  }}
                  title="Message this student directly"
                  style={{ padding: '8px 12px' }}
                >
                  <MessageSquare size={15} />
                </button>
              </div>

              {/* Inline PIN Verification Form */}
              {activePinOrder === order.id && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 12,
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Enter Student 4-Digit Pickup PIN (Student has: {order.pickupPin})
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4821"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      style={{
                        width: 100,
                        padding: '8px',
                        borderRadius: 8,
                        border: '1px solid #94A3B8',
                        fontSize: 16,
                        fontWeight: 800,
                        textAlign: 'center',
                        letterSpacing: 2,
                      }}
                    />
                    <button
                      className="btn-primary"
                      onClick={() => handleVerifyPin(order.id)}
                      style={{ padding: '8px 14px', fontSize: 12 }}
                    >
                      Confirm Handover
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setActivePinOrder(null)}
                      style={{ padding: '8px 12px', fontSize: 12 }}
                    >
                      Cancel
                    </button>
                  </div>
                  {pinError && (
                    <span style={{ fontSize: 11, color: '#DC2626', marginTop: 4, display: 'block' }}>
                      {pinError}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {chatOutletId && (
        <ChatDrawerModal
          isOpen={true}
          onClose={() => setChatOutletId(null)}
          targetOutletId={chatOutletId}
          orderId={chatOrderId}
        />
      )}
    </div>
  );
};
