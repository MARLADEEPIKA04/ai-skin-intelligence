import React, { useState, useRef, useEffect } from 'react';

const CLINICAL_CASES = [
  {
    id: 'acne',
    name: 'Acne Vulgaris & Erythema Recovery',
    duration: '45-Day Protocol',
    regimen: '0.1% Adapalene + 2.5% BPO + Ceramide Barrier Gel',
    metrics: [
      { label: 'Active Lesion Count', before: '28 papules', after: '3 papules', change: '-89%' },
      { label: 'Erythema Index', before: '72/100', after: '18/100', change: '-75%' },
      { label: 'Skin Barrier TEWL', before: '29.4 g/m²h', after: '12.1 g/m²h', change: '+58% seal' }
    ],
    // High-quality clinical photography representations via curated SVG gradient textures
    beforeGradient: 'radial-gradient(circle at 45% 55%, #fca5a5 15%, #f87171 35%, #fecaca 70%, #fed7aa 100%)',
    afterGradient: 'radial-gradient(circle at 50% 50%, #fed7aa 20%, #fef3c7 50%, #fbcfe8 90%)',
    beforeNotes: 'Active inflammatory papules, follicular plugging, marked erythema along bilateral cheeks.',
    afterNotes: 'Substantial pustular resolution, epidermal remodeling, mild residual post-inflammatory macules.'
  },
  {
    id: 'barrier',
    name: 'Compromised Barrier & Severe Dryness',
    duration: '28-Day Protocol',
    regimen: 'Triple Lipid Complex (3:1:1 Ceramides:Cholesterol:Fatty Acids) + 5% Panthenol',
    metrics: [
      { label: 'Hydration Level', before: '24/100', after: '84/100', change: '+250%' },
      { label: 'Desquamation (Flaking)', before: 'Severe', after: 'Nil', change: '-100%' },
      { label: 'Stinging Sensitivity', before: '9/10', after: '1/10', change: '-88%' }
    ],
    beforeGradient: 'radial-gradient(circle at 40% 40%, #e2e8f0 10%, #cbd5e1 30%, #fecdd3 75%, #fecaca 100%)',
    afterGradient: 'radial-gradient(circle at 50% 50%, #fef3c7 20%, #fed7aa 50%, #fbcfe8 85%)',
    beforeNotes: 'Micro-fissuring of stratum corneum, pronounced flaking, acute burning with hydrophilic serums.',
    afterNotes: 'Restored lipid bilayer, continuous hydrated epidermal matrix, zero neurosensory stinging.'
  },
  {
    id: 'pigmentation',
    name: 'Melasma & Sun Damage Clearance',
    duration: '60-Day Protocol',
    regimen: '15% L-Ascorbic Acid + 2% Alpha Arbutin + Daily SPF 50+ PA++++',
    metrics: [
      { label: 'Melanin Pigment Density', before: '82/100', after: '29/100', change: '-64%' },
      { label: 'Radiance Luminance', before: '41/100', after: '89/100', change: '+117%' },
      { label: 'Cellular Turnover', before: 'Slow (38d)', after: 'Optimal (26d)', change: '+31%' }
    ],
    beforeGradient: 'radial-gradient(circle at 60% 45%, #b45309 15%, #d97706 35%, #fed7aa 80%, #ffedd5 100%)',
    afterGradient: 'radial-gradient(circle at 50% 50%, #ffedd5 25%, #fef3c7 60%, #fae8ff 100%)',
    beforeNotes: 'Dermal & epidermal melasma hyper-pigment deposition over zygomatic arches.',
    afterNotes: 'Significant dispersion of melanocyte clusters, uniform luminosity and tone homogeneity.'
  }
];

export default function BeforeAfterSlider({ checkinHistory = [] }) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const activeCase = CLINICAL_CASES[selectedCaseIdx];

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging.current) {
        handleMove(e.clientX);
      }
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            MODULE 8: CLINICAL LONGITUDINAL COMPARISON
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
            Before & After Clinical Photo Slider
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Interactive biometric comparison displaying baseline skin pathology vs targeted post-treatment recovery.
          </p>
        </div>

        {/* Case Study Switcher */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CLINICAL_CASES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setSelectedCaseIdx(idx)}
              style={{
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '8px',
                border: idx === selectedCaseIdx ? '1px solid #7c3aed' : '1px solid #cbd5e1',
                background: idx === selectedCaseIdx ? '#ede9fe' : '#ffffff',
                color: idx === selectedCaseIdx ? '#6d28d9' : '#475569',
                cursor: 'pointer'
              }}
            >
              {c.name.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Case Details Banner */}
      <div
        style={{
          padding: '12px 16px',
          background: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
            Clinical Regimen:
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginLeft: '6px' }}>
            {activeCase.regimen}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
            ⏱ {activeCase.duration}
          </span>
        </div>
      </div>

      {/* Interactive Split-Slider Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'ew-resize',
          userSelect: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #e2e8f0'
        }}
      >
        {/* Right / After Layer (Full width underlying layer) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: activeCase.afterGradient,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            color: '#1e293b'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.92)',
                color: '#059669',
                fontWeight: 800,
                fontSize: '12px',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              DAY 45: CLEAR AFTER ✨
            </span>
          </div>

          <div
            style={{
              alignSelf: 'flex-end',
              maxWidth: '300px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.94)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#334155',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}
          >
            <div style={{ fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
              🔬 Microscopic Findings (Post-Protocol)
            </div>
            {activeCase.afterNotes}
          </div>
        </div>

        {/* Left / Before Layer (Clipped to slider percentage) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${sliderPos}%`,
            overflow: 'hidden',
            borderRight: '3px solid #ffffff'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
              minWidth: '600px',
              height: '100%',
              background: activeCase.beforeGradient,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px'
            }}
          >
            <div>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  color: '#dc2626',
                  fontWeight: 800,
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                DAY 0: BASELINE BEFORE ⚠️
              </span>
            </div>

            <div
              style={{
                maxWidth: '300px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.94)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#334155',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.8)'
              }}
            >
              <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: '4px' }}>
                🩺 Clinical Pathology Notes
              </div>
              {activeCase.beforeNotes}
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: '4px',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            boxShadow: '0 0 12px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#6d28d9',
              color: '#ffffff',
              border: '3px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              cursor: 'ew-resize'
            }}
          >
            ◂ ▸
          </div>
        </div>
      </div>

      {/* Slider Position Range Controller */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626' }}>Day 0 Before</span>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#6d28d9', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>Day 45 After</span>
        <span style={{ fontSize: '11px', color: '#64748b', minWidth: '40px', textAlign: 'right' }}>
          {Math.round(sliderPos)}%
        </span>
      </div>

      {/* Biometric Improvements Telemetry Grid */}
      <div
        style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}
      >
        {activeCase.metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>{m.before}</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{m.after}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#dcfce7',
                  color: '#15803d',
                  marginLeft: 'auto'
                }}
              >
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
