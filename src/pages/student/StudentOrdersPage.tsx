import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { ChatDrawerModal } from '../../components/chat/ChatDrawerModal';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  KeyRound,
  MessageSquare,
} from 'lucide-react';

export const StudentOrdersPage: React.FC = () => {
  const { orders, user } = useApp();
  const [selectedChatOutletId, setSelectedChatOutletId] = useState<string | null>(null);
  const [selectedChatOrderId, setSelectedChatOrderId] = useState<string | undefined>(undefined);

  // Filter strictly to current student's orders
  const studentOrders = orders.filter((o) => {
    if (!user) return false;
    return o.studentId === user.id || (user.id === 'stu-demo-01' && o.studentId.startsWith('stu-demo'));
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return {
          bg: '#EFF6FF',
          color: '#2563EB',
          icon: Clock,
          label: 'Order Placed',
        };
      case 'Preparing':
        return {
          bg: '#FFFBEB',
          color: '#D97706',
          icon: ChefHat,
          label: 'Preparing in Kitchen',
        };
      case 'Ready':
        return {
          bg: '#ECFDF5',
          color: '#059669',
          icon: Sparkles,
          label: 'Ready for Pickup!',
        };
      case 'Completed':
        return {
          bg: '#F3F4F6',
          color: '#4B5563',
          icon: CheckCircle2,
          label: 'Completed',
        };
    }
  };

  return (
    <div className="app-main">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Your Orders</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Real-time synchronized tracking, pickup PINs & outlet messaging
        </p>
      </div>

      {studentOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ShoppingBag size={48} color="var(--text-light)" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: 17, fontWeight: 800 }}>No orders placed yet</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Order from Khan&apos;s Kitchen, Olympia, CP, Brew or Toa&apos;s Kitchen to track here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {studentOrders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const StatusIcon = statusConfig.icon;
            const isLive = order.status !== 'Completed';

            return (
              <div
                key={order.id}
                className="card-base"
                style={{
                  padding: 16,
                  border: isLive ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                  boxShadow: isLive ? '0 8px 24px rgba(246, 137, 32, 0.12)' : 'var(--shadow-sm)',
                }}
              >
                {/* Header Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>
                      ORDER #{order.id}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                      {order.outletName}
                    </h3>
                  </div>

                  <span
                    style={{
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <StatusIcon size={13} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Pickup PIN Verification Banner (Essential for crowded cafeterias) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FEF3C7',
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: '1px solid #FDE68A',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KeyRound size={15} color="#92400E" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#92400E' }}>
                      Pickup PIN: <span style={{ letterSpacing: 1.5, fontSize: 14 }}>{order.pickupPin}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: '#B45309', fontWeight: 600 }}>Show to vendor</span>
                </div>

                {/* Secured Campus Pickup Window Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: order.isScheduledAhead ? '#FFF7ED' : '#F0FDF4',
                    border: order.isScheduledAhead ? '1px solid #FFEDD5' : '1px solid #DCFCE7',
                    padding: '7px 12px',
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color={order.isScheduledAhead ? 'var(--primary)' : '#059669'} />
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: order.isScheduledAhead ? 'var(--primary)' : '#059669', textTransform: 'uppercase' }}>
                        {order.isScheduledAhead ? '⏰ Class Break Slot' : '⚡ Express Pickup'}
                      </span>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        {order.pickupWindow || order.pickupTime}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#059669',
                      background: '#ECFDF5',
                      padding: '2px 7px',
                      borderRadius: 9999,
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    🛡️ Slot Secured
                  </span>
                </div>

                {/* Progress Steps for Live Orders */}
                {isLive && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 4,
                      margin: '4px 0 12px 0',
                    }}
                  >
                    {[
                      { step: 'Placed', label: '1. Placed' },
                      { step: 'Preparing', label: '2. Kitchen' },
                      { step: 'Ready', label: '3. Ready' },
                    ].map((s, idx) => {
                      const activeSteps = ['Placed', 'Preparing', 'Ready'];
                      const currentIdx = activeSteps.indexOf(order.status);
                      const isStepDone = currentIdx >= idx;

                      return (
                        <div key={s.step} style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 4,
                              background: isStepDone ? 'var(--primary)' : '#E5E7EB',
                              marginBottom: 4,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: isStepDone ? 'var(--primary)' : 'var(--text-light)',
                            }}
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ordered Items */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: '10px 12px',
                    background: 'var(--bg-app)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  {order.items.map((cartItem, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong>{cartItem.quantity}x</strong> {cartItem.item.name}
                      </span>
                      <span style={{ fontWeight: 700 }}>৳{cartItem.item.price * cartItem.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Special Instructions if provided */}
                {order.specialInstructions && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      fontSize: 11,
                      color: '#92400E',
                    }}
                  >
                    <strong>Special Note:</strong> &ldquo;{order.specialInstructions}&rdquo;
                  </div>
                )}

                {/* Pickup & Payment Details */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: 12,
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>
                      Pickup: <strong>{order.pickupTime}</strong>
                    </span>
                    {order.pickupWindow && (
                      <span style={{ color: '#059669', display: 'block', fontSize: 11, fontWeight: 700 }}>
                        Slot: {order.pickupWindow}
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      Payment: <strong>{order.paymentMethod} (Demo)</strong>
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-light)', display: 'block' }}>Total</span>
                    <strong style={{ fontSize: 16, color: 'var(--primary)' }}>৳{order.total}</strong>
                  </div>
                </div>

                {/* Direct Message Outlet Button */}
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedChatOutletId(order.outletId);
                    setSelectedChatOrderId(order.id);
                  }}
                  style={{ width: '100%', marginTop: 10, padding: '9px', fontSize: 12 }}
                >
                  <MessageSquare size={14} color="var(--primary)" /> Message {order.outletName} regarding Order
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedChatOutletId && (
        <ChatDrawerModal
          isOpen={true}
          onClose={() => setSelectedChatOutletId(null)}
          targetOutletId={selectedChatOutletId}
          orderId={selectedChatOrderId}
        />
      )}
    </div>
  );
};
