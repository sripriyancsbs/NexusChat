import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconLock, IconInfo, IconSearch } from '../common/Icons.jsx';

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
        padding: '10px 18px',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Conversation Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '4px',
            cursor: 'pointer'
          }}
          aria-label="Toggle channels menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {isChannel ? (activeConversation.is_private ? <IconLock size={15} /> : '#') : '@'}
          </span>

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
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isChannel
                ? activeConversation.topic || 'Channel conversation'
                : `@${activeConversation.other_user?.username || ''} • ${presence === 'online' ? 'Active now' : presence === 'idle' ? 'Away' : 'Offline'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Search in this conversation"
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
