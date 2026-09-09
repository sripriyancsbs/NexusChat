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
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Aurora Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 245, 196, 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', zIndex: 1 }}>
        <div
          onClick={onNavigateHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--grad-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#06090f',
              boxShadow: 'var(--glow-cyan)'
            }}
          >
            ✦
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em' }}>
            NexusChat
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, letterSpacing: '0.02em' }}>
          Autonomous &amp; Privacy-Enforced Workspace Matrix
        </p>
      </div>

      {/* Floating Glass Authentication Terminal */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--glass-elevated)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px 32px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            Authenticate Signal
          </h2>
          <span className="privacy-badge" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
            🔒 E2E Privacy Guard
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Enter your node identifier or use an evaluation teleport key.
        </p>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--status-danger-subtle)',
              border: '1px solid rgba(255, 51, 102, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-danger)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <IconAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
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
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Passcode
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
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)' }}
          >
            {loading ? 'Authenticating Node...' : 'Access Workspace →'}
          </button>
        </form>

        {/* Evaluation Teleport Keys */}
        <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', textAlign: 'center' }}>
            Instant Evaluation Access
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              disabled={loading}
              className="btn btn-outline"
              style={{
                fontSize: '0.75rem',
                padding: '10px 6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 51, 102, 0.08)',
                borderColor: 'rgba(255, 51, 102, 0.3)'
              }}
            >
              <span style={{ fontWeight: 800, color: 'var(--status-danger)' }}>Admin</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('priya', 'user123')}
              disabled={loading}
              className="btn btn-outline"
              style={{
                fontSize: '0.75rem',
                padding: '10px 6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(13, 245, 196, 0.08)',
                borderColor: 'rgba(13, 245, 196, 0.3)'
              }}
            >
              <span style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>Priya</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>user123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('agen', 'user123')}
              disabled={loading}
              className="btn btn-outline"
              style={{
                fontSize: '0.75rem',
                padding: '10px 6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(124, 58, 237, 0.08)',
                borderColor: 'rgba(124, 58, 237, 0.3)'
              }}
            >
              <span style={{ fontWeight: 800, color: 'var(--accent-violet)' }}>Agen</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>user123</span>
            </button>
          </div>
        </div>

        {/* Request Account link */}
        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Need new workspace access?{' '}
          <button
            type="button"
            onClick={() => setIsAccessModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            Request Access
          </button>
        </div>
      </div>

      {/* Back to Home */}
      <div style={{ marginTop: '20px', zIndex: 1 }}>
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
          ← Return to Landing Stream
        </button>
      </div>

      <AccessRequestModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}
