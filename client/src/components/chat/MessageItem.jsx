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

const QUICK_EMOJIS = ['👍', '🔥', '🚀', '❤️', '⚡', '💡'];

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
    if (window.confirm('Terminate transmission? This cannot be reversed.')) {
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
        padding: '2px 20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}
    >
      {/* Sender Avatar (Only shown on left for other operators) */}
      {!isAuthor && (
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(168, 85, 247, 0.25))',
            border: '1px solid var(--border-default)',
            color: 'var(--cyber-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          {(message.sender_full_name || message.sender_username || 'U')[0].toUpperCase()}
        </div>
      )}

      {/* Speech Pod Bubble */}
      <div
        className={`dialogue-bubble ${isAuthor ? 'me' : 'them'} ${isPinned ? 'pinned' : ''}`}
        style={{ position: 'relative' }}
      >
        {/* Pod Header Telemetry */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isAuthor ? 'flex-end' : 'flex-start',
            gap: '8px',
            marginBottom: '6px'
          }}
        >
          {isAuthor ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--cyber-cyan)',
                letterSpacing: '0.04em'
              }}
            >
              YOU [OPERATOR]
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em'
                }}
              >
                {message.sender_full_name || message.sender_username}
              </span>

              {message.sender_role === 'admin' && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(255, 45, 85, 0.15)',
                    color: 'var(--cyber-coral)',
                    border: '1px solid rgba(255, 45, 85, 0.3)',
                    fontWeight: 700
                  }}
                >
                  SYS-ADM
                </span>
              )}
            </div>
          )}

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.675rem',
              color: 'var(--text-muted)'
            }}
          >
            {formattedTime}
          </span>

          {message.is_edited && !isDeleted && (
            <span style={{ fontSize: '0.65rem', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-mono)' }}>
              [MOD]
            </span>
          )}

          {isPinned && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 7px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(255, 149, 0, 0.15)',
                color: 'var(--cyber-amber)',
                border: '1px solid rgba(255, 149, 0, 0.4)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <IconPin size={9} /> PINNED
            </span>
          )}
        </div>

        {/* Transmission Content */}
        {isEditing ? (
          <div style={{ marginTop: '4px' }}>
            <textarea
              className="input"
              rows="2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '8px',
                backgroundColor: 'rgba(5, 8, 16, 0.8)',
                fontSize: '0.875rem'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: isAuthor ? 'flex-end' : 'flex-start' }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn btn-primary"
                style={{ padding: '3px 12px', fontSize: '0.725rem' }}
              >
                <IconCheck size={12} /> Save Signal
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
                style={{ padding: '3px 12px', fontSize: '0.725rem' }}
              >
                <IconX size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.9rem',
              color: isDeleted ? 'var(--text-muted)' : 'var(--text-primary)',
              fontStyle: isDeleted ? 'italic' : 'normal',
              lineHeight: 1.55,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {isDeleted ? '⚡ Transmission signal redacted by operator.' : message.content}
          </div>
        )}

        {/* Neon Reaction Pods */}
        {!isDeleted && message.reactions && message.reactions.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '8px',
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
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: hasReacted ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                    border: hasReacted ? '1px solid var(--cyber-cyan)' : '1px solid var(--border-subtle)',
                    color: hasReacted ? 'var(--cyber-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{r.reaction}</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                    {r.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-Signal Branch Pill */}
        {!isDeleted && message.reply_count > 0 && (
          <div
            style={{
              marginTop: '8px',
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
                gap: '6px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: 'var(--cyber-cyan)',
                fontSize: '0.725rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <IconReply size={11} />
              <span>
                ↳ {message.reply_count} {message.reply_count === 1 ? 'SUB-SIGNAL' : 'SUB-SIGNALS'} // INSPECT
              </span>
            </button>
          </div>
        )}

        {/* Floating Message Action Capsule (Visible on Hover) */}
        {!isDeleted && !isEditing && (
          <div className="message-action-capsule">
            {/* Quick reaction toggle */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Add Reaction Pod"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconSmile size={14} />
            </button>

            {/* Sub-Signal Branch Reply */}
            <button
              type="button"
              onClick={() => onOpenThread(message)}
              title="Branch Sub-Signal"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconReply size={14} />
            </button>

            {/* Pin to Intel */}
            <button
              type="button"
              onClick={() => togglePin(message.id)}
              title={isPinned ? 'Unpin from Intel' : 'Pin to Intel'}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                color: isPinned ? 'var(--cyber-amber)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconPin size={14} />
            </button>

            {/* Author actions */}
            {isAuthor && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Modulate Signal (Edit)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-xs)',
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
                  title="Terminate Signal (Delete)"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--cyber-coral)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <IconTrash size={14} />
                </button>
              </>
            )}

            {/* Report violation for non-author */}
            {!isAuthor && onReport && (
              <button
                type="button"
                onClick={() => onReport(message)}
                title="Report Signal Violation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--cyber-coral)',
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

        {/* Emoji Selector Popup Pod */}
        {showEmojiPicker && (
          <div
            style={{
              position: 'absolute',
              top: '-42px',
              right: '10px',
              backgroundColor: 'rgba(10, 15, 29, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--cyber-cyan)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.25)',
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
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: 'var(--radius-xs)',
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

      {/* Sender Avatar for Current User on right */}
      {isAuthor && (
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(10, 15, 29, 0.9))',
            border: '1px solid var(--cyber-cyan)',
            color: 'var(--cyber-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
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
