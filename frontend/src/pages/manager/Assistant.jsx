import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { sendAssistantMessage } from '../../api/assistantApi';
import { ArrowRight, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTheme } from '../../styles/theme';

const initialExamples = [
  'What did the design team work on last week?',
  'Summarize team progress, blockers, and workload balance.',
  'Which reports need attention from the manager?',
  'Are there any recurring blockers this week?'
];

export default function Assistant() {
  const { dark, toggle } = useTheme();
  const theme = getTheme(dark ? 'dark' : 'light');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me about recent team activity, report status, blockers, or workload balance.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt) return;

    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await sendAssistantMessage(prompt);
      setMessages((prev) => [...prev, { role: 'assistant', text: response.data.answer || 'No response received.' }]);
    } catch (err) {
      const rawMessage = err?.response?.data?.message || err.message || 'Unable to reach the assistant.';
      const message = rawMessage.includes('GOOGLE_API_KEY')
        ? 'The AI assistant is not configured. Please set GOOGLE_API_KEY in the server environment and restart the backend.'
        : rawMessage;
      setError(message);
      setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.text }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 0.75rem', borderRadius: '999px', background: theme.primarySoft, color: theme.primary, fontSize: '0.8rem', fontWeight: 700 }}>
              <Sparkles size={15} />
              AI Assistant
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.75rem' }}>Team Q&A & Summary</h1>
            <p style={{ color: theme.muted, marginTop: '0.35rem', maxWidth: '680px' }}>
              Chat with an AI assistant that uses recent report context to answer questions about team work, blockers, and review priorities.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={toggle}
              style={{ border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, borderRadius: '999px', padding: '0.65rem 0.95rem', cursor: 'pointer', boxShadow: theme.shadow }}
            >
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <Link to="/dashboard" style={{ border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, borderRadius: '999px', padding: '0.65rem 0.95rem', textDecoration: 'none', boxShadow: theme.shadow }}>
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ borderRadius: '24px', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow, padding: '1.25rem' }}>
            <h2 style={{ marginBottom: '0.85rem', fontSize: '1.05rem', fontWeight: 700 }}>How to use</h2>
            <p style={{ color: theme.muted, marginBottom: '1rem' }}>
              Type a question about recent report activity or ask for a summary of team progress. The assistant uses report summaries from the manager review queue to provide answers.
            </p>
            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {initialExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuestion(example)}
                  style={{
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.text,
                    borderRadius: '14px',
                    padding: '0.8rem 1rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: '24px', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow, minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem', borderBottom: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Conversation</h3>
              <p style={{ margin: '0.5rem 0 0', color: theme.muted, fontSize: '0.92rem' }}>Ask the assistant any manager-focused question based on recent report data.</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'grid', gap: '0.85rem' }}>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  style={{
                    maxWidth: '100%', alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end',
                    background: message.role === 'assistant' ? theme.surface2 : theme.primarySoft,
                    color: message.role === 'assistant' ? theme.text : theme.text,
                    borderRadius: '18px',
                    padding: '1rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    boxShadow: theme.shadow
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.9rem' }}>{message.role === 'assistant' ? 'Assistant' : 'You'}</strong>
                  <span>{message.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1.25rem', borderTop: `1px solid ${theme.border}` }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about team activity, blockers, or report status..."
                style={{
                  flex: 1,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  background: theme.background,
                  color: theme.text,
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  border: 'none',
                  background: theme.primary,
                  color: '#fff',
                  borderRadius: '14px',
                  padding: '0.85rem 1.2rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700
                }}
              >
                {loading ? 'Thinking…' : 'Send'}
                <ArrowRight size={16} />
              </button>
            </form>
            {error ? <div style={{ padding: '0 1.25rem 1rem', color: theme.danger, fontSize: '0.92rem' }}>{error}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
