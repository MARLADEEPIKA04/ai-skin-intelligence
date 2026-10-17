import React, { useState, useEffect } from 'react';
import { checkIngredientConflicts, getInteractionMatrix } from '../services/api.js';

const AVAILABLE_ACTIVES = [
  { id: 'retinol', name: 'Retinol (Retinoid)', tag: 'Cell Turnover' },
  { id: 'glycolic_acid', name: 'Glycolic Acid (AHA)', tag: 'Chemical Exfoliant' },
  { id: 'salicylic_acid', name: 'Salicylic Acid (BHA)', tag: 'Pore Clarifier' },
  { id: 'vitamin_c', name: 'Vitamin C (L-Ascorbic)', tag: 'Antioxidant Brightener' },
  { id: 'benzoyl_peroxide', name: 'Benzoyl Peroxide', tag: 'Antimicrobial Acne' },
  { id: 'niacinamide', name: 'Niacinamide (Vit B3)', tag: 'Barrier & Sebum' },
  { id: 'hyaluronic_acid', name: 'Hyaluronic Acid', tag: 'Humectant' },
  { id: 'ceramides', name: 'Ceramides Complex', tag: 'Lipid Barrier' },
  { id: 'azelaic_acid', name: 'Azelaic Acid', tag: 'Anti-Redness' },
  { id: 'copper_peptides', name: 'Copper Peptides', tag: 'Collagen Remodeling' },
  { id: 'centella', name: 'Centella Asiatica', tag: 'Soothing Repair' }
];

const PRESETS = [
  {
    name: '⚠️ Risky Acne Layering',
    ingredients: ['Retinol', 'Glycolic Acid', 'Benzoyl Peroxide']
  },
  {
    name: '✨ Golden Barrier Synergy',
    ingredients: ['Retinol', 'Ceramides', 'Niacinamide', 'Centella Asiatica']
  },
  {
    name: '☀️ AM Antioxidant Glow',
    ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Niacinamide']
  }
];

