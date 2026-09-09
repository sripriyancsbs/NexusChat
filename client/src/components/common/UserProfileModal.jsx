import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [status, setStatus] = useState(user?.status || 'ACTIVE');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await api.updateMe({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim()
      });
      updateUser(res.user);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Settings"
      subtitle="Manage your personal identity and workspace preferences"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            Profile updated successfully!
          </div>
        )}

        {/* Profile Card Header */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.4rem'
            }}
          >
            {(fullName || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {fullName || user?.username}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              @{user?.username} • {user?.email}
            </div>
            <div style={{ marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: user?.role === 'ADMIN' ? 'var(--status-danger-subtle)' : 'var(--accent-cyan-subtle)',
                  color: user?.role === 'ADMIN' ? 'var(--status-danger)' : 'var(--accent-cyan)',
                  fontWeight: 600
                }}
              >
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Full Name
          </label>
          <input
            type="text"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Priya Sharma"
          />
        </div>

        {/* Bio */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Bio / Status Message
          </label>
          <input
            type="text"
            className="input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What are you currently working on?"
          />
        </div>

        {/* Avatar URL */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Avatar Image URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            type="url"
            className="input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
