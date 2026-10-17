import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendAIChatMessage } from '../services/api.js';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hi! I'm Dr. Skin, your AI Skincare Assistant. I can help analyze active ingredient conflicts, troubleshoot breakouts, or triage skin reactions. How can I help your skin today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_red_flag: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const quickPrompts = [
    "Can I use Retinol with Vitamin C?",
    "How to soothe broken skin barrier?",
    "Severe sudden facial swelling & rash",
    "What order should I layer serums?",
    "Recommend routine for hormonal acne"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history for API
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await sendAIChatMessage(query, history);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res?.response || "I have analyzed your query based on clinical dermatology guidelines.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_red_flag: res?.is_red_flag || false,
        urgency: res?.urgency || 'low',
        actions: res?.suggested_actions || []
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I encountered a clinical telemetry hiccup. Please verify your connection or try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_red_flag: false
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000
        }}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(124, 58, 237, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.35)';
            }}
          >
            <span style={{ fontSize: '18px' }}>🤖</span>
            <span>Ask Dr. Skin AI</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ade80',
                display: 'inline-block'
              }}
            />
          </button>
        )}
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.22)',
            border: '1px solid #e2e8f0',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '18px'
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.2px' }}>
                  Dr. Skin AI Assistant
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                  Clinical Triage & Formulation Bot
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setMessages([messages[0]])}
                title="Clear Chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: '4px'
                }}
              >
                🔄
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Window"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0 4px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div
            style={{
              padding: '8px 12px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
              display: 'flex',
              gap: '6px'
            }}
          >
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  background: '#ede9fe',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#fafbfd'
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isUser ? '#6d28d9' : '#ffffff',
                      color: isUser ? '#ffffff' : '#1e293b',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      boxShadow: isUser
                        ? '0 4px 12px rgba(109, 40, 217, 0.2)'
                        : '0 2px 6px rgba(0, 0, 0, 0.05)',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.text}

                    {/* Red-Flag Urgent Clinical Alert Card */}
                    {msg.is_red_flag && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px 12px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '10px',
                          color: '#991b1b'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                          <span>🚨</span> CLINICAL RED-FLAG DETECTED
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>
                          Potential severe dermatological reaction. Do not delay medical assessment.
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate('/appointments');
                            }}
                            style={{
                              padding: '5px 9px',
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            📅 Book Urgent Tele-Care
                          </button>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate('/consultations');
                            }}
                            style={{
                              padding: '5px 9px',
                              background: '#fff',
                              color: '#b91c1c',
                              border: '1px solid #fca5a5',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            💬 Triage Queue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      marginTop: '3px',
                      padding: '0 4px'
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                <span style={{ fontSize: '16px' }}>🤖</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  Dr. Skin is analyzing formulation and clinical guidelines...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div
            style={{
              padding: '12px 14px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Ask a skin, routine, or ingredient query..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: 'none',
                background: inputMessage.trim() ? '#6d28d9' : '#cbd5e1',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: inputMessage.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s ease'
              }}
            >
              Send
            </button>
          </div>

          {/* Clinical Disclaimer */}
          <div
            style={{
              padding: '4px 10px',
              background: '#f1f5f9',
              fontSize: '9px',
              color: '#64748b',
              textAlign: 'center',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            Virtual AI assistant for educational triage. Always consult Dr. Chen for prescription guidance.
          </div>
        </div>
      )}
    </>
  );
}
