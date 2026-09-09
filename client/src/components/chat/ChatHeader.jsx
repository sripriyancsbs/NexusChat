import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconSearch, IconInfo, IconLock } from '../common/Icons.jsx';

export default function ChatHeader({
  onToggleContextPanel,
  isContextOpen,
  onOpenSearch,
  onToggleMobileSidebar
}) {
  const { activeConversation, presenceMap } = useChat();

  if (!activeConversation) return null;

  const isChannel = activeConversation.type === 'CHANNEL' || Boolean(activeConversation.name);
  
  const formatName = (name) => {
    if (!name) return '';
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const title = isChannel
    ? formatName(activeConversation.name)
    : activeConversation.other_user?.full_name || activeConversation.other_user?.username || 'Direct Message';

  const presence = !isChannel
    ? presenceMap[activeConversation.other_user?.id] || activeConversation.other_user?.status?.toLowerCase() || 'offline'
    : null;

  return (
    <header
      style={{
        height: '60px',
        padding: '10px 16px',
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Contact / Channel Info */}
      <div
        onClick={onToggleContextPanel}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          minWidth: 0
        }}
      >
        {/* Mobile sidebar toggle button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMobileSidebar();
          }}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '4px',
            cursor: 'pointer'
          }}
          aria-label="Toggle chat list"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Round Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            color: isChannel ? 'var(--accent-primary)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '1.1rem',
            flexShrink: 0
          }}
        >
          {isChannel ? (activeConversation.is_private ? <IconLock size={18} /> : '#') : (title[0] || 'U').toUpperCase()}
        </div>

        {/* Name and Status */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: '0.8125rem',
              color: presence === 'online' ? 'var(--whatsapp-green)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isChannel
              ? activeConversation.topic || 'tap here for group info'
              : presence === 'online'
              ? 'online'
              : 'click here for contact info'}
          </div>
        </div>
      </div>

      {/* Right Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Search in chat"
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
          <IconSearch size={18} />
        </button>

        <button
          type="button"
          onClick={onToggleContextPanel}
          title="Contact / Group info"
          style={{
            background: isContextOpen ? 'var(--bg-active)' : 'transparent',
            border: 'none',
            color: isContextOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconInfo size={19} />
        </button>
      </div>
    </header>
  );
}
