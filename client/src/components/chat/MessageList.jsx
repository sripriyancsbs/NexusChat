import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import MessageItem from './MessageItem.jsx';
import { IconHash, IconLock, IconUsers } from '../common/Icons.jsx';

export default function MessageList({ onOpenThread, onReport }) {
  const { messages, loadingMessages, activeConversation } = useChat();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when messages change
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
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}
      >
        Loading messages...
      </div>
    );
  }

  const isChannel = activeConversation?.type === 'CHANNEL' || Boolean(activeConversation?.name);
  const title = isChannel
    ? activeConversation?.name
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
      {/* Welcome Conversation Header */}
      <div style={{ padding: '24px 20px', marginBottom: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}
        >
          {isChannel ? (
            activeConversation?.is_private ? <IconLock size={24} /> : <IconHash size={24} />
          ) : (
            <IconUsers size={24} />
          )}
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
          {isChannel ? `Welcome to #${title}!` : `Conversation with ${title}`}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
          {isChannel
            ? activeConversation?.topic || 'This is the start of the channel. Send a message to start communicating with the team.'
            : 'This is the start of your direct messaging history. Direct messages are private between participating members and inaccessible to general administrative browsing.'}
        </p>
      </div>

      {/* Messages Feed */}
      {grouped.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <div
              key={`date-${item.date}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 20px',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
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

      <div ref={bottomRef} style={{ height: '1px' }} />
    </div>
  );
}
