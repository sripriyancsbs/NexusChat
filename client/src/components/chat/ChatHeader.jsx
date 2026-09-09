import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import {
  IconSearch,
  IconInfo,
  IconLock,
  IconPhone,
  IconVideo,
  IconPalette,
  IconX
} from '../common/Icons.jsx';

const THEMES = [
  { id: 'sunset', label: 'Sunset Glow', gradient: 'var(--chat-theme-sunset)' },
  { id: 'prism', label: 'Prism Violet', gradient: 'var(--chat-theme-prism)' },
  { id: 'ocean', label: 'Ocean Breeze', gradient: 'var(--chat-theme-ocean)' },
  { id: 'neon', label: 'Electric Neon', gradient: 'var(--chat-theme-neon)' },
  { id: 'emerald', label: 'Emerald Zen', gradient: 'var(--chat-theme-emerald)' },
  { id: 'berry', label: 'Sweet Berry', gradient: 'var(--chat-theme-berry)' }
];

export default function ChatHeader({
  onToggleContextPanel,
  isContextOpen,
  onOpenSearch,
  onToggleMobileSidebar,
  currentTheme = 'sunset',
  onSelectTheme
}) {
  const { activeConversation, presenceMap } = useChat();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [callModal, setCallModal] = useState(null); // 'audio' | 'video' | null

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
          padding: '0 20px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 20
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
                width: '42px',
                height: '42px',
                borderRadius: isChannel ? '12px' : '50%',
                background: isChannel ? 'var(--grad-prism)' : 'var(--bg-elevated)',
                border: isChannel ? 'none' : '2px solid var(--border-default)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1rem'
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
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-emerald)',
                  border: '2px solid var(--bg-surface)'
                }}
              />
            )}
          </div>

          {/* Title & Status */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.975rem',
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
                ? activeConversation.topic || 'Space discussion'
                : presence === 'online'
                ? 'Active now'
                : `@${activeConversation.other_user?.username || 'user'}`}
            </div>
          </div>
        </div>

        {/* Header Right: Instagram / Messenger Social Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          {/* Audio Call */}
          <button
            type="button"
            onClick={() => setCallModal('audio')}
            title="Start Audio Call"
            className="btn-icon"
          >
            <IconPhone size={18} />
          </button>

          {/* Video Call */}
          <button
            type="button"
            onClick={() => setCallModal('video')}
            title="Start Video Call"
            className="btn-icon"
          >
            <IconVideo size={19} />
          </button>

          {/* Chat Theme Customizer */}
          <button
            type="button"
            onClick={() => setShowThemePicker((prev) => !prev)}
            title="Change Chat Theme"
            className="btn-icon"
            style={{ color: showThemePicker ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            <IconPalette size={19} />
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
                width: '200px'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Chat Theme Gradients
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
            <IconSearch size={18} />
          </button>

          {/* Details Toggle */}
          <button
            type="button"
            onClick={onToggleContextPanel}
            title="Conversation Details"
            className="btn-icon"
            style={{ color: isContextOpen ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
          >
            <IconInfo size={19} />
          </button>
        </div>
      </header>

      {/* Call Dialog Modal Simulation */}
      {callModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setCallModal(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              padding: '32px 28px',
              textAlign: 'center',
              width: '100%',
              maxWidth: '340px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="story-ring"
              style={{
                width: '76px',
                height: '76px',
                margin: '0 auto 16px auto',
                padding: '3px',
                background: 'var(--grad-avatar-ring)'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#ffffff'
                }}
              >
                {(title[0] || 'U').toUpperCase()}
              </div>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {callModal === 'video' ? 'Connecting HD video...' : 'Calling securely (E2EE)...'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => setCallModal(null)}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-rose)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(244, 63, 94, 0.4)'
                }}
                title="End Call"
              >
                <IconX size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
