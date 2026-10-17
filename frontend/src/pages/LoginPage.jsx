import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError(null);
    try {
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'grid', placeItems: 'center' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '440px', margin: '20px auto', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-mark" style={{ margin: '0 auto 12px', width: '54px', height: '54px', fontSize: '26px' }}>
            🧬
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Sign In to Your Account</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Log in with your email to access your personalized skin intelligence dashboard.
          </p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Create Account Link Banner */}
        <div
          style={{
            marginTop: '22px',
            padding: '14px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
            New to AI Skin Intelligence?
          </div>
          <Link
            to="/register"
            style={{
              display: 'inline-block',
              marginTop: '6px',
              color: '#6d28d9',
              fontWeight: 800,
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            Create Your Account & Skin Profile →
          </Link>
        </div>

        {/* Optional Collapsible Sample Test Credentials for Evaluators */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowDemoLogins(!showDemoLogins)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {showDemoLogins ? '▲ Hide Sample Test Credentials' : '▼ Need Sample Test Accounts? Click to View'}
          </button>

          {showDemoLogins && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px',
                background: '#f1f5f9',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '11px',
                color: '#475569',
                lineHeight: 1.6
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>Pre-seeded demo accounts:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('alex@demo.com', 'password123')}
                  style={{ padding: '4px 6px', fontSize: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  👤 Patient (alex@demo.com)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('dr.chen@demo.com', 'password123')}
                  style={{ padding: '4px 6px', fontSize: '10px', borderRadius: '6px', border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', cursor: 'pointer' }}
                >
                  🩺 Doctor (dr.chen@demo.com)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('maya.consultant@demo.com', 'password123')}
                  style={{ padding: '4px 6px', fontSize: '10px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', cursor: 'pointer' }}
                >
                  🌿 Consultant (maya.consultant@demo.com)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@demo.com', 'password123')}
                  style={{ padding: '4px 6px', fontSize: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  📊 Admin (admin@demo.com)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
