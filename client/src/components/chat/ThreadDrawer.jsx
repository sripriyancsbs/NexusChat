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
      className="thread-drawer"
      style={{
        width: '360px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        zIndex: 50
      }}
    >
      {/* Thread Header */}
      <div
        style={{
          height: '56px',
          padding: '0 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Thread</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            with {activeThread.sender_full_name || activeThread.sender_username}
          </span>
        </div>
        <button
          type="button"
          onClick={closeThread}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex'
          }}
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Thread Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {/* Parent Message */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '12px' }}>
          <MessageItem
            message={activeThread}
            onOpenThread={() => {}}
            onReport={onReport}
          />
        </div>

        {/* Replies Header */}
        <div
          style={{
            padding: '0 16px 8px 16px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {threadMessages.length} {threadMessages.length === 1 ? 'Reply' : 'Replies'}
        </div>

        {loadingThread ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
        <div ref={bottomRef} style={{ height: '1px' }} />
      </div>

      {/* Reply Input */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <MessageComposer
          placeholder="Reply in thread..."
          replyToMessageId={activeThread.id}
        />
      </div>
    </aside>
  );
}
