import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconX, IconPin, IconUsers, IconInfo, IconLock } from '../common/Icons.jsx';

export default function ContextPanel({ isOpen, onClose }) {
  const { activeConversation, messages, togglePin } = useChat();
  const [activeTab, setActiveTab] = useState('DETAILS');

  if (!isOpen || !activeConversation) return null;

  const isChannel = activeConversation.type === 'CHANNEL' || Boolean(activeConversation.name);
  const pinnedMessages = messages.filter((m) => m.is_pinned && !m.is_deleted);

  return (
    <aside
      className="bento-panel context-panel"
      style={{
        width: '350px',
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
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: 'rgba(10, 15, 29, 0.7)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--cyber-cyan)', fontSize: '0.9rem' }}>ℹ️</span>
          <h3
            style={{
              fontSize: '0.85rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              margin: 0,
              color: 'var(--text-primary)'
            }}
          >
            TELEMETRY INSPECTOR
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Close Inspector"
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
          backgroundColor: 'rgba(5, 8, 16, 0.5)',
          padding: '6px 12px',
          gap: '6px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('DETAILS')}
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'DETAILS' ? '1px solid var(--cyber-cyan)' : '1px solid transparent',
            backgroundColor: activeTab === 'DETAILS' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
            color: activeTab === 'DETAILS' ? 'var(--cyber-cyan)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.725rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <IconInfo size={13} /> DETAILS
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PINS')}
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'PINS' ? '1px solid var(--cyber-amber)' : '1px solid transparent',
            backgroundColor: activeTab === 'PINS' ? 'rgba(255, 149, 0, 0.12)' : 'transparent',
            color: activeTab === 'PINS' ? 'var(--cyber-amber)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.725rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <IconPin size={13} /> PINNED [{pinnedMessages.length}]
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'DETAILS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Overview Card */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(5, 8, 16, 0.6)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--cyber-cyan)' }}>
                  {isChannel ? (activeConversation.is_private ? <IconLock size={16} /> : '⚡') : <IconUsers size={16} />}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  {isChannel ? activeConversation.name.toUpperCase() : activeConversation.other_user?.full_name || activeConversation.other_user?.username}
                </span>
              </div>

              {activeConversation.topic && (
                <div
                  style={{
                    fontSize: '0.775rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '10px',
                    lineHeight: 1.45
                  }}
                >
                  {activeConversation.topic}
                </div>
              )}

              <div
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div>SIGNAL TYPE: {isChannel ? (activeConversation.is_private ? 'ENCRYPTED FREQUENCY' : 'PUBLIC FREQUENCY') : 'DIRECT POINT-TO-POINT'}</div>
                <div>PROTOCOL: NEXUS-E2EE-v2</div>
                <div>CIPHER: AES-GCM-256</div>
              </div>
            </div>

            {/* Cryptographic Zero-Leakage Guarantee */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--cyber-cyan)',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔒 ZERO-ADMIN TELEMETRY VAULT
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Platform administrators have zero query access to private message contents or direct transmissions. All data is scoped to conversation participants by design.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PINS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pinnedMessages.length === 0 ? (
              <div
                style={{
                  padding: '30px 12px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.775rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                NO PINNED TRANSMISSIONS LOGGED
              </div>
            ) : (
              pinnedMessages.map((pin) => (
                <div
                  key={pin.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'rgba(5, 8, 16, 0.6)',
                    border: '1px solid rgba(255, 149, 0, 0.3)',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: 'var(--cyber-amber)'
                      }}
                    >
                      {pin.sender_full_name || pin.sender_username}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePin(pin.id)}
                      title="Unpin from Intel"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--cyber-amber)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex'
                      }}
                    >
                      <IconPin size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
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
