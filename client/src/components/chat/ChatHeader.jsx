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
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(10, 15, 29, 0.75)',
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
          aria-label="Toggle spectrum sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Signal Indicator Orb */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              background: isChannel
                ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.2))'
                : 'linear-gradient(135deg, rgba(255, 149, 0, 0.2), rgba(0, 240, 255, 0.2))',
              border: isChannel ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 149, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isChannel ? 'var(--cyber-cyan)' : 'var(--cyber-amber)',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            {isChannel ? (activeConversation.is_private ? <IconLock size={15} /> : '⚡') : '◎'}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {isChannel ? `${title}` : title}
              </span>

              <span className="privacy-badge" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                🔒 AES-256 ZERO-ACCESS
              </span>
            </div>

            <div
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isChannel
                ? activeConversation.topic || 'FREQUENCY // LIVE RECEPTOR ACTIVE'
                : `@${activeConversation.other_user?.username || ''} // SIGNAL: ${presence?.toUpperCase() || 'OFFLINE'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Capsules */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Search Frequency Signals"
          className="btn-outline"
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.725rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <IconSearch size={13} />
          <span className="hide-sm">SEARCH</span>
        </button>

        <button
          type="button"
          onClick={onToggleContextPanel}
          title="Inspect Frequency Telemetry"
          className="btn-outline"
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.725rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isContextOpen ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
            color: isContextOpen ? 'var(--cyber-cyan)' : 'var(--text-secondary)',
            borderColor: isContextOpen ? 'var(--cyber-cyan)' : 'var(--border-default)'
          }}
        >
          <IconInfo size={13} />
          <span className="hide-sm">TELEMETRY</span>
        </button>
      </div>
    </header>
  );
}
