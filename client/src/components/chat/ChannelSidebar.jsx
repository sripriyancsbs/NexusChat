import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  IconPlus,
  IconSearch,
  IconLock,
  IconBell,
  IconSun,
  IconMoon,
  IconLogOut,
  IconShield
} from '../common/Icons.jsx';

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
    presenceMap,
    unreadNotificationsCount
  } = useChat();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'CHANNELS' | 'DMS'
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
        width: '380px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative',
        zIndex: 20
      }}
    >
      {/* WhatsApp Web Top Toolbar */}
      <div
        style={{
          height: '60px',
          padding: '10px 16px',
          backgroundColor: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        {/* User Profile Avatar */}
        <div
          onClick={onOpenProfile}
          title="View profile & status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--accent-primary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.full_name || user?.username}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
              Online
            </span>
          </div>
        </div>

        {/* Right Toolbar Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              title="Admin Portal"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconShield size={19} />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCreateChannel}
            title="New Channel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconPlus size={20} />
          </button>

          <button
            type="button"
            onClick={onOpenNewDM}
            title="New Direct Chat"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.05rem',
              fontWeight: 600
            }}
          >
            💬
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            title="Notifications"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconBell size={18} />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--whatsapp-green)'
                }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          <button
            type="button"
            onClick={logout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconLogOut size={18} />
          </button>
        </div>
      </div>

      {/* WhatsApp Search Bar & Filter Chips */}
      <div style={{ padding: '8px 12px 8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '8px',
            padding: '7px 12px'
          }}
        >
          <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* WhatsApp Chat Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'UNREAD', label: 'Unread' },
            { id: 'CHANNELS', label: 'Channels' },
            { id: 'DMS', label: 'DMs' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeFilter === tab.id ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                color: activeFilter === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Chat List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto'
        }}
      >
        {/* Channels List */}
        {(activeFilter === 'ALL' || activeFilter === 'CHANNELS' || activeFilter === 'UNREAD') && (
          <div>
            {filteredChannels
              .filter((c) => (activeFilter === 'UNREAD' ? Boolean(c.unread_count && c.unread_count > 0) : true))
              .map((channel) => {
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
                    {/* Channel Round Avatar */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {channel.is_private ? <IconLock size={18} /> : '#'}
                    </div>

                    {/* Chat Item Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: hasUnread ? 700 : 500,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {formatName(channel.name)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: hasUnread ? 'var(--whatsapp-green)' : 'var(--text-secondary)' }}>
                          Channel
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {channel.topic || 'Tap to join conversation'}
                        </span>

                        {hasUnread && (
                          <span
                            style={{
                              minWidth: '20px',
                              height: '20px',
                              padding: '0 5px',
                              borderRadius: '10px',
                              backgroundColor: 'var(--whatsapp-green)',
                              color: '#111b21',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: '8px'
                            }}
                          >
                            {channel.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Direct Messages List */}
        {(activeFilter === 'ALL' || activeFilter === 'DMS' || activeFilter === 'UNREAD') && (
          <div>
            {filteredConversations
              .filter((conv) => (activeFilter === 'UNREAD' ? Boolean(conv.unread_count && conv.unread_count > 0) : true))
              .map((conv) => {
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
                    {/* Contact Round Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          fontWeight: 600
                        }}
                      >
                        {(other.full_name || other.username || 'U')[0].toUpperCase()}
                      </div>

                      {/* Online Status Dot */}
                      {isOnline && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--whatsapp-green)',
                            border: '2px solid var(--bg-surface)'
                          }}
                        />
                      )}
                    </div>

                    {/* Contact Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: hasUnread ? 700 : 500,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {other.full_name || other.username}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: hasUnread ? 'var(--whatsapp-green)' : 'var(--text-secondary)' }}>
                          {isOnline ? 'Online' : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {other.role === 'admin' ? 'Workspace Admin' : 'Active Community Member'}
                        </span>

                        {hasUnread && (
                          <span
                            style={{
                              minWidth: '20px',
                              height: '20px',
                              padding: '0 5px',
                              borderRadius: '10px',
                              backgroundColor: 'var(--whatsapp-green)',
                              color: '#111b21',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: '8px'
                            }}
                          >
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* WhatsApp E2EE Bottom Note */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}
      >
        <span>🔒</span>
        <span>Your personal messages are end-to-end encrypted</span>
      </div>
    </aside>
  );
}
