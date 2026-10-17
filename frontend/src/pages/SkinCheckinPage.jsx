import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { uploadCheckinPhoto, uploadCheckinCamera, analyzeCheckin, getCheckinHistory } from '../services/api.js';

export default function SkinCheckinPage() {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoQuality, setPhotoQuality] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'camera'

  // Camera stream state & refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [formData, setFormData] = useState({
    pimple_count: 0,
    scar_count: 0,
    stretch_mark_count: 0,
    wrinkle_count: 0,
    pigmentation_spot_count: 0,
    redness_level: 0,
    dryness_level: 0,
    irritation_level: 0,
    has_scars: false,
    has_stretch_marks: false,
    has_wrinkles: false,
    photo_source: 'gallery',
    notes: ''
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await getCheckinHistory(10);
      setHistory(res?.checkins || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error('Failed to load checkin history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    return () => {
      stopCamera();
    };
  }, []);

  // WebCam handling
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      setCameraError('Unable to access webcam. Please check permissions or upload from gallery.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoPreview(dataUrl);
    stopCamera();

    // Upload snapshot to backend
    setUploading(true);
    setError(null);
    try {
      const res = await uploadCheckinCamera(dataUrl);
      setPhotoUrl(res?.photo_url);
      setPhotoQuality(res?.photo_quality);
      setFormData(prev => ({ ...prev, photo_source: 'camera' }));
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Webcam photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);

    try {
      const res = await uploadCheckinPhoto(file);
      setPhotoUrl(res?.photo_url);
      setPhotoQuality(res?.photo_quality);
      setFormData(prev => ({ ...prev, photo_source: 'gallery' }));
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCountChange = (field, delta, booleanFlagField = null) => {
    setFormData(prev => {
      const newCount = Math.max(0, Math.min(100, (prev[field] || 0) + delta));
      const updates = { [field]: newCount };
      if (booleanFlagField) {
        updates[booleanFlagField] = newCount > 0;
      }
      return { ...prev, ...updates };
    });
  };

  const handleToggle = (flagField, countField) => {
    setFormData(prev => {
      const nextVal = !prev[flagField];
      return {
        ...prev,
        [flagField]: nextVal,
        [countField]: nextVal && prev[countField] === 0 ? 1 : (!nextVal ? 0 : prev[countField])
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        photo_url: photoUrl,
      };

      const res = await analyzeCheckin(payload);
      setResult(res);
      fetchHistory();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Check-in analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Hero */}
      <div className="feature-hero checkin-hero">
        <div>
          <span className="eyebrow">COMPUTER-ASSISTED TRIAGE</span>
          <h1>Photo-Assisted Skin Check-in</h1>
          <p>Document localized facial changes with live webcam or photo upload, quantify lesions, assess erythema, and track clinical recovery.</p>
        </div>
        <div className="feature-emoji">📸</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1.15fr 0.85fr', gap: '24px' }}>
        {/* Check-in Form */}
        <div className="modern-form">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Photo Capture (Live Camera & Gallery) */}
            <div className="form-section">
              <div className="section-title">
                <span>1</span>
                <div>
                  <h3>Skin Photo Capture</h3>
                  <p>Choose between live webcam capture or uploading from your local gallery.</p>
                </div>
              </div>

              {/* Source Switcher */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => { setActiveTab('upload'); stopCamera(); }}
                  className={activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                >
                  📁 Gallery Upload
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('camera'); startCamera(); }}
                  className={activeTab === 'camera' ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                >
                  📷 Live Webcam
                </button>
              </div>

              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                background: '#f8fafc',
                marginBottom: '14px'
              }}>
                {activeTab === 'camera' ? (
                  <div>
                    {cameraError ? (
                      <div style={{ color: '#ef4444', fontSize: '13px', padding: '10px' }}>
                        {cameraError}
                      </div>
                    ) : (
                      <div>
                        {isCameraActive ? (
                          <div>
                            <video
                              ref={videoRef}
                              playsInline
                              autoPlay
                              muted
                              style={{ width: '100%', maxHeight: '240px', borderRadius: '12px', background: '#000', objectFit: 'cover' }}
                            />
                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="btn-primary"
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                              >
                                📸 Capture Photo
                              </button>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                              >
                                Stop Camera
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {photoPreview ? (
                              <div>
                                <img
                                  src={photoPreview}
                                  alt="Captured skin snapshot"
                                  style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '12px', objectFit: 'contain' }}
                                />
                                <div style={{ marginTop: '10px' }}>
                                  <button
                                    type="button"
                                    onClick={startCamera}
                                    className="btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: '12px' }}
                                  >
                                    Retake Webcam Photo
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '10px 0' }}>Webcam is ready</p>
                                <button
                                  type="button"
                                  onClick={startCamera}
                                  className="btn-primary"
                                  style={{ padding: '8px 16px', fontSize: '13px' }}
                                >
                                  ▶ Turn On Camera
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {photoPreview ? (
                      <div>
                        <img
                          src={photoPreview}
                          alt="Uploaded check-in"
                          style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '12px', objectFit: 'contain' }}
                        />
                        <div style={{ marginTop: '10px' }}>
                          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            Change Photo
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '32px' }}>📷</span>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 12px' }}>
                          Select a facial photo (JPEG, PNG, WEBP)
                        </p>
                        <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                          {uploading ? 'Processing Image...' : 'Choose Skin Photo'}
                          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {photoQuality && (
                  <div style={{ marginTop: '12px', padding: '10px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <span>Quality Rating: {photoQuality.quality_label}</span>
                      <span>Score: {photoQuality.score}/100</span>
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                      {photoQuality.notes?.join(' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Structured Lesion & Skin Observations */}
            <div className="form-section">
              <div className="section-title">
                <span>2</span>
                <div>
                  <h3>Structured Lesion Observations</h3>
                  <p>Quantify lesion counts and mark specific visual dermatological traits.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {/* Pimples */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #edf0f5' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    🔴 Pimples / Blemishes
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => handleCountChange('pimple_count', -1)} className="btn-secondary" style={{ padding: '6px 12px' }}>-</button>
                    <span style={{ fontSize: '16px', fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{formData.pimple_count}</span>
                    <button type="button" onClick={() => handleCountChange('pimple_count', 1)} className="btn-secondary" style={{ padding: '6px 12px' }}>+</button>
                  </div>
                </div>

                {/* Pigmentation Spots */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #edf0f5' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    🟤 Pigmentation Spots
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => handleCountChange('pigmentation_spot_count', -1)} className="btn-secondary" style={{ padding: '6px 12px' }}>-</button>
                    <span style={{ fontSize: '16px', fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{formData.pigmentation_spot_count}</span>
                    <button type="button" onClick={() => handleCountChange('pigmentation_spot_count', 1)} className="btn-secondary" style={{ padding: '6px 12px' }}>+</button>
                  </div>
                </div>

                {/* Scars (with has_scars flag) */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #edf0f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      🩹 Scars / Marks
                    </label>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#64748b' }}>
                      <input
                        type="checkbox"
                        checked={formData.has_scars}
                        onChange={() => handleToggle('has_scars', 'scar_count')}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => handleCountChange('scar_count', -1, 'has_scars')} className="btn-secondary" style={{ padding: '6px 12px' }}>-</button>
                    <span style={{ fontSize: '16px', fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{formData.scar_count}</span>
                    <button type="button" onClick={() => handleCountChange('scar_count', 1, 'has_scars')} className="btn-secondary" style={{ padding: '6px 12px' }}>+</button>
                  </div>
                </div>

                {/* Stretch Marks (with has_stretch_marks flag) */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #edf0f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      ⚡ Stretch Marks
                    </label>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#64748b' }}>
                      <input
                        type="checkbox"
                        checked={formData.has_stretch_marks}
                        onChange={() => handleToggle('has_stretch_marks', 'stretch_mark_count')}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => handleCountChange('stretch_mark_count', -1, 'has_stretch_marks')} className="btn-secondary" style={{ padding: '6px 12px' }}>-</button>
                    <span style={{ fontSize: '16px', fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{formData.stretch_mark_count}</span>
                    <button type="button" onClick={() => handleCountChange('stretch_mark_count', 1, 'has_stretch_marks')} className="btn-secondary" style={{ padding: '6px 12px' }}>+</button>
                  </div>
                </div>

                {/* Wrinkles (with has_wrinkles flag) */}
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #edf0f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      〰️ Fine Lines / Wrinkles
                    </label>
                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#64748b' }}>
                      <input
                        type="checkbox"
                        checked={formData.has_wrinkles}
                        onChange={() => handleToggle('has_wrinkles', 'wrinkle_count')}
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => handleCountChange('wrinkle_count', -1, 'has_wrinkles')} className="btn-secondary" style={{ padding: '6px 12px' }}>-</button>
                    <span style={{ fontSize: '16px', fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{formData.wrinkle_count}</span>
                    <button type="button" onClick={() => handleCountChange('wrinkle_count', 1, 'has_wrinkles')} className="btn-secondary" style={{ padding: '6px 12px' }}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Severity Levels */}
            <div className="form-section">
              <div className="section-title">
                <span>3</span>
                <div>
                  <h3>Sensory & Barrier Symptoms</h3>
                  <p>Rate the intensity of facial symptoms on a 0-5 scale.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Erythema / Redness Level: {formData.redness_level}/5</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.redness_level}
                  onChange={e => setFormData({ ...formData, redness_level: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Skin Dryness / Flakiness: {formData.dryness_level}/5</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.dryness_level}
                  onChange={e => setFormData({ ...formData, dryness_level: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Stinging / Irritation Level: {formData.irritation_level}/5</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.irritation_level}
                  onChange={e => setFormData({ ...formData, irritation_level: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Clinical Notes / Context</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Recent sun exposure, tried a new active serum, post-workout flare..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px' }}>
              {loading ? 'Analyzing Skin Health...' : '⚡ Analyze Check-in'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div>
          {result ? (
            <div className="card" style={{ background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="eyebrow">CHECK-IN REPORT</span>
                <span className={`status-badge ${result.analysis?.concern_level === 'High' ? 'cancelled' : result.analysis?.concern_level === 'Moderate' ? 'pending' : 'completed'}`}>
                  {result.analysis?.concern_level || 'Low'} Concern Level
                </span>
              </div>

              <div className="score-banner" style={{ margin: '0 0 18px', padding: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#2d3748' }}>Check-in Score</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Algorithmic lesion & erythema severity calculation</p>
                </div>
                <div className="score-orb" style={{ width: '90px', height: '80px' }}>
                  <strong style={{ fontSize: '28px' }}>{result.analysis?.score}</strong>
                  <span style={{ fontSize: '8px' }}>Score</span>
                </div>
              </div>

              {/* Observed Signals */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', color: '#334155', marginBottom: '6px' }}>Clinical Signals Detected</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.analysis?.signals?.map((sig, idx) => (
                    <li key={idx} style={{ padding: '8px 12px', background: '#fafbff', borderRadius: '10px', fontSize: '12px', color: '#475569', border: '1px solid #edf0f5' }}>
                      • {sig}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', color: '#334155', marginBottom: '6px' }}>Targeted Directives</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.analysis?.actions?.map((act, idx) => (
                    <li key={idx} style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: '10px', fontSize: '12px', color: '#166534', border: '1px solid #dcfce7' }}>
                      ✓ {act}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Doctor Guidance */}
              {result.dermatologist_recommendation && (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12px', color: '#1e293b' }}>🩺 Professional Dermatology Assessment</strong>
                    <span className="badge" style={{ fontSize: '10px' }}>
                      {result.dermatologist_recommendation.urgency} Urgency
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 10px', lineHeight: 1.5 }}>
                    {result.dermatologist_recommendation.next_step}
                  </p>
                  {result.dermatologist_recommendation.consultation_recommended && (
                    <Link to="/consultations" className="btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }}>
                      Request Consultation →
                    </Link>
                  )}
                </div>
              )}

              {/* Product Matches */}
              {result.product_recommendations && result.product_recommendations.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', color: '#334155', marginBottom: '8px' }}>Matched Regimen Care</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.product_recommendations.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fbfcfe', border: '1px solid #edf0f5', borderRadius: '10px', fontSize: '12px' }}>
                        <div>
                          <strong>{p.product?.name}</strong>
                          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>{p.product?.category}</span>
                        </div>
                        <span className="badge badge-success">{p.suitability_score}% Match</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>Check-in History ({history.length})</h3>
              {history.length === 0 ? (
                <div className="empty-state">
                  <p>No previous skin check-ins found. Complete your first check-in to track progress!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #edf0f5' }}>
                      <div>
                        <strong>{new Date(item.created_at).toLocaleDateString()}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                          Pimples: {item.pimple_count} • Redness: {item.redness_level}/5 • Irritation: {item.irritation_level}/5
                          {item.has_scars && ' • Scars'} {item.has_wrinkles && ' • Wrinkles'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`status-badge ${item.concern_level === 'High' ? 'cancelled' : item.concern_level === 'Moderate' ? 'pending' : 'completed'}`}>
                          {item.concern_level}
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--purple)', marginTop: '4px' }}>
                          {item.analysis_score}/100
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
