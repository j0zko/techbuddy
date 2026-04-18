import { LANGUAGES, t } from '../i18n/index.js';

export default function LanguagePicker({ lang, onChange }) {
  return (
    <label className="language-picker">
      <span className="visually-hidden">{t(lang, 'language')}</span>
      <span aria-hidden="true" className="globe">🌐</span>
      <select
        value={lang}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t(lang, 'language')}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}
