import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { IconPlus, IconLock, IconHash, IconMessageSquare } from '../common/Icons.jsx';

const STATUS_NOTES = ['vibing ✨', 'coding 💻', 'music 🎧', 'online 🟢', 'coffee ☕', 'studying 📚', 'deep work 🚀'];

export default function ChannelSidebar({
  onOpenCreateChannel,
  onOpenNewDM,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onNavigateAdmin,
  isMobileOpen,
  onCloseMobile,
  activeFilter = 'ALL',
  setActiveFilter
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

  const [localFilter, setLocalFilter] = useState('ALL');
  const currentFilter = setActiveFilter ? activeFilter : localFilter;
  const updateFilter = setActiveFilter || setLocalFilter;

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

  // Extract contacts for Instagram Notes & Active Story Rail
  const activeContacts = conversations
    .filter((conv) => conv.other_user)
    .map((conv, idx) => {
      const isOnline = presenceMap[conv.other_user.id] === 'online' || conv.other_user.status === 'online';
      const note = STATUS_NOTES[idx % STATUS_NOTES.length];
      return {
        conv,
        user: conv.other_user,
        isOnline,
        note
      };
    });

  return (
    <aside
      className={`floating-island ${isMobileOpen ? 'open' : ''}`}
      style={{
        width: '320px',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* Sidebar Header: Instagram Direct Header */}
      <div
        style={{
          padding: '14px 16px 10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-display)'
            }}
          >
            Direct & Spaces
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onOpenCreateChannel}
            title="Create Space"
            className="btn btn-secondary"
            style={{
              padding: '5px 9px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-full)',
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
              padding: '5px 10px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-full)',
              gap: '4px'
            }}
          >
            <IconPlus size={12} />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Instagram Notes & Active Story Rail */}
      {activeContacts.length > 0 && (
        <div className="story-rail">
          {activeContacts.map(({ conv, user: contactUser, isOnline, note }) => (
            <div
              key={contactUser.id}
              onClick={() => {
                selectConversation(conv);
                if (onCloseMobile) onCloseMobile();
              }}
              className="story-node"
              title={`Message ${contactUser.full_name || contactUser.username} (${isOnline ? 'Online' : 'Offline'})`}
            >
              {/* Instagram Note Bubble */}
              <div className="story-note-bubble">
                {note}
              </div>

              {/* Gradient Rainbow Ring */}
              <div
                className="story-ring"
                style={{
                  background: isOnline ? 'var(--grad-avatar-ring)' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <div className="story-avatar">
                  {(contactUser.full_name || contactUser.username || 'U')[0].toUpperCase()}
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: isOnline ? 'var(--text-primary)' : 'var(--text-muted)',
                  maxWidth: '52px',
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

      {/* Search Input & Segmented Filters */}
      <div style={{ padding: '10px 14px 6px 14px' }}>
        <input
          type="text"
          placeholder="Search chats, people, or spaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{
            padding: '7px 14px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-full)'
          }}
        />

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            marginTop: '10px',
            padding: '3px',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-full)'
          }}
        >
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DIRECT', label: 'Direct' },
            { id: 'SPACES', label: 'Spaces' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateFilter(tab.id)}
              style={{
                flex: 1,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: currentFilter === tab.id ? 600 : 500,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: currentFilter === tab.id ? 'var(--bg-card)' : 'transparent',
                color: currentFilter === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: currentFilter === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 4px'
        }}
      >
        {/* Direct Messages (Instagram Direct priority) */}
        {(currentFilter === 'ALL' || currentFilter === 'DIRECT') && (
          <div style={{ marginBottom: '8px' }}>
            <div
              style={{
                padding: '6px 14px 4px 14px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Direct Messages ({filteredConversations.length})
            </div>

            {filteredConversations.length === 0 ? (
              <div style={{ padding: '8px 14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No direct messages
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
                      selectConversation(conv);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`channel-card ${isActive ? 'active' : ''}`}
                  >
                    {/* Circular Avatar with Active Presence */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
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

                    {/* Contact Info & Preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
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
        )}

        {/* Spaces (Channels) */}
        {(currentFilter === 'ALL' || currentFilter === 'SPACES') && (
          <div>
            <div
              style={{
                padding: '6px 14px 4px 14px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Spaces ({filteredChannels.length})
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
                    {/* Modern Squircle Badge */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
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
                      {channel.is_private ? <IconLock size={15} /> : '#'}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
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
        )}
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
          color: 'var(--text-muted)'
        }}
      >
        <span>🔒 Zero-Admin Access</span>
        <span>E2EE Isolated</span>
      </div>
    </aside>
  );
}
