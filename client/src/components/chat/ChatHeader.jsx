import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import {
  IconSearch,
  IconInfo,
  IconLock,
  IconPalette,
  IconX
} from '../common/Icons.jsx';

const THEMES = [
  { id: 'sapphire', label: 'Sapphire Blue', gradient: 'var(--chat-theme-sapphire)' },
  { id: 'indigo', label: 'Electric Indigo', gradient: 'var(--chat-theme-indigo)' },
  { id: 'cyan', label: 'Midnight Cyan', gradient: 'var(--chat-theme-cyan)' },
  { id: 'emerald', label: 'Emerald Pine', gradient: 'var(--chat-theme-emerald)' },
  { id: 'graphite', label: 'Graphite Minimal', gradient: 'var(--chat-theme-graphite)' },
  { id: 'berry', label: 'Velvet Berry', gradient: 'var(--chat-theme-berry)' }
];

export default function ChatHeader({
  onToggleContextPanel,
  isContextOpen,
  onOpenSearch,
  onToggleMobileSidebar,
  currentTheme = 'sapphire',
  onSelectTheme
}) {
  const { activeConversation, presenceMap } = useChat();
  const [showThemePicker, setShowThemePicker] = useState(false);

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
    <>
      <header
        style={{
          height: '62px',
          padding: '0 18px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 20,
          gap: '12px',
          overflow: 'hidden'
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
            minWidth: 0,
            flex: 1,
            overflow: 'hidden'
          }}
        >
          {/* Mobile hamburger */}
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

          {/* Social Avatar with Active Ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: isChannel ? '12px' : '50%',
                background: isChannel ? 'var(--grad-prism)' : 'var(--bg-elevated)',
                border: isChannel ? 'none' : '2px solid var(--border-default)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.9375rem'
              }}
            >
              {isChannel ? (activeConversation.is_private ? <IconLock size={16} /> : '#') : (title[0] || 'U').toUpperCase()}
            </div>

            {!isChannel && presence === 'online' && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-emerald)',
                  border: '2px solid var(--bg-surface)'
                }}
              />
            )}
          </div>

          {/* Title & Status */}
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
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
                🔒 Zero-Admin
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
                ? activeConversation.topic || 'Space discussion'
                : presence === 'online'
                ? 'Active now'
                : `@${activeConversation.other_user?.username || 'user'}`}
            </div>
          </div>
        </div>

        {/* Header Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, position: 'relative' }}>
          {/* Chat Theme Customizer */}
          <button
            type="button"
            onClick={() => setShowThemePicker((prev) => !prev)}
            title="Change Chat Theme"
            className="btn-icon"
            style={{ color: showThemePicker ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            <IconPalette size={18} />
          </button>

          {/* Theme Picker Popover */}
          {showThemePicker && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: '40px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px 14px',
                zIndex: 50,
                width: '210px'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Chat Themes
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      if (onSelectTheme) onSelectTheme(th.id);
                      setShowThemePicker(false);
                    }}
                    className={`theme-swatch ${currentTheme === th.id ? 'active' : ''}`}
                    style={{ background: th.gradient }}
                    title={th.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <button
            type="button"
            onClick={onOpenSearch}
            title="Search Messages"
            className="btn-icon"
          >
            <IconSearch size={17} />
          </button>

          {/* Details Toggle */}
          <button
            type="button"
            onClick={onToggleContextPanel}
            title="Conversation Details"
            className="btn-icon"
            style={{ color: isContextOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            <IconInfo size={18} />
          </button>
        </div>
      </header>
    </>
  );
}
