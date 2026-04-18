import { t } from '../i18n/index.js';

export default function AccessibilityPanel({
  largeText,
  highContrast,
  onToggleLargeText,
  onToggleHighContrast,
  lang,
}) {
  return (
    <div className="a11y-panel" role="region" aria-label={t(lang, 'accessibility')}>
      <span className="a11y-label">{t(lang, 'accessibility')}:</span>
      <label className="a11y-toggle">
        <input
          type="checkbox"
          checked={largeText}
          onChange={onToggleLargeText}
          aria-label={t(lang, 'largeText')}
        />
        <span>{t(lang, 'largeText')}</span>
      </label>
      <label className="a11y-toggle">
        <input
          type="checkbox"
          checked={highContrast}
          onChange={onToggleHighContrast}
          aria-label={t(lang, 'highContrast')}
        />
        <span>{t(lang, 'highContrast')}</span>
      </label>
    </div>
  );
}
