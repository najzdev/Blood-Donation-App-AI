import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../utils/api.js';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import './AIChat.css';

const SUGGESTIONS = [
  'Which blood type is the universal donor?',
  'What are the eligibility criteria for blood donation?',
  'How long can donated blood be stored?',
  'What is the difference between A+ and A- blood?',
  'When should a patient receive O- blood?',
  'What medical conditions disqualify a donor?',
];

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '👋 Hello! I\'m your BloodBank AI assistant powered by Gemini. I can help you with blood compatibility, donor eligibility, patient priorities, and general blood bank operations. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await aiAPI.chat(msg);
      setMessages(m => [...m, { role: 'assistant', text: res.data.reply, usingAI: res.data.usingAI }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: '❌ Sorry, I encountered an error. Please try again.', error: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="chat-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">💬 AI Assistant</h1>
          <p className="page-subtitle">Powered by Google Gemini — Ask about blood types, donors, patients</p>
        </div>
        <span className="ai-badge">✨ Gemini AI</span>
      </div>

      <div className="chat-container card">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="message-avatar">
                {m.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className={`message-bubble ${m.error ? 'error' : ''}`}>
                {m.text.split('\n').map((line, j) => (
                  <React.Fragment key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</React.Fragment>
                ))}
                {m.usingAI === false && (
                  <div className="msg-note">⚙ (Gemini API key not configured — demo mode)</div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="suggestions">
            <div className="suggestions-label">💡 Try asking:</div>
            <div className="suggestions-grid">
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about blood types, donor eligibility, patient care..."
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={!input.trim() || loading}>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}
