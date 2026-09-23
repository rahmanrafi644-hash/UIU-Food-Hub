import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { StockIntakeModal } from '../../components/vendor/StockIntakeModal';
import { StatusBadge } from '../../components/common/StatusBadge';
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
} from 'lucide-react';

export const VendorDashboardPage: React.FC = () => {
  const { orders, inventory, outlets, updateOrderStatus } = useApp();
  const navigate = useNavigate();
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Metrics
  const todayOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'Completed').length;
  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Low stock items
  const lowStockItems = inventory.filter((i) => i.stock <= 8);
  const chickenFry = inventory.find((i) => i.name.toLowerCase().includes('chicken fry'));

  return (
    <div className="app-main">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            UIU Vendor Portal
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Operations Hub</h2>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsStockModalOpen(true)}
          style={{ padding: '8px 14px', fontSize: 12 }}
        >
          <PlusCircle size={15} /> Add Stock
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Today's Revenue */}
        <div className="card-base" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', marginBottom: 4 }}>
            <TrendingUp size={15} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Total Revenue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-muted)' }}>৳</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>{todayRevenue}</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-light)' }}>Demo sales tracking</span>
        </div>

        {/* Active Orders */}
        <div className="card-base" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', marginBottom: 4 }}>
            <Clock size={15} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>Active Orders</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>{activeOrdersCount}</p>
          <span style={{ fontSize: 10, color: 'var(--text-light)' }}>{todayOrdersCount} orders placed</span>
        </div>
      </div>

      {/* AI Demand Intelligence Highlight Banner */}
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
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#9A3412' }}>AI Demand Assistant</h4>
              <span style={{ fontSize: 11, color: '#C25700' }}>Google Gemini 2.0 Flash Integration</span>
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
            ? `⚠️ Alert: ${chickenFry.name} at ${chickenFry.outletName} has dropped to ${chickenFry.stock} units! Stockout predicted during lunch break.`
            : `AI model monitoring student ordering patterns & inventory consumption across campus.`}
        </p>

        <button
          className="btn-primary"
          onClick={() => navigate('/vendor/ai')}
          style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
        >
          Open AI Demand Assistant <ArrowRight size={15} />
        </button>
      </div>

      {/* Low Stock Items Alert Section */}
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
            <span style={{ fontSize: 12, fontWeight: 700 }}>All food items have sufficient inventory!</span>
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

      {/* Recent Orders Pipeline */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Live Orders Pipeline</h3>
          <Link
            to="/vendor/orders"
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
          >
            View All ({orders.length})
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="card-base" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)' }}>
                    #{order.id} • {order.studentName}
                  </span>
                  <h4 style={{ fontSize: 14, fontWeight: 800 }}>{order.outletName}</h4>
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
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <StockIntakeModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} />
    </div>
  );
};
