import { useState } from 'react';
import { t } from '../i18n/index.js';

export default function EscalationCard({ summary, lang }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="escalation-card" role="region" aria-label={t(lang, 'escalateTitle')}>
      <div className="escalation-header">
        <span aria-hidden="true" className="escalation-icon">🤝</span>
        <h3>{t(lang, 'escalateTitle')}</h3>
      </div>
      <p>{t(lang, 'escalateBody')}</p>
      <pre className="escalation-summary">{summary}</pre>
      <button className="btn-secondary" onClick={handleCopy}>
        {copied ? t(lang, 'copied') : t(lang, 'copy')}
      </button>
    </div>
  );
}
