import React, { useState, useEffect, useRef } from 'react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification
} from '../services/api.js';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('routine');
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount()
      ]);
      setNotifications(listRes?.notifications || []);
      setUnreadCount(countRes?.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleQuickAdd = async (title, message, category) => {
    try {
      setLoading(true);
      await createNotification({
        title,
        message,
        category,
        action_url: category === 'consultation' ? '/consultations' : '/progress'
      });
      await fetchNotifications();
      setShowAddModal(false);
      setCustomTitle('');
    } catch (err) {
      console.error('Failed to create reminder:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'hydration': return '💧';
      case 'routine': return '⏰';
      case 'consultation': return '🩺';
      case 'product': return '🧴';
      case 'alert': return '⚠️';
      default: return '🔔';
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        title="Notifications & Routine Reminders"
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          background: open ? '#ede9fe' : '#ffffff',
          display: 'grid',
          placeItems: 'center',
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '9px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              animation: 'pulse 2s infinite'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '0',
            width: '360px',
            maxHeight: '480px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
            border: '1px solid #e2e8f0',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                Notifications & Reminders
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => setShowAddModal(!showAddModal)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: '#7c3aed',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                + Reminder
              </button>
            </div>
          </div>

          {/* Quick Create Reminder Bar */}
          {showAddModal && (
            <div style={{ padding: '12px 16px', background: '#f5f3ff', borderBottom: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginBottom: '8px' }}>
                Quick Routine Reminder
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. Evening Retinol Routine..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    outline: 'none'
                  }}
                />
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{
                    padding: '6px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff'
                  }}
                >
                  <option value="routine">Routine</option>
                  <option value="hydration">Hydration</option>
                  <option value="product">Product</option>
                  <option value="consultation">Doctor</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span
                  onClick={() => handleQuickAdd('💧 Daily Hydration Goal', 'Remember to drink your 2L water goal to maintain dermal turgor.', 'hydration')}
                  style={{ fontSize: '10px', padding: '3px 7px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  + 💧 2L Water
                </span>
                <span
                  onClick={() => handleQuickAdd('🧴 Reapply SPF 50', '2 hours passed! Reapply broad-spectrum sunscreen protection.', 'routine')}
                  style={{ fontSize: '10px', padding: '3px 7px', background: '#fef3c7', color: '#92400e', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  + 🧴 Reapply SPF
                </span>
                <span
                  onClick={() => handleQuickAdd('🌙 Night Barrier Repair', 'Time for night cleanse, 0.3% Retinol & Ceramide recovery cream.', 'routine')}
                  style={{ fontSize: '10px', padding: '3px 7px', background: '#ede9fe', color: '#6d28d9', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  + 🌙 Night Routine
                </span>
              </div>
              {customTitle && (
                <button
                  disabled={loading}
                  onClick={() => handleQuickAdd(customTitle, `Custom reminder created: ${customTitle}`, customCategory)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    background: '#6d28d9',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Save Reminder
                </button>
              )}
            </div>
          )}

          {/* Notifications List */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '340px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>✨</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>All caught up!</div>
                <div style={{ fontSize: '11px' }}>No active routine or triage alerts.</div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    background: item.is_read ? '#ffffff' : '#f8faff',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: item.is_read ? '#f1f5f9' : '#e0e7ff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '16px',
                      flexShrink: 0
                    }}
                  >
                    {getCategoryIcon(item.category)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: item.is_read ? 600 : 700,
                        color: item.is_read ? '#475569' : '#0f172a',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </span>
                      {!item.is_read && (
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            flexShrink: 0
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        lineHeight: 1.4,
                        marginBottom: '4px'
                      }}
                    >
                      {item.message}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {item.category} • {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
