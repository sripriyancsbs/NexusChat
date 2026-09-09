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
      className="bento-panel thread-drawer"
      style={{
        width: '360px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 50
      }}
    >
      {/* Thread Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              margin: 0,
              color: 'var(--text-primary)'
            }}
          >
            Thread
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Started by {activeThread.sender_full_name || activeThread.sender_username}
          </span>
        </div>

        <button
          type="button"
          onClick={closeThread}
          title="Close Thread"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-xs)',
            display: 'flex'
          }}
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Thread Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {/* Parent Message Card */}
        <div
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '10px',
            marginBottom: '10px'
          }}
        >
          <MessageItem
            message={activeThread}
            onOpenThread={() => {}}
            onReport={onReport}
          />
        </div>

        {/* Replies Header */}
        <div
          style={{
            padding: '0 18px 6px 18px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Replies ({threadMessages.length})</span>
          {loadingThread && <span style={{ color: 'var(--accent-primary)' }}>Loading...</span>}
        </div>

        {loadingThread ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
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

      {/* Reply Input */}
      <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '8px' }}>
        <MessageComposer
          placeholder="Reply in thread..."
          replyToMessageId={activeThread.id}
        />
      </div>
    </aside>
  );
}
