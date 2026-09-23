import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarDays, Clock, Users, Phone, CheckCircle, Store, AlertCircle } from 'lucide-react';

export const VendorTablesPage: React.FC = () => {
  const { tableBookings, tables, outlets } = useApp();
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');

  const filteredBookings = tableBookings.filter(
    (b) => selectedOutlet === 'all' || b.outletId === selectedOutlet
  );

  const filteredTables = tables.filter(
    (t) => selectedOutlet === 'all' || t.outletId === selectedOutlet
  );

  return (
    <div className="app-main">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Table Management</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Cafeteria seating reservations & live occupancy
        </p>
      </div>

      {/* Outlet Filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedOutlet('all')}
          className={`category-pill ${selectedOutlet === 'all' ? 'active' : ''}`}
        >
          All Outlets
        </button>
        {outlets.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedOutlet(o.id)}
            className={`category-pill ${selectedOutlet === o.id ? 'active' : ''}`}
          >
            {o.name}
          </button>
        ))}
      </div>

      {/* Real-time Reserved Bookings */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
          Upcoming Student Reservations ({filteredBookings.length})
        </h3>

        {filteredBookings.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: 24,
              textAlign: 'center',
              border: '1px dashed var(--border-subtle)',
              background: 'transparent',
            }}
          >
            <CalendarDays size={28} color="var(--text-light)" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No student reservations logged yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="card-base"
                style={{
                  padding: 14,
                  border: '1px solid #FED7AA',
                  background: '#FFFDF9',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)' }}>
                      #{booking.id}
                    </span>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                      {booking.studentName} • {booking.tableNumber}
                    </h4>
                  </div>

                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                    }}
                  >
                    CONFIRMED
                  </span>
                </div>

                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Outlet: <strong>{booking.outletName}</strong>
                </span>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarDays size={13} color="var(--primary)" /> {booking.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {booking.time} ({booking.durationMinutes} mins)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={13} /> {booking.guests} Guests
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={13} /> {booking.studentPhone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outlet Tables Status Matrix */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Live Table Status</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {filteredTables.map((t) => (
            <div
              key={t.id}
              className="card-base"
              style={{
                padding: 12,
                textAlign: 'center',
                background: t.status === 'Occupied' ? '#F9FAFB' : t.status === 'Reserved' ? '#FFFBEB' : 'white',
              }}
            >
              <span style={{ fontSize: 10, color: 'var(--text-light)', display: 'block' }}>{t.outletName}</span>
              <strong style={{ fontSize: 14, color: 'var(--text-main)', display: 'block', margin: '2px 0' }}>
                {t.tableNumber}
              </strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Capacity: {t.capacity}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 9999,
                  background:
                    t.status === 'Available' ? '#ECFDF5' : t.status === 'Reserved' ? '#FEF3C7' : '#F3F4F6',
                  color:
                    t.status === 'Available' ? '#059669' : t.status === 'Reserved' ? '#D97706' : '#9CA3AF',
                }}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
