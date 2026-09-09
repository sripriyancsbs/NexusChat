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

  return (
    <aside
      className={`sidebar ${isMobileOpen ? 'open' : ''}`}
      style={{
        width: '320px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}
        >
          Conversations
        </span>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

      {/* Search Input & Filter Pills */}
      <div style={{ padding: '10px 14px 6px 14px' }}>
        <input
          type="text"
          placeholder="Filter channels or direct messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{
            padding: '7px 12px',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-full)'
          }}
        />

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CHANNELS', label: 'Channels' },
            { id: 'DIRECT', label: 'Direct' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid transparent',
                backgroundColor: activeFilter === tab.id ? 'var(--bg-active)' : 'transparent',
                color: activeFilter === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 0'
        }}
      >
        {/* Channels */}
        {(activeFilter === 'ALL' || activeFilter === 'CHANNELS') && (
          <div>
            <div
              style={{
                padding: '6px 16px 4px 16px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Channels ({filteredChannels.length})
            </div>

            {filteredChannels.length === 0 ? (
              <div style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No matching channels
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
                    className={`chat-list-item ${isActive ? 'active' : ''}`}
                  >
                    {/* Avatar Squircle */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'var(--grad-prism)' : 'var(--bg-elevated)',
                        color: isActive ? '#ffffff' : 'var(--text-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {channel.is_private ? <IconLock size={15} /> : '#'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 600 : 500,
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
                        {channel.topic || 'Channel conversation'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Direct Messages */}
        {(activeFilter === 'ALL' || activeFilter === 'DIRECT') && (
          <div style={{ marginTop: '8px' }}>
            <div
              style={{
                padding: '6px 16px 4px 16px',
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
              <div style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
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
                    className={`chat-list-item ${isActive ? 'active' : ''}`}
                  >
                    {/* User Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-elevated)',
                          border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
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

                      {/* Status Dot */}
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {other.full_name || other.username}
                        </span>

                        {other.role === 'admin' && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', fontWeight: 500 }}>
                            Admin
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
                        {isOnline ? 'Active now' : `@${other.username}`}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom Privacy Status */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.725rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>🔒 Zero-Admin Access</span>
        <span>E2EE Isolated</span>
      </div>
    </aside>
  );
}
