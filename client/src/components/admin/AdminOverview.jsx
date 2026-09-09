import React from 'react';
import { IconUsers, IconShield, IconKey, IconAlertCircle, IconCheck } from '../common/Icons.jsx';

export default function AdminOverview({ dashboard, onNavigateTab }) {
  const metrics = [
    {
      title: 'Active Members',
      value: dashboard?.activeUsers ?? 0,
      total: `${dashboard?.totalUsers ?? 0} total accounts`,
      color: 'var(--status-success)',
      icon: <IconUsers size={22} />,
      tab: 'USERS'
    },
    {
      title: 'Pending Requests',
      value: dashboard?.pendingRequests ?? 0,
      total: 'Awaiting administrator review',
      color: dashboard?.pendingRequests > 0 ? 'var(--status-warning)' : 'var(--text-secondary)',
      icon: <IconKey size={22} />,
      tab: 'REQUESTS'
    },
    {
      title: 'Active Sessions',
      value: dashboard?.activeSessions ?? 0,
      total: 'Current live authenticated tokens',
      color: 'var(--accent-primary)',
      icon: <IconShield size={22} />,
      tab: 'SESSIONS'
    },
    {
      title: 'Suspended Accounts',
      value: dashboard?.suspendedUsers ?? 0,
      total: 'Restricted from platform access',
      color: dashboard?.suspendedUsers > 0 ? 'var(--status-danger)' : 'var(--text-secondary)',
      icon: <IconAlertCircle size={22} />,
      tab: 'USERS'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metrics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {metrics.map((m, idx) => (
          <div
            key={idx}
            onClick={() => onNavigateTab(m.tab)}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {m.title}
              </span>
              <div style={{ color: m.color }}>{m.icon}</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '6px' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {m.total}
            </div>
          </div>
        ))}
      </div>

      {/* Security Architecture & Boundary Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ color: 'var(--accent-cyan)' }}>
            <IconShield size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
            Administrative Boundary &amp; Privacy Model
          </h3>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
          NexusChat is designed around strict relational privacy boundaries. Administrators manage user accounts, authentication sessions, access requests, and platform security. General administrators have <strong>zero arbitrary access</strong> to private conversation or direct message content.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--status-success)', marginBottom: '4px' }}>
              ✓ Strict Audit Logging
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              System audit logs track role promotions, suspensions, logins, and session terminations without recording message bodies.
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              🔒 Isolated Moderation
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Message inspection is strictly restricted to tickets explicitly submitted by members to report abuse or community violations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
