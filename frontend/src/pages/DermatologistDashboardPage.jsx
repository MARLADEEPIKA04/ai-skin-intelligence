import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDermatologistDashboard, acceptConsultation, respondConsultation } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DermatologistDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'active', 'patients', 'conditions', 'analytics'
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxNotes, setRxNotes] = useState('');
  const [rxRecommendations, setRxRecommendations] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDermatologistDashboard();
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load dermatologist dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAccept = async (consultationId) => {
    setActionLoading(true);
    try {
      await acceptConsultation(consultationId);
      await fetchDashboard();
      navigate(`/consultations/${consultationId}`);
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to accept consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRxModal = (caseItem) => {
    setSelectedCase(caseItem);
    setRxNotes(caseItem.dermatologist_notes || '');
    setRxRecommendations(caseItem.recommendations || '');
    setShowRxModal(true);
  };

  const handleSubmitRx = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setActionLoading(true);
    try {
      await respondConsultation(selectedCase.id, {
        dermatologist_notes: rxNotes,
        recommendations: rxRecommendations,
      });
      setShowRxModal(false);
      setSelectedCase(null);
      await fetchDashboard();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to submit treatment plan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading clinical tele-dermatology workspace...</p>
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
  const queue = data?.queue || [];
  const activeCases = data?.active_cases || [];
  const patients = data?.patient_insights || [];
  const conditions = data?.skin_condition_reports || {};
  const analytics = data?.progress_analytics || {};

  return (
    <div className="container">
      {/* Top Clinical Hero */}
      <div className="hero-row" style={{ alignItems: 'center' }}>
        <div>
          <span className="eyebrow" style={{ color: '#0284c7' }}>
            BOARD-CERTIFIED DERMATOLOGIST WORKSPACE • TELE-TRIAGE
          </span>
          <h1 style={{ margin: '4px 0' }}>Welcome, {user?.full_name || 'Dr. Specialist'}</h1>
          <p>
            Review patient triage queue, evaluate AI skin condition telemetry, prescribe clinical regimens, and communicate directly with patients.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/consultations')} className="btn-primary">
            💬 Open Tele-Consultations
          </button>
          <button onClick={fetchDashboard} className="btn-secondary" title="Refresh records">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Clinical Telemetry KPI Bar */}
      <div className="telemetry-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card" onClick={() => setActiveTab('queue')} style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}>
          <div className="metric-icon" style={{ background: '#fef3c7', color: '#b45309' }}>⏳</div>
          <div>
            <small>Pending Triage Queue</small>
            <div className="value" style={{ color: '#b45309' }}>{kpis.pending_triage || 0}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('active')} style={{ cursor: 'pointer', borderLeft: '4px solid #0284c7' }}>
          <div className="metric-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>🩺</div>
          <div>
            <small>Active Tele-Cases</small>
            <div className="value" style={{ color: '#0369a1' }}>{kpis.active_in_review || 0}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('patients')} style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}>
          <div className="metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>👥</div>
          <div>
            <small>Total Patients</small>
            <div className="value" style={{ color: '#15803d' }}>{kpis.total_patients || 0}</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('analytics')} style={{ cursor: 'pointer', borderLeft: '4px solid #8b5cf6' }}>
          <div className="metric-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>📈</div>
          <div>
            <small>Adherence & Recovery</small>
            <div className="value" style={{ color: '#7e22ce' }}>{analytics.average_adherence || '82%'}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('queue')}
          className={activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          🚨 Triage Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          💬 Active Cases ({activeCases.length})
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={activeTab === 'patients' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          🧬 Patient Insights ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('conditions')}
          className={activeTab === 'conditions' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          📊 Condition Reports
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          📈 Progress Analytics
        </button>
      </div>

      {/* TAB 1: TRIAGE QUEUE */}
      {activeTab === 'queue' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Incoming Tele-Dermatology Requests</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                Cases automatically prioritized by AI symptom severity. Click to claim and open tele-session.
              </p>
            </div>
            <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
              {queue.length} Cases Awaiting Assignment
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
              <h3>Queue is clear!</h3>
              <p>All clinical requests have been claimed or responded to.</p>
            </div>
          ) : (
            <div className="consultation-list">
              {queue.map((c) => (
                <div key={c.id} className="consultation-card" style={{ cursor: 'default' }}>
                  <div className="consultation-card-top">
                    <span className={`priority-badge ${c.priority}`}>
                      {c.priority} Priority
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Case #{c.id} • {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ marginTop: '10px' }}>{c.subject}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{c.description}</p>

                  <div className="consultation-meta">
                    <span>👤 Patient: <strong>{c.patient_name}</strong></span>
                    <span>🧬 Skin Type: <strong>{c.skin_type}</strong></span>
                    <span>🎯 Concern: <strong>{c.primary_concern}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleAccept(c.id)}
                      disabled={actionLoading}
                      className="btn-primary"
                      style={{ fontSize: '13px', padding: '8px 14px' }}
                    >
                      ✓ Accept & Review Case
                    </button>
                    <button
                      onClick={() => navigate(`/consultations/${c.id}`)}
                      className="btn-secondary"
                      style={{ fontSize: '13px', padding: '8px 14px' }}
                    >
                      💬 Open Tele-Channel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE CASES */}
      {activeTab === 'active' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>My Active Consultations</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Ongoing patient exchanges under your clinical supervision.
            </p>
          </div>

          {activeCases.length === 0 ? (
            <div className="empty-state">
              <p>No active consultations in review. Claim a case from the Triage Queue above.</p>
            </div>
          ) : (
            <div className="consultation-list">
              {activeCases.map((c) => (
                <div key={c.id} className="consultation-card" style={{ cursor: 'default' }}>
                  <div className="consultation-card-top">
                    <span className="status-badge in_review">In Review</span>
                    <span className={`priority-badge ${c.priority}`}>{c.priority}</span>
                  </div>

                  <h3 style={{ marginTop: '10px' }}>{c.subject}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>{c.description}</p>

                  <div className="consultation-meta">
                    <span>👤 Patient: <strong>{c.patient_name}</strong></span>
                    <span>🧬 Skin: <strong>{c.skin_type}</strong></span>
                    <span>🎯 Concern: <strong>{c.primary_concern}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => navigate(`/consultations/${c.id}`)}
                      className="btn-primary"
                      style={{ fontSize: '13px', padding: '8px 14px' }}
                    >
                      💬 Open Patient Chat
                    </button>
                    <button
                      onClick={() => handleOpenRxModal(c)}
                      className="btn-mint"
                      style={{ fontSize: '13px', padding: '8px 14px' }}
                    >
                      📝 Prescribe Treatment Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PATIENT INSIGHTS */}
      {activeTab === 'patients' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Patient Insights & Risk Roster</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Longitudinal skin health tracking, allergy flags, and risk categorization across patients.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Patient Name</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Skin Type</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Primary Concern</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Allergies & Sensitivities</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Skin Health Score</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Clinical Risk</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                      {p.name}
                      <small style={{ display: 'block', color: '#94a3b8', fontWeight: 400 }}>{p.email}</small>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{p.skin_type}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                        {p.primary_concern}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '200px' }}>
                      {p.allergies !== 'None reported' ? p.allergies : p.sensitivities}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong>{p.skin_health_score}/100</strong>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`priority-badge ${p.risk_level?.toLowerCase()}`}>
                        {p.risk_level} Risk
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => navigate('/consultations')}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Consult
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONDITION REPORTS */}
      {activeTab === 'conditions' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Skin Condition Reports & Epidemiology</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Prevalence of dermatological conditions diagnosed across the patient cohort.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {Object.entries(conditions).map(([name, count]) => (
              <div key={name} className="card" style={{ padding: '18px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  {name}
                </span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '6px 0' }}>
                  {count} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 400 }}>cases</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.max(15, count * 20))}%`, height: '100%', background: 'var(--purple)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Guidance Box */}
          <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', color: '#334155', marginBottom: '8px' }}>
              🩺 Clinical Protocol Guidelines
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '13px', color: '#475569' }}>
              <div>
                <strong>Inflammatory Acne:</strong> Verify skin barrier integrity before introducing topical retinoids or salicylic acid. Prescribe barrier-protecting moisturizers.
              </div>
              <div>
                <strong>Hyperpigmentation:</strong> Recommend broad-spectrum SPF 50 daily as foundational step. Combine Niacinamide with stabilized Vitamin C.
              </div>
              <div>
                <strong>Reactive Erythema:</strong> Advise elimination of abrasive physical exfoliators and fragranced formulations. Emphasize centella and ceramides.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROGRESS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>Patient Recovery & Adherence Analytics</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Quantifiable patient progress over 30-day therapeutic cycles.
            </p>
          </div>

          <div className="telemetry-grid" style={{ marginBottom: '20px' }}>
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div>
                <small>Average Improvement</small>
                <div className="value">{analytics.average_patient_improvement || '+14.2%'}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div>
                <small>Routine Adherence</small>
                <div className="value">{analytics.average_adherence || '82%'}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🔄</div>
              <div>
                <small>Patient Retention</small>
                <div className="value">{analytics.retention_rate || '91%'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '15px', marginBottom: '14px' }}>Recovery Trajectory by Week</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', height: '180px', padding: '20px 0 0' }}>
              {(analytics.weekly_recovery_trend || []).map((w) => (
                <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#4338ca', marginBottom: '6px' }}>{w.score}%</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '60px',
                      height: `${(w.score / 100) * 120}px`,
                      background: 'linear-gradient(180deg, #6366f1, #a5b4fc)',
                      borderRadius: '8px 8px 0 0',
                    }}
                  />
                  <small style={{ marginTop: '8px', color: '#64748b' }}>{w.week}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prescription / Treatment Plan Modal */}
      {showRxModal && selectedCase && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 24, 38, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            maxWidth: '580px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '6px', color: '#1e293b' }}>
              Formulate Clinical Treatment Plan
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
              Patient: <strong>{selectedCase.patient_name}</strong> • Concern: {selectedCase.primary_concern}
            </p>

            <form onSubmit={handleSubmitRx}>
              <div className="form-group">
                <label>Dermatologist Diagnostic Assessment & Notes</label>
                <textarea
                  rows="3"
                  placeholder="E.g., Contact dermatitis with micro-papular inflammatory flares..."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Prescribed Regimen, Active Ingredients & Precautions</label>
                <textarea
                  rows="4"
                  placeholder="1. Wash with gentle non-stripping cleanser&#10;2. Apply 5% Niacinamide serum&#10;3. Barrier cream with ceramides&#10;4. Mandatory SPF 50 daily"
                  value={rxRecommendations}
                  onChange={(e) => setRxRecommendations(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                >
                  {actionLoading ? 'Finalizing...' : 'Save & Prescribe to Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
