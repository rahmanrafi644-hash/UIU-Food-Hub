import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { StockIntakeModal } from '../../components/vendor/StockIntakeModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OutletOperationalStatus } from '../../types';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Sparkles,
  PlusCircle,
  ArrowRight,
  Boxes,
  CheckCircle,
  Store,
  MessageSquare,
  Activity,
} from 'lucide-react';

export const VendorDashboardPage: React.FC = () => {
  const {
    orders,
    inventory,
    outlets,
    updateOrderStatus,
    activeVendorOutlet,
    switchVendorOutlet,
    updateOutletOperationalStatus,
    messages,
  } = useApp();
  const navigate = useNavigate();
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const currentOutlet = activeVendorOutlet || outlets[0];

  // Scoped orders & revenue for this specific branch
  const outletOrders = orders.filter((o) => o.outletId === currentOutlet.id);
  const todayOrdersCount = outletOrders.length;
  const activeOrdersCount = outletOrders.filter((o) => o.status !== 'Completed').length;
  const todayRevenue = outletOrders.reduce((sum, o) => sum + o.total, 0);

  // Scoped inventory & low stock items for this branch
  const outletItems = inventory.filter((i) => i.outletId === currentOutlet.id);
  const lowStockItems = outletItems.filter((i) => i.stock <= 8);
  const chickenFry = outletItems.find((i) => i.name.toLowerCase().includes('chicken fry'));

  // Unread messages for this outlet
  const unreadMessagesCount = messages.filter(
    (m) => m.outletId === currentOutlet.id && !m.isRead && m.senderRole === 'student'
  ).length;

  const handleStatusToggle = (status: OutletOperationalStatus) => {
    updateOutletOperationalStatus(currentOutlet.id, status);
  };

  const operationalStatus = currentOutlet.operationalStatus || 'Open';

  return (
    <div className="app-main">
      {/* Top Branch Header with Switcher */}
      <div className="card-base" style={{ padding: 14, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #F68920 0%, #D86B07 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Active Branch Portal
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {currentOutlet.name}
              </h2>
            </div>
          </div>

          {/* Quick Branch Switcher Dropdown */}
          <select
            value={currentOutlet.id}
            onChange={(e) => switchVendorOutlet(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              background: 'white',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-main)',
              outline: 'none',
            }}
          >
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                Switch: {o.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kitchen Operational Status Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Kitchen Status:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['Open', 'Busy', 'Paused'] as OutletOperationalStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusToggle(st)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 9999,
                  border: operationalStatus === st ? 'none' : '1px solid var(--border-subtle)',
                  background:
                    operationalStatus === st
                      ? st === 'Open'
                        ? '#059669'
                        : st === 'Busy'
                        ? '#D97706'
                        : '#DC2626'
                      : 'white',
                  color: operationalStatus === st ? 'white' : 'var(--text-muted)',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {st === 'Open' ? '🟢 Open' : st === 'Busy' ? '🟠 Busy (+15m)' : '🔴 Paused'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Today's Revenue */}
        <div className="card-base" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', marginBottom: 4 }}>
            <TrendingUp size={15} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Branch Revenue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>৳</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>{todayRevenue}</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-light)' }}>{currentOutlet.name} sales</span>
        </div>

        {/* Active Orders */}
        <div className="card-base" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', marginBottom: 4 }}>
            <Clock size={15} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Kitchen Queue</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>{activeOrdersCount}</p>
          <span style={{ fontSize: 10, color: 'var(--text-light)' }}>{todayOrdersCount} orders total</span>
        </div>
      </div>

      {/* Student Inquiries Alert Banner */}
      {unreadMessagesCount > 0 && (
        <div
          onClick={() => navigate('/vendor/messages')}
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            padding: '12px 14px',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={18} color="#2563EB" />
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1E40AF' }}>
                {unreadMessagesCount} Unread Student Inquiries
              </h4>
              <span style={{ fontSize: 11, color: '#3B82F6' }}>Click to reply directly to students</span>
            </div>
          </div>
          <ArrowRight size={16} color="#2563EB" />
        </div>
      )}

      {/* AI Demand Intelligence Highlight Banner for This Branch */}
      <div
        className="card-base"
        style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1.5px solid #FDBA74',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: '0 6px 20px rgba(246, 137, 32, 0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F68920 0%, #D86B07 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#9A3412' }}>AI Demand Forecasting</h4>
              <span style={{ fontSize: 11, color: '#C25700' }}>Tuned for {currentOutlet.name}</span>
            </div>
          </div>

          <span
            style={{
              background: '#EA580C',
              color: 'white',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 9999,
            }}
          >
            ACTIVE
          </span>
        </div>

        <p style={{ fontSize: 12, color: '#7C2D12', lineHeight: 1.4 }}>
          {chickenFry && chickenFry.stock <= 8
            ? `⚠️ Alert: ${chickenFry.name} at ${currentOutlet.name} is down to ${chickenFry.stock} units! Stockout predicted during lunch break.`
            : `AI model monitoring student ordering patterns & inventory consumption for ${currentOutlet.name}.`}
        </p>

        <button
          className="btn-primary"
          onClick={() => navigate('/vendor/ai')}
          style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
        >
          Open AI Demand Assistant <ArrowRight size={15} />
        </button>
      </div>

      {/* Low Stock Items Alert Section (Branch Scoped) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={16} color="#D97706" />
            Stock Alerts ({lowStockItems.length})
          </h3>
          <Link
            to="/vendor/inventory"
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
          >
            Manage Stock
          </Link>
        </div>

        {lowStockItems.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: 14,
              textAlign: 'center',
              color: '#059669',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
            }}
          >
            <CheckCircle size={20} style={{ margin: '0 auto 4px auto' }} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>All items for {currentOutlet.name} are well-stocked!</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="card-base"
                style={{
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #FED7AA',
                }}
              >
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800 }}>{item.name}</h4>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.outletName}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={item.status} stock={item.stock} />
                  <button
                    className="btn-secondary"
                    onClick={() => setIsStockModalOpen(true)}
                    style={{ padding: '6px 10px', fontSize: 11 }}
                  >
                    + Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Orders Pipeline for This Branch */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Kitchen Queue ({outletOrders.length})</h3>
          <Link
            to="/vendor/orders"
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
          >
            View All
          </Link>
        </div>

        {outletOrders.length === 0 ? (
          <div className="card-base" style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders placed for {currentOutlet.name} yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {outletOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="card-base" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)' }}>
                      #{order.id} • {order.studentName}
                    </span>
                    <h4 style={{ fontSize: 14, fontWeight: 800 }}>
                      PIN: <span style={{ color: 'var(--primary)' }}>{order.pickupPin}</span>
                    </h4>
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      background:
                        order.status === 'Ready'
                          ? '#ECFDF5'
                          : order.status === 'Preparing'
                          ? '#FFFBEB'
                          : '#EFF6FF',
                      color:
                        order.status === 'Ready'
                          ? '#059669'
                          : order.status === 'Preparing'
                          ? '#D97706'
                          : '#2563EB',
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {order.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')} • ৳{order.total}
                </p>

                {order.specialInstructions && (
                  <p style={{ fontSize: 11, color: '#D97706', marginBottom: 8, fontStyle: 'italic' }}>
                    Note: &ldquo;{order.specialInstructions}&rdquo;
                  </p>
                )}

                {/* Status Action Buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {order.status === 'Placed' && (
                    <button
                      className="btn-primary"
                      onClick={() => updateOrderStatus(order.id, 'Preparing')}
                      style={{ flex: 1, padding: '6px 10px', fontSize: 11 }}
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      className="btn-primary"
                      onClick={() => updateOrderStatus(order.id, 'Ready')}
                      style={{ flex: 1, padding: '6px 10px', fontSize: 11, background: '#059669' }}
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button
                      className="btn-secondary"
                      onClick={() => updateOrderStatus(order.id, 'Completed')}
                      style={{ flex: 1, padding: '6px 10px', fontSize: 11 }}
                    >
                      Handover Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StockIntakeModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} />
    </div>
  );
};
