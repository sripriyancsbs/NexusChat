import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AccessRequestModal from '../components/common/AccessRequestModal.jsx';
import { IconAlertCircle } from '../components/common/Icons.jsx';

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
      setError('Please enter your identifier and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(identifier.trim(), password);
      onLoginSuccess(loggedUser);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
        padding: '24px',
        position: 'relative'
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 1 }}>
        <div
          onClick={onNavigateHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--grad-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#ffffff'
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}
          >
            NexusChat
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Privacy-Focused Community Communication
        </p>
      </div>

      {/* Modern Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: '30px 28px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            Sign in
          </h2>
          <span className="privacy-badge">
            🔒 Zero-Admin Access
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '20px' }}>
          Sign in to your private workspace account.
        </p>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-rose)',
              fontSize: '0.8125rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IconAlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Username or Email
            </label>
            <input
              type="text"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin, priya, or email"
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '9px', marginTop: '4px', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Login */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', textAlign: 'center' }}>
            Quick Evaluation Access
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '8px 4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>Admin</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('priya', 'user123')}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '8px 4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Priya</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>user123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('agen', 'user123')}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '8px 4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>Agen</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>user123</span>
            </button>
          </div>
        </div>

        {/* Request Account link */}
        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Need new workspace access?{' '}
          <button
            type="button"
            onClick={() => setIsAccessModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-primary)',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Request Access
          </button>
        </div>
      </div>

      <AccessRequestModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}
