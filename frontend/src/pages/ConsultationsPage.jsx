import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyConsultations, getConsultationStats, createConsultation, getSpecialists, acceptConsultation } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ConsultationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'in_review', 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    subject: '',
    description: '',
    dermatologist_id: '',
    priority: 'medium',
  });

  const isSpecialist = user?.role === 'dermatologist' || user?.role === 'consultant' || user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cons, st, specs] = await Promise.all([
        getMyConsultations(),
        getConsultationStats(),
        getSpecialists().catch(() => ({ dermatologists: [], consultants: [] })),
      ]);
      setConsultations(Array.isArray(cons) ? cons : cons?.consultations || []);
      setStats(st);
      const allSpec = [
        ...(specs?.dermatologists || []),
        ...(specs?.consultants || []),
      ];
      setSpecialists(allSpec);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to fetch consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        subject: newConsultation.subject,
        description: newConsultation.description,
        priority: newConsultation.priority,
        dermatologist_id: newConsultation.dermatologist_id ? Number(newConsultation.dermatologist_id) : null,
      };
      await createConsultation(payload);
      setShowModal(false);
      setNewConsultation({ subject: '', description: '', dermatologist_id: '', priority: 'medium' });
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAccept = async (e, id) => {
    e.stopPropagation();
    try {
      await acceptConsultation(id);
      await fetchData();
      navigate(`/consultations/${id}`);
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to accept consultation');
    }
  };

  const filtered = consultations.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <div className="container">
      {/* Hero */}
      <div className="consultation-hero">
        <div>
          <span className="eyebrow" style={{ color: isSpecialist ? '#0284c7' : 'var(--purple)' }}>
            {isSpecialist ? 'CLINICAL TELE-DERMATOLOGY SPECIALIST PORTAL' : 'PROFESSIONAL TELE-DERMATOLOGY'}
          </span>
          <h1>Clinical Consultations & Tele-Health</h1>
          <p>
            {isSpecialist
              ? 'Review incoming patient requests, claim triage cases, communicate via secure live chat, and issue clinical regimens.'
              : 'Direct asynchronous and live tele-channel with board-certified dermatologists and licensed skincare consultants.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isSpecialist && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + Request Consultation
            </button>
          )}
          {isSpecialist && (
            <button onClick={() => navigate('/')} className="btn-secondary">
              ← Doctor Workspace
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Available Specialists Directory Banner for Patients */}
      {!isSpecialist && specialists.length > 0 && (
        <div className="card" style={{ marginBottom: '22px', background: 'linear-gradient(135deg, #f8faff, #f4f6ff)', border: '1px solid #dce4f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', margin: 0, color: '#1e293b' }}>👨‍⚕️ Available Specialists Ready for Consultation</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Select a specialist when creating a case, or submit to the general emergency queue.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
              Book with Specialist
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {specialists.map((s) => (
              <div key={s.id} style={{ background: '#fff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: s.role === 'dermatologist' ? '#e0f2fe' : '#d1fae5', color: s.role === 'dermatologist' ? '#0369a1' : '#047857', display: 'grid', placeItems: 'center', fontSize: '18px', fontWeight: 800 }}>
                  {s.role === 'dermatologist' ? '🩺' : '🌿'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.full_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{s.title}</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>★ {s.rating} • Available Now</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Counter Bar */}
      {stats && (
        <div className="telemetry-grid" style={{ marginBottom: '20px' }}>
          <div className="metric-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon">📑</div>
            <div>
              <small>Total Cases</small>
              <div className="value">{stats.total || consultations.length || 0}</div>
            </div>
          </div>
          <div className="metric-card" onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon" style={{ background: '#fff3d5', color: '#b45309' }}>⏳</div>
            <div>
              <small>Pending Triage</small>
              <div className="value">{stats.pending || consultations.filter(c => c.status === 'pending').length}</div>
            </div>
          </div>
          <div className="metric-card" onClick={() => setFilter('in_review')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>🩺</div>
            <div>
              <small>In Review</small>
              <div className="value">{stats.in_review || consultations.filter(c => c.status === 'in_review').length}</div>
            </div>
          </div>
          <div className="metric-card" onClick={() => setFilter('completed')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✅</div>
            <div>
              <small>Completed</small>
              <div className="value">{stats.completed || consultations.filter(c => c.status === 'completed').length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'pending', 'in_review', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-primary' : 'btn-secondary'}
            style={{ textTransform: 'capitalize' }}
          >
            {f === 'in_review' ? 'In Review' : f}
          </button>
        ))}
      </div>

      {loading && consultations.length === 0 && <div className="spinner" />}

      {/* Consultations Cards Grid */}
      <div className="consultation-list">
        {filtered.length === 0 && !loading && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <h3>No consultations found</h3>
            <p>
              {isSpecialist
                ? 'No active patient cases found in this category.'
                : 'You have not requested any consultations under this status. Click "Request Consultation" to start.'}
            </p>
          </div>
        )}

        {filtered.map((c) => {
          const isPending = c.status === 'pending';
          const isAssignedToMe = c.dermatologist_id === user?.id;

          return (
            <div
              key={c.id}
              onClick={() => navigate(`/consultations/${c.id}`)}
              className="consultation-card"
            >
              <div className="consultation-card-top">
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`status-badge ${c.status}`}>
                    {c.status?.replace('_', ' ')}
                  </span>
                  <span className={`priority-badge ${c.priority}`}>
                    {c.priority} Priority
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Case #{c.id} • {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3>{c.subject}</h3>
              <p style={{ lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {c.description}
              </p>

              <div className="consultation-meta">
                {c.patient_name && <span>👤 Patient: <strong>{c.patient_name}</strong></span>}
                {c.skin_type && <span>🧬 {c.skin_type} Skin</span>}
                {c.primary_concern && <span>🎯 {c.primary_concern}</span>}
                {c.dermatologist_name ? (
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>
                    👨‍⚕️ {c.dermatologist_name}
                  </span>
                ) : (
                  <span style={{ color: '#b45309', fontWeight: 600 }}>
                    ⏳ Awaiting specialist triage
                  </span>
                )}
              </div>

              {/* Action row for specialists */}
              {isSpecialist && isPending && (
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>Unassigned Patient Request</span>
                  <button
                    onClick={(e) => handleQuickAccept(e, c.id)}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    ✓ Claim & Open Case
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Consultation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 24, 38, 0.6)',
          backdropFilter: 'blur(5px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Request Clinical Consultation</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Your recorded skin profile, AI diagnostic metrics, and history will be automatically shared with the reviewing specialist.
            </p>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Preferred Specialist (Optional)</label>
                <select
                  value={newConsultation.dermatologist_id}
                  onChange={(e) => setNewConsultation({ ...newConsultation, dermatologist_id: e.target.value })}
                >
                  <option value="">Next Available Licensed Specialist (Recommended)</option>
                  {specialists.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} — {s.title} ({s.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Urgency / Priority Level</label>
                <select
                  value={newConsultation.priority}
                  onChange={(e) => setNewConsultation({ ...newConsultation, priority: e.target.value })}
                >
                  <option value="low">Routine Advice (Low Priority)</option>
                  <option value="medium">Standard Concern (Medium Priority)</option>
                  <option value="high">Acute Flare-up / Painful Breakout (High Priority)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subject / Primary Complaint</label>
                <input
                  type="text"
                  placeholder="E.g., Persistent inflammatory breakouts on jawline and erythema"
                  value={newConsultation.subject}
                  onChange={(e) => setNewConsultation({ ...newConsultation, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Detailed Description of Symptoms & History</label>
                <textarea
                  rows="4"
                  placeholder="Describe when the issue began, current products used, whether it hurts or itches, and any triggers..."
                  value={newConsultation.description}
                  onChange={(e) => setNewConsultation({ ...newConsultation, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
