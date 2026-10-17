import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAISummary } from '../services/api.js';

export default function AIAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('insights'); // 'insights', 'routine', 'dermatology', 'reasoning'

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const summary = await getAISummary();
        setData(summary);
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || 'Failed to load AI Analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Synthesizing deep skin intelligence model...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <Link to="/profile" className="btn-primary">Update Skin Profile</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <h3>No AI Analysis Available</h3>
        <p>Please complete your profile to generate intelligent personalized skincare advice.</p>
        <Link to="/profile" className="btn-primary" style={{ marginTop: '16px' }}>Complete Profile</Link>
      </div>
    );
  }

  const analysis = data.analysis || {};
  const recs = data.recommendations || {};
  const dermRec = data.dermatology_recommendation || {};
  const explanation = data.recommendation_explanation || {};
  const explanationsList = explanation.explanations || [];

  return (
    <div className="container">
      {/* Feature Hero */}
      <div className="feature-hero" style={{ background: 'linear-gradient(120deg, #ede7ff, #e6f6ff 52%, #fff0f7)' }}>
        <div>
          <span className="eyebrow">NEURAL CLINICAL ENGINE</span>
          <h1>Explainable AI Skin Intelligence</h1>
          <p>Transparent, profile-tailored dermatological decision support backed by personalized ingredient and barrier analytics.</p>
        </div>
        <div className="feature-emoji">🧠</div>
      </div>

      {/* Primary Intelligence Banner */}
      <div className="score-banner" style={{ marginTop: 0 }}>
        <div>
          <span className="eyebrow" style={{ color: '#7359e2' }}>ATTENTION LEVEL</span>
          <h2>
            {analysis.attention_level || 'Moderate'} Attention Profile • {analysis.primary_concern || 'Targeted Care'}
          </h2>
          <p>
            System analysis identified <strong>{analysis.priority_areas?.length || 0} priority domains</strong>. 
            Overall algorithmic skin sensitivity score: <strong>{analysis.overall_score || 0} pts</strong>.
          </p>
          <div className="chips">
            {analysis.priority_areas?.map((area, idx) => (
              <span key={idx} className="chip">🎯 {area}</span>
            ))}
          </div>
        </div>
        <div className="score-orb">
          <strong>{analysis.overall_score || 0}</strong>
          <span>Attention Score</span>
          <span className={`status-badge ${analysis.attention_level === 'High' ? 'cancelled' : analysis.attention_level === 'Moderate' ? 'pending' : 'completed'}`}>
            {analysis.attention_level || 'Low'} Level
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('insights')}
          className={activeTab === 'insights' ? 'btn-primary' : 'btn-secondary'}
        >
          💡 Key Insights & Actions
        </button>
        <button
          onClick={() => setActiveTab('routine')}
          className={activeTab === 'routine' ? 'btn-primary' : 'btn-secondary'}
        >
          🧴 Daily Regimen & Routine
        </button>
        <button
          onClick={() => setActiveTab('dermatology')}
          className={activeTab === 'dermatology' ? 'btn-primary' : 'btn-secondary'}
        >
          🩺 Dermatology Guidance
        </button>
        <button
          onClick={() => setActiveTab('reasoning')}
          className={activeTab === 'reasoning' ? 'btn-primary' : 'btn-secondary'}
        >
          🔍 Explainable Reasoning
        </button>
      </div>

      {/* TAB 1: Insights & Actions */}
      {activeTab === 'insights' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="card-icon">🔍</div>
                <div>
                  <h2>Algorithmic Clinical Insights</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78859d' }}>Extracted from user history & barrier metrics</p>
                </div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {analysis.insights && analysis.insights.length > 0 ? (
                analysis.insights.map((insight, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: '#fafbff',
                    border: '1px solid #edf0f6',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#34405a'
                  }}>
                    <span style={{ color: 'var(--purple)', fontWeight: 800 }}>•</span>
                    <span>{insight}</span>
                  </li>
                ))
              ) : (
                <p>No insights generated.</p>
              )}
            </ul>
          </div>

          <div className="dashboard-card">
            <div className="card-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="card-icon" style={{ background: '#e0f8ef', color: '#278b6b' }}>🎯</div>
                <div>
                  <h2>Recommended Targeted Actions</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#78859d' }}>Practical step-by-step guidance</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {analysis.recommended_actions && analysis.recommended_actions.length > 0 ? (
                analysis.recommended_actions.map((action, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: '#f4fbf7',
                    border: '1px solid #e1f4ec',
                    fontSize: '13px',
                    color: '#265444',
                    fontWeight: 600
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: '#d4f2e5',
                      color: '#1a7551',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {idx + 1}
                    </span>
                    <span>{action}</span>
                  </div>
                ))
              ) : (
                <p>No actions available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Daily Regimen & Routine */}
      {activeTab === 'routine' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {/* Morning Routine */}
          <div className="card" style={{ background: 'linear-gradient(145deg, #fff, #fffbf0)' }}>
            <div className="card-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>☀️</span>
                <h3>Morning Routine (AM)</h3>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {Array.isArray(recs.morning_recommendations) ? (
                recs.morning_recommendations.map((step, i) => (
                  <li key={i} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.8)', border: '1px solid #faeed5', fontSize: '13px', color: '#524329' }}>
                    <strong>Step {i + 1}:</strong> {step}
                  </li>
                ))
              ) : (
                <p style={{ fontSize: '13px' }}>{recs.morning_recommendations || 'Cleanse and apply sunscreen.'}</p>
              )}
            </ul>
          </div>

          {/* Evening Routine */}
          <div className="card" style={{ background: 'linear-gradient(145deg, #fff, #f4f0ff)' }}>
            <div className="card-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🌙</span>
                <h3>Evening Routine (PM)</h3>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {Array.isArray(recs.evening_recommendations) ? (
                recs.evening_recommendations.map((step, i) => (
                  <li key={i} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.8)', border: '1px solid #e7ddfc', fontSize: '13px', color: '#443666' }}>
                    <strong>Step {i + 1}:</strong> {step}
                  </li>
                ))
              ) : (
                <p style={{ fontSize: '13px' }}>{recs.evening_recommendations || 'Cleanse and moisturize.'}</p>
              )}
            </ul>
          </div>

          {/* Weekly & Lifestyle */}
          <div className="card" style={{ background: 'linear-gradient(145deg, #fff, #eefbf6)' }}>
            <div className="card-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🌿</span>
                <h3>Weekly & Lifestyle Care</h3>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div>
                <small style={{ fontWeight: 800, color: '#278b6b', textTransform: 'uppercase', fontSize: '10px' }}>Weekly Care</small>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {Array.isArray(recs.weekly_care) && recs.weekly_care.map((w, i) => (
                    <li key={i} style={{ fontSize: '12px', color: '#335245' }}>• {w}</li>
                  ))}
                </ul>
              </div>
              <div style={{ borderTop: '1px solid #dcf2e8', paddingTop: '10px' }}>
                <small style={{ fontWeight: 800, color: '#278b6b', textTransform: 'uppercase', fontSize: '10px' }}>Lifestyle Adjustments</small>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {Array.isArray(recs.lifestyle_recommendations) && recs.lifestyle_recommendations.map((l, i) => (
                    <li key={i} style={{ fontSize: '12px', color: '#335245' }}>• {l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dermatology Guidance */}
      {activeTab === 'dermatology' && (
        <div className="ai-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <span className="eyebrow">CLINICAL TRIAGE</span>
              <h2>Professional Dermatology Guidance</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className={`status-badge ${dermRec.urgency === 'Moderate' ? 'cancelled' : dermRec.urgency === 'Routine' ? 'pending' : 'completed'}`}>
                {dermRec.urgency || 'Routine'} Urgency
              </span>
              <span className="badge" style={{ background: dermRec.consultation_recommended ? '#fff0f1' : '#eafbf5', color: dermRec.consultation_recommended ? '#be123c' : '#278b6b' }}>
                {dermRec.consultation_recommended ? 'Consultation Advised' : 'Self-Care Sourced'}
              </span>
            </div>
          </div>

          <div className="clinical-callout" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginBottom: '16px' }}>
            <strong>Suggested Next Step:</strong>
            <p style={{ fontSize: '14px', color: '#2b364e', fontWeight: 600 }}>{dermRec.next_step}</p>
          </div>

          <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#38425d' }}>Reasoning Factors for Dermatology Assessment:</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dermRec.reason?.map((r, i) => (
              <li key={i} style={{ padding: '12px 14px', background: '#fafbff', border: '1px solid #edf0f6', borderRadius: '12px', fontSize: '13px', color: '#3b4761' }}>
                🩺 {r}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <Link to="/consultations" className="btn-primary">
              💬 Book Consultation With a Dermatologist
            </Link>
          </div>
        </div>
      )}

      {/* TAB 4: Explainable Reasoning */}
      {activeTab === 'reasoning' && (
        <div className="ai-section">
          <div style={{ marginBottom: '18px' }}>
            <span className="eyebrow">TRANSPARENT REASONING ENGINE</span>
            <h2>Why These Recommendations Were Generated</h2>
            <p style={{ color: '#738099', fontSize: '13px' }}>
              {explanation.summary || 'Recommendations are algorithmically derived directly from your skin profile, clinical assessment risk level, and environmental exposures.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {explanationsList.map((exp, idx) => (
              <div key={idx} className="ai-explanation-item">
                <div className="ai-explanation-number">{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="ai-explanation-category">{exp.category}</div>
                  <h4>{exp.recommendation}</h4>
                  <p>{exp.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Disclaimer */}
      <div className="ai-disclaimer">
        <strong>Important Disclaimer:</strong> {data.disclaimer || 'This AI analysis provides educational decision support built from profile data and is not a medical diagnosis. Consult a board-certified dermatologist for medical diagnosis and treatment of persistent skin disorders.'}
      </div>
    </div>
  );
}
