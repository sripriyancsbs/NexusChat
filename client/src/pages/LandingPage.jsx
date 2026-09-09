import React, { useState, useEffect } from 'react';
import AccessRequestModal from '../components/common/AccessRequestModal.jsx';
import { IconShield, IconHash, IconUsers, IconSearch, IconKey, IconAlertCircle } from '../components/common/Icons.jsx';

export default function LandingPage({ onNavigateLogin }) {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? setApiStatus('healthy') : setApiStatus('unhealthy')))
      .catch(() => setApiStatus('disconnected'));
  }, []);

  const features = [
    {
      icon: '⌗',
      tag: 'COLLABORATION',
      title: 'Transmission Channels',
      description: 'Dynamic communication spaces with threaded reply branches, live reactions, and pinned stream memories.'
    },
    {
      icon: '🛡️',
      tag: 'CRYPTOGRAPHIC',
      title: 'Architectural Privacy Vault',
      description: 'Platform administrators possess zero access to private message content or direct communications by system design.'
    },
    {
      icon: '🔍',
      tag: 'INTELLIGENCE',
      title: 'Scoped Relational Search',
      description: 'Instant full-text query matching strictly bounded by user access permissions to prevent data leakage.'
    },
    {
      icon: '⚡',
      tag: 'REAL-TIME',
      title: 'Sub-Second Pulse Engine',
      description: 'Room-scoped WebSocket broadcasting with live presence dots, typing indicators, and instant synchronization.'
    },
    {
      icon: '✦',
      tag: 'SECURITY',
      title: 'Governance & Session Control',
      description: 'Role-based access enforcement, active token inspection, one-click session revocation, and sanitized audit logs.'
    },
    {
      icon: '◎',
      tag: 'MODERATION',
      title: 'Isolated Violation Queue',
      description: 'Admin content moderation is strictly restricted to isolated tickets submitted explicitly by community members.'
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Background Aurora Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 245, 196, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          animation: 'auroraFloat 8s ease-in-out infinite'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '200px',
          right: '15%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          animation: 'auroraFloat 10s ease-in-out infinite 2s'
        }}
      />

      {/* Top Glass Navigation Bar */}
      <header
        style={{
          height: '76px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--grad-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#06090f',
              boxShadow: 'var(--glow-cyan)'
            }}
          >
            ✦
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em' }}>
              NexusChat
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginLeft: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>
              NEO-COMMUNICATION
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            className="badge badge-success"
            style={{ fontSize: '0.75rem', padding: '4px 12px' }}
          >
            ● {apiStatus === 'healthy' ? 'Grid Connected' : 'Synchronizing...'}
          </span>

          <button
            type="button"
            onClick={() => setIsAccessModalOpen(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
          >
            Request Access
          </button>

          <button
            type="button"
            onClick={onNavigateLogin}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', borderRadius: 'var(--radius-full)', padding: '9px 22px' }}
          >
            Enter Workspace →
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '100px 24px 80px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '960px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(13, 245, 196, 0.12), rgba(124, 58, 237, 0.12))',
            border: '1px solid rgba(13, 245, 196, 0.35)',
            color: 'var(--accent-cyan)',
            fontSize: '0.825rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '28px'
          }}
        >
          <span>✦</span> ZERO-COMPROMISE PRIVACY PLATFORM
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            marginBottom: '24px'
          }}
        >
          Untethered conversations.<br />
          <span
            style={{
              background: 'var(--grad-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Architectural privacy.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '740px',
            marginBottom: '40px'
          }}
        >
          NexusChat reinvents community interaction with dynamic transmission nodes, sub-second real-time sync, and an unbreakable boundary. Administrators manage platform security—never your private conversations.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '1.05rem', borderRadius: 'var(--radius-full)' }}
          >
            Launch Workspace Stream →
          </button>

          <button
            type="button"
            onClick={() => setIsAccessModalOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-full)' }}
          >
            Request Access Key
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '20px 24px 100px 24px',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            ENGINEERED WITH RIGOR
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Next-Generation Community Matrix
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}
        >
          {features.map((f, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--glass-elevated)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-normal)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--glow-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-canvas)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {f.tag}
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                {f.title}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
          padding: '28px 40px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>NexusChat</span>
          <span>&copy; {new Date().getFullYear()}</span>
          <span>•</span>
          <span style={{ color: 'var(--accent-cyan)' }}>Neo-Aero Edition</span>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Node.js ESM • Express • PostgreSQL • Native WebSockets • React 18
          </span>
        </div>
      </footer>

      {/* Access Request Dialog */}
      <AccessRequestModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}
