import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { IconSearch, IconRefreshCw } from '../common/Icons.jsx';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionError, setActionError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setActionError('');
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (roleFilter !== 'ALL') queryParams.append('role', roleFilter);
      if (search.trim()) queryParams.append('search', search.trim());

      const res = await api.getAdminUsers(queryParams.toString());
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setActionError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [statusFilter, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id) {
      alert('You cannot change your own administrative role.');
      return;
    }
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert(err.message || 'Failed to update role.');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (userId === currentUser?.id) {
      alert('You cannot modify your own administrative account status.');
      return;
    }
    try {
      await api.updateUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by username, full name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              style={{ paddingLeft: '36px' }}
            />
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            >
              <IconSearch size={16} />
            </div>
          </div>
          <button type="button" onClick={loadUsers} className="btn btn-secondary">
            Search
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Status Filter */}
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', backgroundColor: 'var(--bg-elevated)' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>

          {/* Role Filter */}
          <select
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: 'auto', backgroundColor: 'var(--bg-elevated)' }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
            <option value="MEMBER">Member</option>
          </select>

          <button
            type="button"
            onClick={loadUsers}
            title="Refresh list"
            className="btn btn-outline"
            style={{ padding: '8px' }}
          >
            <IconRefreshCw size={16} />
          </button>
        </div>
      </div>

      {actionError && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--status-danger-subtle)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger)',
            fontSize: '0.85rem'
          }}
        >
          {actionError}
        </div>
      )}

      {/* Users Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>User</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Joined</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Name & Username */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}
                          >
                            {(u.full_name || u.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {u.full_name || u.username} {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>

                      {/* Role Dropdown */}
                      <td style={{ padding: '12px 16px' }}>
                        {isSelf ? (
                          <span className="badge badge-primary">{u.role}</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-elevated)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <option value="MEMBER">MEMBER</option>
                            <option value="MODERATOR">MODERATOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className={`badge ${
                            u.status === 'ACTIVE'
                              ? 'badge-success'
                              : u.status === 'SUSPENDED'
                              ? 'badge-danger'
                              : 'badge-primary'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Created date */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {!isSelf && (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {u.status !== 'ACTIVE' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                                className="btn btn-outline"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', color: 'var(--status-success)' }}
                              >
                                Activate
                              </button>
                            )}
                            {u.status !== 'SUSPENDED' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                                className="btn btn-outline"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', color: 'var(--status-warning)' }}
                              >
                                Suspend
                              </button>
                            )}
                            {u.status !== 'DEACTIVATED' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(u.id, 'DEACTIVATED')}
                                className="btn btn-outline"
                                style={{ padding: '3px 8px', fontSize: '0.75rem', color: 'var(--status-danger)' }}
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
