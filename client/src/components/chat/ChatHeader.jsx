import React, { useState } from 'react';
import { useChat, CHAT_THEMES } from '../../context/ChatContext.jsx';
import {
  IconSearch,
  IconInfo,
  IconLock,
  IconPalette,
  IconX
} from '../common/Icons.jsx';

export default function ChatHeader({
  onToggleContextPanel,
  isContextOpen,
  onOpenSearch,
  onToggleMobileSidebar
}) {
  const { activeConversation, presenceMap, chatTheme, setChatTheme } = useChat();
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
          zIndex: 35,
          gap: '12px',
          position: 'relative'
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
                color: isChannel ? '#ffffff' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.9375rem'
              }}
            >
              {isChannel ? (activeConversation.is_private ? <IconLock size={16} /> : (title[0] || 'S').toUpperCase()) : (title[0] || 'U').toUpperCase()}
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
          {/* Backdrop for closing theme picker when clicking outside */}
          {showThemePicker && (
            <div
              onClick={() => setShowThemePicker(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40
              }}
            />
          )}

          {/* Chat Theme Customizer */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowThemePicker((prev) => !prev);
            }}
            title="Change Chat Theme Atmosphere"
            className="btn-icon"
            style={{
              color: showThemePicker ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: showThemePicker ? 'var(--bg-hover)' : 'transparent',
              position: 'relative',
              zIndex: 41
            }}
          >
            <IconPalette size={18} />
          </button>

          {/* Theme Picker Popover */}
          {showThemePicker && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '46px',
                right: '0px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '14px',
                zIndex: 50,
                width: '280px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  🎨 Chat Atmospheres
                </span>
                <button
                  type="button"
                  onClick={() => setShowThemePicker(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex'
                  }}
                >
                  <IconX size={14} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {CHAT_THEMES.map((th) => {
                  const isActive = chatTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        setChatTheme(th.id);
                        setShowThemePicker(false);
                      }}
                      className={`theme-swatch ${isActive ? 'active' : ''}`}
                      style={{
                        background: th.gradient,
                        height: '38px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: isActive ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.6)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform var(--transition-fast)'
                      }}
                      title={`${th.label} — ${th.subtitle}`}
                    >
                      {isActive && (
                        <span style={{ color: '#ffffff', fontSize: '0.8125rem', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {CHAT_THEMES.find((t) => t.id === chatTheme)?.label || 'Atmosphere'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  {CHAT_THEMES.find((t) => t.id === chatTheme)?.subtitle || 'Select a visual atmosphere'}
                </div>
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
