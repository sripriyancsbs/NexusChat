import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext.jsx';
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
  const { channels, activeConversationId, selectChannel, activeThread, openThread } = useChat();

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
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Left Navigation Sidebar */}
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

      {/* Main Chat Center Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: 'var(--bg-canvas)',
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

      {/* Right Panels (Thread Drawer or Context Details) */}
      {activeThread && (
        <ThreadDrawer onReport={(msg) => setReportTargetMessage(msg)} />
      )}

      {isContextPanelOpen && !activeThread && (
        <ContextPanel
          isOpen={isContextPanelOpen}
          onClose={() => setIsContextPanelOpen(false)}
        />
      )}

      {/* Common Modals */}
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
