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
          gap: '12px'
        }}
      >
        <span style={{ fontSize: '1.5rem', animation: 'pulse 1.5s infinite' }}>✦</span>
        <span style={{ fontSize: '0.85rem' }}>Synchronizing stream telemetry...</span>
      </div>
    );
  }

  const isChannel = activeConversation?.type === 'CHANNEL' || Boolean(activeConversation?.name);
  const title = isChannel
    ? activeConversation?.name
    : activeConversation?.other_user?.full_name || activeConversation?.other_user?.username || 'Direct Stream';

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
        padding: '20px 0'
      }}
    >
      {/* Nexus Stream Anchor Card */}
      <div
        style={{
          margin: '20px 24px 28px 24px',
          padding: '28px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(13, 245, 196, 0.04) 0%, rgba(124, 58, 237, 0.06) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            top: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 245, 196, 0.15) 0%, transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--grad-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06090f',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: 'var(--glow-cyan)'
            }}
          >
            {isChannel ? (activeConversation?.is_private ? <IconLock size={20} /> : '⌗') : '◎'}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isChannel ? 'TRANSMISSION NODE' : 'ENCRYPTED DIRECT STREAM'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              {isChannel ? `${title}` : title}
            </h2>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '650px', margin: 0 }}>
          {isChannel
            ? activeConversation?.topic || 'This transmission node is ready for communications. Messages broadcast to members in real-time.'
            : 'Direct stream established. All communication between participants is private and isolated from platform administrative browsing.'}
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
                margin: '18px 24px',
                gap: '14px'
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-default), transparent)' }} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  padding: '3px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {item.date}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-default), transparent)' }} />
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
