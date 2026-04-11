import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../utils/api'
import { Send, Bot, Loader } from 'lucide-react'

export default function AIChat() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m Dem AI assistant. I can help you with blood donation information, eligibility, compatibility, and more. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/ai/chat', { message: input, history })
      setMessages(m => [...m, { role: 'assistant', content: res.data.response }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={18} color="var(--red)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>Dem AI Assistant</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Powered by Gemini</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color="var(--red)" />
              </div>
            )}
            <div className={`chat-bubble ${msg.role}`}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg">
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="var(--red)" />
            </div>
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Thinking...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <input
          className="form-input"
          placeholder="Ask about blood donation..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary btn-icon" onClick={send} disabled={!input.trim() || loading}>
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
