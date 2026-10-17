import React, { useState, useEffect } from 'react';
import {
  getExecutiveDashboard,
  getClinicalSummaryReport,
  exportCSVReport,
  exportJSONReport
} from '../services/api.js';

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);

  // Clinical Summary Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getExecutiveDashboard();
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load executive dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenReport = async () => {
    setShowReportModal(true);
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await getClinicalSummaryReport();
      setReportData(res);
    } catch (err) {
      setReportError(err?.response?.data?.detail || err.message || 'Failed to generate clinical summary report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const blob = await exportCSVReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skin_intelligence_clinical_data_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('CSV Export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportJSON = async () => {
    setExportingJSON(true);
    try {
      const json = await exportJSONReport();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skin_intelligence_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('JSON Export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExportingJSON(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
        <p style={{ color: '#64748b' }}>Aggregating clinical intelligence & platform telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboard} className="btn-primary" style={{ marginTop: '16px' }}>Retry Loading</button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const telemetry = data?.consultations_telemetry || {};
  const distributions = data?.distributions || {};
  const lesions = data?.lesion_telemetry || {};

  const totalConcerns = Object.values(distributions.concerns || {}).reduce((a, b) => a + b, 0) || 1;
  const totalSkinTypes = Object.values(distributions.skin_types || {}).reduce((a, b) => a + b, 0) || 1;
  const totalRisks = Object.values(distributions.risk_levels || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="container">
      {/* Hero Header */}
      <div className="feature-hero" style={{ background: 'linear-gradient(135deg, #2c354e 0%, #1e2436 100%)', color: '#fff' }}>
        <div>
          <span className="eyebrow" style={{ color: '#a5b4fc' }}>MILESTONE 4 • EXECUTIVE SUITE</span>
          <h1 style={{ color: '#fff' }}>Clinical Analytics & Intelligence Dashboard</h1>
          <p style={{ color: '#cbd5e1' }}>
            High-level cohort diagnostics, tele-dermatology throughput, automated clinical reporting, and data governance export modules.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button onClick={handleOpenReport} className="btn-primary" style={{ background: 'var(--purple)', border: 'none', padding: '10px 18px', fontSize: '13px' }}>
              📄 View Clinical Summary Report
            </button>
            <button onClick={handleExportCSV} disabled={exportingCSV} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', padding: '10px 18px', fontSize: '13px' }}>
              {exportingCSV ? 'Generating CSV...' : '📥 Export Clinical CSV'}
            </button>
            <button onClick={handleExportJSON} disabled={exportingJSON} className="btn-secondary" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', padding: '10px 18px', fontSize: '13px' }}>
              {exportingJSON ? 'Exporting JSON...' : '💾 Export JSON'}
            </button>
            <button onClick={fetchDashboard} className="btn-secondary" style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 14px', fontSize: '13px' }}>
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="feature-emoji">📈</div>
      </div>

      {/* KPI Telemetry Grid */}
      <div className="telemetry-grid" style={{ marginBottom: '24px' }}>
        <div className="telemetry-card">
          <span className="t-label">Registered Cohort</span>
          <span className="t-val">{kpis.total_users || 0}</span>
          <span className="t-sub">{kpis.patients || 0} Patients • {kpis.dermatologists || 0} Specialists</span>
        </div>

        <div className="telemetry-card">
          <span className="t-label">Tele-Consultations</span>
          <span className="t-val">{kpis.total_consultations || 0}</span>
          <span className="t-sub">{kpis.completed_consultations || 0} resolved ({kpis.completion_rate_pct || 0}%)</span>
        </div>

        <div className="telemetry-card">
          <span className="t-label">Photo Check-ins</span>
          <span className="t-val">{kpis.total_checkins || 0}</span>
          <span className="t-sub">Avg score: {kpis.average_checkin_score || 0}/100</span>
        </div>

        <div className="telemetry-card">
          <span className="t-label">Active Pharmacopoeia</span>
          <span className="t-val">{kpis.catalog_ingredients || 0}</span>
          <span className="t-sub">{kpis.active_catalog_products || 0} verified clinical products</span>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Tele-Dermatology Throughput */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', color: '#2c354e' }}>🩺 Tele-Dermatology Pipeline</h3>
            <span className="badge badge-purple">{telemetry.completion_rate_pct || 0}% Completion</span>
          </div>

          <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: '#e2e8f0', marginBottom: '16px' }}>
            <div style={{ width: `${(telemetry.completed / Math.max(telemetry.total, 1)) * 100}%`, background: 'var(--mint)' }} title="Completed" />
            <div style={{ width: `${(telemetry.in_review / Math.max(telemetry.total, 1)) * 100}%`, background: 'var(--blue)' }} title="In Review" />
            <div style={{ width: `${(telemetry.pending / Math.max(telemetry.total, 1)) * 100}%`, background: 'var(--yellow)' }} title="Pending" />
            <div style={{ width: `${(telemetry.cancelled / Math.max(telemetry.total, 1)) * 100}%`, background: 'var(--danger)' }} title="Cancelled" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Pending Review</div>
              <strong style={{ fontSize: '16px', color: '#d97706' }}>{telemetry.pending || 0}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>In Clinical Review</div>
              <strong style={{ fontSize: '16px', color: '#2563eb' }}>{telemetry.in_review || 0}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Completed Cases</div>
              <strong style={{ fontSize: '16px', color: '#16a34a' }}>{telemetry.completed || 0}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Cancelled / Closed</div>
              <strong style={{ fontSize: '16px', color: '#dc2626' }}>{telemetry.cancelled || 0}</strong>
            </div>
          </div>
        </div>

        {/* Risk Stratification Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', color: '#2c354e' }}>⚠️ Clinical Risk Stratification</h3>
            <span className="badge badge-neutral">{Object.values(distributions.risk_levels || {}).reduce((a, b) => a + b, 0)} Profiles</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(distributions.risk_levels || {}).map(([risk, count]) => {
              const pct = Math.round((count / totalRisks) * 100);
              const color = risk === 'High' ? 'var(--danger)' : risk === 'Moderate' ? 'var(--amber)' : 'var(--mint)';
              return (
                <div key={risk}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span>{risk} Risk Cohort</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesion & Erythema Telemetry */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', color: '#2c354e' }}>🔬 Lesion Telemetry Aggregates</h3>
            <span className="badge badge-purple">{kpis.total_checkins || 0} Checks</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700 }}>🔴 Pimples Detected</div>
              <strong style={{ fontSize: '20px', color: '#b91c1c' }}>{lesions.total_pimples_detected || 0}</strong>
            </div>

            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>🩹 Scars Logged</div>
              <strong style={{ fontSize: '20px', color: '#15803d' }}>{lesions.total_scars_recorded || 0}</strong>
            </div>

            <div style={{ background: '#fdf4ff', padding: '12px', borderRadius: '10px', border: '1px solid #fae8ff' }}>
              <div style={{ fontSize: '11px', color: '#86198f', fontWeight: 700 }}>⚡ Stretch Marks</div>
              <strong style={{ fontSize: '20px', color: '#a21caf' }}>{lesions.total_stretch_marks_recorded || 0}</strong>
            </div>

            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700 }}>〰️ Wrinkles Logged</div>
              <strong style={{ fontSize: '20px', color: '#1d4ed8' }}>{lesions.total_wrinkles_recorded || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Section (Concerns & Skin Types) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Primary Concerns */}
        <div className="card">
          <h3 style={{ fontSize: '15px', color: '#2c354e', marginBottom: '14px' }}>🎯 Primary Dermatological Concerns</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(distributions.concerns || {}).map(([concern, count]) => {
              const pct = Math.round((count / totalConcerns) * 100);
              return (
                <div key={concern}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{concern}</span>
                    <span style={{ color: '#64748b' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--purple)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skin Types */}
        <div className="card">
          <h3 style={{ fontSize: '15px', color: '#2c354e', marginBottom: '14px' }}>🧬 Skin Classification Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(distributions.skin_types || {}).map(([type, count]) => {
              const pct = Math.round((count / totalSkinTypes) * 100);
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{type} Skin</span>
                    <span style={{ color: '#64748b' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--blue)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          CLINICAL SUMMARY REPORT MODAL (PRINT-READY)
      ========================================================= */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#1e293b', margin: 0 }}>Clinical Skincare Summary Report</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Report Ref: {reportData?.report_id || 'Generating...'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {reportLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Synthesizing patient history, AI diagnostics, and clinical recommendations...</p>
                </div>
              ) : reportError ? (
                <div className="error-message">{reportError}</div>
              ) : reportData ? (
                <div className="printable-report">
                  {/* Clinic Header */}
                  <div style={{ borderBottom: '2px solid #2c354e', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', color: '#2c354e', margin: 0 }}>AI SKIN INTELLIGENCE CLINICAL REPORT</h2>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>Authoritative Dermatological Decision Support Document</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                      <div>Date: {new Date(reportData.generated_at).toLocaleString()}</div>
                      <div>Status: <strong>VERIFIED CLINICAL RECORD</strong></div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Patient Name</span>
                      <strong style={{ display: 'block', fontSize: '14px' }}>{reportData.patient?.full_name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{reportData.patient?.email} (ID #{reportData.patient?.id})</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Profile Classification</span>
                      <strong style={{ display: 'block', fontSize: '14px' }}>
                        {reportData.skin_profile?.skin_type} Skin • {reportData.skin_profile?.primary_concern}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Risk Stratification: <strong style={{ color: reportData.clinical_assessment?.risk_level === 'High' ? '#dc2626' : '#2563eb' }}>{reportData.clinical_assessment?.risk_level}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Skin Health Scores & Intelligence */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '18px' }}>
                    <div style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Calculated Skin Index</span>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--purple)', margin: '8px 0' }}>
                        {reportData.skin_health_index?.score || 80}/100
                      </div>
                      <span className="badge badge-purple">{reportData.skin_health_index?.status || 'Good'}</span>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                      <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>AI Clinical Insights</strong>
                      <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#475569', margin: 0 }}>
                        {reportData.ai_intelligence?.insights?.slice(0, 3).map((ins, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Prescribed Routine Summary */}
                  <div style={{ marginBottom: '18px' }}>
                    <h4 style={{ fontSize: '13px', color: '#2c354e', marginBottom: '8px' }}>Prescribed Protocol</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div style={{ background: '#fdf4ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fae8ff', fontSize: '12px' }}>
                        <strong style={{ color: '#86198f', display: 'block', marginBottom: '4px' }}>☀️ Morning Routine:</strong>
                        {reportData.prescribed_routine?.morning?.map((m, idx) => (
                          <div key={idx} style={{ marginBottom: '2px' }}>• {m.step || m}</div>
                        ))}
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dcfce7', fontSize: '12px' }}>
                        <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>🌙 Evening Routine:</strong>
                        {reportData.prescribed_routine?.evening?.map((e, idx) => (
                          <div key={idx} style={{ marginBottom: '2px' }}>• {e.step || e}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Physician Sign-Off Block */}
                  <div style={{ marginTop: '24px', borderTop: '2px dashed #cbd5e1', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '12px' }}>
                      Official Physician & Dermatologist Sign-Off
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Reviewing Specialist:</div>
                        <div style={{ borderBottom: '1px solid #94a3b8', height: '28px', marginTop: '4px' }}>Dr. A. Vance, MD (Dermatology)</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Clinical Signature / Stamp & Date:</div>
                        <div style={{ borderBottom: '1px solid #94a3b8', height: '28px', marginTop: '4px', fontStyle: 'italic', color: '#475569' }}>
                          Verified via AI-TeleMed ID #{reportData.patient?.id}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '12px', fontStyle: 'italic' }}>
                      {reportData.disclaimer}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