export default function IngredientConflictChecker() {
  const [selected, setSelected] = useState(['Retinol', 'Ceramides', 'Hyaluronic Acid']);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('checker'); // 'checker' | 'matrix'
  const [matrixData, setMatrixData] = useState([]);

  const runAnalysis = async (ingredientsList) => {
    if (!ingredientsList || ingredientsList.length === 0) {
      setAnalysis(null);
      return;
    }
    setLoading(true);
    try {
      const res = await checkIngredientConflicts(ingredientsList);
      setAnalysis(res);
    } catch (err) {
      console.error('Failed to analyze interactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatrix = async () => {
    try {
      const res = await getInteractionMatrix();
      setMatrixData(res?.matrix || []);
    } catch (err) {
      console.error('Failed to fetch matrix:', err);
    }
  };

  useEffect(() => {
    runAnalysis(selected);
    fetchMatrix();
  }, []);

  const toggleIngredient = (name) => {
    let next;
    if (selected.includes(name)) {
      next = selected.filter(x => x !== name);
    } else {
      next = [...selected, name];
    }
    setSelected(next);
    runAnalysis(next);
  };

  const applyPreset = (presetIngredients) => {
    setSelected(presetIngredients);
    runAnalysis(presetIngredients);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            MODULE 5: BIOCHEMICAL PHARMACOKINETICS
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
            Active Ingredient Conflict & Synergy Matrix
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Multi-active interaction analysis, pH contraindications, oxidative inactivation alerts, and smart AM/PM routine layer schedules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('checker')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: activeTab === 'checker' ? '1px solid #7c3aed' : '1px solid #cbd5e1',
              background: activeTab === 'checker' ? '#ede9fe' : '#ffffff',
              color: activeTab === 'checker' ? '#6d28d9' : '#475569',
              cursor: 'pointer'
            }}
          >
            ⚡ Routine Conflict Checker
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: activeTab === 'matrix' ? '1px solid #7c3aed' : '1px solid #cbd5e1',
              background: activeTab === 'matrix' ? '#ede9fe' : '#ffffff',
              color: activeTab === 'matrix' ? '#6d28d9' : '#475569',
              cursor: 'pointer'
            }}
          >
            📊 Master Interaction Matrix
          </button>
        </div>
      </div>

      {activeTab === 'checker' ? (
        <div>
          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Test Scenarios:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p.ingredients)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Actives Multi-Selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Select Active Ingredients in Your Daily Regimen:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {AVAILABLE_ACTIVES.map((item) => {
                const isSelected = selected.some(s => s.toLowerCase().includes(item.id.replace('_', ' ')) || item.name.toLowerCase().includes(s.toLowerCase()));
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleIngredient(item.name.split(' (')[0])}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #6d28d9' : '1px solid #e2e8f0',
                      background: isSelected ? '#7c3aed' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{item.name}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b'
                      }}
                    >
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysis && (
            <div>
              {/* Score Banner */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: analysis.score >= 85 ? '#ecfdf5' : analysis.score >= 60 ? '#fffbeb' : '#fef2f2',
                  border: `1px solid ${analysis.score >= 85 ? '#a7f3d0' : analysis.score >= 60 ? '#fde68a' : '#fecaca'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: `4px solid ${getScoreColor(analysis.score)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '18px',
                      color: '#0f172a'
                    }}
                  >
                    <span>{analysis.score}</span>
                    <span style={{ fontSize: '8px', color: '#64748b', marginTop: '-4px' }}>/ 100</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      {analysis.score >= 85
                        ? 'Optimal Biochemical Compatibility'
                        : analysis.score >= 60
                        ? 'Cautionary Interactions Detected'
                        : 'Severe Active Conflict & Barrier Threat'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                      {analysis.conflicts?.length || 0} Conflict Warning(s) • {analysis.synergies?.length || 0} Synergistic Pairing(s)
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: getScoreColor(analysis.score),
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {analysis.score >= 85 ? 'Safe Layering' : analysis.score >= 60 ? 'Stagger Required' : 'High Risk'}
                </div>
              </div>

              {/* Conflicts List */}
              {analysis.conflicts && analysis.conflicts.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠️</span> Contraindications & Active Inactivations:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analysis.conflicts.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: '#fff1f2',
                          border: '1px solid #fecdd3'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#9f1239' }}>
                            {c.ingredient1} ⨉ {c.ingredient2}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#ffe4e6',
                              color: '#be123c'
                            }}
                          >
                            {c.severity}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#4c0519', lineHeight: 1.4, marginBottom: '6px' }}>
                          {c.reason}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                          💡 Clinical Layering Fix: {c.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Synergies List */}
              {analysis.synergies && analysis.synergies.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✨</span> Synergistic Bioactive Pairings:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analysis.synergies.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0'
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534', marginBottom: '2px' }}>
                          {s.ingredient1} + {s.ingredient2}
                        </div>
                        <div style={{ fontSize: '12px', color: '#14532d', lineHeight: 1.4 }}>
                          {s.benefit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Layering Schedule (AM vs PM) */}
              {analysis.layering_schedule && (
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
                    🗓️ Recommended Staggered Application Schedule
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {/* AM Routine */}
                    <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px', color: '#ea580c', marginBottom: '8px' }}>
                        <span>☀️</span> MORNING (AM) ROUTINE
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {analysis.layering_schedule.morning?.map((step, idx) => (
                          <div key={idx} style={{ fontSize: '12px', color: '#334155', display: 'flex', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: '#f97316' }}>Step {idx + 1}:</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PM Routine */}
                    <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '13px', color: '#4338ca', marginBottom: '8px' }}>
                        <span>🌙</span> EVENING (PM) ROUTINE
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {analysis.layering_schedule.evening?.map((step, idx) => (
                          <div key={idx} style={{ fontSize: '12px', color: '#334155', display: 'flex', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: '#6366f1' }}>Step {idx + 1}:</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Full Master Cross-Matrix Grid View */
        <div style={{ overflowX: 'auto' }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
            Reference guide of pairwise clinical interactions cataloged by dermatological pharmacology standards.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#1e293b' }}>Ingredient Pair</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#1e293b' }}>Compatibility</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#1e293b' }}>Clinical Mechanism</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#1e293b' }}>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row, idx) => {
                const isConflict = row.type === 'conflict';
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafbfd' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                      {row.pair?.[0]} + {row.pair?.[1]}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: isConflict ? '#fee2e2' : '#dcfce7',
                          color: isConflict ? '#b91c1c' : '#15803d'
                        }}
                      >
                        {isConflict ? '⚠️ Incompatible' : '✨ Synergistic'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569', lineHeight: 1.4 }}>
                      {row.notes || row.mechanism}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#0369a1', fontWeight: 600 }}>
                      {row.recommendation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
