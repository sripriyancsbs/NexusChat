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
      icon: <IconHash size={24} />,
      title: 'Channels & Conversations',
      description: 'Topic-based public and private channels, threaded replies, reactions, and pinned messages for high-signal communication.'
    },
    {
      icon: <IconShield size={24} />,
      title: 'Architectural Privacy Boundary',
      description: 'Strict separation of concerns. Platform administrators cannot browse or inspect private direct messages or conversations.'
    },
    {
      icon: <IconSearch size={24} />,
      title: 'Scoped Global Search',
      description: 'Fast, relational full-text search with database-enforced boundaries ensuring results never leak unauthorized messages.'
    },
    {
      icon: <IconUsers size={24} />,
      title: 'Presence & Real-Time Sync',
      description: 'Authenticated native WebSockets with room-scoped multicasting, live typing indicators, and presence updates.'
    },
    {
      icon: <IconKey size={24} />,
      title: 'Platform Security & RBAC',
      description: 'Role-based access control, active session inspection, force-logout, and comprehensive sanitized audit trails.'
    },
    {
      icon: <IconAlertCircle size={24} />,
      title: 'Isolated Moderation',
      description: 'Moderators review content strictly through member-submitted violation reports, preserving member privacy.'
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Navigation Bar */}
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 21, 35, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#ffffff'
            }}
          >
            N
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
            NexusChat
          </span>
          <span className="privacy-badge">
            🔒 Privacy-Focused
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            className={`badge ${apiStatus === 'healthy' ? 'badge-success' : 'badge-danger'}`}
            style={{ fontSize: '0.75rem' }}
          >
            ● {apiStatus === 'healthy' ? 'API Online' : 'Connecting...'}
          </span>

          <button
            type="button"
            onClick={() => setIsAccessModalOpen(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
          >
            Request Access
          </button>

          <button
            type="button"
            onClick={onNavigateLogin}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-primary-subtle)',
            border: '1px solid var(--border-accent)',
            color: 'var(--accent-primary)',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '24px'
          }}
        >
          <span>✨</span> Modern Community Communication Platform
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px'
          }}
        >
          Private conversations.<br />
          <span
            style={{
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Connected community.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
            marginBottom: '36px'
          }}
        >
          NexusChat combines the real-time velocity of channels and direct messaging with an uncompromising administrative privacy boundary. Administrators manage accounts and security—never your private conversations.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 600 }}
          >
            Sign In to Workspace →
          </button>

          <button
            type="button"
            onClick={() => setIsAccessModalOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '12px 24px', fontSize: '1rem' }}
          >
            Request Community Access
          </button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px 80px 24px',
          width: '100%'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
            Built for Privacy, Speed, and Scale
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Engineered with a strict separation between communication channels and administrative controls.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}
        >
          {features.map((f, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                {f.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
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
          padding: '24px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>NexusChat</span>
          <span>&copy; {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Privacy-Focused Community Communication</span>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ color: 'var(--status-success)' }}>Node.js • PostgreSQL • React • WebSocket</span>
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
