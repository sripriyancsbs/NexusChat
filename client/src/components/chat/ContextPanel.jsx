import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconX, IconPin, IconUsers, IconInfo, IconLock, IconHash } from '../common/Icons.jsx';

export default function ContextPanel({ isOpen, onClose }) {
  const { activeConversation, messages, togglePin, presenceMap } = useChat();
  const [activeTab, setActiveTab] = useState('DETAILS');

  if (!isOpen || !activeConversation) return null;

  const isChannel = activeConversation.type === 'CHANNEL' || Boolean(activeConversation.name);
  const pinnedMessages = messages.filter((m) => m.is_pinned && !m.is_deleted);

  return (
    <aside
      className="context-panel"
      style={{
        width: '320px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        zIndex: 40
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '56px',
          padding: '0 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Conversation Details</h3>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex'
          }}
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('DETAILS')}
          style={{
            flex: 1,
            padding: '10px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'DETAILS' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'DETAILS' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'DETAILS' ? 600 : 400,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <IconInfo size={14} /> Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PINS')}
          style={{
            flex: 1,
            padding: '10px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'PINS' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'PINS' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'PINS' ? 600 : 400,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <IconPin size={14} /> Pinned ({pinnedMessages.length})
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'DETAILS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Overview Card */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent-cyan)' }}>
                  {isChannel ? (
                    activeConversation.is_private ? <IconLock size={18} /> : <IconHash size={18} />
                  ) : (
                    <IconUsers size={18} />
                  )}
                </span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {isChannel ? `#${activeConversation.name}` : activeConversation.other_user?.full_name || activeConversation.other_user?.username}
                </span>
              </div>

              {activeConversation.topic && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                  {activeConversation.topic}
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Type: {isChannel ? (activeConversation.is_private ? 'Private Channel' : 'Public Channel') : 'Direct Message'}
              </div>
            </div>

            {/* Privacy Guarantee Box */}
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                🔒 Strict Privacy Model
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Administrators cannot view private conversation messages in this workspace. Content is only accessible to authorized conversation participants.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PINS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pinnedMessages.length === 0 ? (
              <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No pinned messages in this conversation yet.
              </div>
            ) : (
              pinnedMessages.map((pin) => (
                <div
                  key={pin.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {pin.sender_full_name || pin.sender_username}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePin(pin.id)}
                      title="Unpin message"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex'
                      }}
                    >
                      <IconPin size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {pin.content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
