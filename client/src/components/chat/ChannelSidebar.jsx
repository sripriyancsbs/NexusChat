import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { IconPlus, IconLock, IconHash, IconUsers } from '../common/Icons.jsx';

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

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CHANNELS' | 'DIRECT'
  const [filterQuery, setFilterQuery] = useState('');

  const formatName = (name) => {
    if (!name) return '';
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((conv) => {
    const other = conv.other_user;
    const name = other?.full_name || other?.username || '';
    return name.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <aside
      className={`bento-panel ${isMobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}
        >
          Navigation
        </span>

        {/* Action Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={onOpenCreateChannel}
            title="Create Channel"
            className="btn btn-secondary"
            style={{
              padding: '4px 8px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              gap: '4px'
            }}
          >
            <IconPlus size={13} />
            <span>Channel</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewDM}
            title="New Direct Message"
            className="btn btn-secondary"
            style={{
              padding: '4px 8px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <span>+ DM</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ padding: '10px 12px 6px 12px' }}>
        <input
          type="text"
          placeholder="Filter channels or members..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="input"
          style={{
            padding: '6px 10px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        />

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CHANNELS', label: 'Channels' },
            { id: 'DIRECT', label: 'DMs' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              style={{
                flex: 1,
                padding: '3px 6px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                border: activeFilter === tab.id ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                backgroundColor: activeFilter === tab.id ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                color: activeFilter === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Channels & DMs List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 8px 12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Channels Section */}
        {(activeFilter === 'ALL' || activeFilter === 'CHANNELS') && (
          <div>
            <div
              style={{
                padding: '4px 8px 6px 8px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Channels ({filteredChannels.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filteredChannels.length === 0 ? (
                <div style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No channels found
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
                      style={{
                        position: 'relative',
                        padding: '6px 10px'
                      }}
                    >
                      {/* Active Indicator Strip */}
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '2px',
                            top: '6px',
                            bottom: '6px',
                            width: '3px',
                            borderRadius: '2px',
                            backgroundColor: 'var(--accent-primary)'
                          }}
                        />
                      )}

                      {/* Icon */}
                      <span
                        style={{
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.9rem',
                          flexShrink: 0
                        }}
                      >
                        {channel.is_private ? <IconLock size={14} /> : '#'}
                      </span>

                      {/* Name & Topic */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {formatName(channel.name)}
                          </span>

                          {hasUnread && !isActive && (
                            <span
                              style={{
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--accent-primary)',
                                color: '#ffffff',
                                fontSize: '0.6875rem',
                                fontWeight: 600
                              }}
                            >
                              {channel.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Direct Messages Section */}
        {(activeFilter === 'ALL' || activeFilter === 'DIRECT') && (
          <div>
            <div
              style={{
                padding: '4px 8px 6px 8px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Direct Messages ({filteredConversations.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filteredConversations.length === 0 ? (
                <div style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No direct messages
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
                      style={{
                        position: 'relative',
                        padding: '6px 10px'
                      }}
                    >
                      {/* Active Indicator Strip */}
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '2px',
                            top: '6px',
                            bottom: '6px',
                            width: '3px',
                            borderRadius: '2px',
                            backgroundColor: 'var(--accent-primary)'
                          }}
                        />
                      )}

                      {/* Avatar with clean status dot */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {(other.full_name || other.username || 'U')[0].toUpperCase()}
                        </div>

                        {/* Status Dot */}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-1px',
                            right: '-1px',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: isOnline
                              ? 'var(--accent-emerald)'
                              : isIdle
                              ? 'var(--accent-amber)'
                              : '#64748b',
                            border: '1.5px solid var(--bg-surface)'
                          }}
                        />
                      </div>

                      {/* Name & Role */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {other.full_name || other.username}
                          </span>

                          {other.role === 'admin' && (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                color: 'var(--accent-rose)',
                                fontWeight: 500
                              }}
                            >
                              Admin
                            </span>
                          )}
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

      {/* Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>🔒 Zero-Admin Access</span>
        <span>E2EE Active</span>
      </div>
    </aside>
  );
}
