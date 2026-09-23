import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  RotateCcw,
  UtensilsCrossed,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC<{
  onOpenNotifications?: () => void;
}> = () => {
  const { user, logout, notifications, resetDemoData, markNotificationAsRead } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const unreadCount = notifications.filter(
    (n) => !n.isRead && (n.recipientRole === 'all' || n.recipientRole === user?.role)
  ).length;

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="app-header">
        <Link to={user?.role === 'vendor' ? '/vendor' : '/'} className="brand-badge">
          <div className="brand-logo-icon">
            <UtensilsCrossed size={20} />
          </div>
          <div className="brand-titles">
            <span className="brand-name">UIU FOOD HUB</span>
            <span className="brand-sub">
              {user?.role === 'vendor' ? 'Vendor Operations' : 'Campus Food'}
            </span>
          </div>
        </Link>

        <div className="header-actions">
          {/* Presentation Script Guide */}
          <button
            className="btn-icon-circle"
            title="Presentation Demo Script (Step-by-Step)"
            onClick={() => setShowDemoGuide(true)}
            style={{ color: '#D97706', borderColor: '#FDE68A', background: '#FFFDF9' }}
          >
            <Sparkles size={16} />
          </button>

          {/* Quick Demo Reset Button for Faculty Presentations */}
          <button
            className="btn-icon-circle"
            title="Reset Demo State (Initial presentation conditions)"
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={16} />
          </button>

          {/* Notification Bell */}
          <button
            className="btn-icon-circle"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="badge-counter">{unreadCount}</span>}
          </button>

          {/* Logout */}
          <button
            className="btn-icon-circle"
            title="Logout"
            onClick={handleLogout}
            style={{ color: '#EF4444' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Notifications</h3>
              <button
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => setShowNotifications(false)}
              >
                Close
              </button>
            </div>

            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                No notifications right now.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications
                  .filter((n) => n.recipientRole === 'all' || n.recipientRole === user?.role)
                  .map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        background: notif.isRead ? 'var(--bg-muted)' : 'var(--primary-light)',
                        border: notif.isRead ? '1px solid var(--border-subtle)' : '1px solid #FED7AA',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{notif.title}</strong>
                        <span style={{ fontSize: 10, color: 'var(--text-light)' }}>
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.35 }}>{notif.message}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Demo State Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#D97706', marginBottom: 12 }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>Reset Demo Data</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              This will restore all inventory (Khan&apos;s Kitchen Chicken Fry back to 10 units), reset order history, and clear table reservations so you can repeat the demonstration flow for faculty evaluation.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleReset}>
                Reset to Initial State
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Success Toast */}
      {resetSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#064E3B',
            color: 'white',
            padding: '10px 18px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 999,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <CheckCircle size={16} color="#34D399" />
          Demo data reset to initial presentation conditions!
        </div>
      )}
      {/* Presentation Script Guide Modal */}
      {showDemoGuide && (
        <div className="modal-overlay" onClick={() => setShowDemoGuide(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={16} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>Presentation Demonstration Script</h3>
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() => setShowDemoGuide(false)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, lineHeight: 1.45 }}>
              <div style={{ padding: 10, background: 'var(--bg-app)', borderRadius: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>1. Initial State (Student):</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  Show Khan&apos;s Kitchen Chicken Fry has <strong>10 units</strong> (Available).
                </p>
              </div>

              <div style={{ padding: 10, background: 'var(--bg-app)', borderRadius: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>2. Student Order & Stock Deduction:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  Order 2 Chicken Fry with ASAP pickup & bKash demo. Stock drops to <strong>8 units (Low Stock)</strong> in shared state.
                </p>
              </div>

              <div style={{ padding: 10, background: 'var(--bg-app)', borderRadius: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>3. Vendor Live Pipeline:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  Switch to Vendor, observe incoming order and advance status: Placed ➔ Preparing ➔ Ready.
                </p>
              </div>

              <div style={{ padding: 10, background: 'var(--bg-app)', borderRadius: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>4. AI Demand Assistant (Gemini API):</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  Click [AI Demand] ➔ [Analyze Demand with AI]. Gemini reads live data, detects shortage risk, and recommends <strong>+20 portions refill</strong>.
                </p>
              </div>

              <div style={{ padding: 10, background: 'var(--bg-app)', borderRadius: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>5. Human-in-the-Loop Restock Commit:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  Click [Add Recommended Stock]. Shared stock increments to <strong>28 portions (Available)</strong>.
                </p>
              </div>

              <div style={{ padding: 10, background: 'var(--bg-app)', borderRadius: 12 }}>
                <strong style={{ color: 'var(--primary)' }}>6. Table Reservation:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  Book Table 02 at Khan&apos;s Kitchen; vendor table matrix immediately shows Reserved.
                </p>
              </div>

              <div style={{ padding: 10, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12 }}>
                <strong style={{ color: '#D97706' }}>💡 Presentation Reset:</strong>
                <p style={{ color: '#92400E', marginTop: 2 }}>
                  Click the circular reset icon in the top header anytime to restore the 10-unit initial state.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
