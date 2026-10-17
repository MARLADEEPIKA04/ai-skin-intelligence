import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await register(formData);
      setSuccess('Account created! Setting up your personal workspace...');
      // Automatically log the new user in with their own credentials
      try {
        await login(formData.email, formData.password);
        if (formData.role === 'dermatologist') {
          navigate('/dermatologist');
        } else if (formData.role === 'consultant') {
          navigate('/consultant');
        } else {
          // Send new patient straight to their personalized Skin Profile questionnaire!
          navigate('/profile');
        }
      } catch {
        navigate('/login');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'grid', placeItems: 'center' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '460px', margin: '20px auto', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div className="brand-mark" style={{ margin: '0 auto 12px', width: '54px', height: '54px', fontSize: '26px' }}>
            🧬
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Create New Account</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Register to build your personalized skin intelligence profile.
          </p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}
        {success && <div className="success-message" style={{ marginBottom: '16px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Jane Doe"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. jane@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Account Type / Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="user">👤 Patient / Skincare User</option>
              <option value="dermatologist">🩺 Licensed Dermatologist</option>
              <option value="consultant">🌿 Skincare Consultant</option>
            </select>
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
            {loading ? 'Creating Account & Initializing...' : 'Register & Start Assessment'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'none' }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
