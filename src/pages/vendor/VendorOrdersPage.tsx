import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { Clock, ChefHat, CheckCircle2, Filter, Phone, User, Calendar } from 'lucide-react';

export const VendorOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, outlets } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [outletFilter, setOutletFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesOutlet = outletFilter === 'all' || o.outletId === outletFilter;
    return matchesStatus && matchesOutlet;
  });

  return (
    <div className="app-main">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Order Management</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Update status in real time to alert student tracking
        </p>
      </div>

      {/* Outlet Filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setOutletFilter('all')}
          className={`category-pill ${outletFilter === 'all' ? 'active' : ''}`}
        >
          All Outlets
        </button>
        {outlets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOutletFilter(o.id)}
            className={`category-pill ${outletFilter === o.id ? 'active' : ''}`}
          >
            {o.name}
          </button>
        ))}
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
            No orders match the selected filters.
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
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{order.outletName}</span>
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
                  marginBottom: 10,
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
              <div style={{ display: 'flex', gap: 8 }}>
                {order.status === 'Placed' && (
                  <button
                    className="btn-primary"
                    onClick={() => updateOrderStatus(order.id, 'Preparing')}
                    style={{ flex: 1, padding: '10px', fontSize: 12 }}
                  >
                    <ChefHat size={14} /> Mark Preparing
                  </button>
                )}

                {order.status === 'Preparing' && (
                  <button
                    className="btn-primary"
                    onClick={() => updateOrderStatus(order.id, 'Ready')}
                    style={{ flex: 1, padding: '10px', fontSize: 12, background: '#059669' }}
                  >
                    <CheckCircle2 size={14} /> Mark Ready for Student Pickup
                  </button>
                )}

                {order.status === 'Ready' && (
                  <button
                    className="btn-secondary"
                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                    style={{ flex: 1, padding: '10px', fontSize: 12 }}
                  >
                    <CheckCircle2 size={14} /> Mark Completed
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
