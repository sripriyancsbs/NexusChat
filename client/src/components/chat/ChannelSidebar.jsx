import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { IconPlus, IconLock, IconShield } from '../common/Icons.jsx';

export default function ChannelSidebar({
  onOpenCreateChannel,
  onOpenNewDM,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onNavigateAdmin,
  isMobileOpen,
  onCloseMobile
}) {
  const {
    channels,
    conversations,
    activeConversationId,
    selectChannel,
    selectConversation,
    presenceMap
  } = useChat();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'FREQUENCIES' | 'DIRECT'
  const [filterQuery, setFilterQuery] = useState('');

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((conv) => {
    const other = conv.other_user;
    const name = other?.full_name || other?.username || '';
    return name.toLowerCase().includes(filterQuery.toLowerCase());
  });

  const getChannelIcon = (name, isPrivate) => {
    if (isPrivate) return <IconLock size={14} />;
    const lower = name.toLowerCase();
    if (lower.includes('dev') || lower.includes('code')) return '⚡';
    if (lower.includes('sec') || lower.includes('ops')) return '🛡️';
    if (lower.includes('announc') || lower.includes('alert')) return '📢';
    if (lower.includes('random') || lower.includes('lounge')) return '☕';
    return '🌐';
  };

  return (
    <aside
      className={`bento-panel ${isMobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Deck Header */}
      <div
        style={{
          padding: '16px 18px 12px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--cyber-cyan)',
              boxShadow: '0 0 8px var(--cyber-cyan)',
              animation: 'pulseSlow 2s infinite'
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}
          >
            Spectrum Matrix
          </h2>
        </div>

        {/* Action Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onOpenCreateChannel}
            title="Initialize New Frequency Channel"
            className="btn-outline"
            style={{
              padding: '4px 10px',
              fontSize: '0.7rem',
              borderRadius: 'var(--radius-xs)',
              gap: '4px',
              color: 'var(--cyber-cyan)',
              borderColor: 'rgba(0, 240, 255, 0.3)'
            }}
          >
            <IconPlus size={12} />
            <span>FREQ</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewDM}
            title="Open Direct Transmission Node"
            className="btn-outline"
            style={{
              padding: '4px 10px',
              fontSize: '0.7rem',
              borderRadius: 'var(--radius-xs)',
              gap: '4px',
              color: 'var(--cyber-amber)',
              borderColor: 'rgba(255, 149, 0, 0.3)'
            }}
          >
            <span>◎ DIRECT</span>
          </button>
        </div>
      </div>

      {/* Filter and Spectrum Search */}
      <div style={{ padding: '12px 16px 8px 16px' }}>
        <input
          type="text"
          placeholder="⌕ Filter spectrum frequencies..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="input"
          style={{
            padding: '7px 12px',
            fontSize: '0.775rem',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'rgba(5, 8, 16, 0.6)'
          }}
        />

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          {['ALL', 'FREQUENCIES', 'DIRECT'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.675rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                border: activeFilter === tab ? '1px solid var(--cyber-cyan)' : '1px solid var(--border-subtle)',
                backgroundColor: activeFilter === tab ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                color: activeFilter === tab ? 'var(--cyber-cyan)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab === 'ALL' ? 'ALL' : tab === 'FREQUENCIES' ? 'CHANNELS' : 'DMS'}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Frequency Spectrum Deck */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px 16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Frequencies Section */}
        {(activeFilter === 'ALL' || activeFilter === 'FREQUENCIES') && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px 6px 6px',
                fontSize: '0.675rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              <span>Frequencies [{filteredChannels.length}]</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredChannels.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No matching frequencies
                </div>
              ) : (
                filteredChannels.map((channel) => {
                  const isActive = channel.id === activeConversationId;
                  const hasUnread = Boolean(channel.unread_count && channel.unread_count > 0);

                  return (
                    <div
                      key={channel.id}
                      onClick={() => {
                        selectChannel(channel);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`frequency-card ${isActive ? 'active' : ''}`}
                    >
                      {/* Domain Icon Pod */}
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: isActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: isActive ? '1px solid var(--cyber-cyan)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          color: isActive ? 'var(--cyber-cyan)' : 'var(--text-secondary)',
                          flexShrink: 0
                        }}
                      >
                        {getChannelIcon(channel.name, channel.is_private)}
                      </div>

                      {/* Frequency Title & Snippet */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px'
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: isActive ? 700 : 600,
                              fontSize: '0.825rem',
                              color: isActive ? 'var(--cyber-cyan)' : 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {channel.name.toUpperCase()}
                          </span>

                          {/* Soundwave Bars if Active */}
                          {isActive && (
                            <span className="soundwave-indicator">
                              <span className="soundwave-bar" />
                              <span className="soundwave-bar" />
                              <span className="soundwave-bar" />
                            </span>
                          )}

                          {hasUnread && !isActive && (
                            <span
                              style={{
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: 'var(--cyber-cyan)',
                                color: '#050810',
                                fontSize: '0.65rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800
                              }}
                            >
                              {channel.unread_count}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px'
                          }}
                        >
                          {channel.topic || (channel.is_private ? 'Encrypted private frequency' : 'Public signal stream')}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Direct Encrypted Streams Section */}
        {(activeFilter === 'ALL' || activeFilter === 'DIRECT') && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px 6px 6px',
                fontSize: '0.675rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              <span>Direct Streams [{filteredConversations.length}]</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredConversations.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No active direct streams
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = conv.other_user;
                  if (!other) return null;

                  const isActive = conv.id === activeConversationId;
                  const presence = presenceMap[other.id] || other.status?.toLowerCase() || 'offline';
                  const isOnline = presence === 'online';
                  const isIdle = presence === 'idle';

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        selectConversation(conv);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`frequency-card ${isActive ? 'active' : ''}`}
                    >
                      {/* Operator Hologram Pod with Dual-Ring Radar Presence */}
                      <div
                        style={{
                          position: 'relative',
                          width: '32px',
                          height: '32px',
                          flexShrink: 0
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-elevated)',
                            border: isActive ? '1px solid var(--cyber-amber)' : '1px solid var(--border-default)',
                            color: isActive ? 'var(--cyber-amber)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          {(other.full_name || other.username || 'U')[0].toUpperCase()}
                        </div>

                        {/* Dual Presence Ring */}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-1px',
                            right: '-1px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: isOnline
                              ? 'var(--cyber-mint)'
                              : isIdle
                              ? 'var(--cyber-amber)'
                              : '#475569',
                            border: '2px solid var(--bg-canvas)',
                            boxShadow: isOnline ? '0 0 6px var(--cyber-mint)' : 'none'
                          }}
                        />
                      </div>

                      {/* Operator Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px'
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: isActive ? 700 : 600,
                              fontSize: '0.825rem',
                              color: isActive ? 'var(--cyber-amber)' : 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {other.full_name || other.username}
                          </span>

                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontFamily: 'var(--font-mono)',
                              color: other.role === 'admin' ? 'var(--cyber-coral)' : 'var(--text-muted)'
                            }}
                          >
                            {other.role === 'admin' ? 'SYS-ADM' : 'NODE'}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px'
                          }}
                        >
                          {isOnline ? 'Transmitting active' : isIdle ? 'Node idle' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Deck Telemetry Footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(5, 8, 16, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.675rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)'
        }}
      >
        <span>E2EE // ACTIVE</span>
        <span>CTRL+K OMNI</span>
      </div>
    </aside>
  );
}
