import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { api } from '../../services/api.js';

export default function AccessRequestModal({ isOpen, onClose }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !reason.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.submitAccessRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim().toLowerCase(),
        password,
        reason: reason.trim()
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit access request.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setReason('');
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetForm}
      title="Request Community Access"
      subtitle="NexusChat is a curated privacy-first workspace. Requests are reviewed by administrators."
      maxWidth="500px"
    >
      {success ? (
        <div style={{ textAlign: 'center', padding: '24px 12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--status-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '1.5rem'
            }}
          >
            ✓
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Request Submitted Successfully!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Your access request has been sent to workspace administrators for review. Once approved, you can log in immediately with your chosen username and password.
          </p>
          <button type="button" onClick={resetForm} className="btn btn-primary">
            Close
          </button>
        </div>
      ) : (
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

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Maya Lin"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Username *
              </label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mayalin"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Email Address *
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Account Password *
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Reason for Joining *
            </label>
            <textarea
              className="input"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your project or role in the community..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
