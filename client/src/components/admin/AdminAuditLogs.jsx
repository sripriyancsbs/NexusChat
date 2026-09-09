import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { IconShield, IconRefreshCw } from '../common/Icons.jsx';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to load security audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadgeColor = (action) => {
    if (action.includes('LOGIN') || action.includes('APPROVED')) return 'badge-success';
    if (action.includes('FAILED') || action.includes('BLOCKED') || action.includes('REVOKED')) return 'badge-danger';
    if (action.includes('UPDATED') || action.includes('ROLE')) return 'badge-primary';
    return 'badge-cyan';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with privacy confirmation notice */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: 'var(--bg-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Security &amp; Administrative Audit Trail</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Chronological log of administrative actions, account promotions, and authentication events.
            </p>
          </div>
          <button
            type="button"
            onClick={loadLogs}
            title="Refresh logs"
            className="btn btn-outline"
            style={{ padding: '8px' }}
          >
            <IconRefreshCw size={16} />
          </button>
        </div>

        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.775rem',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconShield size={16} />
          <span>
            <strong>Architectural Guarantee:</strong> Audit logs record system actors, IP addresses, and metadata. Conversation text and private message content are NEVER logged.
          </span>
        </div>
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

      {/* Audit Logs Table */}
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
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Target</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Metadata</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.actor_full_name || log.actor_username || 'System'}
                      </div>
                      {log.actor_username && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          @{log.actor_username}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {log.target_type ? `${log.target_type} (${log.target_id ? log.target_id.slice(0, 8) + '...' : 'none'})` : '—'}
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.ip_address || '127.0.0.1'}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                      {log.details ? (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                          {JSON.stringify(typeof log.details === 'string' ? JSON.parse(log.details) : log.details)}
                        </pre>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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
