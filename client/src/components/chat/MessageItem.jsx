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

const QUICK_EMOJIS = ['👍', '🔥', '🚀', '❤️', '💡', '✨'];

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
    if (window.confirm('Delete this message?')) {
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
        gap: '14px',
        padding: '10px 20px',
        margin: '3px 12px',
        borderRadius: 'var(--radius-md)',
        transition: 'all var(--transition-fast)',
        backgroundColor: isPinned ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
        border: isPinned ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!isDeleted) {
          e.currentTarget.style.backgroundColor = isPinned ? 'rgba(124, 58, 237, 0.12)' : 'var(--bg-hover)';
          e.currentTarget.style.borderColor = isPinned ? 'rgba(124, 58, 237, 0.4)' : 'var(--border-subtle)';
        }
        const toolbar = e.currentTarget.querySelector('.message-toolbar');
        if (toolbar) toolbar.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isPinned ? 'rgba(124, 58, 237, 0.08)' : 'transparent';
        e.currentTarget.style.borderColor = isPinned ? 'rgba(124, 58, 237, 0.3)' : 'transparent';
        const toolbar = e.currentTarget.querySelector('.message-toolbar');
        if (toolbar) toolbar.style.opacity = '0';
        setShowEmojiPicker(false);
      }}
    >
      {/* Sender Squircle Avatar */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(13, 245, 196, 0.2), rgba(124, 58, 237, 0.25))',
          border: '1px solid var(--border-default)',
          color: 'var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.95rem',
          flexShrink: 0
        }}
      >
        {(message.sender_full_name || message.sender_username || 'U')[0].toUpperCase()}
      </div>

      {/* Message Body Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}
          >
            {message.sender_full_name || message.sender_username}
          </span>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)'
            }}
          >
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {message.is_edited && !isDeleted && (
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>[edited]</span>
          )}

          {isPinned && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                color: 'var(--accent-violet)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <IconPin size={10} /> PINNED
            </span>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div style={{ marginTop: '8px' }}>
            <textarea
              className="input"
              rows="2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ width: '100%', marginBottom: '8px', backgroundColor: 'var(--bg-elevated)' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                <IconCheck size={14} /> Update
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                <IconX size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.925rem',
              color: isDeleted ? 'var(--text-muted)' : 'var(--text-primary)',
              fontStyle: isDeleted ? 'italic' : 'normal',
              lineHeight: 1.55,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {message.content}
          </div>
        )}

        {/* Neon Reaction Pods */}
        {!isDeleted && message.reactions && message.reactions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
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
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: hasReacted ? 'var(--accent-cyan-subtle)' : 'var(--bg-elevated)',
                    border: hasReacted ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    color: hasReacted ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{r.reaction}</span>
                  <span style={{ fontWeight: 700 }}>{r.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Thread replies pill */}
        {!isDeleted && message.reply_count > 0 && (
          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => onOpenThread(message)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(124, 58, 237, 0.15)',
                border: '1px solid rgba(124, 58, 237, 0.35)',
                color: 'var(--accent-violet)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <IconReply size={12} />
              <span>{message.reply_count} {message.reply_count === 1 ? 'Reply Stream' : 'Reply Streams'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Translucent Capsule Dock on Hover */}
      {!isDeleted && !isEditing && (
        <div
          className="message-toolbar"
          style={{
            position: 'absolute',
            right: '20px',
            top: '-12px',
            backgroundColor: 'var(--glass-elevated)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            padding: '3px 8px',
            gap: '4px',
            opacity: 0,
            transition: 'opacity var(--transition-fast)',
            zIndex: 10
          }}
        >
          {/* Reaction trigger */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="React with emoji"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '5px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <IconSmile size={15} />
          </button>

          {/* Reply in thread */}
          <button
            type="button"
            onClick={() => onOpenThread(message)}
            title="Open reply thread"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '5px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <IconReply size={15} />
          </button>

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => togglePin(message.id)}
            title={isPinned ? 'Unpin message' : 'Pin message'}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '5px',
              borderRadius: 'var(--radius-full)',
              color: isPinned ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <IconPin size={15} />
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
                  padding: '5px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <IconEdit size={15} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title="Delete message"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '5px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--status-danger)',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <IconTrash size={15} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onReport(message)}
              title="Report content"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '5px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <IconAlertCircle size={15} />
            </button>
          )}

          {/* Quick Emoji Picker Popover */}
          {showEmojiPicker && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px 8px',
                display: 'flex',
                gap: '6px',
                zIndex: 30
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
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'transform var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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
