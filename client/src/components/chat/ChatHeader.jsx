import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { IconHash, IconLock, IconPin, IconUsers, IconInfo, IconSearch } from '../common/Icons.jsx';

export default function ChatHeader({
  onToggleContextPanel,
  isContextOpen,
  onOpenSearch,
  onToggleMobileSidebar
}) {
  const { activeConversation, presenceMap } = useChat();

  if (!activeConversation) return null;

  const isChannel = activeConversation.type === 'CHANNEL' || Boolean(activeConversation.name);
  const title = isChannel
    ? activeConversation.name
    : activeConversation.other_user?.full_name || activeConversation.other_user?.username || 'Direct Message';
  const subtitle = isChannel
    ? activeConversation.topic || (activeConversation.is_private ? 'Private channel' : 'Public channel')
    : `@${activeConversation.other_user?.username || ''} • ${
        presenceMap[activeConversation.other_user?.id] || 'offline'
      }`;

  return (
    <header
      style={{
        height: '56px',
        padding: '0 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
        flexShrink: 0
      }}
    >
      {/* Left Title & Status */}
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
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ color: 'var(--accent-cyan)', display: 'flex' }}>
            {isChannel ? (
              activeConversation.is_private ? <IconLock size={18} /> : <IconHash size={18} />
            ) : (
              <IconUsers size={18} />
            )}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isChannel ? `#${title}` : title}
              </span>
              <span className="privacy-badge" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                🔒 Privacy Protected
              </span>
            </div>
            {subtitle && (
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Search in workspace"
          className="btn-outline"
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <IconSearch size={14} />
          <span className="hide-sm">Search</span>
        </button>

        <button
          type="button"
          onClick={onToggleContextPanel}
          title="Channel details & pinned messages"
          className={`btn-outline ${isContextOpen ? 'active' : ''}`}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isContextOpen ? 'var(--bg-active)' : 'transparent',
            borderColor: isContextOpen ? 'var(--border-strong)' : 'var(--border-subtle)'
          }}
        >
          <IconInfo size={15} />
          <span className="hide-sm">Details</span>
        </button>
      </div>
    </header>
  );
}
