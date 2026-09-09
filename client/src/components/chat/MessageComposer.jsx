import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { socketClient } from '../../services/socket.js';
import { IconSend, IconSmile } from '../common/Icons.jsx';

const EMOJIS = ['👍', '🔥', '🚀', '⚡', '❤️', '🎉', '💡', '✨'];

export default function MessageComposer({ placeholder, replyToMessageId = null }) {
  const { activeConversationId, sendMessage, typingMap, activeConversation } = useChat();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  const isChannel = activeConversation?.type === 'CHANNEL' || Boolean(activeConversation?.name);
  const defaultPlaceholder = isChannel
    ? `Transmit signal to #${activeConversation?.name || 'frequency'}... (Enter to broadcast)`
    : `Direct signal to ${activeConversation?.other_user?.full_name || activeConversation?.other_user?.username || 'operator'}...`;

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
    <div style={{ padding: '0 20px 16px 20px', flexShrink: 0, position: 'relative' }}>
      {/* Live Frequency Waveform Indicator */}
      <div
        style={{
          minHeight: '20px',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--cyber-cyan)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}
      >
        {typingUsers.length > 0 && (
          <>
            <span className="soundwave-indicator">
              <span className="soundwave-bar" />
              <span className="soundwave-bar" />
              <span className="soundwave-bar" />
            </span>
            <span>
              &gt;&gt; 📡 OPERATOR {typingUsers.join(', ').toUpperCase()} MODULATING SIGNAL...
            </span>
          </>
        )}
      </div>

      {/* Floating Cyber Broadcast Console */}
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
            padding: '12px 18px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '160px',
            lineHeight: 1.5
          }}
        />

        {/* Action Dock inside Console */}
        <div
          style={{
            padding: '6px 14px',
            backgroundColor: 'rgba(5, 8, 16, 0.65)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Emoji & Quick Signal Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Add Emoji Pod"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <IconSmile size={13} />
              <span className="hide-sm">EMOJI</span>
            </button>

            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--cyber-cyan)',
                opacity: 0.8,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0, 240, 255, 0.08)'
              }}
              className="hide-sm"
            >
              E2EE
            </span>

            {/* Emoji popover */}
            {showEmojiPicker && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '8px',
                  backgroundColor: 'rgba(10, 15, 29, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--cyber-cyan)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                  padding: '6px 8px',
                  display: 'flex',
                  gap: '6px',
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
                      fontSize: '1.15rem',
                      cursor: 'pointer',
                      padding: '2px',
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

          {/* Transmit Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.675rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}
              className="hide-sm"
            >
              ↵ ENTER
            </span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!content.trim() || sending}
              className="btn btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.775rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                letterSpacing: '0.04em',
                borderRadius: 'var(--radius-xs)',
                gap: '6px',
                opacity: !content.trim() || sending ? 0.45 : 1
              }}
            >
              <IconSend size={13} />
              <span>TRANSMIT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
