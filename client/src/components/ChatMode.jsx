import { useEffect, useRef, useState } from 'react';
import { sendChat } from '../api.js';
import { t } from '../i18n/index.js';
import { useSpeech, SPEECH_LANG_MAP } from '../hooks/useSpeech.js';
import EscalationCard from './EscalationCard.jsx';

export default function ChatMode({ lang }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const logRef = useRef(null);

  const { supported, listening, startListening, stopListening } = useSpeech({
    lang: SPEECH_LANG_MAP[lang] || 'en-US',
    onResult: (text) => setInput((prev) => (prev ? `${prev} ${text}` : text)),
  });

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, busy]);

  async function send(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || busy) return;
    const next = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError(null);
    try {
      const { reply } = await sendChat({ messages: next, mode: 'chat' });
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message || t(lang, 'error'));
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const escalateSummary = (() => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!last) return null;
    const triggers = /(repair shop|technician|professional|store|hardware|may need help|seek help|servisn|servicio técnico|atelier|werkstatt|assist[êe]ncia|technicien)/i;
    return triggers.test(last.content)
      ? messages.map((m) => `${m.role === 'user' ? 'Me' : 'TechBuddy'}: ${m.content}`).join('\n\n')
      : null;
  })();

  return (
    <div className="chat-mode">
      <div
        className="message-log"
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length === 0 && (
          <div className="starters">
            {t(lang, 'starters').map((s) => (
              <button key={s} className="starter-chip" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="bubble assistant typing" aria-label={t(lang, 'typing')}>
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}
        {error && <div className="error" role="alert">{error}</div>}
        {escalateSummary && <EscalationCard summary={escalateSummary} lang={lang} />}
      </div>

      <div className="composer">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t(lang, 'chatPlaceholder')}
          aria-label={t(lang, 'chatPlaceholder')}
          disabled={busy}
        />
        <div className="composer-actions">
          {supported && (
            <button
              className={`btn-icon ${listening ? 'listening' : ''}`}
              onClick={listening ? stopListening : startListening}
              aria-label={listening ? t(lang, 'listening') : t(lang, 'voice')}
              title={listening ? t(lang, 'listening') : t(lang, 'voice')}
              type="button"
            >
              {listening ? '�' : '🎙️'}
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => send()}
            disabled={busy || !input.trim()}
          >
            {t(lang, 'send')}
          </button>
        </div>
      </div>
    </div>
  );
}
