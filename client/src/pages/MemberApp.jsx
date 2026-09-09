import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

import SocialNavRail from '../components/chat/SocialNavRail.jsx';
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

export default function MemberApp({ onNavigateAdmin }) {
  const { channels, activeConversationId, selectChannel, activeThread, openThread, unreadNotificationsCount } = useChat();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Professional Chat Theme state: 'sapphire' | 'indigo' | 'cyan' | 'emerald' | 'graphite' | 'berry'
  const [chatTheme, setChatTheme] = useState('sapphire');

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
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* 1. Global Social Navigation Rail (Instagram / Messenger Primary Dock) */}
      <SocialNavRail
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigateAdmin={onNavigateAdmin}
        unreadCount={unreadNotificationsCount}
      />

      {/* 2. Floating Bento Workspace Canvas */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          padding: '12px 14px 14px 14px',
          gap: '12px',
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden'
        }}
      >
        {/* Left Floating Island: Auto-collapsing hover sidebar */}
        <ChannelSidebar
          onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
          onOpenNewDM={() => setIsNewDMOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Floating Island: Main Dialogue Feed & Instagram Floating Composer */}
        <main
          className={`floating-island theme-${chatTheme}`}
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
            currentTheme={chatTheme}
            onSelectTheme={setChatTheme}
          />

          <MessageList
            onOpenThread={openThread}
            onReport={(msg) => setReportTargetMessage(msg)}
          />

          <MessageComposer />
        </main>

        {/* Right Floating Island: Thread or Context Details */}
        {activeThread && (
          <ThreadDrawer onReport={(msg) => setReportTargetMessage(msg)} />
        )}

        {isContextPanelOpen && !activeThread && (
          <ContextPanel
            isOpen={isContextPanelOpen}
            onClose={() => setIsContextPanelOpen(false)}
            currentTheme={chatTheme}
            onSelectTheme={setChatTheme}
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
