import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { socketClient } from '../../services/socket.js';
import {
  IconSend,
  IconSmile,
  IconPaperclip
} from '../common/Icons.jsx';

const EMOJIS = ['👍', '❤️', '🔥', '🎉', '🚀', '💡', '✨', '⚡', '😍', '👏', '🙌', '💯'];

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
    ? `Message ${formatName(activeConversation?.name) || 'space'}...`
    : `Message ${activeConversation?.other_user?.full_name || activeConversation?.other_user?.username || 'user'}...`;

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
      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '-22px',
            left: '32px',
            fontSize: '0.75rem',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      {/* Modern Instagram Direct Floating Pill Deck */}
      <div className="floating-composer-deck">
        {/* Emoji Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="Emoji Picker"
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <IconSmile size={19} />
          </button>

          {/* Emoji Popover */}
          {showEmojiPicker && (
            <div
              style={{
                position: 'absolute',
                bottom: '48px',
                left: '0',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
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
                    borderRadius: '6px',
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

        {/* Attachment & Media Button */}
        <button
          type="button"
          onClick={() => alert('Attachments encrypted and isolated.')}
          title="Share Photos & Media"
          className="btn-icon"
          style={{ width: '32px', height: '32px' }}
        >
          <IconPaperclip size={18} />
        </button>

        {/* Input Textarea */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder || defaultPlaceholder}
            value={content}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.90625rem',
              fontFamily: 'var(--font-sans)',
              resize: 'none',
              maxHeight: '120px',
              lineHeight: 1.45,
              padding: '4px 0'
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || sending}
          title="Send Message (Enter)"
          className="btn btn-primary"
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem',
            gap: '6px',
            flexShrink: 0,
            background: 'var(--theme-bubble, var(--accent-primary))',
            boxShadow: 'var(--theme-bubble-shadow, 0 2px 8px rgba(0, 122, 204, 0.4))',
            opacity: !content.trim() || sending ? 0.45 : 1,
            cursor: !content.trim() || sending ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <IconSend size={13} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
