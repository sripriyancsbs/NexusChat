import React, { useState, useEffect } from 'react';

export default function App() {
  const [healthStatus, setHealthStatus] = useState({ status: 'checking', message: 'Connecting to backend...' });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus({ status: 'connected', data }))
      .catch((err) => setHealthStatus({ status: 'disconnected', error: err.message }));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-canvas)',
      color: 'var(--text-primary)'
    }}>
      {/* Top Brand Bar */}
      <header style={{
        height: '60px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#fff'
          }}>
            N
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            NexusChat
          </span>
          <span className="privacy-badge">
            🔒 Privacy-Focused
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge ${healthStatus.status === 'connected' ? 'badge-success' : 'badge-danger'}`}>
            API: {healthStatus.status.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '680px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-primary-subtle)',
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            FOUNDATION PHASE 1
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            marginBottom: '12px',
            lineHeight: 1.2
          }}>
            Private conversations.<br />Connected community.
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            marginBottom: '28px',
            lineHeight: 1.6
          }}>
            NexusChat provides a secure community communication platform built with a strict administrative boundary.
            Administrators manage accounts and platform security, while private direct and group conversations remain inaccessible to general admin browsing.
          </p>

          <div style={{
            textAlign: 'left',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
              Phase 1 System Verification
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)' }}>
                <span>✓</span> Frontend: React 18 + Vite + Vanilla CSS Design Tokens
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)' }}>
                <span>✓</span> Backend: Node.js Express API + WebSocket Server Foundation
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)' }}>
                <span>✓</span> Health Check Service: {healthStatus.status === 'connected' ? 'Healthy (200 OK)' : 'Connecting...'}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)' }}>
                <span>✓</span> Architecture & Privacy Boundary Model Approved
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <span>NexusChat &copy; {new Date().getFullYear()}</span>
        <span>Strict Privacy &amp; Relational Community Platform</span>
      </footer>
    </div>
  );
}
