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

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

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
    if (window.confirm('Delete message?')) {
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
        padding: '2px 24px',
        display: 'flex',
        position: 'relative'
      }}
    >
      {/* WhatsApp Message Bubble */}
      <div
        className={`dialogue-bubble ${isAuthor ? 'me' : 'them'} ${isPinned ? 'pinned' : ''}`}
        style={{ position: 'relative' }}
      >
        {/* Sender Name for group incoming messages */}
        {!isAuthor && (
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{message.sender_full_name || message.sender_username}</span>
            {message.sender_role === 'admin' && (
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: '#f43f5e',
                  fontWeight: 500
                }}
              >
                Admin
              </span>
            )}
          </div>
        )}

        {/* Pinned Tag */}
        {isPinned && (
          <div
            style={{
              fontSize: '0.6875rem',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '2px'
            }}
          >
            <IconPin size={10} /> Pinned
          </div>
        )}

        {/* Message Text / Edit Input */}
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
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                fontSize: '0.9375rem',
                color: '#ffffff'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
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
          <div style={{ wordBreak: 'break-word', display: 'inline' }}>
            <span
              style={{
                fontSize: '0.9375rem',
                fontStyle: isDeleted ? 'italic' : 'normal',
                color: isDeleted ? 'var(--text-secondary)' : 'inherit'
              }}
            >
              {isDeleted ? '🚫 This message was deleted' : message.content}
            </span>

            {/* Inline WhatsApp Timestamp and Blue Checks */}
            <span className="bubble-meta">
              <span>{formattedTime}</span>
              {message.is_edited && !isDeleted && <span>(edited)</span>}
              {isAuthor && (
                <span style={{ color: 'var(--whatsapp-blue-check)', fontSize: '0.85rem', fontWeight: 700, marginLeft: '2px' }}>
                  ✓✓
                </span>
              )}
            </span>
          </div>
        )}

        {/* WhatsApp Quoted Reply / Thread Branch */}
        {!isDeleted && message.reply_count > 0 && (
          <div
            onClick={() => onOpenThread(message)}
            style={{
              marginTop: '6px',
              padding: '4px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              borderLeft: '3px solid var(--accent-primary)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78125rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <IconReply size={12} />
              <span>{message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}</span>
            </span>
            <span style={{ fontSize: '0.6875rem', opacity: 0.8 }}>View thread →</span>
          </div>
        )}

        {/* Reactions floating capsule */}
        {!isDeleted && message.reactions && message.reactions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: isAuthor ? 'auto' : '8px',
              right: isAuthor ? '8px' : 'auto',
              display: 'flex',
              gap: '2px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '1px 6px',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 5
            }}
          >
            {message.reactions.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleToggleReaction(r.reaction)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: '1px 3px'
                }}
              >
                <span>{r.reaction}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  {r.count > 1 ? r.count : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Hover Action Menu Capsule */}
        {!isDeleted && !isEditing && (
          <div className="message-action-capsule">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="React"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '3px 5px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex'
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
                display: 'flex'
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
                display: 'flex'
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
                    display: 'flex'
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
                    color: '#f43f5e',
                    cursor: 'pointer',
                    display: 'flex'
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
                  color: '#f43f5e',
                  cursor: 'pointer',
                  display: 'flex'
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
              top: '-40px',
              right: isAuthor ? '0' : 'auto',
              left: isAuthor ? 'auto' : '0',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              gap: '4px',
              padding: '4px 8px',
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
                  padding: '2px',
                  transition: 'transform var(--transition-fast)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
