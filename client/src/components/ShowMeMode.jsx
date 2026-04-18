import { useState } from 'react';
import { sendChat } from '../api.js';
import { t } from '../i18n/index.js';
import EscalationCard from './EscalationCard.jsx';

export default function ShowMeMode({ lang }) {
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);

  async function ask() {
    const trimmed = topic.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setData(null);
    setError(null);
    setStepIndex(0);
    try {
      const { data: result } = await sendChat({
        messages: [{ role: 'user', content: trimmed }],
        mode: 'showme',
      });
      setData(result);
    } catch (e) {
      setError(e.message || t(lang, 'error'));
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className="showme-mode">
        <div className="showme-prompt">
          <label htmlFor="showme-input" className="showme-label">
            {t(lang, 'showMePrompt')}
          </label>
          <textarea
            id="showme-input"
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={busy}
            placeholder={t(lang, 'showMePrompt')}
          />
          <button className="btn-primary" onClick={ask} disabled={busy || !topic.trim()}>
            {busy ? t(lang, 'typing') : t(lang, 'showMeAsk')}
          </button>
          {error && <div className="error" role="alert">{error}</div>}
        </div>
      </div>
    );
  }

  const totalSteps = data.steps.length;
  const isLast = stepIndex === totalSteps - 1;
  const currentStep = data.steps[stepIndex];

  return (
    <div className="showme-mode">
      <div className="showme-result" aria-live="polite">
        <h2 className="showme-title">{data.title}</h2>
        <p className="showme-intro">{data.intro}</p>

        <div className="progress-dots" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={stepIndex + 1}>
          {data.steps.map((_, i) => (
            <span key={i} className={`dot ${i === stepIndex ? 'current' : ''} ${i < stepIndex ? 'done' : ''}`} />
          ))}
        </div>

        <div className="step-card">
          <div className="step-number">{stepIndex + 1} / {totalSteps}</div>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.body}</p>
        </div>

        <div className="step-nav">
          <button
            className="btn-secondary"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
          >
            ← {t(lang, 'prev')}
          </button>
          {!isLast ? (
            <button
              className="btn-primary"
              onClick={() => setStepIndex((i) => Math.min(totalSteps - 1, i + 1))}
            >
              {t(lang, 'next')} →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => { setData(null); setTopic(''); }}
            >
              ✓ {t(lang, 'finish')}
            </button>
          )}
        </div>

        {isLast && <p className="done-message">{data.done_message}</p>}
        {data.escalate && (
          <EscalationCard
            summary={`${data.title}\n\n${data.intro}\n\n${data.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`).join('\n')}`}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
