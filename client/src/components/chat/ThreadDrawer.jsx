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
        width: '380px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 50
      }}
    >
      {/* Branch Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: 'rgba(10, 15, 29, 0.7)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--cyber-cyan)', fontSize: '0.9rem' }}>↳</span>
          <div>
            <h3
              style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                letterSpacing: '0.04em',
                margin: 0,
                color: 'var(--text-primary)'
              }}
            >
              SUB-SIGNAL BRANCH
            </h3>
            <span style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ANCHOR: {activeThread.sender_full_name || activeThread.sender_username}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={closeThread}
          title="Close Branch"
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

      {/* Branch Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {/* Parent Anchor Message Card */}
        <div
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            marginBottom: '12px',
            backgroundColor: 'rgba(0, 240, 255, 0.03)'
          }}
        >
          <div
            style={{
              padding: '0 20px 6px 20px',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--cyber-cyan)',
              fontWeight: 700
            }}
          >
            [ANCHOR TRANSMISSION]
          </div>
          <MessageItem
            message={activeThread}
            onOpenThread={() => {}}
            onReport={onReport}
          />
        </div>

        {/* Sub-Signals Ticker Header */}
        <div
          style={{
            padding: '0 20px 8px 20px',
            fontSize: '0.675rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>SUB-SIGNALS [{threadMessages.length}]</span>
          {loadingThread && <span style={{ color: 'var(--cyber-cyan)' }}>SYNCHRONIZING...</span>}
        </div>

        {loadingThread ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            Polling branch packets...
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

      {/* Sub-Stream Broadcast Console */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <MessageComposer
          placeholder="Transmit sub-signal to branch..."
          replyToMessageId={activeThread.id}
        />
      </div>
    </aside>
  );
}
