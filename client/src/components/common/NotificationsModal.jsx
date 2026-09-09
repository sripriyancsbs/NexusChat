import React from 'react';
import Modal from './Modal.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { api } from '../../services/api.js';
import { IconBell, IconCheck } from './Icons.jsx';

export default function NotificationsModal({ isOpen, onClose }) {
  const {
    notifications,
    refreshNotifications,
    selectConversation,
    setNotifications,
    setUnreadNotificationsCount
  } = useChat();

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, isRead: true })));
      setUnreadNotificationsCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read && !notif.isRead) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true, isRead: true } : n))
        );
        setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }

    if (notif.conversation_id) {
      selectConversation(notif.conversation_id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      subtitle="Mentions, thread replies, and system announcements"
      maxWidth="500px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Header action */}
        {notifications.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              <IconCheck size={14} /> Mark all as read
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <IconBell size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div>You're all caught up! No notifications.</div>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.is_read && !n.isRead;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isUnread ? 'var(--bg-elevated)' : 'var(--bg-canvas)',
                    border: isUnread ? '1px solid var(--accent-primary-subtle)' : '1px solid var(--border-subtle)',
                    borderLeft: isUnread ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {n.title || 'Notification'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {n.content || n.message}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
