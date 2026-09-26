import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { KeyRound, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase is not configured.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
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
      <div
        className="card-base"
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 24,
          borderRadius: 24,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <KeyRound size={28} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Set New Password</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Enter a secure new password for your UIU Food HUB account.
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#065F46', marginBottom: 6 }}>
              Password Updated!
            </h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Your password has been reset successfully. You can now sign in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ width: '100%', padding: 12 }}
            >
              Go to Sign In <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
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
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
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
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
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
              style={{ width: '100%', padding: 14, marginTop: 6 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
