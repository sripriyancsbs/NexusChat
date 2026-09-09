import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { socketClient } from '../../services/socket.js';
import { IconSend, IconSmile } from '../common/Icons.jsx';

const EMOJIS = ['👍', '❤️', '🔥', '🎉', '🚀', '💡', '✨', '⚡'];

export default function MessageComposer({ placeholder, replyToMessageId = null }) {
  const { activeConversationId, sendMessage, typingMap, activeConversation } = useChat();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  const formatName = (name) => {
    if (!name) return '';
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const isChannel = activeConversation?.type === 'CHANNEL' || Boolean(activeConversation?.name);
  const defaultPlaceholder = isChannel
    ? `Message #${formatName(activeConversation?.name) || 'channel'}...`
    : `Message @${activeConversation?.other_user?.full_name || activeConversation?.other_user?.username || 'user'}...`;

  const typingUsers = typingMap[activeConversationId] || [];

  const handleTyping = (text) => {
    setContent(text);

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
      setContent(msgText);
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
    <div style={{ padding: '0 18px 14px 18px', flexShrink: 0, position: 'relative' }}>
      {/* Typing Indicator */}
      <div
        style={{
          minHeight: '18px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px'
        }}
      >
        {typingUsers.length > 0 && (
          <span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        )}
      </div>

      {/* Modern Composer Card */}
      <div className="broadcast-console">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder || defaultPlaceholder}
          value={content}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '140px',
            lineHeight: 1.5
          }}
        />

        {/* Action Dock */}
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomLeftRadius: 'var(--radius-md)',
            borderBottomRightRadius: 'var(--radius-md)'
          }}
        >
          {/* Left Actions: Emoji */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Add Emoji"
              className="btn btn-secondary"
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                gap: '4px'
              }}
            >
              <IconSmile size={14} />
              <span className="hide-sm">Emoji</span>
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
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                  display: 'flex',
                  gap: '4px',
                  zIndex: 30
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
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      padding: '3px',
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

          {/* Right Action: Send */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)'
              }}
              className="hide-sm"
            >
              Press Enter to send
            </span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!content.trim() || sending}
              className="btn btn-primary"
              style={{
                padding: '5px 12px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--radius-sm)',
                gap: '6px',
                opacity: !content.trim() || sending ? 0.45 : 1
              }}
            >
              <IconSend size={13} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
