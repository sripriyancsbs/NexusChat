import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AccessRequestModal from '../components/common/AccessRequestModal.jsx';
import { IconShield, IconUsers, IconAlertCircle } from '../components/common/Icons.jsx';

export default function LoginPage({ onNavigateHome, onLoginSuccess }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(identifier.trim(), password);
      onLoginSuccess(loggedUser);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoIdentifier, demoPassword) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(demoIdentifier, demoPassword);
      onLoginSuccess(loggedUser);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          onClick={onNavigateHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff'
            }}
          >
            N
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
            NexusChat
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Privacy-Focused Community Communication Platform
        </p>
      </div>

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: '32px 28px'
        }}
      >
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          Sign in to your account to enter your workspace.
        </p>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--status-danger-subtle)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-danger)',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IconAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Username or Email
            </label>
            <input
              type="text"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. admin or priya"
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', marginTop: '6px', fontSize: '0.95rem', fontWeight: 600 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Test Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
            Instant Evaluation Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              disabled={loading}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--status-danger)' }}>Admin</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('priya', 'user123')}
              disabled={loading}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Priya</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>user123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('agen', 'user123')}
              disabled={loading}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Agen</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>user123</span>
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Need community access?{' '}
          <button
            type="button"
            onClick={() => setIsAccessModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Request an account
          </button>
        </div>
      </div>

      {/* Back button */}
      <div style={{ marginTop: '18px' }}>
        <button
          type="button"
          onClick={onNavigateHome}
          className="btn-outline"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ← Back to Homepage
        </button>
      </div>

      <AccessRequestModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}
