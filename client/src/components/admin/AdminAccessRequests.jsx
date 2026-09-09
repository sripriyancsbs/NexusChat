import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { IconCheck, IconX, IconRefreshCw } from '../common/Icons.jsx';

export default function AdminAccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminAccessRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError(err.message || 'Failed to load access requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleReview = async (requestId, status) => {
    setProcessingId(requestId);
    try {
      await api.reviewAccessRequest(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    } catch (err) {
      alert(err.message || `Failed to ${status.toLowerCase()} request.`);
    } finally {
      setProcessingId(null);
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Community Access Queue</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Approving a request activates the member's account and automatically joins them to public community channels.
          </p>
        </div>
        <button
          type="button"
          onClick={loadRequests}
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

      {/* Requests Table */}
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
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Applicant</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reason / Statement</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading access requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No access requests currently found.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const isPending = r.status === 'PENDING';
                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.full_name || r.username}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          @{r.username}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {r.email}
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', maxWidth: '300px' }}>
                        <div style={{ fontSize: '0.825rem', lineHeight: 1.4 }}>
                          {r.reason}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className={`badge ${
                            r.status === 'APPROVED'
                              ? 'badge-success'
                              : r.status === 'REJECTED'
                              ? 'badge-danger'
                              : 'badge-primary'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleReview(r.id, 'APPROVED')}
                              disabled={processingId === r.id}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              <IconCheck size={14} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReview(r.id, 'REJECTED')}
                              disabled={processingId === r.id}
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--status-danger)' }}
                            >
                              <IconX size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Reviewed
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
