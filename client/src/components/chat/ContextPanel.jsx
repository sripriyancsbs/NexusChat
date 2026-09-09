import React, { useState } from 'react';
import { useChat, CHAT_THEMES } from '../../context/ChatContext.jsx';
import { IconX, IconPin, IconLock, IconUsers, IconInfo, IconPalette } from '../common/Icons.jsx';

export default function ContextPanel({ isOpen, onClose }) {
  const { activeConversation, messages, togglePin, chatTheme, setChatTheme } = useChat();
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
        width: '320px',
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
          height: '62px',
          padding: '0 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Details & Customization
        </span>

        <button
          type="button"
          onClick={onClose}
          title="Close details"
          className="btn-icon"
          style={{ width: '32px', height: '32px' }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Contact / Space Profile Hero */}
            <div
              style={{
                padding: '20px 16px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div
                className="story-ring"
                style={{
                  width: '64px',
                  height: '64px',
                  padding: '2.5px',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  {isChannel ? (activeConversation.is_private ? <IconLock size={22} /> : (title[0] || 'S').toUpperCase()) : (title[0] || 'U').toUpperCase()}
                </div>
              </div>

              <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {title}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isChannel ? 'Community Space' : `@${activeConversation.other_user?.username || ''}`}
              </div>
            </div>

            {/* Messenger-style "Customize Chat" Theme Section */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <IconPalette size={15} />
                  <span>Chat Atmosphere</span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {CHAT_THEMES.find((t) => t.id === chatTheme)?.label || 'Theme'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {CHAT_THEMES.map((th) => {
                  const isActive = chatTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setChatTheme(th.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: isActive ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-default)',
                        backgroundColor: isActive ? 'var(--bg-active)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all var(--transition-fast)'
                      }}
                      title={`${th.label} — ${th.subtitle}`}
                    >
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          background: th.gradient,
                          flexShrink: 0
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: isActive ? 600 : 500,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {th.label}
                      </span>
                    </button>
                  );
                })}
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
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                🔒 Zero-Admin Access Boundary
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Messages are private to authorized conversation participants. Server administrators cannot inspect message text.
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
