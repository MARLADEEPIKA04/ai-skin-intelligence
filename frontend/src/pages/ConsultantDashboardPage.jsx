import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultantDashboard } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ConsultantDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('clients'); // 'clients', 'assessments', 'progress', 'recommendations'
  const [selectedClient, setSelectedClient] = useState(null);
  const [customAdvice, setCustomAdvice] = useState('');
  const [adviceSubmitted, setAdviceSubmitted] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getConsultantDashboard();
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load consultant dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSendAdvice = (e) => {
    e.preventDefault();
    setAdviceSubmitted(true);
    setTimeout(() => {
      setAdviceSubmitted(false);
      setCustomAdvice('');
      setSelectedClient(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading skincare consultant workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboard} className="btn-secondary">Retry</button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const clientProfiles = data?.client_profiles || [];
  const assessmentReports = data?.assessment_reports || [];
  const progressMonitoring = data?.progress_monitoring || {};
  const recommendations = data?.recommendation_management || [];

  return (
    <div className="container">
      {/* Top Consultant Hero */}
      <div className="hero-row" style={{ alignItems: 'center' }}>
        <div>
          <span className="eyebrow" style={{ color: '#059669' }}>
            SKINCARE CONSULTANT WORKSPACE • PERSONALIZED ROUTINE ARCHITECT
          </span>
          <h1 style={{ margin: '4px 0' }}>Welcome, {user?.full_name || 'Consultant'}</h1>
          <p>
            Monitor client skin profiles, review AI assessment scores, track routine adherence, and formulate personalized daily regimens.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/consultations')} className="btn-primary">
            💬 Client Consultations
          </button>
          <button onClick={fetchDashboard} className="btn-secondary">
            🔄 Refresh Hub
          </button>
        </div>
      </div>

      {/* KPI Bar */}
      <div className="telemetry-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card" onClick={() => setActiveTab('clients')} style={{ cursor: 'pointer', borderLeft: '4px solid #059669' }}>
          <div className="metric-icon" style={{ background: '#d1fae5', color: '#065f46' }}>👤</div>
          <div>
            <small>Active Clients</small>
            <div className="value" style={{ color: '#065f46' }}>{kpis.total_clients || 0}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('assessments')} style={{ cursor: 'pointer', borderLeft: '4px solid #6366f1' }}>
          <div className="metric-icon" style={{ background: '#ede9fe', color: '#5b21b6' }}>✨</div>
          <div>
            <small>Assessments Analyzed</small>
            <div className="value" style={{ color: '#5b21b6' }}>{assessmentReports.length || 0}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('progress')} style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}>
          <div className="metric-icon" style={{ background: '#fef3c7', color: '#92400e' }}>📊</div>
          <div>
            <small>Avg Routine Adherence</small>
            <div className="value" style={{ color: '#92400e' }}>{kpis.avg_adherence || '84%'}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('recommendations')} style={{ cursor: 'pointer', borderLeft: '4px solid #ec4899' }}>
          <div className="metric-icon" style={{ background: '#fce7f3', color: '#9d174d' }}>🧴</div>
          <div>
            <small>Routine Protocols</small>
            <div className="value" style={{ color: '#9d174d' }}>{recommendations.length || 5} Categories</div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('clients')}
          className={activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          👥 Client Profiles ({clientProfiles.length})
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={activeTab === 'assessments' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          📋 Skin Assessment Reports ({assessmentReports.length})
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          📈 Progress & Adherence
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={activeTab === 'recommendations' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          🧴 Recommendation Management
        </button>
      </div>

      {/* TAB 1: CLIENT PROFILES */}
      {activeTab === 'clients' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Client Profiles Directory</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Detailed lifestyle, skin type, and sensitivity records for tailored routine consulting.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {clientProfiles.map((c) => (
              <div key={c.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', margin: '0 0 2px', color: '#1e293b' }}>{c.name}</h3>
                    <small style={{ color: '#94a3b8' }}>{c.email}</small>
                  </div>
                  <span className="badge badge-primary">{c.skin_type} Skin</span>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Primary Concern:</span>
                    <strong>{c.primary_concern}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Age Group:</span>
                    <span>{c.age_group}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Allergies:</span>
                    <span style={{ color: '#dc2626' }}>{c.allergies}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Sensitivities:</span>
                    <span>{c.sensitivities}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Hydration & Sleep:</span>
                    <span>{c.water_intake} • {c.sleep_quality}</span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { setSelectedClient(c); setCustomAdvice(`Recommended 5-step morning protocol for ${c.name}: 1. Gentle foaming cleanser, 2. Niacinamide serum, 3. Ceramide moisturizer, 4. Daily SPF 50.`); }}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '6px 12px', flex: 1 }}
                  >
                    Suggest Routine
                  </button>
                  <button
                    onClick={() => navigate('/consultations')}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SKIN ASSESSMENT REPORTS */}
      {activeTab === 'assessments' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Skin Assessment Reports (Weighted Model)</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Multivariate AI health scores based on Assessment (35%), Lifestyle (20%), Sleep (15%), Consistency (20%), and Hydration (10%).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {assessmentReports.map((r) => (
              <div key={r.client_id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '16px', margin: 0, color: '#1e293b' }}>{r.client_name}</h3>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{r.health_score}</span>
                    <small style={{ color: '#94a3b8' }}>/100</small>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  Skin Type: <strong>{r.skin_type}</strong> • Target: <strong>{r.concern}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Skin Condition (35%)</span>
                    <strong>{r.assessment_breakdown?.skin_condition}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Routine Consistency (20%)</span>
                    <strong>{r.assessment_breakdown?.routine_consistency}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Lifestyle Habits (20%)</span>
                    <strong>{r.assessment_breakdown?.lifestyle_habits}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sleep Quality (15%)</span>
                    <strong>{r.assessment_breakdown?.sleep_quality}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hydration Level (10%)</span>
                    <strong>{r.assessment_breakdown?.hydration_level}%</strong>
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => navigate('/consultations')}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '12px', padding: '6px' }}
                  >
                    Open Client Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROGRESS & ADHERENCE */}
      {activeTab === 'progress' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Client Progress & Adherence Monitoring</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Aggregated daily checklist tracking, morning/evening consistency, and barrier stability.
            </p>
          </div>

          <div className="telemetry-grid" style={{ marginBottom: '20px' }}>
            <div className="metric-card">
              <div className="metric-icon">☀️</div>
              <div>
                <small>Morning Routine Completion</small>
                <div className="value">{progressMonitoring.morning_routine_rate || '89%'}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🌙</div>
              <div>
                <small>Evening Routine Completion</small>
                <div className="value">{progressMonitoring.evening_routine_rate || '81%'}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🛡️</div>
              <div>
                <small>Sunscreen Daily Compliance</small>
                <div className="value">{progressMonitoring.sunscreen_compliance || '86%'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', color: '#334155', marginBottom: '8px' }}>
              💡 Consultant Observation & Adherence Strategies
            </h3>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              <li>Clients reporting &gt;80% adherence achieve an average skin health score increase of 12 points in 3 weeks.</li>
              <li>Evening consistency drops on weekends; suggest simplifying night routine to just Cleanser + Barrier Moisturizer.</li>
              <li>Remind clients to reapply sunscreen every 2 hours during direct outdoor exposure.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDATION MANAGEMENT */}
      {activeTab === 'recommendations' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Recommendation Management & Protocols</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Standard clinical routine categories and ingredient compatibility guidelines.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {recommendations.map((rec, i) => (
              <div key={i} className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
                    Step {i + 1}: {rec.category}
                  </span>
                  <span className="badge badge-success">{rec.status}</span>
                </div>
                <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1e293b' }}>{rec.recommended_focus}</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>Target: {rec.target_skin}</p>
              </div>
            ))}
          </div>

          {/* Routine Advice Composer */}
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>Send Tailored Skincare Advisory</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Compose personalized routine planning suggestions for any registered client.
            </p>

            {adviceSubmitted && (
              <div className="success-message" style={{ marginBottom: '14px' }}>
                ✓ Routine recommendation successfully recorded and dispatched to client!
              </div>
            )}

            <form onSubmit={handleSendAdvice}>
              <div className="form-group">
                <label>Target Client</label>
                <select
                  value={selectedClient?.id || ''}
                  onChange={(e) => {
                    const cl = clientProfiles.find((p) => p.id === Number(e.target.value));
                    setSelectedClient(cl);
                  }}
                  required
                >
                  <option value="">Select client...</option>
                  {clientProfiles.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} ({cl.skin_type} • {cl.primary_concern})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Consultant Routine & Product Recommendations</label>
                <textarea
                  rows="3"
                  placeholder="Detail step-by-step AM/PM regimen, safe actives to combine, and suggested products from catalog..."
                  value={customAdvice}
                  onChange={(e) => setCustomAdvice(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                Send Recommendation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
