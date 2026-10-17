import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDashboard, getActionPlan } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import DermatologistDashboardPage from './DermatologistDashboardPage';
import ConsultantDashboardPage from './ConsultantDashboardPage';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Route specialists directly to their clinical workspaces
  if (user?.role === 'dermatologist') {
    return <DermatologistDashboardPage />;
  }
  if (user?.role === 'consultant') {
    return <ConsultantDashboardPage />;
  }

  const [dashboard, setDashboard] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, planRes] = await Promise.all([
          getDashboard(),
          getActionPlan().catch(() => null)
        ]);
        if (!dashRes?.profile) {
          setNeedsProfile(true);
        } else {
          setDashboard(dashRes);
          setActionPlan(planRes?.action_plan?.items || planRes?.items || []);
        }
      } catch (err) {
        if (err?.response?.status === 404 || err?.status === 404 || err?.message?.includes('404')) {
          setNeedsProfile(true);
        } else {
          setError(err?.response?.data?.detail || err.message || 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading clinical dashboard...</p>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="container" style={{ padding: '24px 0' }}>
        {/* Onboarding Welcome Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f5f3ff, #ede9fe 50%, #e0f2fe)',
            borderRadius: '24px',
            padding: '36px',
            border: '1px solid #ddd6fe',
            boxShadow: '0 12px 36px rgba(124, 58, 237, 0.08)',
            marginBottom: '28px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧬</div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#7c3aed', letterSpacing: '1px', textTransform: 'uppercase' }}>
            NEW PATIENT ONBOARDING
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
            Welcome, {user?.full_name || 'Patient'}!
          </h1>
          <p style={{ fontSize: '15px', color: '#475569', maxWidth: '580px', margin: '10px auto 24px', lineHeight: 1.6 }}>
            Your account is ready! To generate your bespoke dermatological routine, calculate cellular barrier biometrics, and analyze ingredient synergies, please complete your initial Skin Profile Assessment.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 800,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🚀 Complete Your Skin Profile Assessment (2 min)
          </button>
        </div>

        {/* Feature Discovery Grid while profile is pending */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div
            onClick={() => navigate('/ingredients')}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧪</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Active Ingredient Conflict Checker</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Check compatibility scores between Retinoids, Vitamin C, AHAs, and Ceramides.
            </p>
          </div>

          <div
            onClick={() => navigate('/appointments')}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Tele-Care Appointments</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Book encrypted 1-on-1 virtual sessions with Dr. Alexander Chen or Maya Lin.
            </p>
          </div>

          <div
            onClick={() => navigate('/products')}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧴</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Formulary Catalog</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Explore dermatologist-approved skincare formulations and barrier repair creams.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
      </div>
    );
  }

  const profile = dashboard?.profile || {};
  const assessment = dashboard?.assessment || {};
  const skinHealth = dashboard?.skin_health || {};
  const components = skinHealth?.components || {};
  const overallScore = skinHealth?.overall || 80;

  return (
    <div className="container">
      <div className="hero-row">
        <div>
          <span className="eyebrow">CLINICAL WORKSPACE • INTELLIGENT CARE</span>
          <h1>Welcome back, {user?.full_name || dashboard?.user?.name || 'Patient'}</h1>
          <p>Real-time dermatological intelligence, weighted health scoring, and predictive skin analysis.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/skin-checkin" className="btn-primary">
            📸 Quick Photo Check-in
          </Link>
          <Link to="/ai-analysis" className="btn-secondary">
            View AI Analysis
          </Link>
        </div>
      </div>

      {/* 4 Telemetry Metrics */}
      <div className="telemetry-grid">
        <div className="metric-card">
          <div className="metric-icon">✨</div>
          <div>
            <small>Skin Health Score</small>
            <div className="value">{overallScore}/100</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🔄</div>
          <div>
            <small>Routine Adherence</small>
            <div className="value">{Math.round(components.routine_consistency || 70)}%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🌙</div>
          <div>
            <small>Sleep Support</small>
            <div className="value">{Math.round(components.sleep_quality || 80)}%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💧</div>
          <div>
            <small>Hydration Level</small>
            <div className="value">{Math.round(components.hydration_level || 65)}%</div>
          </div>
        </div>
      </div>

      {/* Score Banner */}
      <div className="score-banner">
        <div>
          <span className="eyebrow" style={{ color: '#684ed2' }}>AI CLINICAL SUMMARY</span>
          <h2>{profile.skin_type || 'Custom'} Skin • {profile.primary_concern || 'General Care'}</h2>
          <p>
            Your current assessment reflects a <strong>{assessment.risk_level || 'Low'}</strong> risk index. 
            Recommendations prioritize barrier fortification, balanced hydration, and gentle active ingredient pacing.
          </p>
          <div className="chips">
            <span className="chip">🧬 Type: {profile.skin_type || 'Normal'}</span>
            <span className="chip">🎯 Focus: {profile.primary_concern || 'Acne'}</span>
            <span className="chip">⚠️ Risk: {assessment.risk_level || 'Low'}</span>
            <span className="chip">📅 Age: {profile.age_group || '25-34'}</span>
          </div>
        </div>
        <div className="score-orb">
          <strong>{overallScore}</strong>
          <span>Skin Health Index</span>
          <span className="badge badge-success">Active Plan</span>
        </div>
      </div>

      {/* 2-Column Dashboard Cards */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="card-icon">🩺</div>
              <div>
                <h2>Skin Condition Analysis</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#78859d' }}>Multi-factor weighted dermatological indices</p>
              </div>
            </div>
            <span className={`status-badge ${assessment.risk_level === 'High' ? 'cancelled' : assessment.risk_level === 'Moderate' ? 'pending' : 'completed'}`}>
              {assessment.risk_level || 'Low'} Risk
            </span>
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <small>Condition Index</small>
              <strong>{Math.round(components.skin_condition_assessment || 80)}%</strong>
            </div>
            <div className="mini-stat">
              <small>Lifestyle Habit</small>
              <strong>{Math.round(components.lifestyle_habits || 80)}%</strong>
            </div>
            <div className="mini-stat">
              <small>Recovery Velocity</small>
              <strong>{Math.round(components.sleep_quality || 80)}%</strong>
            </div>
          </div>

          <div className="clinical-callout">
            <strong>Key Clinical Observations</strong>
            <p>
              {assessment.concerns && assessment.concerns.length > 0
                ? assessment.concerns.join(', ') + ' are currently monitored as key target signals.'
                : 'No acute inflammation or excessive erythema flags recorded in profile.'}
            </p>
          </div>

          {assessment.risk_factors && assessment.risk_factors.length > 0 && (
            <div className="recovery-row">
              <span>Identified Risk Factors:</span>
              <strong>{assessment.risk_factors.slice(0, 3).join(', ')}</strong>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="card-icon" style={{ background: '#e0f8ef', color: '#278b6b' }}>📋</div>
              <div>
                <h2>Personalised Action Plan</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#78859d' }}>Daily evidence-based recommendations</p>
              </div>
            </div>
            <Link to="/progress" style={{ fontSize: '12px', color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>
              Track Daily →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {actionPlan && actionPlan.length > 0 ? (
              actionPlan.slice(0, 4).map((item, idx) => (
                <div key={item.id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #edf0f5'
                }}>
                  <span className={`priority-badge ${item.priority || 'medium'}`}>
                    {item.priority || 'medium'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#38435d', fontWeight: 600 }}>
                    {item.title || item.task}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: '#71809b' }}>Complete daily routine to populate action tracking.</p>
            )}
          </div>

          <div className="recovery-row" style={{ marginTop: '16px' }}>
            <span>Routine Consistency:</span>
            <strong>{Math.round(components.routine_consistency || 70)}% Adherence</strong>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <h3 style={{ fontSize: '18px', color: '#333b54', marginBottom: '14px' }}>Quick Navigation</h3>
      <div className="quick-grid">
        <Link to="/ai-analysis" className="quick-card">
          <span>✨</span>
          <div>
            <h3>AI Skin Analysis</h3>
            <p>Full explainable intelligence report</p>
          </div>
          <b>→</b>
        </Link>
        <Link to="/products" className="quick-card">
          <span>🧴</span>
          <div>
            <h3>Product Intelligence</h3>
            <p>Smart suitability & comparisons</p>
          </div>
          <b>→</b>
        </Link>
        <Link to="/ingredients" className="quick-card">
          <span>🧪</span>
          <div>
            <h3>Ingredient Analysis</h3>
            <p>Compatibility & allergen checks</p>
          </div>
          <b>→</b>
        </Link>
        <Link to="/skin-checkin" className="quick-card">
          <span>📸</span>
          <div>
            <h3>Photo Skin Check-in</h3>
            <p>Self-check-in observation scoring</p>
          </div>
          <b>→</b>
        </Link>
        <Link to="/progress" className="quick-card">
          <span>📈</span>
          <div>
            <h3>Progress & Trends</h3>
            <p>Daily routines & health analytics</p>
          </div>
          <b>→</b>
        </Link>
        <Link to="/consultations" className="quick-card">
          <span>💬</span>
          <div>
            <h3>Dermatologist Portal</h3>
            <p>Direct professional consultations</p>
          </div>
          <b>→</b>
        </Link>
      </div>

      <div className="ai-disclaimer" style={{ marginTop: '30px' }}>
        <strong>Clinical Disclaimer:</strong> AI Skin Intelligence provides evidence-based educational decision support. 
        It does not provide medical diagnoses or replace an evaluation by a certified dermatologist. Persistent or painful changes should be evaluated professionally.
      </div>
    </div>
  );
}
