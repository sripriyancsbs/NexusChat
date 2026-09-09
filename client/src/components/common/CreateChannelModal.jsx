import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { IconHash, IconLock } from './Icons.jsx';

export default function CreateChannelModal({ isOpen, onClose }) {
  const { createChannel } = useChat();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Channel name is required.');
      return;
    }

    // Clean channel name (lowercase, replace spaces with hyphens)
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');

    if (!cleanName) {
      setError('Please provide a valid channel name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createChannel(cleanName, topic.trim(), isPrivate);
      setName('');
      setTopic('');
      setIsPrivate(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create channel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a Channel"
      subtitle="Channels are where your team communicates around topics or projects"
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

        {/* Channel Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Channel Name
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              #
            </span>
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '32px' }}
              placeholder="e.g. announcements or frontend-dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Names must be lowercase, without spaces or special characters.
          </span>
        </div>

        {/* Topic */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Topic / Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="What is this channel about?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* Privacy Toggle */}
        <div
          style={{
            padding: '12px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: isPrivate ? 'var(--status-warning)' : 'var(--accent-cyan)' }}>
              {isPrivate ? <IconLock size={20} /> : <IconHash size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isPrivate ? 'Private Channel' : 'Public Channel'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isPrivate
                  ? 'Only invited members can view or post messages.'
                  : 'Anyone in the workspace can view and join.'}
              </div>
            </div>
          </div>

          <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: isPrivate ? 'var(--accent-primary)' : 'var(--border-strong)',
                borderRadius: '22px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '16px',
                  width: '16px',
                  left: isPrivate ? '21px' : '3px',
                  bottom: '3px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transition: 'all var(--transition-fast)'
                }}
              />
            </span>
          </label>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
