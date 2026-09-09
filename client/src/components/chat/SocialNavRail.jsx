import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  IconMessageSquare,
  IconGlobe,
  IconBell,
  IconBookmark,
  IconSearch,
  IconSun,
  IconMoon,
  IconShield,
  IconLogOut
} from '../common/Icons.jsx';

export default function SocialNavRail({
  activeView,
  onChangeView,
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
      {/* Top Brand Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onOpenProfile}
          title="NexusChat Home"
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
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ✦
        </button>

        {/* Primary Navigation Icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Direct Messages (Instagram / Messenger Primary) */}
          <button
            type="button"
            onClick={() => onChangeView('DIRECT')}
            className={`social-nav-item ${activeView === 'DIRECT' || activeView === 'ALL' ? 'active' : ''}`}
            title="Direct Messages"
          >
            <IconMessageSquare size={20} />
          </button>

          {/* Spaces & Communities */}
          <button
            type="button"
            onClick={() => onChangeView('SPACES')}
            className={`social-nav-item ${activeView === 'SPACES' ? 'active' : ''}`}
            title="Spaces & Communities"
          >
            <IconGlobe size={20} />
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

        {/* User Profile Avatar with Rainbow Status Ring */}
        <div
          onClick={onOpenProfile}
          className="story-node"
          title={`Profile: ${user?.full_name || user?.username}`}
          style={{ marginTop: '4px' }}
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
                width: '32px',
                height: '32px',
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
