import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { socketClient } from '../../services/socket.js';
import { IconSend, IconSmile } from '../common/Icons.jsx';

const EMOJIS = ['👍', '❤️', '🔥', '🚀', '🎉', '😊', '💡', '✅'];

export default function MessageComposer({ placeholder, replyToMessageId = null }) {
  const { activeConversationId, sendMessage, typingMap, activeConversation } = useChat();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  const isChannel = activeConversation?.type === 'CHANNEL' || Boolean(activeConversation?.name);
  const defaultPlaceholder = isChannel
    ? `Message #${activeConversation?.name || 'channel'}`
    : `Message ${activeConversation?.other_user?.full_name || activeConversation?.other_user?.username || 'user'}`;

  // Get active typing users for this conversation
  const typingUsers = typingMap[activeConversationId] || [];

  const handleTyping = (text) => {
    setContent(text);

    // Emit typing indicator
    if (activeConversationId) {
      socketClient.setTyping(activeConversationId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socketClient.setTyping(activeConversationId, false);
      }, 2500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    const msgText = content.trim();
    setContent('');
    setSending(true);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    socketClient.setTyping(activeConversationId, false);

    try {
      await sendMessage(msgText, replyToMessageId);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setContent(msgText); // Restore on error
    } finally {
      setSending(false);
    }
  };

  const handleAddEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div style={{ padding: '0 20px 16px 20px', flexShrink: 0, position: 'relative' }}>
      {/* Typing indicator banner */}
      <div
        style={{
          minHeight: '20px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px'
        }}
      >
        {typingUsers.length > 0 && (
          <>
            <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
              <span className="dot" style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
              <span className="dot" style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
              <span className="dot" style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
            </span>
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </>
        )}
      </div>

      {/* Composer Input Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'border-color var(--transition-fast)'
        }}
        onFocus={() => {
          const el = document.getElementById('composer-box');
          if (el) el.style.borderColor = 'var(--accent-primary)';
        }}
      >
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          rows={1}
          placeholder={placeholder || defaultPlaceholder}
          value={content}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '180px',
            lineHeight: 1.5
          }}
        />

        {/* Composer Toolbar */}
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--bg-canvas)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Left formatting & emoji */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Insert Emoji"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <IconSmile size={16} />
            </button>

            {/* Emoji popover */}
            {showEmojiPicker && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '8px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '6px',
                  display: 'flex',
                  gap: '6px',
                  zIndex: 20
                }}
              >
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right send button & keyboard hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} className="hide-sm">
              ↵ to send
            </span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!content.trim() || sending}
              className="btn btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                opacity: !content.trim() || sending ? 0.5 : 1
              }}
            >
              <IconSend size={14} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
