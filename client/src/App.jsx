import { useEffect, useState } from 'react';
import ModeBar from './components/ModeBar.jsx';
import ChatMode from './components/ChatMode.jsx';
import ShowMeMode from './components/ShowMeMode.jsx';
import DiagnoseMode from './components/DiagnoseMode.jsx';
import AccessibilityPanel from './components/AccessibilityPanel.jsx';
import LanguagePicker from './components/LanguagePicker.jsx';
import { t } from './i18n/index.js';

const MODE_META = {
  chat: { titleKey: 'modeChat', subtitleKey: 'chatSubtitle' },
  showme: { titleKey: 'modeShowMe', subtitleKey: 'showMeSubtitle' },
  diagnose: { titleKey: 'modeDiagnose', subtitleKey: 'diagnoseSubtitle' },
};

export default function App() {
  const [mode, setMode] = useState('chat');
  const [lang, setLang] = useState(() => localStorage.getItem('tb-lang') || 'en');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('tb-large') === '1');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('tb-contrast') === '1');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
    localStorage.setItem('tb-large', largeText ? '1' : '0');
  }, [largeText]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('tb-contrast', highContrast ? '1' : '0');
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('tb-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const meta = MODE_META[mode];

  return (
    <div className={`app-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside className="app-sidebar" aria-label="Primary navigation">
        <div className="sidebar-brand">
          <div className="brand-mark">AT&amp;T</div>
          <div className="brand-text">
            <div className="brand-title">{t(lang, 'appTitle')}</div>
            <div className="brand-tagline">{t(lang, 'tagline')}</div>
          </div>
        </div>

        <ModeBar mode={mode} onChange={(m) => { setMode(m); setNavOpen(false); }} lang={lang} />

        <div className="sidebar-footer">
          <LanguagePicker lang={lang} onChange={setLang} />
          <AccessibilityPanel
            largeText={largeText}
            highContrast={highContrast}
            onToggleLargeText={() => setLargeText((v) => !v)}
            onToggleHighContrast={() => setHighContrast((v) => !v)}
            lang={lang}
          />
          <p className="sidebar-note">{t(lang, 'footer')}</p>
        </div>
      </aside>

      {navOpen && <div className="nav-scrim" onClick={() => setNavOpen(false)} />}

      <div className="app-content">
        <header className="content-header">
          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
          <div className="content-heading">
            <h1>{t(lang, meta.titleKey)}</h1>
            <p>{t(lang, meta.subtitleKey)}</p>
          </div>
        </header>

        <main className="content-main">
          {mode === 'chat' && <ChatMode lang={lang} />}
          {mode === 'showme' && <ShowMeMode lang={lang} />}
          {mode === 'diagnose' && <DiagnoseMode lang={lang} />}
        </main>
      </div>
    </div>
  );
}
