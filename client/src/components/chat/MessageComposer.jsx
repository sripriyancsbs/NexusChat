import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { socketClient } from '../../services/socket.js';
import { IconSend, IconSmile } from '../common/Icons.jsx';

const EMOJIS = ['👍', '🔥', '🚀', '❤️', '🎉', '💡', '✨', '⚡'];

export default function MessageComposer({ placeholder, replyToMessageId = null }) {
  const { activeConversationId, sendMessage, typingMap, activeConversation } = useChat();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  const isChannel = activeConversation?.type === 'CHANNEL' || Boolean(activeConversation?.name);
  const defaultPlaceholder = isChannel
    ? `Transmit signal to #${activeConversation?.name || 'channel'}...`
    : `Direct signal to ${activeConversation?.other_user?.full_name || activeConversation?.other_user?.username || 'user'}...`;

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
    <div style={{ padding: '0 24px 20px 24px', flexShrink: 0, position: 'relative' }}>
      {/* Live Waveform Indicator */}
      <div
        style={{
          minHeight: '22px',
          fontSize: '0.725rem',
          color: 'var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px'
        }}
      >
        {typingUsers.length > 0 && (
          <>
            <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
              <span style={{ width: '4px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--accent-cyan)', animation: 'pulse 0.8s infinite' }} />
              <span style={{ width: '4px', height: '14px', borderRadius: '2px', backgroundColor: 'var(--accent-cyan)', animation: 'pulse 0.8s infinite 0.2s' }} />
              <span style={{ width: '4px', height: '6px', borderRadius: '2px', backgroundColor: 'var(--accent-cyan)', animation: 'pulse 0.8s infinite 0.4s' }} />
            </span>
            <span>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} transmitting...
            </span>
          </>
        )}
      </div>

      {/* Floating Modern Capsule Composer */}
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all var(--transition-fast)'
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder || defaultPlaceholder}
          value={content}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '14px 18px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.925rem',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '180px',
            lineHeight: 1.5
          }}
        />

        {/* Action Dock inside Composer */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--bg-canvas)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Emoji & Quick Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Insert Emoji"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem'
              }}
            >
              <IconSmile size={15} />
              <span className="hide-sm">Emoji</span>
            </button>

            {/* Emoji popover */}
            {showEmojiPicker && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '10px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
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
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transmit Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} className="hide-sm">
              Press ↵ Enter
            </span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!content.trim() || sending}
              className="btn btn-primary"
              style={{
                padding: '8px 18px',
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-full)',
                gap: '8px',
                opacity: !content.trim() || sending ? 0.45 : 1
              }}
            >
              <IconSend size={14} />
              <span>Transmit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
