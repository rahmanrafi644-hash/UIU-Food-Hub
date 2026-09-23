import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ReportIssueModal } from '../../components/student/ReportIssueModal';
import {
  User,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Store,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, logout, resetDemoData } = useApp();
  const navigate = useNavigate();
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleSwitchToVendor = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-main">
      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Student Profile</h2>

      {/* Profile Card */}
      <div className="card-base" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F68920 0%, #D86B07 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 20,
            boxShadow: '0 4px 12px rgba(246, 137, 32, 0.3)',
          }}
        >
          {user?.name?.charAt(0) || 'S'}
        </div>

        <div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>
            {user?.name || 'UIU Student'}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>
            ID: {user?.studentId || '011211048'} • UIU CSE
          </span>
          <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
            {user?.email || 'student@uiu.ac.bd'}
          </span>
        </div>
      </div>

      {/* Quick Action List */}
      <div className="card-base" style={{ padding: 6, display: 'flex', flexDirection: 'column' }}>
        {/* Report an Issue */}
        <button
          onClick={() => setIsReportOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 14px',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={17} />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>Report a Food / Service Issue</strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                Directly alerts cafeteria vendor team
              </span>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-light)" />
        </button>

        {/* Switch to Vendor View */}
        <button
          onClick={handleSwitchToVendor}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 14px',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={17} />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>Switch to Vendor Operations</strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                View vendor dashboard & AI Demand Assistant
              </span>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-light)" />
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetDemoData}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#F3F4F6',
                color: '#4B5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={17} />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>Reset Demo Data</strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                Restore initial presentation state (Chicken Fry = 10 units)
              </span>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-light)" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="btn-secondary"
        style={{ width: '100%', color: '#EF4444', borderColor: '#FCA5A5' }}
      >
        <LogOut size={16} /> Sign Out
      </button>

      <ReportIssueModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
};
