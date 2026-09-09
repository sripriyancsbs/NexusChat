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

  // Global Ctrl+K / Cmd+K listener
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
      {/* Top Nexus Horizon HUD Bar */}
      <header
        style={{
          height: '56px',
          backgroundColor: 'rgba(10, 15, 29, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          zIndex: 40
        }}
      >
        {/* Left Brand Identity & Telemetry Beacon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
            onClick={() => setIsCommandPaletteOpen(true)}
            title="Nexus Horizon Command Center"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--cyber-cyan), var(--cyber-amber))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#050810',
                fontWeight: 900,
                fontSize: '1rem',
                boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)'
              }}
            >
              ✦
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)'
                }}
              >
                NEXUS <span style={{ color: 'var(--cyber-cyan)' }}>//</span> HORIZON
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--cyber-mint)',
                  letterSpacing: '0.04em'
                }}
              >
                ● NODE ONLINE // E2EE ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Center Omni-Search Bar */}
        <div style={{ flex: 1, maxWidth: '520px', margin: '0 20px' }}>
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              width: '100%',
              padding: '7px 14px',
              backgroundColor: 'rgba(5, 8, 16, 0.65)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cyber-cyan)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSearch size={14} />
              <span>Omni-Search transmissions, operators, or telemetry...</span>
            </div>
            <kbd
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)'
              }}
            >
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Horizon Actions & Operator Profile Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              title="Admin Command Vault"
              className="btn-outline"
              style={{
                padding: '5px 12px',
                fontSize: '0.725rem',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--cyber-coral)',
                borderColor: 'rgba(255, 45, 85, 0.35)',
                backgroundColor: 'rgba(255, 45, 85, 0.08)',
                gap: '6px'
              }}
            >
              <IconShield size={13} />
              <span className="hide-sm">ADMIN VAULT</span>
            </button>
          )}

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            title="Transmitted Notifications"
            style={{
              position: 'relative',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconBell size={16} />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cyber-cyan)',
                  boxShadow: '0 0 8px var(--cyber-cyan)'
                }}
              />
            )}
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme palette"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
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

          {/* Operator Profile Pill */}
          <div
            onClick={() => setIsProfileOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--cyber-cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            title="Operator Identity Details"
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--cyber-cyan)',
                color: 'var(--cyber-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)'
              }}
            >
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="hide-sm">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.full_name || user?.username}
              </span>
              <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--cyber-cyan)' }}>
                @{user?.username}
              </span>
            </div>
          </div>

          {/* Terminate Session / Log out */}
          <button
            type="button"
            onClick={logout}
            title="Terminate Active Session"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              color: 'var(--cyber-coral)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Bento Matrix Canvas */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          padding: '12px 14px 14px 14px',
          gap: '12px',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Left Column: Spectrum Matrix Deck */}
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

        {/* Center Column: The Transmission Hub */}
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

        {/* Right Column: Sub-Signal Branch Matrix or Stream Telemetry */}
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

      {/* Modals & Dialogs */}
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
