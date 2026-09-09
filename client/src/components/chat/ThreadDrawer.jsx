import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import MessageItem from './MessageItem.jsx';
import MessageComposer from './MessageComposer.jsx';
import { IconX } from '../common/Icons.jsx';

export default function ThreadDrawer({ onReport }) {
  const { activeThread, threadMessages, loadingThread, closeThread } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threadMessages]);

  if (!activeThread) return null;

  return (
    <aside
      style={{
        width: '380px',
        backgroundColor: 'var(--bg-canvas)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 30
      }}
    >
      {/* WhatsApp Thread Header */}
      <div
        style={{
          height: '60px',
          padding: '10px 16px',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={closeThread}
            title="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <IconX size={20} />
          </button>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
              Thread replies
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {activeThread.sender_full_name || activeThread.sender_username}
            </span>
          </div>
        </div>
      </div>

      {/* Thread Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {/* Parent Message */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '8px' }}>
          <MessageItem
            message={activeThread}
            onOpenThread={() => {}}
            onReport={onReport}
          />
        </div>

        {/* Replies List */}
        <div
          style={{
            padding: '4px 24px 8px 24px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
        </div>

        {loadingThread ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Loading replies...
          </div>
        ) : (
          threadMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onOpenThread={() => {}}
              onReport={onReport}
            />
          ))
        )}
        <div ref={bottomRef} style={{ height: '4px' }} />
      </div>

      {/* Reply Composer */}
      <div style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
        <MessageComposer
          placeholder="Reply in thread..."
          replyToMessageId={activeThread.id}
        />
      </div>
    </aside>
  );
}
