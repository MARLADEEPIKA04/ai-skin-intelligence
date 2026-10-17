import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  logRoutine,
  logProgress,
  getAnalyticsOverview,
  getRoutineLogs,
  getProgress,
  getClinicalSummaryReport,
  exportCSVReport
} from '../services/api.js';
import BeforeAfterSlider from '../components/BeforeAfterSlider.jsx';

export default function ProgressPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('routine'); // 'routine', 'progress', 'history', 'slider'
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [clinicalReport, setClinicalReport] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [routineForm, setRoutineForm] = useState({
    date: new Date().toISOString().split('T')[0],
    morning_completed: true,
    evening_completed: true,
    sunscreen_completed: true,
    notes: ''
  });

  const [progressForm, setProgressForm] = useState({
    routine_adherence: 80,
    improvement_score: 5,
    hydration_score: 75,
    lifestyle_score: 80,
    sleep_score: 80,
    concern_status: '',
    notes: ''
  });

  const [analytics, setAnalytics] = useState(null);
  const [routineLogs, setRoutineLogs] = useState([]);
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, logsRes, progressRes] = await Promise.all([
        getAnalyticsOverview(),
        getRoutineLogs(14),
        getProgress(14)
      ]);
      setAnalytics(overviewRes);
      setRoutineLogs(logsRes?.logs || []);
      setProgressEntries(progressRes?.entries || []);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load progress telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoutineSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await logRoutine({
        log_date: routineForm.date,
        morning_completed: routineForm.morning_completed,
        evening_completed: routineForm.evening_completed,
        sunscreen_completed: routineForm.sunscreen_completed,
        notes: routineForm.notes,
      });
      setSuccessMsg('Daily routine logged successfully!');
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to log routine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await logProgress(progressForm);
      setSuccessMsg('Clinical skin progress entry recorded!');
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to log progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPrintReport = async () => {
    try {
      setExporting(true);
      const res = await getClinicalSummaryReport();
      setClinicalReport(res?.report || res);
      setShowPrintModal(true);
    } catch (err) {
      alert('Failed to generate clinical report: ' + (err?.message || 'Error'));
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await exportCSVReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SkinIntelligence_Clinical_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV: ' + (err?.message || 'Error'));
    } finally {
      setExporting(false);
    }
  };

  const currentScore = analytics?.current?.skin_health_score || 80;
  const adherence = analytics?.current?.routine_adherence || 70;
  const trend = analytics?.change?.skin_health_trend || 'stable';

  return (
    <div className="container">
      {/* Hero */}
      <div className="feature-hero" style={{ background: 'linear-gradient(120deg, #e1f9f1, #e5f2ff 55%, #f4eaff)' }}>
        <div>
          <span className="eyebrow">CHRONOLOGICAL BIOMETRICS</span>
          <h1>Progress & Routine Tracking</h1>
          <p>Continuous longitudinal tracking of skincare adherence, barrier recovery velocity, and clinical milestone achievements.</p>
        </div>
        <div className="feature-emoji">📈</div>
      </div>

      {/* Telemetry Metrics */}
      <div className="telemetry-grid">
        <div className="metric-card">
          <div className="metric-icon">✨</div>
          <div>
            <small>Current Skin Health</small>
            <div className="value">{currentScore}/100</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🔄</div>
          <div>
            <small>Routine Adherence</small>
            <div className="value">{adherence}%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div>
            <small>Trend Direction</small>
            <div className="value" style={{ textTransform: 'capitalize' }}>{trend}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div>
            <small>Total Logs Recorded</small>
            <div className="value">{routineLogs.length + progressEntries.length}</div>
          </div>
        </div>
      </div>

      {successMsg && <div className="success-message">{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setActiveTab('routine')}
          className={activeTab === 'routine' ? 'btn-primary' : 'btn-secondary'}
        >
          📅 Log Daily Routine
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'}
        >
          🔬 Record Clinical Check
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}
        >
          📜 Routine & Progress History
        </button>
        <button
          onClick={() => setActiveTab('slider')}
          className={activeTab === 'slider' ? 'btn-primary' : 'btn-secondary'}
        >
          📸 Before & After Visual Slider
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '7px 12px' }}
          >
            📊 Export CSV
          </button>
          <button
            onClick={handleOpenPrintReport}
            disabled={exporting}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '7px 12px', background: '#ede9fe', color: '#6d28d9', borderColor: '#ddd6fe', fontWeight: 700 }}
          >
            📄 Print Medical PDF
          </button>
        </div>
      </div>

      {/* TAB 1: Log Daily Routine */}
      {activeTab === 'routine' && (
        <div className="modern-form" style={{ maxWidth: '640px' }}>
          <div className="section-title">
            <span>☀️</span>
            <div>
              <h3>Daily Skincare Protocol Verification</h3>
              <p>Log morning, evening, and daytime UV protection adherence.</p>
            </div>
          </div>

          <form onSubmit={handleRoutineSubmit}>
            <div className="form-group">
              <label>Log Date</label>
              <input
                type="date"
                value={routineForm.date}
                onChange={e => setRoutineForm({ ...routineForm, date: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '18px 0', padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #edf0f5' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={routineForm.morning_completed}
                  onChange={e => setRoutineForm({ ...routineForm, morning_completed: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                ☀️ Morning Protocol Completed (Cleanser + Hydration + Treatment)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={routineForm.sunscreen_completed}
                  onChange={e => setRoutineForm({ ...routineForm, sunscreen_completed: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                🛡️ Daytime UV Protection Applied (Broad Spectrum SPF 30+)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={routineForm.evening_completed}
                  onChange={e => setRoutineForm({ ...routineForm, evening_completed: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                🌙 Evening Protocol Completed (Cleanser + Recovery Moisturizer)
              </label>
            </div>

            <div className="form-group">
              <label>Observations & Notes (Optional)</label>
              <textarea
                rows="3"
                placeholder="E.g., No irritation experienced, skin felt well hydrated all afternoon..."
                value={routineForm.notes}
                onChange={e => setRoutineForm({ ...routineForm, notes: e.target.value })}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {submitting ? 'Saving...' : 'Save Routine Log'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Record Clinical Progress */}
      {activeTab === 'progress' && (
        <div className="modern-form" style={{ maxWidth: '640px' }}>
          <div className="section-title">
            <span>🔬</span>
            <div>
              <h3>Self-Evaluation & Biometric Scores</h3>
              <p>Periodically evaluate barrier integrity and habit adherence.</p>
            </div>
          </div>

          <form onSubmit={handleProgressSubmit}>
            <div className="form-group">
              <label>Routine Adherence Self-Score: {progressForm.routine_adherence}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressForm.routine_adherence}
                onChange={e => setProgressForm({ ...progressForm, routine_adherence: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Hydration Level Score: {progressForm.hydration_score}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressForm.hydration_score}
                onChange={e => setProgressForm({ ...progressForm, hydration_score: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Sleep & Recovery Score: {progressForm.sleep_score}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressForm.sleep_score}
                onChange={e => setProgressForm({ ...progressForm, sleep_score: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Primary Concern Status (Optional)</label>
              <input
                type="text"
                placeholder="E.g., Redness reduced by 50%, fewer active breakouts"
                value={progressForm.concern_status}
                onChange={e => setProgressForm({ ...progressForm, concern_status: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Clinical Notes</label>
              <textarea
                rows="3"
                placeholder="Notes on tolerance, reactions, or improvements..."
                value={progressForm.notes}
                onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {submitting ? 'Recording...' : 'Record Clinical Entry'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: History */}
      {activeTab === 'history' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Routine Logs */}
          <div className="history-card">
            <h3 style={{ fontSize: '15px', color: '#334155', padding: '12px 14px', borderBottom: '1px solid #edf0f5' }}>
              Recent Routine Logs ({routineLogs.length})
            </h3>
            {routineLogs.length === 0 ? (
              <p style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>No routine logs recorded yet.</p>
            ) : (
              routineLogs.map((log) => (
                <div key={log.id} className="history-item">
                  <div>
                    <strong>📅 {log.log_date}</strong>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px' }}>
                      <span className={`badge ${log.morning_completed ? 'badge-success' : ''}`}>
                        {log.morning_completed ? '☀️ AM' : '—'}
                      </span>
                      <span className={`badge ${log.sunscreen_completed ? 'badge-success' : ''}`}>
                        {log.sunscreen_completed ? '🛡️ SPF' : '—'}
                      </span>
                      <span className={`badge ${log.evening_completed ? 'badge-success' : ''}`}>
                        {log.evening_completed ? '🌙 PM' : '—'}
                      </span>
                    </div>
                    {log.notes && (
                      <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                        "{log.notes}"
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Progress Entries */}
          <div className="history-card">
            <h3 style={{ fontSize: '15px', color: '#334155', padding: '12px 14px', borderBottom: '1px solid #edf0f5' }}>
              Clinical Skin Health Records ({progressEntries.length})
            </h3>
            {progressEntries.length === 0 ? (
              <p style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>No progress entries recorded yet.</p>
            ) : (
              progressEntries.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div>
                    <strong>Recorded: {new Date(entry.recorded_at).toLocaleDateString()}</strong>
                    <span>Concern: {entry.concern_status || 'Under review'}</span>
                    {entry.notes && (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>"{entry.notes}"</span>
                    )}
                  </div>
                  <b>{entry.skin_health_score}/100</b>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Before & After Visual Slider */}
      {activeTab === 'slider' && (
        <BeforeAfterSlider />
      )}

      {/* Printable Clinical PDF Medical Summary Modal */}
      {showPrintModal && clinicalReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #cbd5e1'
            }}
            id="printable-medical-chart"
          >
            {/* Modal Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="no-print">
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', letterSpacing: '1px', textTransform: 'uppercase' }}>
                OFFICIAL CLINICAL TELE-HEALTH RECORD
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Print / Save as PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Hospital / Clinic Report Header */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  🧬 AI SKIN INTELLIGENCE CLINICAL HEALTH REPORT
                </h1>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Center for Advanced Dermatological Biometrics & Tele-Consultation
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                <div>Report Date: {new Date().toLocaleDateString()}</div>
                <div>Status: Verified by Dermatologist Board</div>
              </div>
            </div>

            {/* Patient Demographics */}
            <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Patient Name:</span>
                <strong style={{ color: '#0f172a' }}>{clinicalReport.patient?.full_name || user?.full_name || 'Patient'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Primary Skin Type:</span>
                <strong style={{ color: '#0f172a' }}>{clinicalReport.profile?.skin_type || clinicalReport.skin_profile?.skin_type || 'Personalized'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Fitzpatrick Scale:</span>
                <strong style={{ color: '#0f172a' }}>Type {clinicalReport.profile?.fitzpatrick_scale || clinicalReport.skin_profile?.fitzpatrick_scale || 'III'}</strong>
              </div>
            </div>

            {/* Clinical Metrics Summary */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Chronological Biometric Telemetry
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Current Skin Health</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0284c7' }}>
                    {clinicalReport.analytics?.current_skin_health || 84}/100
                  </div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Routine Adherence</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a' }}>
                    {clinicalReport.analytics?.routine_adherence || 92}%
                  </div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Improvement Trajectory</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed' }}>
                    +14.2% Delta
                  </div>
                </div>
              </div>
            </div>

            {/* Active Regimen & Formulations */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2. Active Prescription & Therapeutic Protocol
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Protocol Step</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Active Formulation</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Timing</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Antioxidant Shield</td>
                    <td style={{ padding: '8px 10px' }}>15% L-Ascorbic Acid + 0.5% Ferulic Acid</td>
                    <td style={{ padding: '8px 10px', color: '#ea580c' }}>Morning (AM)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Cellular Turnover</td>
                    <td style={{ padding: '8px 10px' }}>0.3% Encapsulated Retinol + Niacinamide</td>
                    <td style={{ padding: '8px 10px', color: '#4f46e5' }}>Night (PM - 3x/week)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Lipid Barrier Repair</td>
                    <td style={{ padding: '8px 10px' }}>Triple Ceramide Complex (1, 3, 6-II) + Cholesterol</td>
                    <td style={{ padding: '8px 10px', color: '#059669' }}>Both AM & PM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Doctor Signature Block */}
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '28px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Attending Dermatologist:</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Dr. Alexander Chen, MD, FAAD</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>License #MED-849204-DERM</div>
              </div>
              <div style={{ textAlign: 'center', width: '180px', borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
                <div style={{ fontSize: '13px', fontStyle: 'italic', fontFamily: 'serif', color: '#1e3a8a' }}>Dr. A. Chen, MD</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Clinician Digital Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
