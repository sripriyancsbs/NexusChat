import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  IconHash,
  IconLock,
  IconPlus,
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconLogOut,
  IconShield,
  IconUsers
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

  return (
    <aside
      className={`sidebar ${isMobileOpen ? 'open' : ''}`}
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* Workspace Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#ffffff'
            }}
          >
            N
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
              NexusChat
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>
              ● Connected
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onNavigateAdmin}
            title="Admin Portal"
            className="btn-outline"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-primary)',
              background: 'var(--accent-primary-subtle)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconShield size={16} />
          </button>
        )}
      </div>

      {/* Quick Search Trigger */}
      <div style={{ padding: '12px 14px 6px 14px' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconSearch size={14} />
            <span>Search or jump...</span>
          </div>
          <kbd
            style={{
              fontSize: '0.7rem',
              padding: '2px 5px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Scrollable Channels & DMs */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        {/* CHANNELS SECTION */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em'
            }}
          >
            <span>Channels</span>
            <button
              type="button"
              onClick={onOpenCreateChannel}
              title="Create channel"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: 'var(--radius-xs)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <IconPlus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
            {channels.map((chan) => {
              const isActive = activeConversationId === chan.conversation_id;
              return (
                <button
                  key={chan.id}
                  type="button"
                  onClick={() => {
                    selectChannel(chan);
                    onCloseMobile?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <span style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', display: 'flex' }}>
                      {chan.is_private ? <IconLock size={15} /> : <IconHash size={15} />}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chan.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DIRECT MESSAGES SECTION */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.04em'
            }}
          >
            <span>Direct Messages</span>
            <button
              type="button"
              onClick={onOpenNewDM}
              title="New direct message"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: 'var(--radius-xs)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <IconPlus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
            {conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              const otherUser = conv.other_user;
              const displayName = otherUser?.full_name || otherUser?.username || 'Direct Message';
              const presence = presenceMap[otherUser?.id] || otherUser?.status?.toLowerCase() || 'offline';
              const hasUnread = conv.unread_count > 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    selectConversation(conv.id, conv);
                    onCloseMobile?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? 'var(--text-primary)' : hasUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive || hasUnread ? 600 : 400,
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    {/* Status dot */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--accent-primary-subtle)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}
                      >
                        {displayName[0].toUpperCase()}
                      </div>
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-1px',
                          right: '-1px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          border: '1.5px solid var(--bg-surface)',
                          backgroundColor:
                            presence === 'online'
                              ? 'var(--status-online)'
                              : presence === 'away'
                              ? 'var(--status-away)'
                              : 'var(--status-offline)'
                        }}
                      />
                    </div>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayName}
                    </span>
                  </div>

                  {hasUnread && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}
                    >
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer Panel */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div
          onClick={onOpenProfile}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', overflow: 'hidden' }}
          title="Edit Profile"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              @{user?.username}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Notifications button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            title="Notifications"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              padding: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconBell size={16} />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-danger)'
                }}
              />
            )}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          {/* Logout button */}
          <button
            type="button"
            onClick={logout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              color: 'var(--status-danger)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
