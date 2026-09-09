import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { IconShield, IconTrash, IconRefreshCw } from '../common/Icons.jsx';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [error, setError] = useState('');

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminSessions();
      setSessions(res.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError(err.message || 'Failed to load active sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    if (!window.confirm('Force terminate this session? The user will be immediately logged out.')) {
      return;
    }

    setRevokingId(sessionId);
    try {
      await api.revokeAdminSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      alert(err.message || 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Active Authentication Sessions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Inspect active session tokens across devices and force-terminate suspect or stale sessions.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSessions}
          title="Refresh list"
          className="btn btn-outline"
          style={{ padding: '8px' }}
        >
          <IconRefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--status-danger-subtle)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger)',
            fontSize: '0.85rem'
          }}
        >
          {error}
        </div>
      )}

      {/* Sessions Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Member Account</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>User Agent / Client</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Created</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Expires</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading active sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No active sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.full_name || s.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        @{s.username} • {s.role}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.ip_address || '127.0.0.1'}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      <div style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.user_agent || 'Standard Web Browser'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(s.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(s.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleRevoke(s.id)}
                        disabled={revokingId === s.id}
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--status-danger)' }}
                      >
                        <IconTrash size={14} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
