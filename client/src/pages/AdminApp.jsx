import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../services/api.js';
import AdminOverview from '../components/admin/AdminOverview.jsx';
import AdminUsers from '../components/admin/AdminUsers.jsx';
import AdminAccessRequests from '../components/admin/AdminAccessRequests.jsx';
import AdminSessions from '../components/admin/AdminSessions.jsx';
import AdminAuditLogs from '../components/admin/AdminAuditLogs.jsx';
import AdminReports from '../components/admin/AdminReports.jsx';
import {
  IconShield,
  IconUsers,
  IconKey,
  IconAlertCircle,
  IconSun,
  IconMoon,
  IconLogOut
} from '../components/common/Icons.jsx';

export default function AdminApp({ onNavigateChat }) {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      api.getAdminDashboard()
        .then((res) => setDashboard(res))
        .catch((err) => console.error('Failed to load dashboard:', err))
        .finally(() => setLoadingDashboard(false));
    }
  }, [isAdmin, activeTab]);

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-canvas)',
          padding: '24px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 24px'
          }}
        >
          <div style={{ color: 'var(--status-danger)', marginBottom: '16px' }}>
            <IconAlertCircle size={48} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Restricted Administrative Area</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Access to the Platform Administration Portal is strictly restricted to accounts with the <strong>ADMIN</strong> role.
          </p>
          <button type="button" onClick={onNavigateChat} className="btn btn-primary">
            Return to Community Chat
          </button>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: <IconShield size={16} /> },
    { id: 'USERS', label: 'Users & Roles', icon: <IconUsers size={16} /> },
    {
      id: 'REQUESTS',
      label: 'Access Requests',
      icon: <IconKey size={16} />,
      badge: dashboard?.pendingRequests > 0 ? dashboard.pendingRequests : null
    },
    { id: 'SESSIONS', label: 'Active Sessions', icon: <IconShield size={16} /> },
    { id: 'AUDIT', label: 'Audit Trail', icon: <IconShield size={16} /> },
    { id: 'REPORTS', label: 'Moderation Queue', icon: <IconAlertCircle size={16} /> }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Admin Top Header */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--status-danger), var(--accent-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              A
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                NexusChat Admin
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                Platform Security &amp; Accounts
              </span>
            </div>
          </div>

          <span
            className="privacy-badge"
            style={{
              borderColor: 'rgba(244, 63, 94, 0.3)',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              color: 'var(--status-danger)',
              fontSize: '0.75rem'
            }}
          >
            🔒 Privacy Boundary Active: Private Messages Inaccessible
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onNavigateChat}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            ← Back to Chat Workspace
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme"
            className="btn-outline"
            style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          <button
            type="button"
            onClick={logout}
            title="Log Out"
            className="btn-outline"
            style={{ padding: '8px', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)' }}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </header>

      {/* Admin Tab Navigation Subheader */}
      <nav
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 24px',
          display: 'flex',
          gap: '4px',
          overflowX: 'auto'
        }}
      >
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--status-danger)',
                    color: '#ffffff',
                    fontWeight: 700
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Main Body */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'OVERVIEW' && (
          <AdminOverview dashboard={dashboard} onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'USERS' && <AdminUsers />}

        {activeTab === 'REQUESTS' && <AdminAccessRequests />}

        {activeTab === 'SESSIONS' && <AdminSessions />}

        {activeTab === 'AUDIT' && <AdminAuditLogs />}

        {activeTab === 'REPORTS' && <AdminReports />}
      </main>
    </div>
  );
}
