import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportStatus } from '../../types';
import {
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  TrendingUp,
  PieChart,
  User,
  ShieldCheck,
} from 'lucide-react';

export const VendorReportsPage: React.FC = () => {
  const { reports, updateReportStatus, orders, inventory } = useApp();
  const [activeTab, setActiveTab] = useState<'issues' | 'analytics'>('issues');

  const openIssuesCount = reports.filter((r) => r.status === 'Open').length;

  return (
    <div className="app-main">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Issues & Analytics</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Student feedback resolution & campus dining insights
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: 'var(--bg-muted)',
          padding: 4,
          borderRadius: 14,
        }}
      >
        <button
          onClick={() => setActiveTab('issues')}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'issues' ? 'white' : 'transparent',
            color: activeTab === 'issues' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <AlertTriangle size={15} />
          Customer Issues ({openIssuesCount})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'analytics' ? 'white' : 'transparent',
            color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <BarChart3 size={15} />
          Dining Analytics
        </button>
      </div>

      {/* TAB 1: Issues Management */}
      {activeTab === 'issues' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.length === 0 ? (
            <div
              className="card-base"
              style={{
                padding: 30,
                textAlign: 'center',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
              }}
            >
              <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#065F46' }}>No Open Issues</h4>
              <p style={{ fontSize: 12, color: '#047857' }}>
                All student feedback tickets have been resolved or none have been submitted yet.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="card-base"
                style={{
                  padding: 14,
                  border: report.status === 'Open' ? '1px solid #FED7AA' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)' }}>
                      #{report.id} • {report.outletName}
                    </span>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                      {report.category}
                    </h4>
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      background:
                        report.status === 'Open'
                          ? '#FEF2F2'
                          : report.status === 'Reviewing'
                          ? '#FFFBEB'
                          : '#ECFDF5',
                      color:
                        report.status === 'Open'
                          ? '#DC2626'
                          : report.status === 'Reviewing'
                          ? '#D97706'
                          : '#059669',
                    }}
                  >
                    {report.status.toUpperCase()}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                  &ldquo;{report.description}&rdquo;
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-light)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <span>Reported by: <strong>{report.studentName}</strong></span>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {report.status !== 'Reviewing' && report.status !== 'Resolved' && (
                      <button
                        className="btn-secondary"
                        onClick={() => updateReportStatus(report.id, 'Reviewing')}
                        style={{ padding: '4px 8px', fontSize: 10 }}
                      >
                        Reviewing
                      </button>
                    )}
                    {report.status !== 'Resolved' && (
                      <button
                        className="btn-primary"
                        onClick={() => updateReportStatus(report.id, 'Resolved')}
                        style={{ padding: '4px 8px', fontSize: 10, background: '#059669' }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* TAB 2: Dining Analytics */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Peak Hours Card */}
          <div className="card-base" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', marginBottom: 8 }}>
              <Clock size={16} />
              <h4 style={{ fontSize: 14, fontWeight: 800 }}>Campus Peak Ordering Window</h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Peak order velocity consistently occurs between <strong>1:00 PM – 2:30 PM</strong> (undergraduate lunch hour and post-lab departures).
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 6,
                marginTop: 12,
                textAlign: 'center',
                fontSize: 11,
              }}
            >
              <div style={{ background: 'var(--bg-app)', padding: 8, borderRadius: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--text-light)' }}>11:30 AM</span>
                <p style={{ fontWeight: 800 }}>18% Vol</p>
              </div>
              <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 10, border: '1px solid #FED7AA' }}>
                <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>1:15 PM</span>
                <p style={{ fontWeight: 800, color: 'var(--primary)' }}>58% Vol</p>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 8, borderRadius: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--text-light)' }}>3:30 PM</span>
                <p style={{ fontWeight: 800 }}>24% Vol</p>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 8, borderRadius: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--text-light)' }}>6:00 PM</span>
                <p style={{ fontWeight: 800 }}>14% Vol</p>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="card-base" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', marginBottom: 10 }}>
              <TrendingUp size={16} />
              <h4 style={{ fontSize: 14, fontWeight: 800 }}>Top Selling Dishes (Live State)</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>1. Chicken Fry (Khan&apos;s & CP)</span>
                <strong style={{ color: 'var(--primary)' }}>38 portions today</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>2. Fried Rice Combo</span>
                <strong>24 portions today</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>3. Dim Khichuri</span>
                <strong>19 portions today</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>4. Cold Coffee (Brew)</span>
                <strong>16 cups today</strong>
              </div>
            </div>
          </div>

          {/* Prototype Demo Disclaimer Banner */}
          <div className="demo-banner-box">
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Prototype demo data</strong> — analytics calculated from session interactions and realistic campus simulation. Not official UIU revenue.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
