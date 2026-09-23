import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, GraduationCap, Store, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, outlets } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState<'student' | 'vendor'>('student');
  const [selectedOutletId, setSelectedOutletId] = useState('khans-kitchen');
  const [email, setEmail] = useState('student@uiu.ac.bd');
  const [password, setPassword] = useState('demo123');

  const handleRoleChange = (newRole: 'student' | 'vendor') => {
    setRole(newRole);
    if (newRole === 'student') {
      setEmail('student@uiu.ac.bd');
    } else {
      setEmail('vendor@uiu.ac.bd');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role, role === 'vendor' ? selectedOutletId : undefined);
    if (role === 'vendor') {
      navigate('/vendor');
    } else {
      navigate('/');
    }
  };

  const selectedOutlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: '30px 20px',
      }}
    >
      {/* Brand Hero */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #F68920 0%, #D86B07 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 14px auto',
            boxShadow: '0 8px 24px rgba(246, 137, 32, 0.35)',
          }}
        >
          <UtensilsCrossed size={32} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', letterSpacing: -0.5 }}>
          UIU FOOD HUB
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          United International University • Smart Food Ecosystem
        </p>
      </div>

      {/* Login Card */}
      <div
        className="card-base"
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 24,
          borderRadius: 24,
        }}
      >
        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            background: 'var(--bg-app)',
            padding: 4,
            borderRadius: 14,
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 10,
              border: 'none',
              background: role === 'student' ? 'white' : 'transparent',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: role === 'student' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <GraduationCap size={16} />
            Student
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('vendor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              borderRadius: 10,
              border: 'none',
              background: role === 'vendor' ? 'white' : 'transparent',
              color: role === 'vendor' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: role === 'vendor' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Store size={16} />
            Vendor Branch
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Branch / Outlet Selector for Vendor */}
          {role === 'vendor' && (
            <div
              style={{
                background: 'var(--primary-light)',
                border: '1.5px solid #FED7AA',
                padding: '12px 14px',
                borderRadius: 16,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#9A3412',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginBottom: 6,
                }}
              >
                <Store size={14} /> Select Your Outlet / Branch
              </label>

              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #FDBA74',
                  background: 'white',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.location})
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: '#C25700' }}>
                <MapPin size={11} />
                <span>Operating dashboard will be tuned specifically to <strong>{selectedOutlet.name}</strong>.</span>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
              University Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-app)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-app)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Quick Demo Autofill Notice */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              fontSize: 11,
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ShieldCheck size={14} style={{ flexShrink: 0 }} />
            <span>
              Pre-filled demo credentials: <strong>{email}</strong> (password: <code>demo123</code>)
            </span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: 14, fontSize: 14, marginTop: 4 }}
          >
            Sign In as {role === 'student' ? 'Student' : `${selectedOutlet.name} Vendor`} <ArrowRight size={16} />
          </button>
        </form>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 24, textAlign: 'center' }}>
        Prototype demo data — not official UIU operational data.
      </p>
    </div>
  );
};
