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
        <span style={{ fontSize: '1.8rem', color: 'var(--cyber-cyan)', animation: 'pulseSlow 1.5s infinite' }}>✦</span>
        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          SYNCHRONIZING STREAM TELEMETRY...
        </span>
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
        padding: '16px 0'
      }}
    >
      {/* Frequency Anchor Beacon Card */}
      <div
        style={{
          margin: '12px 20px 24px 20px',
          padding: '22px',
          backgroundColor: 'rgba(16, 23, 43, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            top: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-xs)',
              background: 'linear-gradient(135deg, var(--cyber-cyan), var(--cyber-amber))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#050810',
              fontWeight: 900,
              fontSize: '1.1rem',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)'
            }}
          >
            {isChannel ? (activeConversation?.is_private ? <IconLock size={18} /> : '⚡') : '◎'}
          </div>

          <div>
            <div
              style={{
                fontSize: '0.675rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--cyber-cyan)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              {isChannel ? 'FREQUENCY BEACON // ONLINE' : 'DIRECT CIPHER STREAM'}
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              {isChannel ? `${title.toUpperCase()}` : title}
            </h2>
          </div>
        </div>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.825rem',
            lineHeight: 1.5,
            maxWidth: '650px',
            margin: 0
          }}
        >
          {isChannel
            ? activeConversation?.topic || 'Frequency receptor online. Transmit data packets and voice waveforms with zero admin leakage.'
            : 'Encrypted direct node established. Communication is mathematically isolated from administrative observation.'}
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
                margin: '16px 20px',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)' }} />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(5, 8, 16, 0.7)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {item.date}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)' }} />
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
