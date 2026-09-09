import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  IconPlus,
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconLogOut,
  IconShield,
  IconLock
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

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'CHANNELS' | 'DMS'

  return (
    <aside
      className={`sidebar ${isMobileOpen ? 'open' : ''}`}
      style={{
        width: '300px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none',
        boxShadow: 'var(--shadow-md)',
        zIndex: 20
      }}
    >
      {/* Micro Activity Rail (Slim Left Bar) */}
      <div
        style={{
          width: '64px',
          backgroundColor: 'var(--bg-canvas)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          flexShrink: 0
        }}
      >
        {/* Top Brand Orb */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div
            title="NexusChat Aurora Core"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--grad-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06090f',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: 'var(--glow-cyan)',
              cursor: 'pointer',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✦
          </div>

          {/* Quick Tab Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              title="All Streams"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'ALL' ? 'var(--accent-cyan-subtle)' : 'transparent',
                color: activeTab === 'ALL' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: activeTab === 'ALL' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 700,
                transition: 'all var(--transition-fast)'
              }}
            >
              ALL
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CHANNELS')}
              title="Channels Only"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'CHANNELS' ? 'var(--accent-cyan-subtle)' : 'transparent',
                color: activeTab === 'CHANNELS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: activeTab === 'CHANNELS' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              ⌗
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DMS')}
              title="Direct Streams Only"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'DMS' ? 'var(--accent-cyan-subtle)' : 'transparent',
                color: activeTab === 'DMS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: activeTab === 'DMS' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              ◎
            </button>
          </div>
        </div>

        {/* Bottom Rail Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              title="Admin Command Center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 51, 102, 0.15)',
                color: 'var(--status-danger)',
                border: '1px solid rgba(255, 51, 102, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
            >
              <IconShield size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNotifications}
            title="Notifications"
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
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
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-cyan)',
                  boxShadow: 'var(--glow-cyan)'
                }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>

          {/* User Presence Avatar Orb */}
          <div
            onClick={onOpenProfile}
            title="Your Profile"
            style={{
              position: 'relative',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #162035, #1e293b)',
                border: '2px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '-1px',
                right: '-1px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-online)',
                border: '1.5px solid var(--bg-canvas)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Stream Hub Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Workspace Brand Capsule */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              Nexus Space
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', boxShadow: 'var(--glow-cyan)' }} />
              Live Mesh Stream
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSearch}
            title="Search Workspace (Ctrl+K)"
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem'
            }}
          >
            <IconSearch size={13} />
            <kbd style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>⌘K</kbd>
          </button>
        </div>

        {/* Scrollable Channels & DMs List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {/* CHANNELS */}
          {(activeTab === 'ALL' || activeTab === 'CHANNELS') && (
            <div style={{ marginBottom: '22px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)'
                }}
              >
                <span>Channels</span>
                <button
                  type="button"
                  onClick={onOpenCreateChannel}
                  title="Create Channel"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--accent-cyan)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  <IconPlus size={12} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
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
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(13, 245, 196, 0.12), rgba(124, 58, 237, 0.08))'
                          : 'transparent',
                        border: isActive ? '1px solid rgba(13, 245, 196, 0.35)' : '1px solid transparent',
                        cursor: 'pointer',
                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.85rem',
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
                        <span style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {chan.is_private ? <IconLock size={14} /> : '⌗'}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chan.name}
                        </span>
                      </div>
                      {isActive && (
                        <span
                          style={{
                            width: '4px',
                            height: '14px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--accent-cyan)',
                            boxShadow: 'var(--glow-cyan)'
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DIRECT STREAMS */}
          {(activeTab === 'ALL' || activeTab === 'DMS') && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)'
                }}
              >
                <span>Direct Streams</span>
                <button
                  type="button"
                  onClick={onOpenNewDM}
                  title="New Direct Message"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--accent-cyan)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  <IconPlus size={12} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
                {conversations.map((conv) => {
                  const isActive = activeConversationId === conv.id;
                  const otherUser = conv.other_user || conv.targetUser;
                  const displayName = otherUser?.displayName || otherUser?.full_name || otherUser?.username || 'Direct Stream';
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
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.15), rgba(13, 245, 196, 0.08))'
                          : 'transparent',
                        border: isActive ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid transparent',
                        cursor: 'pointer',
                        color: isActive ? 'var(--text-primary)' : hasUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive || hasUnread ? 700 : 500,
                        fontSize: '0.85rem',
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
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-elevated)',
                              color: 'var(--accent-sky)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
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
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
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
                            background: 'var(--grad-brand)',
                            color: '#06090f',
                            fontSize: '0.65rem',
                            fontWeight: 800
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
          )}
        </div>

        {/* User Identity Panel at Bottom of Hub */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-canvas)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div
            onClick={onOpenProfile}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', overflow: 'hidden' }}
          >
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                @{user?.username} • {user?.role}
              </div>
            </div>
          </div>

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
