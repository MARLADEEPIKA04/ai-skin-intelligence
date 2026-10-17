import React, { useState, useEffect, useContext } from 'react';
import {
  getSpecialists,
  getAvailableAppointmentSlots,
  bookAppointment,
  getMyAppointments,
  cancelAppointment
} from '../services/api.js';
import { AuthContext } from '../context/AuthContext';

export default function AppointmentsPage() {
  const { user } = useContext(AuthContext);
  const [specialists, setSpecialists] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState('tele-video');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [specRes, apptRes] = await Promise.all([
        getSpecialists(),
        getMyAppointments()
      ]);
      const specs = specRes?.specialists || [];
      setSpecialists(specs);
      if (specs.length > 0 && !selectedSpecialist) {
        setSelectedSpecialist(specs[0]);
      }
      setMyAppointments(apptRes?.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  // Fetch slots whenever specialist or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedSpecialist?.id) return;
      try {
        const res = await getAvailableAppointmentSlots(selectedSpecialist.id, selectedDate);
        const slots = res?.available_slots || [];
        setAvailableSlots(slots);
        if (slots.length > 0) {
          setSelectedSlot(slots[0]);
        } else {
          setSelectedSlot('');
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      }
    };
    fetchSlots();
  }, [selectedSpecialist, selectedDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSpecialist || !selectedSlot) {
      setErrorMsg('Please select a specialist and an available time slot.');
      return;
    }
    setBookingLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        specialist_id: selectedSpecialist.id,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        consultation_type: consultationType,
        reason: reason || 'General clinical dermatological evaluation'
      };
      await bookAppointment(payload);
      setSuccessMsg(`Tele-consultation successfully booked with ${selectedSpecialist.full_name} for ${selectedDate} at ${selectedSlot}!`);
      setShowBookingModal(false);
      setReason('');
      // Refresh list
      const apptRes = await getMyAppointments();
      setMyAppointments(apptRes?.appointments || []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || err.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled tele-consultation?')) return;
    try {
      await cancelAppointment(id);
      setMyAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="container">
      {/* Hero */}
      <div className="feature-hero" style={{ background: 'linear-gradient(120deg, #ede9fe, #e0f2fe 50%, #f0fdf4)' }}>
        <div>
          <span className="eyebrow">TELE-DERMATOLOGY & SPECIALIST CARE</span>
          <h1>Clinical Appointment Scheduling</h1>
          <p>
            Schedule encrypted 1-on-1 virtual telemedicine consultations with board-certified dermatologists and licensed aesthetic consultants.
          </p>
        </div>
        <div className="feature-emoji">📅</div>
      </div>

      {successMsg && <div className="success-message" style={{ marginBottom: '16px' }}>{successMsg}</div>}
      {errorMsg && <div className="error-message" style={{ marginBottom: '16px' }}>{errorMsg}</div>}

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
            {user?.role === 'dermatologist' || user?.role === 'consultant'
              ? 'My Patient Tele-Consultation Schedule'
              : 'My Scheduled Tele-Consultations'}
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Direct access to live telemedicine video rooms and clinical triage notes.
          </p>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
          }}
        >
          + Book New Tele-Consultation
        </button>
      </div>

      {/* Scheduled Appointments Grid */}
      {myAppointments.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📆</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>No Active Appointments</h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px', margin: '6px auto 16px' }}>
            You do not have any upcoming tele-consultations booked. Choose a specialist below to schedule your evaluation.
          </p>
          <button
            onClick={() => setShowBookingModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#7c3aed',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Schedule First Tele-Consultation
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {myAppointments.map((appt) => {
            const isDoctor = user?.role === 'dermatologist';
            const isCancelled = appt.status === 'cancelled';
            return (
              <div
                key={appt.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: isCancelled ? '1px solid #e2e8f0' : '1px solid #c7d2fe',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  opacity: isCancelled ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: appt.specialist_role === 'dermatologist' ? '#e0f2fe' : '#d1fae5',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '20px'
                        }}
                      >
                        {appt.specialist_role === 'dermatologist' ? '🩺' : '🌿'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                          {isDoctor ? (appt.patient_name || 'Patient') : (appt.specialist_name || 'Specialist')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {appt.specialist_role === 'dermatologist' ? 'Board-Certified Dermatologist' : 'Aesthetic Consultant'}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background:
                          appt.status === 'scheduled' ? '#dcfce7' : appt.status === 'completed' ? '#e0e7ff' : '#f1f5f9',
                        color:
                          appt.status === 'scheduled' ? '#15803d' : appt.status === 'completed' ? '#4338ca' : '#64748b'
                      }}
                    >
                      {appt.status}
                    </span>
                  </div>

                  {/* Timing & Modality */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>📅 Date:</span>
                      <span>{appt.appointment_date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>⏰ Time Slot:</span>
                      <span style={{ color: '#6d28d9', fontWeight: 800 }}>{appt.time_slot}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>📹 Format:</span>
                      <span style={{ textTransform: 'capitalize' }}>{appt.consultation_type?.replace('-', ' ')}</span>
                    </div>
                  </div>

                  {appt.reason && (
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '10px', fontStyle: 'italic' }}>
                      "{appt.reason}"
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  {appt.meeting_url && !isCancelled && (
                    <a
                      href={appt.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#10b981',
                        color: '#ffffff',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📹</span> Join Telehealth Room
                    </a>
                  )}

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #fca5a5',
                        background: '#fff',
                        color: '#dc2626',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Specialists Showcase */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '14px' }}>
          Our Clinical Board Specialists
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {specialists.map((spec) => (
            <div
              key={spec.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: spec.role === 'dermatologist' ? '#e0f2fe' : '#d1fae5',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '22px'
                    }}
                  >
                    {spec.role === 'dermatologist' ? '👨‍⚕️' : '🌿'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                      {spec.full_name}
                    </div>
                    <div style={{ fontSize: '12px', color: spec.role === 'dermatologist' ? '#0284c7' : '#059669', fontWeight: 700 }}>
                      {spec.role === 'dermatologist' ? 'Board-Certified Dermatologist' : 'Clinical Aesthetic Consultant'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, marginBottom: '10px' }}>
                  {spec.bio || 'Specializes in medical acne protocols, retinoid titration, and barrier rehabilitation.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {spec.specialties?.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 600
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSpecialist(spec);
                  setShowBookingModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '8px',
                  border: '1px solid #7c3aed',
                  background: '#f5f3ff',
                  color: '#6d28d9',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                Schedule Appointment with {spec.full_name.split(' ')[1] || spec.full_name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Book Tele-Consultation
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Select your specialist, date, and preferred video time slot.
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook}>
              {/* Specialist Selection */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Specialist:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {specialists.map((spec) => (
                    <div
                      key={spec.id}
                      onClick={() => setSelectedSpecialist(spec)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: selectedSpecialist?.id === spec.id ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                        background: selectedSpecialist?.id === spec.id ? '#ede9fe' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                        {spec.full_name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {spec.role === 'dermatologist' ? 'Dermatologist' : 'Consultant'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Appointment Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px'
                  }}
                  required
                />
              </div>

              {/* Time Slot Selection */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Available Time Slots:
                </label>
                {availableSlots.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#dc2626', padding: '8px', background: '#fef2f2', borderRadius: '8px' }}>
                    No open slots on this date. Please choose another date.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: selectedSlot === slot ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                          background: selectedSlot === slot ? '#7c3aed' : '#f8fafc',
                          color: selectedSlot === slot ? '#ffffff' : '#334155',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modality */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Consultation Format:
                </label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px'
                  }}
                >
                  <option value="tele-video">📹 Video Tele-Health (HD Encrypted)</option>
                  <option value="direct-chat">💬 Direct Clinical Messaging Session</option>
                  <option value="routine-audit">📑 Comprehensive Regimen Formulation Audit</option>
                </select>
              </div>

              {/* Chief Complaint / Notes */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Chief Complaint / Reason for Consultation:
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Skin redness after starting Retinol, cystic flare-up on chin..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {bookingLoading ? 'Securing Slot...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
