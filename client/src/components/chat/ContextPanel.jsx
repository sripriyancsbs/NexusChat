import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconX, IconPin, IconLock, IconUsers, IconInfo } from '../common/Icons.jsx';

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

  const title = isChannel
    ? formatName(activeConversation.name)
    : activeConversation.other_user?.full_name || activeConversation.other_user?.username || 'Conversation';

  return (
    <aside
      style={{
        width: '340px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 30
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          height: '56px',
          padding: '0 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Conversation Info
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Close panel"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
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
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'DETAILS' ? '1px solid var(--border-default)' : '1px solid transparent',
            backgroundColor: activeTab === 'DETAILS' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'DETAILS' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <IconInfo size={13} /> Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PINS')}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'PINS' ? '1px solid var(--border-default)' : '1px solid transparent',
            backgroundColor: activeTab === 'PINS' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'PINS' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 500,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <IconPin size={13} /> Pinned ({pinnedMessages.length})
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'DETAILS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Showcase Card */}
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--grad-prism)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '10px'
                }}
              >
                {isChannel ? (activeConversation.is_private ? <IconLock size={24} /> : '#') : (title[0] || 'U').toUpperCase()}
              </div>

              <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {title}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isChannel ? 'Community Channel' : `@${activeConversation.other_user?.username || ''}`}
              </div>
            </div>

            {/* Description Card */}
            {activeConversation.topic && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Description
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {activeConversation.topic}
                </div>
              </div>
            )}

            {/* Privacy Architecture Guarantee */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                🔒 Zero-Admin Access Boundary
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Messages are private to authorized conversation participants. System administrators cannot inspect message text.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PINS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pinnedMessages.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No pinned messages
              </div>
            ) : (
              pinnedMessages.map((pin) => (
                <div
                  key={pin.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {pin.sender_full_name || pin.sender_username}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePin(pin.id)}
                      title="Unpin"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-amber)',
                        cursor: 'pointer',
                        padding: '2px'
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
