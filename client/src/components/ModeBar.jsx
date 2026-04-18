import { t } from '../i18n/index.js';

const MODES = [
  { key: 'chat', icon: '💬', labelKey: 'modeChat' },
  { key: 'showme', icon: '👣', labelKey: 'modeShowMe' },
  { key: 'diagnose', icon: '🩺', labelKey: 'modeDiagnose' },
];

export default function ModeBar({ mode, onChange, lang }) {
  return (
    <nav className="mode-bar" role="tablist" aria-label="Mode">
      {MODES.map((m) => (
        <button
          key={m.key}
          role="tab"
          aria-selected={mode === m.key}
          className={`mode-tab ${mode === m.key ? 'active' : ''}`}
          onClick={() => onChange(m.key)}
        >
          <span className="mode-icon" aria-hidden="true">{m.icon}</span>
          <span className="mode-label">{t(lang, m.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
