import React, { useContext } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import './App.css';

// Page Components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SkinProfilePage from './pages/SkinProfilePage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import ProductsPage from './pages/ProductsPage';
import IngredientsPage from './pages/IngredientsPage';
import ProgressPage from './pages/ProgressPage';
import ConsultationsPage from './pages/ConsultationsPage';
import ConsultationDetailPage from './pages/ConsultationDetailPage';
import SkinCheckinPage from './pages/SkinCheckinPage';
import ExecutiveDashboardPage from './pages/ExecutiveDashboardPage';
import DermatologistDashboardPage from './pages/DermatologistDashboardPage';
import ConsultantDashboardPage from './pages/ConsultantDashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';

// Interactive Components
import NotificationCenter from './components/NotificationCenter';
import AIChatbot from './components/AIChatbot';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Role-based navigation items
  let navItems = [];
  let professionalItems = [];

  if (user?.role === 'dermatologist') {
    navItems = [
      { path: '/', label: 'Doctor Hub', icon: '🩺' },
      { path: '/consultations', label: 'Triage & Consultations', icon: '💬' },
      { path: '/appointments', label: 'Tele-Appointments', icon: '📅' },
      { path: '/products', label: 'Formulary & Products', icon: '🧴' },
      { path: '/ingredients', label: 'Active Ingredients', icon: '🧪' },
    ];
    professionalItems = [
      { path: '/executive', label: 'Clinical Analytics', icon: '📊' },
    ];
  } else if (user?.role === 'consultant') {
    navItems = [
      { path: '/', label: 'Consultant Hub', icon: '🌿' },
      { path: '/consultations', label: 'Client Consultations', icon: '💬' },
      { path: '/appointments', label: 'Tele-Appointments', icon: '📅' },
      { path: '/products', label: 'Products Catalog', icon: '🧴' },
      { path: '/ingredients', label: 'Ingredients', icon: '🧪' },
    ];
    professionalItems = [
      { path: '/executive', label: 'Platform Analytics', icon: '📊' },
    ];
  } else {
    // Default patient / user
    navItems = [
      { path: '/', label: 'Dashboard', icon: '🏠' },
      { path: '/profile', label: 'My Profile', icon: '👤' },
      { path: '/ai-analysis', label: 'AI Analysis', icon: '✨' },
      { path: '/products', label: 'Products', icon: '🧴' },
      { path: '/ingredients', label: 'Ingredients & Conflicts', icon: '🧪' },
      { path: '/progress', label: 'Progress & Visuals', icon: '📈' },
      { path: '/skin-checkin', label: 'Skin Check-in', icon: '📸' },
      { path: '/appointments', label: 'Tele-Care Booking', icon: '📅' },
    ];
    professionalItems = [
      { path: '/consultations', label: 'Dermatologist Tele-Care', icon: '💬' },
      { path: '/executive', label: 'Analytics', icon: '📊' },
    ];
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-shell">
      {isAuthenticated && (
        <aside className="topbar">
          <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
            <div className="brand-mark">🧬</div>
            <div>
              <strong>AI Skin Intelligence</strong>
              <span>
                {user?.role === 'dermatologist'
                  ? 'DERMATOLOGIST CLINIC'
                  : user?.role === 'consultant'
                  ? 'CONSULTANT STUDIO'
                  : 'CLINICAL WORKSPACE'}
              </span>
            </div>
          </Link>

          <nav className="main-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${isActive(item.path) ? ' active' : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {professionalItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item professional-nav${isActive(item.path) ? ' active' : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="topbar-actions" style={{ alignItems: 'center' }}>
            <NotificationCenter />
            <div style={{ textAlign: 'right', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name || 'User'}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background:
                    user?.role === 'dermatologist'
                      ? '#e0f2fe'
                      : user?.role === 'consultant'
                      ? '#d1fae5'
                      : '#ede9fe',
                  color:
                    user?.role === 'dermatologist'
                      ? '#0369a1'
                      : user?.role === 'consultant'
                      ? '#047857'
                      : '#6d28d9',
                }}
              >
                {user?.role === 'dermatologist'
                  ? '👨‍⚕️ Derm'
                  : user?.role === 'consultant'
                  ? '🌿 Consultant'
                  : '👤 Patient'}
              </span>
            </div>
            <button className="signout-button" onClick={logout} style={{ padding: '6px 10px', fontSize: '11px' }}>
              Exit
            </button>
          </div>
        </aside>
      )}

      <main className={`main-content${!isAuthenticated ? ' full-width' : ''}`}
            style={!isAuthenticated ? { marginLeft: 0 } : {}}>
        <div className="page-wrap">
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dermatologist" element={<ProtectedRoute><DermatologistDashboardPage /></ProtectedRoute>} />
            <Route path="/consultant" element={<ProtectedRoute><ConsultantDashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><SkinProfilePage /></ProtectedRoute>} />
            <Route path="/ai-analysis" element={<ProtectedRoute><AIAnalysisPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/ingredients" element={<ProtectedRoute><IngredientsPage /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/consultations" element={<ProtectedRoute><ConsultationsPage /></ProtectedRoute>} />
            <Route path="/consultations/:id" element={<ProtectedRoute><ConsultationDetailPage /></ProtectedRoute>} />
            <Route path="/skin-checkin" element={<ProtectedRoute><SkinCheckinPage /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
            <Route path="/executive" element={<ProtectedRoute><ExecutiveDashboardPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      {/* Global AI Virtual Skincare Chatbot */}
      {isAuthenticated && <AIChatbot />}
    </div>
  );
}

export default App;
