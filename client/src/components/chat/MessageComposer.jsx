import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { socketClient } from '../../services/socket.js';
import { IconSend, IconSmile } from '../common/Icons.jsx';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '💡', '✨'];

export default function MessageComposer({ placeholder, replyToMessageId = null }) {
  const { activeConversationId, sendMessage, typingMap, activeConversation } = useChat();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

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
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Typing Indicator Bar */}
      {typingUsers.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            left: '20px',
            fontSize: '0.75rem',
            color: 'var(--whatsapp-green)',
            backgroundColor: 'var(--bg-elevated)',
            padding: '2px 10px',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* WhatsApp Bottom Composer Bar */}
      <div className="whatsapp-composer-bar">
        {/* Emoji Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="Emoji"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconSmile size={24} />
          </button>

          {/* Emoji popover */}
          {showEmojiPicker && (
            <div
              style={{
                position: 'absolute',
                bottom: '50px',
                left: '0',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                zIndex: 40
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
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Pill */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-active)',
            borderRadius: '8px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder || 'Type a message'}
            value={content}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-sans)',
              resize: 'none',
              maxHeight: '120px',
              lineHeight: 1.4
            }}
          />
        </div>

        {/* Circular Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || sending}
          title="Send"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: content.trim() ? 'var(--accent-primary)' : 'transparent',
            color: content.trim() ? '#ffffff' : 'var(--text-secondary)',
            border: 'none',
            cursor: content.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color var(--transition-fast)',
            flexShrink: 0
          }}
        >
          <IconSend size={18} />
        </button>
      </div>
    </div>
  );
}
