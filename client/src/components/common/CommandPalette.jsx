import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { IconSearch, IconHash, IconLock, IconUsers, IconMoon, IconSun, IconShield, IconX } from './Icons.jsx';

export default function CommandPalette({ isOpen, onClose, onNavigateAdmin, onOpenProfile }) {
  const { channels, conversations, selectChannel, selectConversation } = useChat();
  const { isAdmin, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
          setSelectedIndex(0);
          // open command palette
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  // Build searchable items
  const items = [];

  // Channels
  channels.forEach((c) => {
    if (!query || c.name.toLowerCase().includes(query.toLowerCase())) {
      items.push({
        id: `chan-${c.id}`,
        category: 'Channels',
        title: c.name,
        subtitle: c.topic || (c.is_private ? 'Private channel' : 'Public channel'),
        icon: c.is_private ? <IconLock size={16} /> : <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.name ? c.name[0].toUpperCase() : 'S'}</span>,
        action: () => {
          selectChannel(c);
          onClose();
        }
      });
    }
  });

  // Direct Messages
  conversations.forEach((conv) => {
    const name = conv.other_user?.full_name || conv.other_user?.username || 'Direct Message';
    if (!query || name.toLowerCase().includes(query.toLowerCase()) || conv.other_user?.username?.toLowerCase().includes(query.toLowerCase())) {
      items.push({
        id: `dm-${conv.id}`,
        category: 'Direct Messages',
        title: `@ ${name}`,
        subtitle: `@${conv.other_user?.username || 'user'}`,
        icon: <IconUsers size={16} />,
        action: () => {
          selectConversation(conv.id, conv);
          onClose();
        }
      });
    }
  });

  // Actions
  if (!query || 'toggle theme mode light dark'.includes(query.toLowerCase())) {
    items.push({
      id: 'action-theme',
      category: 'Preferences',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: `Currently using ${theme} theme`,
      icon: theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />,
      action: () => {
        toggleTheme();
        onClose();
      }
    });
  }

  if (isAdmin && (!query || 'admin portal moderation security'.includes(query.toLowerCase()))) {
    items.push({
      id: 'action-admin',
      category: 'Administration',
      title: 'Go to Admin Portal',
      subtitle: 'Manage accounts, access requests, sessions, and audit logs',
      icon: <IconShield size={16} />,
      action: () => {
        onNavigateAdmin();
        onClose();
      }
    });
  }

  if (!query || 'edit profile status account'.includes(query.toLowerCase())) {
    items.push({
      id: 'action-profile',
      category: 'Preferences',
      title: 'Edit My Profile',
      subtitle: `@${user?.username || ''}`,
      icon: <IconUsers size={16} />,
      action: () => {
        onOpenProfile();
        onClose();
      }
    });
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < items.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 1100
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <IconSearch size={20} className="text-secondary" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or jump to channel / member..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <kbd
            style={{
              padding: '2px 6px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No matches found for "{query}"
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '8px 18px',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>NexusChat Command Bar</span>
        </div>
      </div>
    </div>
  );
}
