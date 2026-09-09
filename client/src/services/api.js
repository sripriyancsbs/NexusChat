/**
 * NexusChat API Client
 * Centralized fetch wrapper with authentication token injection and error handling.
 */

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(handleResponse),

  logout: () => fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse),

  getSession: () => fetch(`${API_BASE}/auth/session`, {
    headers: getHeaders()
  }).then(handleResponse),

  // Access Requests
  submitAccessRequest: (reqData) => fetch(`${API_BASE}/access-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData)
  }).then(handleResponse),

  // Users
  getMe: () => fetch(`${API_BASE}/users/me`, { headers: getHeaders() }).then(handleResponse),
  updateMe: (profile) => fetch(`${API_BASE}/users/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profile)
  }).then(handleResponse),
  listUsers: () => fetch(`${API_BASE}/users`, { headers: getHeaders() }).then(handleResponse),

  // Channels
  listChannels: () => fetch(`${API_BASE}/channels`, { headers: getHeaders() }).then(handleResponse),
  createChannel: (data) => fetch(`${API_BASE}/channels`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),
  joinChannel: (id) => fetch(`${API_BASE}/channels/${id}/join`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse),

  // Conversations
  listConversations: () => fetch(`${API_BASE}/conversations`, { headers: getHeaders() }).then(handleResponse),
  getOrCreateDirect: (targetUserId) => fetch(`${API_BASE}/conversations/direct`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ targetUserId })
  }).then(handleResponse),
  markAsRead: (convId) => fetch(`${API_BASE}/conversations/${convId}/read`, {
    method: 'PATCH',
    headers: getHeaders()
  }).then(handleResponse),

  // Messages
  getMessages: (convId) => fetch(`${API_BASE}/conversations/${convId}/messages`, {
    headers: getHeaders()
  }).then(handleResponse),
  sendMessage: (convId, content, replyToMessageId = null) => fetch(`${API_BASE}/conversations/${convId}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content, replyToMessageId })
  }).then(handleResponse),
  editMessage: (id, content) => fetch(`${API_BASE}/messages/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ content })
  }).then(handleResponse),
  deleteMessage: (id) => fetch(`${API_BASE}/messages/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),
  toggleReaction: (id, reaction) => fetch(`${API_BASE}/messages/${id}/reactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reaction })
  }).then(handleResponse),
  togglePin: (id) => fetch(`${API_BASE}/messages/${id}/pin`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse),

  // Notifications
  listNotifications: () => fetch(`${API_BASE}/notifications`, { headers: getHeaders() }).then(handleResponse),
  markNotificationRead: (id) => fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders()
  }).then(handleResponse),
  markAllNotificationsRead: () => fetch(`${API_BASE}/notifications/read-all`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse),

  // Search
  search: (q) => fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
    headers: getHeaders()
  }).then(handleResponse),

  // Reports
  submitReport: (messageId, reason) => fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ messageId, reason })
  }).then(handleResponse),
  listReports: () => fetch(`${API_BASE}/reports/admin`, { headers: getHeaders() }).then(handleResponse),
  resolveReport: (id, status, deleteMessage = false) => fetch(`${API_BASE}/reports/admin/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, deleteMessage })
  }).then(handleResponse),

  // Admin Portal
  getAdminDashboard: () => fetch(`${API_BASE}/admin/dashboard`, { headers: getHeaders() }).then(handleResponse),
  getAdminUsers: (params = '') => fetch(`${API_BASE}/admin/users${params ? '?' + params : ''}`, { headers: getHeaders() }).then(handleResponse),
  updateUserStatus: (id, status) => fetch(`${API_BASE}/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  }).then(handleResponse),
  updateUserRole: (id, role) => fetch(`${API_BASE}/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ role })
  }).then(handleResponse),
  getAdminSessions: () => fetch(`${API_BASE}/admin/sessions`, { headers: getHeaders() }).then(handleResponse),
  revokeAdminSession: (id) => fetch(`${API_BASE}/admin/sessions/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),
  getAdminAuditLogs: () => fetch(`${API_BASE}/admin/audit-logs`, { headers: getHeaders() }).then(handleResponse),
  getAdminSecurity: () => fetch(`${API_BASE}/admin/security`, { headers: getHeaders() }).then(handleResponse),
  getAdminAccessRequests: () => fetch(`${API_BASE}/access-requests/admin`, { headers: getHeaders() }).then(handleResponse),
  reviewAccessRequest: (id, status) => fetch(`${API_BASE}/access-requests/admin/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  }).then(handleResponse)
};
