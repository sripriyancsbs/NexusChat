import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MemberApp from './pages/MemberApp.jsx';
import AdminApp from './pages/AdminApp.jsx';

function AppRouter() {
  const { user, loading, isAdmin } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'ADMIN';
    if (path.startsWith('/login')) return 'LOGIN';
    if (path.startsWith('/app')) return 'CHAT';
    return 'HOME';
  });

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) setCurrentRoute('ADMIN');
      else if (path.startsWith('/login')) setCurrentRoute('LOGIN');
      else if (path.startsWith('/app')) setCurrentRoute('CHAT');
      else setCurrentRoute('HOME');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route, path) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', path);
  };

  // If session is still loading, show splash
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-canvas)',
          color: 'var(--text-primary)',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: '#ffffff',
            animation: 'pulse 1.5s infinite'
          }}
        >
          N
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Connecting to NexusChat...
        </div>
      </div>
    );
  }

  // Routing decisions
  if (!user) {
    if (currentRoute === 'LOGIN') {
      return (
        <LoginPage
          onNavigateHome={() => navigate('HOME', '/')}
          onLoginSuccess={(logged) => {
            if (logged.role === 'ADMIN') {
              navigate('ADMIN', '/admin');
            } else {
              navigate('CHAT', '/app');
            }
          }}
        />
      );
    }
    return (
      <LandingPage
        onNavigateLogin={() => navigate('LOGIN', '/login')}
      />
    );
  }

  // User is authenticated
  if (currentRoute === 'ADMIN') {
    return (
      <AdminApp
        onNavigateChat={() => navigate('CHAT', '/app')}
      />
    );
  }

  if (currentRoute === 'HOME' && !window.location.pathname.startsWith('/app')) {
    // If authenticated and on home, go to chat workspace
    return (
      <ChatProvider>
        <MemberApp
          onNavigateAdmin={() => navigate('ADMIN', '/admin')}
        />
      </ChatProvider>
    );
  }

  return (
    <ChatProvider>
      <MemberApp
        onNavigateAdmin={() => navigate('ADMIN', '/admin')}
      />
    </ChatProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
