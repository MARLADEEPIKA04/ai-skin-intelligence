import React, { useState, useEffect } from 'react';
import { getIngredients, getIngredient, analyzeIngredient } from '../services/api.js';
import IngredientConflictChecker from '../components/IngredientConflictChecker.jsx';

export default function IngredientsPage() {
  const [pageTab, setPageTab] = useState('conflict'); // 'conflict' or 'directory'
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [customIngredient, setCustomIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIngredients(query, category);
      const list = res?.ingredients || [];
      setIngredients(list);
      if (list.length > 0 && !selectedIngredient) {
        handleSelect(list[0].name);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to fetch ingredients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIngredients();
  };

  const handleSelect = async (name) => {
    setLoading(true);
    setAnalysisResult(null);
    try {
      const res = await getIngredient(name);
      setSelectedIngredient(res);
      // Auto-analyze fit against profile
      try {
        const fit = await analyzeIngredient(name);
        setAnalysisResult(fit?.personalized_fit || fit);
      } catch {
        // Fit analysis optional if profile not set
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to fetch ingredient details');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAnalyze = async (e) => {
    e.preventDefault();
    if (!customIngredient.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeIngredient(customIngredient.trim());
      if (res?.found && res.ingredient) {
        setSelectedIngredient(res.ingredient);
        setAnalysisResult(res.personalized_fit);
      } else {
        setError(res?.message || `"${customIngredient}" is not cataloged in our clinical database yet.`);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container">
      {/* Hero */}
      <div className="feature-hero" style={{ background: 'linear-gradient(120deg, #e7fbf4, #e8f5ff 50%, #fff4df)' }}>
        <div>
          <span className="eyebrow">BIOACTIVE PHARMACOPOEIA</span>
          <h1>Ingredient Intelligence</h1>
          <p>Scientific active-ingredient profiles, cellular mechanisms, concentration benchmarks, and allergy contraindications.</p>
        </div>
        <div className="feature-emoji">🧪</div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setPageTab('conflict')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: pageTab === 'conflict' ? '1px solid #7c3aed' : '1px solid #cbd5e1',
            background: pageTab === 'conflict' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#ffffff',
            color: pageTab === 'conflict' ? '#ffffff' : '#475569',
            boxShadow: pageTab === 'conflict' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none'
          }}
        >
          ⚡ Active Interaction & Conflict Checker
        </button>
        <button
          onClick={() => setPageTab('directory')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: pageTab === 'directory' ? '1px solid #7c3aed' : '1px solid #cbd5e1',
            background: pageTab === 'directory' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#ffffff',
            color: pageTab === 'directory' ? '#ffffff' : '#475569',
            boxShadow: pageTab === 'directory' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none'
          }}
        >
          🔬 Bioactive Pharmacopoeia Catalog
        </button>
      </div>

      {pageTab === 'conflict' ? (
        <IngredientConflictChecker />
      ) : (
        <div>
          {/* Filter and Search Bar */}
          <form onSubmit={handleSearchSubmit} className="filter-bar">
        <input
          type="text"
          placeholder="Search by ingredient name (e.g. Niacinamide, Vitamin C)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ minWidth: '160px' }}
        >
          {['', 'Vitamin B3', 'Antioxidant', 'Humectant', 'BHA', 'Barrier Lipids', 'Peptides'].map(cat => (
            <option key={cat} value={cat}>{cat ? cat : 'All Bio-Categories'}</option>
          ))}
        </select>

        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '20px' }}>
        {/* Ingredients Directory List */}
        <div className="card" style={{ padding: '16px', maxHeight: '720px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '15px', color: '#38425d', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #edf0f5' }}>
            Cataloged Actives ({ingredients.length})
          </h3>

          {loading && !selectedIngredient && <div className="spinner" />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ingredients.map((ing) => {
              const isSelected = selectedIngredient?.name?.toLowerCase() === ing.name?.toLowerCase();
              return (
                <div
                  key={ing.id || ing.name}
                  onClick={() => handleSelect(ing.name)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isSelected ? '#eee8ff' : '#f8fafc',
                    border: isSelected ? '1px solid #c9bcf5' : '1px solid #edf0f5',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px', color: isSelected ? 'var(--purple)' : '#2d3748' }}>
                      {ing.name}
                    </strong>
                    <span className="badge" style={{ fontSize: '10px' }}>{ing.category}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#71809b', margin: '4px 0 0', lineHeight: 1.4 }}>
                    {ing.benefits}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Analyzer Box */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #edf0f5' }}>
            <h4 style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>🔍 Test Custom Active</h4>
            <form onSubmit={handleCustomAnalyze} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Active ingredient..."
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button type="submit" disabled={analyzing} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px' }}>
                {analyzing ? '...' : 'Check'}
              </button>
            </form>
          </div>
        </div>

        {/* Selected Ingredient Dossier */}
        <div>
          {selectedIngredient ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <span className="eyebrow">{selectedIngredient.category}</span>
                  <h2 style={{ fontSize: '26px', margin: '4px 0', color: '#2c354e' }}>
                    {selectedIngredient.name}
                  </h2>
                </div>
                {analysisResult && (
                  <div className="score-orb" style={{ width: '110px', height: '90px' }}>
                    <strong style={{ fontSize: '32px' }}>{analysisResult.score}%</strong>
                    <span style={{ fontSize: '9px' }}>Profile Fit</span>
                  </div>
                )}
              </div>

              {/* Personalized Profile Fit Box */}
              {analysisResult && (
                <div style={{
                  background: analysisResult.score >= 75 ? 'linear-gradient(135deg, #f0fbf6, #e6f8ef)' : '#fff6e8',
                  border: `1px solid ${analysisResult.score >= 75 ? '#c3eed9' : '#f5df9d'}`,
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: analysisResult.score >= 75 ? '#166534' : '#92400e', fontSize: '13px' }}>
                      Personalized Profile Compatibility Score: {analysisResult.score}/100
                    </strong>
                    <span className={`status-badge ${analysisResult.score >= 75 ? 'completed' : 'pending'}`}>
                      {analysisResult.score >= 75 ? 'Recommended' : 'Caution Advised'}
                    </span>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                    {analysisResult.reasons?.map((r, i) => (
                      <li key={i} style={{ color: '#15803d' }}>✓ {r}</li>
                    ))}
                    {analysisResult.warnings?.map((w, i) => (
                      <li key={i} style={{ color: '#b45309' }}>⚠️ {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '14px', color: '#334155', marginBottom: '6px' }}>Biological Description</h4>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{selectedIngredient.description}</p>
              </div>

              {/* Benefits & Caution Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #edf0f5' }}>
                  <h4 style={{ fontSize: '13px', color: '#166534', marginBottom: '4px' }}>✨ Clinically Proven Benefits</h4>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>{selectedIngredient.benefits}</p>
                </div>
                <div style={{ background: '#fff7ed', padding: '14px', borderRadius: '14px', border: '1px solid #fed7aa' }}>
                  <h4 style={{ fontSize: '13px', color: '#c2410c', marginBottom: '4px' }}>⚠️ Usage Cautions</h4>
                  <p style={{ fontSize: '12px', color: '#7c2d12', lineHeight: 1.5 }}>{selectedIngredient.caution}</p>
                </div>
              </div>

              {/* Suitable Skin Types & Targets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', color: '#334155', marginBottom: '6px' }}>Suitable Skin Types</h4>
                  <div className="chips">
                    {selectedIngredient.suitable_skin_types?.map((t, i) => (
                      <span key={i} className="chip">💧 {t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', color: '#334155', marginBottom: '6px' }}>Target Concerns</h4>
                  <div className="chips">
                    {selectedIngredient.concern_targets?.map((c, i) => (
                      <span key={i} className="chip">🎯 {c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Common Interactions */}
              {selectedIngredient.common_interactions && (
                <div className="clinical-callout" style={{ marginTop: '10px' }}>
                  <strong>Ingredient Pairing & Synergy:</strong>
                  <p>{selectedIngredient.common_interactions}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Select an ingredient to view its scientific profile</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
);
}
