import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import {
  IconSmile,
  IconReply,
  IconPin,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconX
} from '../common/Icons.jsx';

const QUICK_EMOJIS = ['👍', '❤️', '🎉', '🚀', '👀', '💡'];

export default function MessageItem({ message, onOpenThread, onReport }) {
  const { user } = useAuth();
  const { toggleReaction, togglePin, editMessage, deleteMessage } = useChat();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const isAuthor = user?.id === message.sender_id;
  const isDeleted = message.is_deleted;
  const isPinned = message.is_pinned;

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    setSavingEdit(true);
    try {
      await editMessage(message.id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save edit:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(message.id);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  };

  const handleToggleReaction = async (emoji) => {
    setShowEmojiPicker(false);
    await toggleReaction(message.id, emoji);
  };

  return (
    <div
      className="message-item"
      style={{
        position: 'relative',
        display: 'flex',
        gap: '12px',
        padding: '8px 16px',
        margin: '2px 0',
        borderRadius: 'var(--radius-sm)',
        transition: 'background-color var(--transition-fast)',
        backgroundColor: isPinned ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
        borderLeft: isPinned ? '3px solid var(--accent-primary)' : '3px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!isDeleted) e.currentTarget.style.backgroundColor = isPinned ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-hover)';
        const toolbar = e.currentTarget.querySelector('.message-toolbar');
        if (toolbar) toolbar.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isPinned ? 'rgba(99, 102, 241, 0.05)' : 'transparent';
        const toolbar = e.currentTarget.querySelector('.message-toolbar');
        if (toolbar) toolbar.style.opacity = '0';
        setShowEmojiPicker(false);
      }}
    >
      {/* Sender Avatar */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-primary-subtle)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.9rem',
          flexShrink: 0
        }}
      >
        {(message.sender_full_name || message.sender_username || 'U')[0].toUpperCase()}
      </div>

      {/* Message Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            {message.sender_full_name || message.sender_username}
          </span>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.is_edited && !isDeleted && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(edited)</span>
          )}
          {isPinned && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <IconPin size={10} /> Pinned
            </span>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div style={{ marginTop: '6px' }}>
            <textarea
              className="input"
              rows="2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ width: '100%', marginBottom: '6px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <IconCheck size={14} /> Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <IconX size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.9rem',
              color: isDeleted ? 'var(--text-muted)' : 'var(--text-primary)',
              fontStyle: isDeleted ? 'italic' : 'normal',
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {message.content}
          </div>
        )}

        {/* Reactions List */}
        {!isDeleted && message.reactions && message.reactions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
            {message.reactions.map((r, idx) => {
              const hasReacted = r.users?.includes(user?.id);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleReaction(r.reaction)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: hasReacted ? 'var(--accent-primary-subtle)' : 'var(--bg-canvas)',
                    border: hasReacted ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    color: hasReacted ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{r.reaction}</span>
                  <span style={{ fontWeight: 600 }}>{r.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Thread replies button */}
        {!isDeleted && message.reply_count > 0 && (
          <div style={{ marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => onOpenThread(message)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-cyan-subtle)',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <IconReply size={12} />
              <span>{message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Toolbar on Hover */}
      {!isDeleted && !isEditing && (
        <div
          className="message-toolbar"
          style={{
            position: 'absolute',
            right: '16px',
            top: '-12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            padding: '2px 4px',
            gap: '2px',
            opacity: 0,
            transition: 'opacity var(--transition-fast)',
            zIndex: 10
          }}
        >
          {/* Reaction trigger */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="React"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <IconSmile size={16} />
          </button>

          {/* Reply in thread */}
          <button
            type="button"
            onClick={() => onOpenThread(message)}
            title="Reply in thread"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <IconReply size={16} />
          </button>

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => togglePin(message.id)}
            title={isPinned ? 'Unpin message' : 'Pin message'}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              borderRadius: 'var(--radius-xs)',
              color: isPinned ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <IconPin size={16} />
          </button>

          {/* Author actions */}
          {isAuthor ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Edit message"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <IconEdit size={16} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title="Delete message"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--status-danger)',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <IconTrash size={16} />
              </button>
            </>
          ) : (
            /* Report content */
            <button
              type="button"
              onClick={() => onReport(message)}
              title="Report content to moderators"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <IconAlertCircle size={16} />
            </button>
          )}

          {/* Quick Emoji Picker Popover */}
          {showEmojiPicker && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                padding: '4px 6px',
                display: 'flex',
                gap: '4px',
                zIndex: 20
              }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleToggleReaction(emoji)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
