import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedOutletId?: string;
}

export const TableBookingModal: React.FC<TableBookingModalProps> = ({
  isOpen,
  onClose,
  preselectedOutletId,
}) => {
  const { outlets, tables, bookTable } = useApp();

  const [selectedOutletId, setSelectedOutletId] = useState(
    preselectedOutletId || outlets[0]?.id || 'khans-kitchen'
  );
  const [selectedTable, setSelectedTable] = useState('Table 02');
  const [date, setDate] = useState('Today (Lunch)');
  const [time, setTime] = useState('1:30 PM');
  const [duration, setDuration] = useState(60);
  const [guests, setGuests] = useState(2);
  const [phone, setPhone] = useState('+880 1711-223344');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentOutletTables = tables.filter((t) => t.outletId === selectedOutletId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = bookTable({
      outletId: selectedOutletId,
      tableNumber: selectedTable,
      date,
      time,
      durationMinutes: duration,
      guests,
      phone,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      setErrorMsg(result.error || 'Failed to book table.');
    }
  };

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
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Reserve Campus Table</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Avoid cafeteria crowd during lunch break
            </span>
          </div>
          <button onClick={onClose} className="btn-icon-circle" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Reservation Confirmed!</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {selectedTable} is booked for {time} ({duration} mins). Check under Tables tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Outlet Selection */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Select Outlet
              </label>
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Table Selection Grid */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Choose Table
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {currentOutletTables.map((t) => {
                  const isSelected = selectedTable === t.tableNumber;
                  const isOccupied = t.status === 'Occupied';
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedTable(t.tableNumber)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 12,
                        border: isSelected
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-subtle)',
                        background: isSelected
                          ? 'var(--primary-light)'
                          : isOccupied
                          ? '#F3F4F6'
                          : 'var(--bg-card)',
                        color: isOccupied
                          ? '#9CA3AF'
                          : isSelected
                          ? 'var(--primary)'
                          : 'var(--text-main)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: isOccupied ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <span>{t.tableNumber}</span>
                      <span style={{ fontSize: 9, opacity: 0.75 }}>
                        {isOccupied ? 'Busy' : `${t.capacity}p`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} /> Date
                </label>
                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    fontSize: 12,
                  }}
                >
                  <option value="Today (Lunch)">Today (Lunch)</option>
                  <option value="Today (Evening)">Today (Evening)</option>
                  <option value="Tomorrow">Tomorrow</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> Time
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    fontSize: 12,
                  }}
                >
                  <option value="1:15 PM">1:15 PM</option>
                  <option value="1:30 PM">1:30 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="2:30 PM">2:30 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:30 PM">5:30 PM</option>
                </select>
              </div>
            </div>

            {/* Duration & Guests */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    fontSize: 12,
                  }}
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  <Users size={12} style={{ display: 'inline', marginRight: 4 }} /> Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-app)',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            {/* Student Phone */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)',
                  fontSize: 13,
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 14, marginTop: 6 }}
            >
              Confirm Reservation
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
