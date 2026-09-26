import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TableBookingModal } from '../../components/student/TableBookingModal';
import { CalendarDays, Clock, Users, Plus, CheckCircle, Store, AlertCircle } from 'lucide-react';

export const StudentTablesPage: React.FC = () => {
  const { tableBookings, tables, outlets, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('all');

  // Filter bookings strictly to current student
  const studentBookings = tableBookings.filter(
    (b) => b.studentId === user?.id || (user?.id === 'stu-demo-01' && b.studentId.startsWith('stu-demo'))
  );

  const filteredTables = tables.filter(
    (t) => selectedOutletFilter === 'all' || t.outletId === selectedOutletFilter
  );

  return (
    <div className="app-main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Campus Tables</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Reserve cafeteria seating & avoid busy rush
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 16px', fontSize: 12 }}
        >
          <Plus size={16} /> Book Table
        </button>
      </div>

      {/* Active Bookings Section */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Your Reservations</h3>

        {studentBookings.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: 24,
              textAlign: 'center',
              border: '1px dashed var(--border-subtle)',
              background: 'transparent',
            }}
          >
            <CalendarDays size={32} color="var(--text-light)" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              No table reservations right now.
            </p>
            <button
              className="btn-secondary"
              onClick={() => setIsModalOpen(true)}
              style={{ marginTop: 10, padding: '8px 14px', fontSize: 12 }}
            >
              Reserve a Table
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {studentBookings.map((b) => (
              <div
                key={b.id}
                className="card-base"
                style={{
                  padding: 14,
                  background: 'var(--primary-light)',
                  border: '1px solid #FED7AA',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', letterSpacing: 0.5 }}>
                      BOOKING #{b.id}
                    </span>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                      {b.outletName} • {b.tableNumber}
                    </h4>
                  </div>

                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CheckCircle size={12} /> {b.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarDays size={13} color="var(--primary)" /> {b.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {b.time} ({b.durationMinutes}m)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={13} /> {b.guests} Guests
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Table Availability Grid */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Campus Table Availability</h3>
        </div>

        {/* Outlet Filter Pills */}
        <div className="category-row" style={{ marginBottom: 10 }}>
          <button
            onClick={() => setSelectedOutletFilter('all')}
            className={`category-pill ${selectedOutletFilter === 'all' ? 'active' : ''}`}
          >
            All Outlets
          </button>
          {outlets.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOutletFilter(o.id)}
              className={`category-pill ${selectedOutletFilter === o.id ? 'active' : ''}`}
            >
              {o.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {filteredTables.map((t) => {
            const isAvailable = t.status === 'Available';
            const isOccupied = t.status === 'Occupied';
            return (
              <div
                key={t.id}
                className="card-base"
                style={{
                  padding: 12,
                  textAlign: 'center',
                  background: isOccupied ? '#F9FAFB' : isAvailable ? 'white' : '#FFFBEB',
                  border: isAvailable ? '1px solid #D1FAE5' : '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--text-light)', display: 'block' }}>
                  {t.outletName}
                </span>
                <strong style={{ fontSize: 14, color: 'var(--text-main)', display: 'block', margin: '2px 0' }}>
                  {t.tableNumber}
                </strong>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Cap: {t.capacity} seats
                </span>

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 9999,
                    background: isOccupied ? '#F3F4F6' : isAvailable ? '#ECFDF5' : '#FEF3C7',
                    color: isOccupied ? '#9CA3AF' : isAvailable ? '#059669' : '#D97706',
                  }}
                >
                  {t.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <TableBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
