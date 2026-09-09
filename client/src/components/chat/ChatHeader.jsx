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
        height: '56px',
        padding: '0 18px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Header Left: Avatar & Info */}
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
        {/* Mobile menu button */}
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
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Squircle Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: isChannel ? 'var(--accent-primary)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '1rem',
            flexShrink: 0
          }}
        >
          {isChannel ? (activeConversation.is_private ? <IconLock size={16} /> : '#') : (title[0] || 'U').toUpperCase()}
        </div>

        {/* Title & Metadata */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </span>

            <span className="privacy-badge">
              🔒 Zero-Admin Access
            </span>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              color: presence === 'online' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isChannel
              ? activeConversation.topic || 'Channel conversation'
              : presence === 'online'
              ? 'Active now'
              : 'Direct communication'}
          </div>
        </div>
      </div>

      {/* Header Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Search in conversation"
          className="btn btn-secondary"
          style={{
            padding: '5px 10px',
            fontSize: '0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <IconSearch size={13} />
          <span className="hide-sm">Search</span>
        </button>

        <button
          type="button"
          onClick={onToggleContextPanel}
          title="Conversation Details"
          className="btn btn-secondary"
          style={{
            padding: '5px 10px',
            fontSize: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isContextOpen ? 'var(--bg-active)' : 'var(--bg-elevated)',
            color: isContextOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
            borderColor: isContextOpen ? 'var(--accent-primary)' : 'var(--border-default)'
          }}
        >
          <IconInfo size={13} />
          <span className="hide-sm">Details</span>
        </button>
      </div>
    </header>
  );
}
