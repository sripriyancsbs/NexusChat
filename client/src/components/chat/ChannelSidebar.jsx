import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { IconPlus, IconLock, IconHash } from '../common/Icons.jsx';

export default function ChannelSidebar({
  onOpenCreateChannel,
  onOpenNewDM,
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

  const [searchQuery, setSearchQuery] = useState('');

  const formatName = (name) => {
    if (!name) return '';
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((conv) => {
    const other = conv.other_user;
    const name = other?.full_name || other?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Extract online contacts for top story rail
  const activeContacts = conversations
    .filter((conv) => conv.other_user)
    .map((conv) => {
      const isOnline = presenceMap[conv.other_user.id] === 'online' || conv.other_user.status === 'online';
      return {
        conv,
        user: conv.other_user,
        isOnline
      };
    });

  return (
    <aside
      className={`floating-island sidebar-deck ${isMobileOpen ? 'open' : ''}`}
      style={{
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '14px 16px 10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <span
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)'
          }}
        >
          Conversations
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onOpenCreateChannel}
            title="Create Space"
            className="btn btn-secondary"
            style={{
              padding: '4px 9px',
              fontSize: '0.75rem',
              gap: '4px'
            }}
          >
            <IconPlus size={12} />
            <span>Space</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewDM}
            title="New Direct Message"
            className="btn btn-primary"
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              gap: '4px'
            }}
          >
            <IconPlus size={12} />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Online Contacts Stories Rail (Clean, compact, no floating text bubbles) */}
      {activeContacts.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px 12px 16px',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}
        >
          {activeContacts.map(({ conv, user: contactUser, isOnline }) => (
            <div
              key={contactUser.id}
              onClick={() => {
                selectConversation(conv.id, conv);
                if (onCloseMobile) onCloseMobile();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title={`Chat with ${contactUser.full_name || contactUser.username} (${isOnline ? 'Online' : 'Offline'})`}
            >
              <div
                className="story-ring"
                style={{
                  padding: '2px',
                  background: isOnline ? 'var(--grad-avatar-ring)' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    border: '2px solid var(--bg-surface)'
                  }}
                >
                  {(contactUser.full_name || contactUser.username || 'U')[0].toUpperCase()}
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.6875rem',
                  color: isOnline ? 'var(--text-primary)' : 'var(--text-muted)',
                  maxWidth: '48px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center'
                }}
              >
                {(contactUser.full_name || contactUser.username).split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Clean Search Input */}
      <div style={{ padding: '10px 14px 6px 14px', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{
            padding: '7px 14px',
            fontSize: '0.8125rem'
          }}
        />
      </div>

      {/* Conversations Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 4px'
        }}
      >
        {/* Direct Messages Section */}
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              padding: '6px 14px 4px 14px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Direct Messages ({filteredConversations.length})</span>
            <button
              type="button"
              onClick={onOpenNewDM}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                padding: '2px',
                fontSize: '0.875rem'
              }}
              title="New Direct Message"
            >
              +
            </button>
          </div>

          {filteredConversations.length === 0 ? (
            <div style={{ padding: '8px 14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No direct messages yet
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = conv.other_user;
              if (!other) return null;

              const isActive = conv.id === activeConversationId;
              const hasUnread = Boolean(conv.unread_count && conv.unread_count > 0);
              const presence = presenceMap[other.id] || other.status?.toLowerCase() || 'offline';
              const isOnline = presence === 'online';

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    selectConversation(conv.id, conv);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`channel-card ${isActive ? 'active' : ''}`}
                >
                  {/* Round Avatar with Status Dot */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-elevated)',
                        border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {(other.full_name || other.username || 'U')[0].toUpperCase()}
                    </div>

                    {isOnline && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '0px',
                          right: '0px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-emerald)',
                          border: '2px solid var(--bg-surface)'
                        }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1px' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: isActive || hasUnread ? 600 : 500,
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {other.full_name || other.username}
                      </span>

                      {other.role === 'admin' && (
                        <span style={{ fontSize: '0.625rem', color: 'var(--accent-rose)', fontWeight: 500 }}>
                          Admin
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: isOnline ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {isOnline ? 'Active now' : `@${other.username}`}
                    </div>
                  </div>

                  {hasUnread && !isActive && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Spaces Section */}
        <div>
          <div
            style={{
              padding: '6px 14px 4px 14px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Spaces ({filteredChannels.length})</span>
            <button
              type="button"
              onClick={onOpenCreateChannel}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                padding: '2px',
                fontSize: '0.875rem'
              }}
              title="Create Space"
            >
              +
            </button>
          </div>

          {filteredChannels.length === 0 ? (
            <div style={{ padding: '8px 14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No matching spaces
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
                  className={`channel-card ${isActive ? 'active' : ''}`}
                >
                  {/* Squircle Badge */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isActive ? 'var(--grad-prism)' : 'var(--bg-elevated)',
                      color: isActive ? '#ffffff' : 'var(--text-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}
                  >
                    {channel.is_private ? <IconLock size={15} /> : (channel.name ? channel.name[0].toUpperCase() : 'S')}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1px' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: isActive || hasUnread ? 600 : 500,
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
                            background: 'var(--grad-prism)',
                            color: '#ffffff',
                            fontSize: '0.6875rem',
                            fontWeight: 600
                          }}
                        >
                          {channel.unread_count}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {channel.topic || 'Space conversation'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          flexShrink: 0
        }}
      >
        <span>🔒 Zero-Admin Access</span>
        <span>E2EE Isolated</span>
      </div>
    </aside>
  );
}
