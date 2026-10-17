import React, { useState, useEffect } from 'react';
import { getProductRecommendations, compareProducts, getAlternatives } from '../services/api.js';

export default function ProductsPage() {
  const [category, setCategory] = useState('All');
  const [budget, setBudget] = useState('');
  const [search, setSearch] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [alternativesResult, setAlternativesResult] = useState(null);
  const [showAltModal, setShowAltModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (budget) params.budget = Number(budget);
      
      const res = await getProductRecommendations(params);
      const items = res?.recommendations || [];
      setRecommendations(items);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load product intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleSelect = (id) => {
    setSelectedForComparison(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedForComparison.length < 2) {
      setError('Please select at least 2 products to compare.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await compareProducts(selectedForComparison);
      setComparisonResult(res?.products || []);
      setShowCompareModal(true);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAlternatives = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAlternatives(productId);
      setAlternativesResult(res);
      setShowAltModal(true);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to fetch alternatives');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecs = recommendations.filter(item => {
    const p = item.product || {};
    const matchesSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container">
      {/* Hero */}
      <div className="feature-hero" style={{ background: 'linear-gradient(120deg, #eaf6ff, #efeaff 52%, #fff0f6)' }}>
        <div>
          <span className="eyebrow">FORMULATION INTELLIGENCE</span>
          <h1>Personalised Product Recommendations</h1>
          <p>Dermatologically vetted skincare formulations scored against your unique skin barrier, allergies, and tolerance profile.</p>
        </div>
        <div className="feature-emoji">🧴</div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="filter-bar">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          {['All', 'Face Wash', 'Serum', 'Moisturizer', 'Sunscreen', 'Treatment'].map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Max Budget (₹/USD)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={{ width: '160px' }}
        />

        <input
          type="text"
          placeholder="Search by name, brand, active..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />

        <button type="submit" className="btn-primary">
          Filter
        </button>

        {selectedForComparison.length > 0 && (
          <button
            type="button"
            onClick={handleCompare}
            className="btn-mint"
          >
            ⚖️ Compare ({selectedForComparison.length})
          </button>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="spinner" />}

      {/* Product Grid */}
      <div className="products-grid">
        {filteredRecs.length === 0 && !loading && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <h3>No products found</h3>
            <p>Try adjusting your category filter, budget, or search terms.</p>
          </div>
        )}

        {filteredRecs.map((item) => {
          const product = item.product || {};
          const isSelected = selectedForComparison.includes(product.id);
          const suitability = item.suitability_score || 0;

          return (
            <div key={product.id} className="product-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="badge" style={{ background: '#f0edff', color: '#684ed2' }}>
                  {product.category}
                </span>
                <span className={`status-badge ${suitability >= 80 ? 'completed' : suitability >= 65 ? 'pending' : 'cancelled'}`}>
                  {suitability}% Match
                </span>
              </div>

              <h4 style={{ fontSize: '17px', margin: '4px 0 2px', color: '#2b364e' }}>{product.name}</h4>
              <p className="brand" style={{ fontSize: '12px', color: '#7a879e', margin: '0 0 10px' }}>
                by {product.brand}
              </p>

              <p style={{ fontSize: '12px', color: '#56647e', lineHeight: 1.5, flex: 1, margin: '0 0 12px' }}>
                {product.description}
              </p>

              {/* Active Ingredient Details */}
              {product.active_ingredient_details && product.active_ingredient_details.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '10px', marginBottom: '10px', fontSize: '11px', color: '#4d5b75' }}>
                  <strong>Key Actives: </strong>
                  {product.active_ingredient_details.map(a => `${a.name} (${a.concentration})`).join(', ')}
                </div>
              )}

              {/* Suitability Reasons */}
              {item.reasons && item.reasons.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  {item.reasons.slice(0, 2).map((r, idx) => (
                    <span key={idx} style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      ✓ {r}
                    </span>
                  ))}
                </div>
              )}

              {/* Price & Rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf0f5', paddingTop: '10px', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--purple)' }}>
                    ₹{product.price}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>
                    ★ {product.rating}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewAlternatives(product.id)}
                  style={{ background: 'transparent', border: 0, color: 'var(--blue)', fontSize: '12px', fontWeight: 700 }}
                >
                  Alternatives →
                </button>
              </div>

              {/* Compare toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(product.id)}
                />
                Select to compare
              </label>
            </div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      {showCompareModal && comparisonResult && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 24, 38, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>⚖️ Formulation Comparison</h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="btn-secondary"
                style={{ padding: '6px 14px' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparisonResult.length}, 1fr)`, gap: '16px' }}>
              {comparisonResult.map((prod) => (
                <div key={prod.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', background: '#fafbff' }}>
                  <h4 style={{ fontSize: '15px', color: '#2c364f' }}>{prod.name}</h4>
                  <p style={{ fontSize: '12px', color: '#71809b' }}>{prod.brand} • {prod.category}</p>
                  
                  <div style={{ margin: '12px 0' }}>
                    <span className="badge badge-success">
                      {prod.personalized_suitability_score}% Match
                    </span>
                  </div>

                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--purple)', margin: '8px 0' }}>
                    ₹{prod.price}
                  </p>

                  <div style={{ marginTop: '12px' }}>
                    <small style={{ fontWeight: 800, color: '#475569', fontSize: '11px' }}>Suitability Factors:</small>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px', fontSize: '12px', color: '#334155' }}>
                      {prod.reasons?.map((r, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>✓ {r}</li>
                      ))}
                    </ul>
                  </div>

                  {prod.ingredients && prod.ingredients.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <small style={{ fontWeight: 800, color: '#475569', fontSize: '11px' }}>Ingredients:</small>
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        {prod.ingredients.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alternatives Modal */}
      {showAltModal && alternativesResult && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 24, 38, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2>Suggested Formulations</h2>
                <p style={{ fontSize: '13px', color: '#71809b' }}>
                  Smart alternatives for <strong>{alternativesResult.source_product?.name}</strong> (₹{alternativesResult.source_product?.price})
                </p>
              </div>
              <button
                onClick={() => setShowAltModal(false)}
                className="btn-secondary"
                style={{ padding: '6px 14px' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alternativesResult.alternatives?.map((item) => {
                const alt = item.product || {};
                return (
                  <div key={alt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #edf0f5' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', color: '#2d3748' }}>{alt.name}</h4>
                      <p style={{ fontSize: '12px', color: '#718096' }}>{alt.brand} • {alt.category}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <span className="badge badge-success">{item.suitability_score}% Match</span>
                        {item.reasons?.slice(0, 1).map((r, i) => (
                          <span key={i} style={{ fontSize: '11px', color: '#16a34a' }}>✓ {r}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--purple)' }}>₹{alt.price}</span>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>★ {alt.rating}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
