import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { IconAlertCircle, IconCheck, IconX, IconTrash, IconRefreshCw } from '../common/Icons.jsx';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listReports();
      setReports(res.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Failed to load moderation reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (reportId, status, deleteMessage = false) => {
    setProcessingId(reportId);
    try {
      await api.resolveReport(reportId, status, deleteMessage);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    } catch (err) {
      alert(err.message || 'Failed to update report.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Content Moderation Queue</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Isolated moderation tickets submitted by community members. Only reported items are surfaced for review.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          title="Refresh queue"
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

      {/* Reports Table */}
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
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reported Content</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Report Reason</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reporter</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading moderation tickets...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No moderation reports present.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => {
                  const isPending = rep.status === 'PENDING';
                  return (
                    <tr
                      key={rep.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Message preview */}
                      <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                        <div
                          style={{
                            padding: '8px 10px',
                            backgroundColor: 'var(--bg-canvas)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.825rem',
                            color: 'var(--text-primary)',
                            fontStyle: 'italic'
                          }}
                        >
                          "{rep.message_content || '[Message no longer available]'}"
                        </div>
                      </td>

                      {/* Reason */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                        {rep.reason}
                      </td>

                      {/* Reporter */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {rep.reporter_full_name || rep.reporter_username || 'Member'}
                        </div>
                        {rep.reporter_username && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            @{rep.reporter_username}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(rep.created_at).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className={`badge ${
                            rep.status === 'ACTION_TAKEN'
                              ? 'badge-danger'
                              : rep.status === 'DISMISSED'
                              ? 'badge-primary'
                              : 'badge-cyan'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleResolve(rep.id, 'ACTION_TAKEN', true)}
                              disabled={processingId === rep.id}
                              className="btn btn-outline"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--status-danger)' }}
                              title="Delete violating message"
                            >
                              <IconTrash size={13} /> Delete Msg
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolve(rep.id, 'DISMISSED', false)}
                              disabled={processingId === rep.id}
                              className="btn btn-outline"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              <IconCheck size={13} /> Dismiss
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
