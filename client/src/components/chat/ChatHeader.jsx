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
  const title = isChannel
    ? activeConversation.name
    : activeConversation.other_user?.full_name || activeConversation.other_user?.username || 'Direct Stream';
  const presence = !isChannel
    ? presenceMap[activeConversation.other_user?.id] || activeConversation.other_user?.status?.toLowerCase() || 'offline'
    : null;

  return (
    <header
      style={{
        height: '60px',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Stream Info & Telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        {/* Mobile menu toggle */}
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: isChannel
                ? 'linear-gradient(135deg, rgba(13, 245, 196, 0.2), rgba(124, 58, 237, 0.2))'
                : 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(56, 189, 248, 0.2))',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            {isChannel ? (activeConversation.is_private ? <IconLock size={15} /> : '⌗') : '◎'}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {isChannel ? `${title}` : title}
              </span>

              <span className="privacy-badge" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                🔒 Zero-Admin Access
              </span>
            </div>

            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isChannel
                ? activeConversation.topic || 'Secure community transmission space'
                : `@${activeConversation.other_user?.username || ''} • Signal: ${presence?.toUpperCase() || 'OFFLINE'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Capsules */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Search Workspace (Ctrl+K)"
          className="btn-outline"
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <IconSearch size={14} />
          <span className="hide-sm">Search</span>
        </button>

        <button
          type="button"
          onClick={onToggleContextPanel}
          title="Conversation Inspector"
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            backgroundColor: isContextOpen ? 'var(--accent-cyan-subtle)' : 'var(--bg-elevated)',
            color: isContextOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: isContextOpen ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <IconInfo size={14} />
          <span className="hide-sm">Inspector</span>
        </button>
      </div>
    </header>
  );
}
