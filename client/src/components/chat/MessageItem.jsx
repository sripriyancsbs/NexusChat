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

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🎉', '🚀', '💡'];

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
    if (window.confirm('Delete this message permanently?')) {
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

  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={`dialogue-pod ${isAuthor ? 'me' : 'them'}`}
      style={{
        padding: '2px 18px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start'
      }}
    >
      {/* Sender Avatar (Only on left for others) */}
      {!isAuthor && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '0.8125rem',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          {(message.sender_full_name || message.sender_username || 'U')[0].toUpperCase()}
        </div>
      )}

      {/* Message Card Bubble */}
      <div
        className={`dialogue-bubble ${isAuthor ? 'me' : 'them'} ${isPinned ? 'pinned' : ''}`}
        style={{ position: 'relative' }}
      >
        {/* Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isAuthor ? 'flex-end' : 'flex-start',
            gap: '8px',
            marginBottom: '4px'
          }}
        >
          {isAuthor ? (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-accent)'
              }}
            >
              You
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)'
                }}
              >
                {message.sender_full_name || message.sender_username}
              </span>

              {message.sender_role === 'admin' && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(244, 63, 94, 0.12)',
                    color: 'var(--accent-rose)',
                    fontWeight: 500
                  }}
                >
                  Admin
                </span>
              )}
            </div>
          )}

          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {formattedTime}
          </span>

          {message.is_edited && !isDeleted && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              (edited)
            </span>
          )}

          {isPinned && (
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '1px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <IconPin size={10} /> Pinned
            </span>
          )}
        </div>

        {/* Message Content */}
        {isEditing ? (
          <div style={{ marginTop: '4px' }}>
            <textarea
              className="input"
              rows="2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '6px',
                backgroundColor: 'var(--bg-canvas)',
                fontSize: '0.875rem'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '6px', justifyContent: isAuthor ? 'flex-end' : 'flex-start' }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn btn-primary"
                style={{ padding: '3px 10px', fontSize: '0.75rem' }}
              >
                <IconCheck size={12} /> Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                style={{ padding: '3px 10px', fontSize: '0.75rem' }}
              >
                <IconX size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.875rem',
              color: isDeleted ? 'var(--text-muted)' : 'var(--text-primary)',
              fontStyle: isDeleted ? 'italic' : 'normal',
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {isDeleted ? 'This message was deleted.' : message.content}
          </div>
        )}

        {/* Reactions List */}
        {!isDeleted && message.reactions && message.reactions.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginTop: '6px',
              justifyContent: isAuthor ? 'flex-end' : 'flex-start'
            }}
          >
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
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: hasReacted ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-elevated)',
                    border: hasReacted ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-default)',
                    color: hasReacted ? 'var(--text-accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{r.reaction}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.6875rem' }}>
                    {r.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Replies Link */}
        {!isDeleted && message.reply_count > 0 && (
          <div
            style={{
              marginTop: '6px',
              display: 'flex',
              justifyContent: isAuthor ? 'flex-end' : 'flex-start'
            }}
          >
            <button
              type="button"
              onClick={() => onOpenThread(message)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'var(--text-accent)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <IconReply size={12} />
              <span>
                {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          </div>
        )}

        {/* Hover Action Capsule */}
        {!isDeleted && !isEditing && (
          <div className="message-action-capsule">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="React with emoji"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '3px 5px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconSmile size={14} />
            </button>

            <button
              type="button"
              onClick={() => onOpenThread(message)}
              title="Reply in thread"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '3px 5px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconReply size={14} />
            </button>

            <button
              type="button"
              onClick={() => togglePin(message.id)}
              title={isPinned ? 'Unpin message' : 'Pin message'}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '3px 5px',
                color: isPinned ? 'var(--accent-amber)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconPin size={14} />
            </button>

            {isAuthor && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit message"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '3px 5px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <IconEdit size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  title="Delete message"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '3px 5px',
                    color: 'var(--accent-rose)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <IconTrash size={14} />
                </button>
              </>
            )}

            {!isAuthor && onReport && (
              <button
                type="button"
                onClick={() => onReport(message)}
                title="Report message"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '3px 5px',
                  color: 'var(--accent-rose)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <IconAlertCircle size={14} />
              </button>
            )}
          </div>
        )}

        {/* Emoji Selector Popup */}
        {showEmojiPicker && (
          <div
            style={{
              position: 'absolute',
              top: '-38px',
              right: '8px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              gap: '3px',
              padding: '4px 6px',
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
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: 'var(--radius-xs)',
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

      {/* Sender Avatar for Current User on right */}
      {isAuthor && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '0.8125rem',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          {(user?.full_name || user?.username || 'Y')[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}
