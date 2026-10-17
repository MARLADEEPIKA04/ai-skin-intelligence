import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, saveProfile } from '../services/api.js';

export default function SkinProfilePage() {
  const [formData, setFormData] = useState({
    age_group: '25-34',
    skin_type: 'Combination',
    primary_concern: 'Acne',
    allergies: '',
    sensitivities: '',
    lifestyle_habits: '',
    sleep_quality: 'Average',
    water_intake: '1 - 2 L',
    environmental_exposure: 'Sun exposure'
  });

  const [assessment, setAssessment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setFormData({
            age_group: profile.age_group || '25-34',
            skin_type: profile.skin_type || 'Combination',
            primary_concern: profile.primary_concern || 'Acne',
            allergies: profile.allergies || '',
            sensitivities: profile.sensitivities || '',
            lifestyle_habits: profile.lifestyle_habits || '',
            sleep_quality: profile.sleep_quality || 'Average',
            water_intake: profile.water_intake || '1 - 2 L',
            environmental_exposure: profile.environmental_exposure || 'Sun exposure'
          });
          setIsEditing(true);
        }
      } catch {
        // If 404, start with defaults
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await saveProfile(formData);
      setMessage('Skin profile and clinical assessment updated successfully!');
      if (res?.assessment) {
        setAssessment(res.assessment);
      }
      setIsEditing(true);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to save skin profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading your clinical profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '980px' }}>
      {/* Hero */}
      <div className="feature-hero" style={{ background: 'linear-gradient(120deg, #ede8ff, #e7f8ff 50%, #fff0f6)' }}>
        <div>
          <span className="eyebrow">PATIENT PROFILE & TRIAGE DATA</span>
          <h1>Comprehensive Skin Profile</h1>
          <p>This profile drives your barrier risk calculations, AI intelligence scores, allergen exclusion filters, and routine generator.</p>
        </div>
        <div className="feature-emoji">🧬</div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: assessment ? '1.2fr 0.8fr' : '1fr', gap: '24px' }}>
        {/* Modern Form */}
        <form onSubmit={handleSubmit} className="modern-form">
          {/* Section 1: Demographics & Skin Basics */}
          <div className="form-section">
            <div className="section-title">
              <span>1</span>
              <div>
                <h3>Skin Demographics & Foundation</h3>
                <p>Fundamental skin classification parameters.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Age Group</label>
                <select name="age_group" value={formData.age_group} onChange={handleChange}>
                  {['Under 18', '18-24', '25-34', '35-44', '45-54', '55+'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Skin Type</label>
                <select name="skin_type" value={formData.skin_type} onChange={handleChange}>
                  {['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Primary Concern</label>
                <select name="primary_concern" value={formData.primary_concern} onChange={handleChange}>
                  {[
                    'Acne',
                    'Hyperpigmentation',
                    'Dark Spots',
                    'Uneven Skin Tone',
                    'Redness',
                    'Dryness',
                    'Fine Lines',
                    'Wrinkles'
                  ].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Allergies & Sensitivities */}
          <div className="form-section">
            <div className="section-title">
              <span>2</span>
              <div>
                <h3>Allergies & Contraindications</h3>
                <p>Ingredients listed here are automatically flagged and avoided in recommendations.</p>
              </div>
            </div>

            <div className="form-grid two">
              <div className="form-group">
                <label>Known Allergies (comma-separated)</label>
                <textarea
                  name="allergies"
                  rows="2"
                  placeholder="E.g., Fragrance, Essential oils, Parabens, Sulfates..."
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Reported Sensitivities (comma-separated)</label>
                <textarea
                  name="sensitivities"
                  rows="2"
                  placeholder="E.g., Alcohol denat, High-strength Vitamin C, Retinoids..."
                  value={formData.sensitivities}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lifestyle & Environmental Exposures */}
          <div className="form-section">
            <div className="section-title">
              <span>3</span>
              <div>
                <h3>Lifestyle & Environmental Context</h3>
                <p>Cellular recovery metrics and climate exposure factors.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Sleep Quality</label>
                <select name="sleep_quality" value={formData.sleep_quality} onChange={handleChange}>
                  {['Excellent', 'Good', 'Average', 'Poor'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Daily Water Intake</label>
                <select name="water_intake" value={formData.water_intake} onChange={handleChange}>
                  {['Less than 1 L', '1 - 2 L', '2 - 3 L', 'More than 3 L'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Environmental Exposure</label>
                <select name="environmental_exposure" value={formData.environmental_exposure} onChange={handleChange}>
                  {[
                    'Minimal exposure',
                    'Sun exposure',
                    'Pollution exposure',
                    'Dry climate',
                    'Sun and dry climate',
                    'High humidity'
                  ].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Lifestyle Habits & Stress Profile</label>
              <input
                type="text"
                name="lifestyle_habits"
                placeholder="E.g., High stress, occasional smoking, active gym routine..."
                value={formData.lifestyle_habits}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn-primary" style={{ minWidth: '180px' }}>
              {saving ? 'Saving...' : (isEditing ? 'Update Profile & Assessment' : 'Save Skin Profile')}
            </button>
          </div>
        </form>

        {/* Real-time Assessment Card (when available) */}
        {assessment && (
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="eyebrow">GENERATED ASSESSMENT</span>
              <span className={`status-badge ${assessment.risk_level === 'High' ? 'cancelled' : assessment.risk_level === 'Moderate' ? 'pending' : 'completed'}`}>
                {assessment.risk_level} Risk Level
              </span>
            </div>

            <h3 style={{ fontSize: '18px', color: '#2d3748', margin: '4px 0 10px' }}>
              Clinical Triage Insights
            </h3>

            {assessment.recommendations && assessment.recommendations.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <strong style={{ fontSize: '12px', color: '#166534', display: 'block', marginBottom: '6px' }}>
                  Core Directives:
                </strong>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {assessment.recommendations.map((rec, i) => (
                    <li key={i} style={{ fontSize: '12px', color: '#374151', padding: '8px 10px', background: '#f0fdf4', borderRadius: '8px' }}>
                      ✓ {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.risk_factors && assessment.risk_factors.length > 0 && (
              <div>
                <strong style={{ fontSize: '12px', color: '#b45309', display: 'block', marginBottom: '6px' }}>
                  Identified Modifiers:
                </strong>
                <div className="chips">
                  {assessment.risk_factors.map((rf, i) => (
                    <span key={i} className="chip" style={{ fontSize: '10px' }}>⚠️ {rf}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              <button onClick={() => navigate('/')} className="btn-primary" style={{ flex: 1, fontSize: '12px' }}>
                Go to Dashboard
              </button>
              <button onClick={() => navigate('/ai-analysis')} className="btn-secondary" style={{ flex: 1, fontSize: '12px' }}>
                Deep AI Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
