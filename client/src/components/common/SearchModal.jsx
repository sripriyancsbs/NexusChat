import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { api } from '../../services/api.js';
import { useChat } from '../../context/ChatContext.jsx';
import { IconSearch, IconHash, IconLock, IconUsers, IconMessageSquare } from './Icons.jsx';

export default function SearchModal({ isOpen, onClose }) {
  const { selectChannel, selectConversation } = useChat();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [results, setResults] = useState({ channels: [], messages: [], users: [] });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ channels: [], messages: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query.trim());
        setResults({
          channels: data.channels || [],
          messages: data.messages || [],
          users: data.users || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.channels.length + results.messages.length + results.users.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scoped Global Search"
      subtitle="Privacy-enforced: results strictly limited to channels and messages you have access to"
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <input
            autoFocus
            type="text"
            className="input"
            placeholder="Search channels, messages, or community members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '40px', fontSize: '1rem' }}
          />
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconSearch size={18} />
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          {['ALL', 'MESSAGES', 'CHANNELS', 'MEMBERS'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="btn"
              style={{
                padding: '4px 12px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === tab ? 'var(--accent-primary-subtle)' : 'transparent',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: activeTab === tab ? '1px solid var(--accent-primary)' : '1px solid transparent'
              }}
            >
              {tab === 'ALL' && `All (${totalResults})`}
              {tab === 'MESSAGES' && `Messages (${results.messages.length})`}
              {tab === 'CHANNELS' && `Channels (${results.channels.length})`}
              {tab === 'MEMBERS' && `Members (${results.users.length})`}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching workspace...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No accessible results found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Type a keyword to search across authorized messages, channels, and members.
            </div>
          )}

          {/* Messages */}
          {(activeTab === 'ALL' || activeTab === 'MESSAGES') && results.messages.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Messages ({results.messages.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.messages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      selectConversation(m.conversation_id);
                      onClose();
                    }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.sender_full_name || m.sender_username}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Channels */}
          {(activeTab === 'ALL' || activeTab === 'CHANNELS') && results.channels.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Channels ({results.channels.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.channels.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      selectChannel(c);
                      onClose();
                    }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        flexShrink: 0
                      }}
                    >
                      {c.is_private ? <IconLock size={15} /> : (c.name ? c.name[0].toUpperCase() : 'S')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {c.name}
                      </div>
                      {c.topic && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.topic}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {(activeTab === 'ALL' || activeTab === 'MEMBERS') && results.users.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Community Members ({results.users.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.users.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--accent-primary-subtle)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      {(u.full_name || u.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {u.full_name || u.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        @{u.username} • {u.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
