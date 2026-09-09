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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '8px' }}>Restricted Area</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Access to the Platform Administration Command Center is strictly restricted to accounts with the <strong>ADMIN</strong> role.
          </p>
          <button type="button" onClick={onNavigateChat} className="btn btn-primary">
            Return to Community Chat
          </button>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'OVERVIEW', label: 'Telemetry & Grid', icon: <IconShield size={16} /> },
    { id: 'USERS', label: 'Identities & Roles', icon: <IconUsers size={16} /> },
    {
      id: 'REQUESTS',
      label: 'Access Clearance',
      icon: <IconKey size={16} />,
      badge: dashboard?.pendingRequests > 0 ? dashboard.pendingRequests : null
    },
    { id: 'SESSIONS', label: 'Active Tokens', icon: <IconShield size={16} /> },
    { id: 'AUDIT', label: 'Audit Trail', icon: <IconShield size={16} /> },
    { id: 'REPORTS', label: 'Moderation Tickets', icon: <IconAlertCircle size={16} /> }
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
      {/* Cybernetic Admin Header */}
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--status-danger), var(--accent-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 0 16px rgba(255, 51, 102, 0.3)'
              }}
            >
              ✦
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                Nexus Governance
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--status-danger)', marginLeft: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                SEC-COMMAND
              </span>
            </div>
          </div>

          <span
            className="privacy-badge"
            style={{
              borderColor: 'rgba(255, 51, 102, 0.4)',
              backgroundColor: 'rgba(255, 51, 102, 0.12)',
              color: 'var(--status-danger)',
              fontSize: '0.75rem'
            }}
          >
            🔒 Privacy Barrier Enforced: Message Bodies Inaccessible
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onNavigateChat}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '7px 16px', borderRadius: 'var(--radius-full)' }}
          >
            ← Back to Chat Workspace
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title="Toggle theme"
            className="btn-outline"
            style={{ padding: '8px', borderRadius: 'var(--radius-md)' }}
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          <button
            type="button"
            onClick={logout}
            title="Log Out"
            className="btn-outline"
            style={{ padding: '8px', borderRadius: 'var(--radius-md)', color: 'var(--status-danger)' }}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </header>

      {/* Cyber Tab Bar */}
      <nav
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 28px',
          display: 'flex',
          gap: '6px',
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
                padding: '14px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
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
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--status-danger)',
                    color: '#ffffff',
                    fontWeight: 800
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Content Canvas */}
      <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
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
