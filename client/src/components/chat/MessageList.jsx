import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import MessageItem from './MessageItem.jsx';

export default function MessageList({ onOpenThread, onReport }) {
  const { messages, loadingMessages, activeConversation } = useChat();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loadingMessages) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>✦</span>
        <span style={{ fontSize: '0.875rem' }}>Loading messages...</span>
      </div>
    );
  }

  // Group messages by date
  const grouped = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (msgDate !== currentDate) {
      currentDate = msgDate;
      grouped.push({ type: 'divider', date: msgDate });
    }
    grouped.push({ type: 'message', data: msg });
  });

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* WhatsApp Iconic End-to-End Encryption Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '8px 24px 16px 24px'
        }}
      >
        <div className="whatsapp-privacy-pill">
          <span>🔒</span>
          <span>
            Messages are end-to-end encrypted. No one outside of this chat, not even platform administrators, can read or listen to them.
          </span>
        </div>
      </div>

      {/* Message Feed Items */}
      {grouped.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <div
              key={`date-${item.date}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '12px 0'
              }}
            >
              <div className="whatsapp-date-chip">
                {item.date}
              </div>
            </div>
          );
        }

        return (
          <MessageItem
            key={item.data.id}
            message={item.data}
            onOpenThread={onOpenThread}
            onReport={onReport}
          />
        );
      })}

      <div ref={bottomRef} style={{ height: '4px' }} />
    </div>
  );
}
