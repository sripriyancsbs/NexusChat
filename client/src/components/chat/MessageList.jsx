import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import MessageItem from './MessageItem.jsx';
import { IconLock } from '../common/Icons.jsx';

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
          color: 'var(--text-muted)',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>✦</span>
        <span style={{ fontSize: '0.8125rem' }}>Loading messages...</span>
      </div>
    );
  }

  const formatName = (name) => {
    if (!name) return '';
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const isChannel = activeConversation?.type === 'CHANNEL' || Boolean(activeConversation?.name);
  const title = isChannel
    ? formatName(activeConversation?.name)
    : activeConversation?.other_user?.full_name || activeConversation?.other_user?.username || 'Direct Message';

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
        padding: '16px 0'
      }}
    >
      {/* Welcome Header */}
      <div
        style={{
          margin: '8px 18px 20px 18px',
          padding: '18px 20px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}
          >
            {isChannel ? (activeConversation?.is_private ? <IconLock size={16} /> : '#') : '@'}
          </div>

          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.125rem',
                fontWeight: 600,
                margin: 0,
                color: 'var(--text-primary)'
              }}
            >
              {isChannel ? `Welcome to #${title}` : `Conversation with ${title}`}
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isChannel ? 'Channel created for community interaction' : 'Private direct conversation'}
            </div>
          </div>
        </div>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
            maxWidth: '650px',
            margin: 0
          }}
        >
          {isChannel
            ? activeConversation?.topic || 'This is the start of the conversation. Messages posted here are real-time, persistent, and strictly isolated from platform administrators.'
            : 'Direct messages are private between you and this participant. Platform administrators cannot browse or inspect private message contents.'}
        </p>
      </div>

      {/* Message Feed Items */}
      {grouped.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <div
              key={`date-${item.date}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '14px 18px',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {item.date}
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
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
