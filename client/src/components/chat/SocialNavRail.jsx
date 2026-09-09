import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  IconMessageSquare,
  IconBell,
  IconSearch,
  IconSun,
  IconMoon,
  IconShield,
  IconLogOut
} from '../common/Icons.jsx';

export default function SocialNavRail({
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onNavigateAdmin,
  unreadCount = 0
}) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="social-nav-rail" aria-label="Primary Navigation">
      {/* Top Brand Logo (Does NOT open profile) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div
          title="NexusChat"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--grad-prism)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.15rem',
            boxShadow: 'var(--theme-bubble-shadow, 0 4px 14px rgba(0, 122, 204, 0.45))',
            userSelect: 'none',
            cursor: 'default',
            transition: 'background var(--transition-normal), box-shadow var(--transition-normal)'
          }}
        >
          ✦
        </div>

        {/* Primary Navigation Icons (Clean, unified - no separate direct/spaces clutter) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Messages & Spaces Unified */}
          <button
            type="button"
            className="social-nav-item active"
            title="All Conversations"
          >
            <IconMessageSquare size={20} />
          </button>

          {/* Global Search */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="social-nav-item"
            title="Search (Ctrl + K)"
          >
            <IconSearch size={20} />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="social-nav-item"
            title="Activity & Notifications"
          >
            <IconBell size={20} />
            {unreadCount > 0 && <span className="social-nav-badge" />}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {/* Admin Portal Shortcut */}
        {isAdmin && (
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="social-nav-item"
            title="Admin Console"
            style={{ color: 'var(--accent-rose)' }}
          >
            <IconShield size={19} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="social-nav-item"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <IconSun size={19} /> : <IconMoon size={19} />}
        </button>

        {/* User Profile Avatar with Rainbow Status Ring (Opens Profile) */}
        <div
          onClick={onOpenProfile}
          className="story-node"
          title={`Profile: ${user?.full_name || user?.username} (Click to open)`}
          style={{ marginTop: '4px', cursor: 'pointer' }}
        >
          <div
            className="story-ring"
            style={{
              padding: '2px',
              background: 'var(--grad-avatar-ring)'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.8125rem',
                border: '2px solid var(--bg-surface)'
              }}
            >
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="social-nav-item"
          title="Sign Out"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <IconLogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
