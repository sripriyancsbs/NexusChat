import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { api } from '../../services/api.js';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { IconSearch } from './Icons.jsx';

export default function NewDirectMessageModal({ isOpen, onClose }) {
  const { startDirectMessage } = useChat();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.listUsers()
        .then((res) => {
          // Exclude current logged in user
          const list = (res.users || []).filter((u) => u.id !== currentUser?.id);
          setUsers(list);
        })
        .catch((err) => console.error('Failed to load users:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentUser]);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.full_name && u.full_name.toLowerCase().includes(term))
    );
  });

  const handleSelectUser = async (user) => {
    if (starting) return;
    setStarting(true);
    try {
      await startDirectMessage(user.id);
      onClose();
    } catch (err) {
      console.error('Failed to start DM:', err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Direct Message"
      subtitle="Select a team member to start a private conversation"
      maxWidth="460px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            autoFocus
            type="text"
            className="input"
            placeholder="Search member by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          >
            <IconSearch size={16} />
          </div>
        </div>

        {/* User list */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading members...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No members found.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  cursor: starting ? 'default' : 'pointer',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--accent-primary-subtle)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    {(u.full_name || u.username)[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.full_name || u.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      @{u.username}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {u.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
