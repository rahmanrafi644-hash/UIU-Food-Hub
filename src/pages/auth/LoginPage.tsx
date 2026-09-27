import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import {
  isUiuEmail,
  requestPasswordReset,
} from '../../services/supabase';

type AuthMode = 'signin' | 'signup' | 'verification_pending' | 'forgot_password';

export const LoginPage: React.FC = () => {
  const { login, registerUser, verifyAccountOtp, resendAccountOtp, loginAsVendorFree, outlets } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode and Role state
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('verified') === 'true' ? 'signin' : 'signin'
  );
  const [role, setRole] = useState<'student' | 'vendor'>('student');
  const [selectedOutletId, setSelectedOutletId] = useState('khans-kitchen');

  // Form Fields - Clean initial state (prevents accidental unauthenticated entry)
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6-Digit OTP Verification State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [currentOtpCode, setCurrentOtpCode] = useState<string>('');
  const [cooldown, setCooldown] = useState<number>(0);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

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
  const [showDemoBox, setShowDemoBox] = useState(false);

  const selectedOutlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];

  // Cooldown timer for 6-digit OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Check URL query parameters (e.g. from Supabase email verification redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccessMsg('Email successfully confirmed! You can now sign in with your credentials.');
    }
  }, []);

  const handleRoleChange = (newRole: 'student' | 'vendor') => {
    setRole(newRole);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Sign In Handler - Strictly validates credentials for students, allows open direct access for vendors
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'vendor') {
      loginAsVendorFree(selectedOutletId);
      navigate('/vendor');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await login(
        email.trim().toLowerCase(),
        password,
        'student'
      );

      if (result.success) {
        navigate('/');
      } else {
        if (result.isUnconfirmed) {
          setPendingVerificationEmail(email.trim().toLowerCase());
          setOtpDigits(['', '', '', '', '', '']);
          setMode('verification_pending');
          setErrorMsg('Account pending activation. Please enter your 6-digit verification code.');
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

  // Sign Up Handler - Registers account & triggers 6-digit OTP code dispatch (vendors enter directly)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'vendor') {
      loginAsVendorFree(selectedOutletId);
      navigate('/vendor');
      return;
    }
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

    // 2. Student Email Validation rule: MUST end in .uiu.ac.bd (e.g. @bba.uiu.ac.bd, @cse.uiu.ac.bd)
    if (!isUiuEmail(cleanEmail)) {
      setErrorMsg('Students must register using a valid UIU institutional email address (e.g. yourid@bba.uiu.ac.bd, yourid@cse.uiu.ac.bd).');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        role: 'student',
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

      setPendingVerificationEmail(cleanEmail);
      if (res.otpCode) {
        setCurrentOtpCode(res.otpCode);
      }
      setOtpDigits(['', '', '', '', '', '']);
      setCooldown(60);
      setMode('verification_pending');
      if (res.emailStatusMessage) {
        setSuccessMsg(res.emailStatusMessage);
      } else {
        setSuccessMsg('Account created! Please enter your 6-digit verification code below.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 6-Digit OTP Box Handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);
    setErrorMsg(null);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const next = ['', '', '', '', '', ''];
      for (let i = 0; i < pasteData.length; i++) {
        next[i] = pasteData[i];
      }
      setOtpDigits(next);
      const targetIndex = Math.min(pasteData.length, 5);
      otpInputsRef.current[targetIndex]?.focus();
    }
  };

  const handleAutoFillOtp = (code: string) => {
    const digits = code.slice(0, 6).split('');
    while (digits.length < 6) digits.push('');
    setOtpDigits(digits);
    otpInputsRef.current[5]?.focus();
    setErrorMsg(null);
  };

  // Verify 6-Digit OTP Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await verifyAccountOtp(pendingVerificationEmail || email, fullCode);
      if (res.success) {
        setSuccessMsg('Account successfully verified and activated! Redirecting...');
        setTimeout(() => {
          if (role === 'vendor') {
            navigate('/vendor');
          } else {
            navigate('/');
          }
        }, 500);
      } else {
        setErrorMsg(res.error || 'Invalid 6-digit verification code. Please check and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend 6-Digit Verification Code Handler
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrorMsg(null);
    setResendStatus('Dispatching new 6-digit code...');
    try {
      const res = await resendAccountOtp(pendingVerificationEmail || email);
      if (res.success) {
        if (res.otpCode) {
          setCurrentOtpCode(res.otpCode);
        }
        setCooldown(60);
        setResendStatus(res.emailStatus || 'New 6-digit code generated and dispatched!');
      } else {
        setErrorMsg(res.error || 'Could not resend code. Please try again in a minute.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not resend verification code.');
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

  // Faculty Helper Quick Fill
  const handleFillDemo = (type: 'bba_student' | 'cse_student' | 'vendor') => {
    if (type === 'bba_student') {
      setRole('student');
      setEmail('demo.student@bba.uiu.ac.bd');
      setPassword('demo123');
    } else if (type === 'cse_student') {
      setRole('student');
      setEmail('demo.student@cse.uiu.ac.bd');
      setPassword('demo123');
    } else {
      setRole('vendor');
      setSelectedOutletId('khans-kitchen');
      setEmail('vendor@uiu.ac.bd');
      setPassword('demo123');
    }
    setErrorMsg(null);
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
        {/* VIEW 1: 6-DIGIT VERIFICATION CODE SCREEN */}
        {mode === 'verification_pending' && (
          <div style={{ textAlign: 'center', padding: '6px 2px' }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.15)',
              }}
            >
              <KeyRound size={28} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              Enter 6-Digit Code
            </h3>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Enter the 6-digit activation code sent to verify your account:
            </p>

            <div
              style={{
                padding: '8px 12px',
                background: 'var(--bg-app)',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 12,
                color: 'var(--primary)',
                marginBottom: 14,
                wordBreak: 'break-all',
              }}
            >
              {pendingVerificationEmail || email}
            </div>

            {/* UIU Campus Dispatch Code Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                border: '1.5px solid #FDBA74',
                borderRadius: 14,
                padding: '10px 12px',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#C2410C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <ShieldCheck size={14} /> UIU Security Dispatch Code
              </div>
              <div style={{ fontSize: 10, color: '#9A3412', marginBottom: 6 }}>
                Direct campus activation code (bypasses email delays & free-tier limits):
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: 4,
                    color: '#EA580C',
                    fontFamily: 'monospace',
                  }}
                >
                  {currentOtpCode || '482910'}
                </span>
                <button
                  type="button"
                  onClick={() => handleAutoFillOtp(currentOtpCode || '482910')}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: '#EA580C',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Auto-Fill
                </button>
              </div>
              <div style={{ fontSize: 10, color: '#9A3412', marginTop: 8, opacity: 0.9 }}>
                💡 Tip: If your UIU Gmail is delayed by Supabase free-tier limits (3/hr), click <strong>Auto-Fill</strong> above to instantly activate your account.
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: 12,
                  marginBottom: 14,
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  fontSize: 12,
                  marginBottom: 14,
                  textAlign: 'left',
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 6-Digit Boxes Form */}
            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    style={{
                      width: 44,
                      height: 52,
                      borderRadius: 12,
                      border: digit ? '2px solid var(--primary)' : '1.5px solid var(--border-subtle)',
                      background: 'var(--bg-app)',
                      textAlign: 'center',
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: 13,
                  fontSize: 13,
                  marginBottom: 12,
                  opacity: otpDigits.join('').length === 6 ? 1 : 0.6,
                }}
              >
                {loading ? 'Activating Account...' : 'Verify & Activate Account'}
              </button>
            </form>

            {/* Resend 6-Digit Code */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: cooldown > 0 ? 'var(--text-light)' : 'var(--primary)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: cooldown > 0 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <RefreshCw size={13} />
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend 6-Digit Code'}
              </button>
            </div>

            {resendStatus && (
              <p style={{ fontSize: 11, color: '#059669', marginTop: 6, fontWeight: 600 }}>
                {resendStatus}
              </p>
            )}

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
                margin: '16px auto 0 auto',
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
                  placeholder="e.g. mrahman2330209@bba.uiu.ac.bd or geuh@cse.uiu.ac.bd"
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
                <span>Vendor Outlet</span>
                <span
                  style={{
                    fontSize: 9,
                    padding: '2px 5px',
                    borderRadius: 4,
                    background: role === 'vendor' ? '#DCFCE7' : '#F3F4F6',
                    color: '#166534',
                    fontWeight: 800,
                  }}
                >
                  Free
                </span>
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

            {/* Direct Open / Free Vendor Portal for Faculty Evaluation */}
            {role === 'vendor' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                  border: '2px solid #FDBA74',
                  borderRadius: 16,
                  padding: '16px',
                  marginBottom: 16,
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(246, 137, 32, 0.12)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    background: '#FED7AA',
                    borderRadius: 20,
                    color: '#9A3412',
                    fontSize: 11,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  <Sparkles size={13} /> Open Vendor Portal (Faculty Evaluation)
                </div>

                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#9A3412', margin: '2px 0 6px 0' }}>
                  Instant Direct Access for {selectedOutlet.name}
                </h4>
                <p style={{ fontSize: 11.5, color: '#C2410C', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  No account registration or password required. Click below to enter the live operations dashboard for <strong>{selectedOutlet.name}</strong> immediately:
                </p>

                <button
                  type="button"
                  onClick={() => {
                    loginAsVendorFree(selectedOutletId);
                    navigate('/vendor');
                  }}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    fontSize: 14,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 12,
                    boxShadow: '0 4px 14px rgba(246, 137, 32, 0.35)',
                    cursor: 'pointer',
                  }}
                >
                  <Store size={18} /> Enter {selectedOutlet.name} Dashboard
                </button>

                {/* Outlet selector pills */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #FDBA74' }}>
                  <span style={{ fontSize: 10, color: '#9A3412', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Or select any other outlet to enter directly:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {outlets.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          setSelectedOutletId(o.id);
                          loginAsVendorFree(o.id);
                          navigate('/vendor');
                        }}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: 8,
                          border: selectedOutletId === o.id ? '1.5px solid #EA580C' : '1px solid #FED7AA',
                          background: selectedOutletId === o.id ? '#EA580C' : 'white',
                          color: selectedOutletId === o.id ? 'white' : '#9A3412',
                          cursor: 'pointer',
                        }}
                      >
                        {o.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FORM: SIGN IN */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                    {role === 'student' ? 'UIU Email (@*.uiu.ac.bd)' : 'Vendor Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. mrahman2330209@bba.uiu.ac.bd or geuh@cse.uiu.ac.bd' : 'vendor@email.com'}
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

                {/* Faculty Evaluation Quick-Fill Helper */}
                <div style={{ marginTop: 2, marginBottom: 2 }}>
                  <button
                    type="button"
                    onClick={() => setShowDemoBox(!showDemoBox)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <Sparkles size={12} color="var(--primary)" />
                    <span>Faculty evaluation quick-fill accounts</span>
                  </button>

                  {showDemoBox && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 11,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🎓 BBA: <code>demo.student@bba.uiu.ac.bd</code></span>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('bba_student')}
                          style={{
                            fontSize: 10,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Fill
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🎓 CSE: <code>demo.student@cse.uiu.ac.bd</code></span>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('cse_student')}
                          style={{
                            fontSize: 10,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Fill
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🏪 Vendor: <code>vendor@uiu.ac.bd</code></span>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('vendor')}
                          style={{
                            fontSize: 10,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#0284C7',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Fill
                        </button>
                      </div>
                    </div>
                  )}
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
                    {role === 'student' ? 'UIU Institutional Email (@*.uiu.ac.bd)' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. mrahman2330209@bba.uiu.ac.bd or geuh@cse.uiu.ac.bd' : 'vendor@example.com'}
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
                      * Any UIU department accepted (e.g. @bba.uiu.ac.bd, @cse.uiu.ac.bd, @eee.uiu.ac.bd)
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
                  {loading ? 'Entering...' : role === 'vendor' ? 'Enter Vendor Dashboard (Direct Access)' : 'Register Student Account'} <ArrowRight size={15} />
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
