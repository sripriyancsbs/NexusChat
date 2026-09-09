import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

import ChannelSidebar from '../components/chat/ChannelSidebar.jsx';
import ChatHeader from '../components/chat/ChatHeader.jsx';
import MessageList from '../components/chat/MessageList.jsx';
import MessageComposer from '../components/chat/MessageComposer.jsx';
import ThreadDrawer from '../components/chat/ThreadDrawer.jsx';
import ContextPanel from '../components/chat/ContextPanel.jsx';

import CommandPalette from '../components/common/CommandPalette.jsx';
import SearchModal from '../components/common/SearchModal.jsx';
import CreateChannelModal from '../components/common/CreateChannelModal.jsx';
import NewDirectMessageModal from '../components/common/NewDirectMessageModal.jsx';
import NotificationsModal from '../components/common/NotificationsModal.jsx';
import UserProfileModal from '../components/common/UserProfileModal.jsx';
import ReportMessageModal from '../components/common/ReportMessageModal.jsx';

import {
  IconSearch,
  IconBell,
  IconSun,
  IconMoon,
  IconLogOut,
  IconShield
} from '../components/common/Icons.jsx';

export default function MemberApp({ onNavigateAdmin }) {
  const { channels, activeConversationId, selectChannel, activeThread, openThread, unreadNotificationsCount } = useChat();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isNewDMOpen, setIsNewDMOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [reportTargetMessage, setReportTargetMessage] = useState(null);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto-select general or first channel on initial load if none selected
  useEffect(() => {
    if (!activeConversationId && channels.length > 0) {
      const general = channels.find((c) => c.name === 'general') || channels[0];
      selectChannel(general);
    }
  }, [activeConversationId, channels, selectChannel]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Top Application Header */}
      <header
        style={{
          height: '52px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
          zIndex: 40
        }}
      >
        {/* Brand & Workspace Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              cursor: 'pointer'
            }}
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Open Command Palette (Ctrl+K)"
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--grad-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              ✦
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)'
                }}
              >
                NexusChat
              </span>

              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-emerald)'
                  }}
                />
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Center Search Input */}
        <div style={{ flex: 1, maxWidth: '480px', margin: '0 20px' }}>
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              width: '100%',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSearch size={14} />
              <span>Search messages, channels, or commands...</span>
            </div>
            <kbd
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 5px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}
            >
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Workspace Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              title="Admin Portal"
              className="btn btn-secondary"
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                gap: '5px'
              }}
            >
              <IconShield size={13} />
              <span className="hide-sm">Admin</span>
            </button>
          )}

          {/* Notifications */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            title="Notifications"
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconBell size={15} />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)'
                }}
              />
            )}
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setIsProfileOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 5px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            title="View Profile"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hide-sm">
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {user?.full_name || user?.username}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: user?.role === 'admin' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  color: user?.role === 'admin' ? 'var(--accent-rose)' : 'var(--text-muted)',
                  fontWeight: 500
                }}
              >
                {user?.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>

          {/* Log out */}
          <button
            type="button"
            onClick={logout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          padding: '10px 14px 14px 14px',
          gap: '10px',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Left Column: Channels & DMs Sidebar */}
        <ChannelSidebar
          onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
          onOpenNewDM={() => setIsNewDMOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onNavigateAdmin={onNavigateAdmin}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Column: Conversation Hub */}
        <main
          className="bento-panel"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <ChatHeader
            onToggleContextPanel={() => setIsContextPanelOpen((prev) => !prev)}
            isContextOpen={isContextPanelOpen}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          />

          <MessageList
            onOpenThread={openThread}
            onReport={(msg) => setReportTargetMessage(msg)}
          />

          <MessageComposer />
        </main>

        {/* Right Column: Thread Drawer or Context Details */}
        {activeThread && (
          <ThreadDrawer onReport={(msg) => setReportTargetMessage(msg)} />
        )}

        {isContextPanelOpen && !activeThread && (
          <ContextPanel
            isOpen={isContextPanelOpen}
            onClose={() => setIsContextPanelOpen(false)}
          />
        )}
      </div>

      {/* Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateAdmin={onNavigateAdmin}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />

      <NewDirectMessageModal
        isOpen={isNewDMOpen}
        onClose={() => setIsNewDMOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <ReportMessageModal
        isOpen={Boolean(reportTargetMessage)}
        onClose={() => setReportTargetMessage(null)}
        message={reportTargetMessage}
      />
    </div>
  );
}
