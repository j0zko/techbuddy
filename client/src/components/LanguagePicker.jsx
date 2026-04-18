import { LANGUAGES, t } from '../i18n/index.js';

export default function LanguagePicker({ lang, onChange }) {
  return (
    <label className="language-picker">
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
