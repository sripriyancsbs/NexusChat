import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconX, IconPin, IconUsers, IconInfo, IconLock } from '../common/Icons.jsx';

export default function ContextPanel({ isOpen, onClose }) {
  const { activeConversation, messages, togglePin } = useChat();
  const [activeTab, setActiveTab] = useState('DETAILS');

  if (!isOpen || !activeConversation) return null;

  const isChannel = activeConversation.type === 'CHANNEL' || Boolean(activeConversation.name);
  const pinnedMessages = messages.filter((m) => m.is_pinned && !m.is_deleted);

  const formatName = (name) => {
    if (!name) return '';
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <aside
      className="bento-panel context-panel"
      style={{
        width: '340px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 40
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              margin: 0,
              color: 'var(--text-primary)'
            }}
          >
            Details
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Close Details"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-xs)',
            display: 'flex'
          }}
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '4px 10px',
          gap: '4px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('DETAILS')}
          style={{
            flex: 1,
            padding: '5px 8px',
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'DETAILS' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
            backgroundColor: activeTab === 'DETAILS' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            color: activeTab === 'DETAILS' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <IconInfo size={13} /> Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PINS')}
          style={{
            flex: 1,
            padding: '5px 8px',
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'PINS' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
            backgroundColor: activeTab === 'PINS' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            color: activeTab === 'PINS' ? 'var(--accent-amber)' : 'var(--text-muted)',
            fontWeight: 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <IconPin size={13} /> Pinned ({pinnedMessages.length})
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {activeTab === 'DETAILS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Overview Card */}
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                  {isChannel ? (activeConversation.is_private ? <IconLock size={15} /> : '#') : <IconUsers size={15} />}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  {isChannel ? formatName(activeConversation.name) : activeConversation.other_user?.full_name || activeConversation.other_user?.username}
                </span>
              </div>

              {activeConversation.topic && (
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    lineHeight: 1.45
                  }}
                >
                  {activeConversation.topic}
                </div>
              )}

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                <div>Type: {isChannel ? (activeConversation.is_private ? 'Private Channel' : 'Public Channel') : 'Direct Message'}</div>
                <div>Protocol: End-to-End Isolated (E2EE)</div>
              </div>
            </div>

            {/* Privacy Guarantee */}
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'var(--accent-primary)',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔒 Zero-Admin Access Boundary
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Platform administrators cannot browse or read private conversation messages. Messages remain mathematically restricted to authorized conversation members.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PINS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pinnedMessages.length === 0 ? (
              <div
                style={{
                  padding: '24px 10px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem'
                }}
              >
                No pinned messages
              </div>
            ) : (
              pinnedMessages.map((pin) => (
                <div
                  key={pin.id}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {pin.sender_full_name || pin.sender_username}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePin(pin.id)}
                      title="Unpin message"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-amber)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex'
                      }}
                    >
                      <IconPin size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
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
