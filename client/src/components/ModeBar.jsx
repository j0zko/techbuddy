import { t } from '../i18n/index.js';

const MODES = [
  { key: 'chat', icon: '💬', labelKey: 'modeChat' },
  { key: 'showme', icon: '👣', labelKey: 'modeShowMe' },
  { key: 'diagnose', icon: '🩺', labelKey: 'modeDiagnose' },
];

export default function ModeBar({ mode, onChange, lang }) {
  return (
    <div className="mode-bar" role="tablist" aria-label="Mode">
      {MODES.map((m) => (
        <button
          key={m.key}
          role="tab"
          aria-selected={mode === m.key}
          className={`mode-tab ${mode === m.key ? 'active' : ''}`}
          onClick={() => onChange(m.key)}
        >
          <span aria-hidden="true" className="mode-icon">{m.icon}</span>
          <span>{t(lang, m.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
