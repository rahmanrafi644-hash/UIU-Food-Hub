import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UtensilsCrossed,
  GraduationCap,
  Store,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import {
  isUiuEmail,
  registerStudentWithSupabase,
  registerVendorWithSupabase,
  resendSupabaseVerification,
  requestPasswordReset,
  isSupabaseConfigured,
} from '../../services/supabase';

type AuthMode = 'signin' | 'signup' | 'verification_pending' | 'forgot_password';

export const LoginPage: React.FC = () => {
  const { login, outlets } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode and Role state
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('verified') === 'true' ? 'signin' : 'signin'
  );
  const [role, setRole] = useState<'student' | 'vendor'>('student');
  const [selectedOutletId, setSelectedOutletId] = useState('khans-kitchen');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('011211048');
  const [phone, setPhone] = useState('01711223344');
  const [email, setEmail] = useState('student@uiu.ac.bd');
  const [password, setPassword] = useState('demo123');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    searchParams.get('verified') === 'true'
      ? 'Email verified successfully! You can now sign in.'
      : null
  );
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const selectedOutlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];

  const handleRoleChange = (newRole: 'student' | 'vendor') => {
    setRole(newRole);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (newRole === 'student') {
      setEmail('student@uiu.ac.bd');
      setPassword('demo123');
    } else {
      setEmail('vendor@uiu.ac.bd');
      setPassword('demo123');
    }
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await login(
        email.trim().toLowerCase(),
        password,
        role,
        role === 'vendor' ? selectedOutletId : undefined
      );

      if (result.success) {
        if (role === 'vendor') {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      } else {
        if (result.isUnconfirmed) {
          setPendingVerificationEmail(email.trim().toLowerCase());
          setMode('verification_pending');
        } else {
          setErrorMsg(result.error || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Password confirmation check
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    // 2. Student Email Validation rule: MUST end in @uiu.ac.bd
    if (role === 'student') {
      if (!isUiuEmail(cleanEmail)) {
        setErrorMsg('Students must register using a valid UIU email address ending with @uiu.ac.bd.');
        return;
      }
    }

    setLoading(true);

    try {
      if (role === 'student') {
        const res = await registerStudentWithSupabase({
          fullName,
          email: cleanEmail,
          phone,
          studentId,
          password,
        });

        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed.');
          setLoading(false);
          return;
        }

        if (res.needsVerification) {
          setPendingVerificationEmail(cleanEmail);
          setMode('verification_pending');
        } else {
          // If auto-confirm is on in Supabase, log in directly
          await login(cleanEmail, password, 'student');
          navigate('/');
        }
      } else {
        // Vendor registration
        const res = await registerVendorWithSupabase({
          vendorName: fullName,
          outletId: selectedOutlet.id,
          outletName: selectedOutlet.name,
          email: cleanEmail,
          phone,
          password,
        });

        if (!res.success) {
          setErrorMsg(res.error || 'Vendor registration failed.');
          setLoading(false);
          return;
        }

        if (res.needsVerification) {
          setPendingVerificationEmail(cleanEmail);
          setMode('verification_pending');
        } else {
          await login(cleanEmail, password, 'vendor', selectedOutlet.id);
          navigate('/vendor');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Verification Handler
  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;
    setResendStatus('Sending verification email...');
    const res = await resendSupabaseVerification(pendingVerificationEmail);
    if (res.success) {
      setResendStatus('Verification email sent! Please check your inbox.');
    } else {
      setResendStatus(res.error || 'Could not send verification email. Try again in a minute.');
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await requestPasswordReset(email.trim().toLowerCase());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password reset link sent! Please check your email.');
    } else {
      setErrorMsg(res.error || 'Could not send reset link. Please check your email.');
    }
  };

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
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #F68920 0%, #D86B07 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 12px auto',
            boxShadow: '0 8px 24px rgba(246, 137, 32, 0.35)',
          }}
        >
          <UtensilsCrossed size={30} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: -0.5 }}>
          UIU FOOD HUB
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          United International University • Smart Food Ecosystem
        </p>
      </div>

      {/* Main Card */}
      <div
        className="card-base"
        style={{
          width: '100%',
          maxWidth: 390,
          padding: 22,
          borderRadius: 22,
        }}
      >
        {/* VIEW 1: EMAIL VERIFICATION PENDING SCREEN */}
        {mode === 'verification_pending' && (
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Mail size={30} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Verify Your Email Address
            </h3>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Please verify your email address to activate your account. We sent a verification link to:
            </p>

            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-app)',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--primary)',
                marginBottom: 18,
                wordBreak: 'break-all',
              }}
            >
              {pendingVerificationEmail || email}
            </div>

            {resendStatus && (
              <p
                style={{
                  fontSize: 12,
                  color: resendStatus.includes('sent') ? '#059669' : '#DC2626',
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                {resendStatus}
              </p>
            )}

            <button
              type="button"
              onClick={handleResendVerification}
              className="btn-secondary"
              style={{ width: '100%', padding: 12, fontSize: 13, marginBottom: 10 }}
            >
              <RefreshCw size={15} /> Resend verification email
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                margin: '12px auto 0 auto',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </div>
        )}

        {/* VIEW 2: FORGOT PASSWORD SCREEN */}
        {mode === 'forgot_password' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setMode('signin')}
                className="btn-icon-circle"
                style={{ width: 30, height: 30 }}
              >
                <ArrowLeft size={14} />
              </button>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Reset Password</h3>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Enter your registered university email to receive a password reset link.
            </p>

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
                  marginBottom: 14,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 10,
                  borderRadius: 12,
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@uiu.ac.bd"
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: 13, fontSize: 13 }}
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3 & 4: SIGN IN / SIGN UP TABS */}
        {(mode === 'signin' || mode === 'signup') && (
          <div>
            {/* Top Navigation: Sign In vs Sign Up */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 4,
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 10,
                marginBottom: 16,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  padding: '8px 4px',
                  border: 'none',
                  background: 'none',
                  color: mode === 'signin' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  borderBottom: mode === 'signin' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                  marginBottom: -11,
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  padding: '8px 4px',
                  border: 'none',
                  background: 'none',
                  color: mode === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  borderBottom: mode === 'signup' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                  marginBottom: -11,
                  transition: 'all 0.2s',
                }}
              >
                Register
              </button>
            </div>

            {/* Role Selector Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
                background: 'var(--bg-app)',
                padding: 4,
                borderRadius: 14,
                marginBottom: 16,
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
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: 'none',
                  background: role === 'student' ? 'white' : 'transparent',
                  color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: role === 'student' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <GraduationCap size={15} />
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
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: 'none',
                  background: role === 'vendor' ? 'white' : 'transparent',
                  color: role === 'vendor' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  boxShadow: role === 'vendor' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Store size={15} />
                Vendor Outlet
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Branch Selector for Vendor */}
            {role === 'vendor' && (
              <div
                style={{
                  background: 'var(--primary-light)',
                  border: '1.5px solid #FED7AA',
                  padding: '10px 12px',
                  borderRadius: 14,
                  marginBottom: 14,
                }}
              >
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#9A3412',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginBottom: 5,
                  }}
                >
                  <Store size={13} /> Assigned Outlet / Branch
                </label>

                <select
                  value={selectedOutletId}
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #FDBA74',
                    background: 'white',
                    fontSize: 12,
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10, color: '#C25700' }}>
                  <MapPin size={10} />
                  <span>Scoped directly to <strong>{selectedOutlet.name}</strong>.</span>
                </div>
              </div>
            )}

            {/* FORM: SIGN IN */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                    {role === 'student' ? 'UIU Email (@uiu.ac.bd)' : 'Vendor Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'student' ? 'student@uiu.ac.bd' : 'vendor@email.com'}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-app)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-app)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Demo autofill hint */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    fontSize: 10,
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                  <span>
                    Demo accounts active: <strong>{email}</strong> (pass: <code>demo123</code>)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: 13, fontSize: 13, marginTop: 4 }}
                >
                  {loading ? 'Signing in...' : `Sign In as ${role === 'student' ? 'Student' : `${selectedOutlet.name} Vendor`}`} <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              /* FORM: SIGN UP */
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 3 }}>
                    {role === 'student' ? 'Full Name' : 'Vendor / Owner Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Rahim Ahmed' : 'e.g. Tareq Khan'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 11,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-app)',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 3 }}>
                    {role === 'student' ? 'UIU Email (@uiu.ac.bd only)' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'student' ? 'studentname@uiu.ac.bd' : 'vendor@example.com'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 11,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-app)',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  {role === 'student' && (
                    <span style={{ fontSize: 10, color: '#D97706', fontWeight: 600, marginTop: 2, display: 'block' }}>
                      * Must end in @uiu.ac.bd
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: role === 'student' ? '1fr 1fr' : '1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 3 }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01700000000"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 11,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)',
                        fontSize: 12,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {role === 'student' && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 3 }}>
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="011211048"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 11,
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-app)',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 3 }}>
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 11,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)',
                        fontSize: 12,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 3 }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 11,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)',
                        fontSize: 12,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: 13, fontSize: 13, marginTop: 4 }}
                >
                  {loading ? 'Creating Account...' : `Register ${role === 'student' ? 'Student' : 'Vendor'} Account`} <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 20, textAlign: 'center' }}>
        Prototype demo data — not official UIU operational data.
      </p>
    </div>
  );
};
