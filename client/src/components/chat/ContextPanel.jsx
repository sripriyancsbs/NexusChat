import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconX, IconPin, IconLock } from '../common/Icons.jsx';

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
    : activeConversation.other_user?.full_name || activeConversation.other_user?.username || 'Contact Info';

  return (
    <aside
      style={{
        width: '380px',
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
      {/* WhatsApp Info Header */}
      <div
        style={{
          height: '60px',
          padding: '10px 16px',
          backgroundColor: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={onClose}
          title="Close"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex'
          }}
        >
          <IconX size={20} />
        </button>

        <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
          {isChannel ? 'Group info' : 'Contact info'}
        </h3>
      </div>

      {/* WhatsApp Profile Showcase */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            padding: '24px 16px',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderBottom: '10px solid var(--bg-canvas)'
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-elevated)',
              color: isChannel ? 'var(--accent-primary)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            {isChannel ? (activeConversation.is_private ? <IconLock size={44} /> : '#') : (title[0] || 'U').toUpperCase()}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
            {title}
          </h2>

          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isChannel ? 'Community Channel' : `@${activeConversation.other_user?.username || ''}`}
          </span>
        </div>

        {/* Description / About */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '10px solid var(--bg-canvas)'
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            {isChannel ? 'Channel description' : 'About'}
          </div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {activeConversation.topic || 'No description provided.'}
          </div>
        </div>

        {/* Privacy & Encryption Guarantee */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '10px solid var(--bg-canvas)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <span style={{ fontSize: '1.25rem', color: 'var(--whatsapp-green)' }}>🔒</span>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              End-to-end encryption
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Messages are secured. Platform administrators have zero access.
            </div>
          </div>
        </div>

        {/* Pinned Messages */}
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Starred & Pinned ({pinnedMessages.length})
            </span>
          </div>

          {pinnedMessages.length === 0 ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px 0' }}>
              No pinned messages
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pinnedMessages.map((pin) => (
                <div
                  key={pin.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
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
                      <IconPin size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {pin.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
