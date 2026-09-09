import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { api } from '../../services/api.js';
import { IconAlertCircle } from './Icons.jsx';

export default function ReportMessageModal({ isOpen, onClose, message }) {
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('HARASSMENT');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!message) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for the report.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullReason = `[${category}] ${reason.trim()}`;
      await api.submitReport(message.id, fullReason);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Content"
      subtitle="Report abusive, spammy, or violating messages to community moderators"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

        {success && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-success)',
              fontSize: '0.85rem'
            }}
          >
            Thank you. Your report has been submitted to moderators for review.
          </div>
        )}

        {/* Message Snippet */}
        <div
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {message.sender_full_name || message.sender_username}:
          </div>
          <div style={{ fontStyle: 'italic' }}>"{message.content}"</div>
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Report Category
          </label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ backgroundColor: 'var(--bg-surface)' }}
          >
            <option value="HARASSMENT">Harassment or Bullying</option>
            <option value="SPAM">Spam or Unwanted Ads</option>
            <option value="INAPPROPRIATE">Inappropriate or Explicit Content</option>
            <option value="IMPERSONATION">Impersonation or False Identity</option>
            <option value="OTHER">Other Issue</option>
          </select>
        </div>

        {/* Reason Details */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Explanation / Details
          </label>
          <textarea
            className="input"
            rows="3"
            placeholder="Please describe why this content violates community guidelines..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Privacy Note */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            lineHeight: 1.4
          }}
        >
          <strong>Privacy Notice:</strong> Platform administrators cannot browse private messages. Submitting a report authorizes moderators to review only this specific message item and ticket.
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: 'var(--status-danger)' }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
