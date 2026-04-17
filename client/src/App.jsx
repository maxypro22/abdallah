import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LawyerDashboard from './pages/LawyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CaseDetails from './pages/CaseDetails';
import HearingsTimeline from './pages/HearingsTimeline';
import ChangePassword from './pages/ChangePassword';
import AccountantDashboard from './pages/AccountantDashboard';
import Sidebar from './components/Sidebar';
import { Bell, Sun, Moon, Menu, X } from 'lucide-react';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <div className={user ? "app-layout" : "container"}>
        {user && (
          <>
            <div
              className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
              onClick={closeSidebar}
            ></div>
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          </>
        )}
        <main className={user ? "main-content" : ""}>
          {user && (
            <div className="header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  className="mobile-toggle"
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    display: window.innerWidth <= 1024 ? 'block' : 'none'
                  }}
                >
                  <Menu size={24} />
                </button>
                <div style={{ flex: 1 }}></div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <button
                  onClick={toggleTheme}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  title={theme === 'dark' ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Bell size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
                </div>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/lawyer" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Lawyer']}><LawyerDashboard /></ProtectedRoute>} />
            <Route path="/hearings" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Lawyer']}><HearingsTimeline /></ProtectedRoute>} />
            <Route path="/cases/:id" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Lawyer']}><CaseDetails /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/accountant" element={<ProtectedRoute allowedRoles={['Super Admin']}><AccountantDashboard /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/" element={
              ['Super Admin', 'Admin'].includes(user?.role) ? <Navigate to="/admin" /> :
                user?.role === 'Lawyer' ? <Navigate to="/lawyer" /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
