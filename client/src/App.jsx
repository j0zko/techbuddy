import { useEffect, useState } from 'react';
import ModeBar from './components/ModeBar.jsx';
import ChatMode from './components/ChatMode.jsx';
import ShowMeMode from './components/ShowMeMode.jsx';
import DiagnoseMode from './components/DiagnoseMode.jsx';
import AccessibilityPanel from './components/AccessibilityPanel.jsx';
import LanguagePicker from './components/LanguagePicker.jsx';
import { t } from './i18n/index.js';

export default function App() {
  const [mode, setMode] = useState('chat');
  const [lang, setLang] = useState(() => localStorage.getItem('tb-lang') || 'en');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('tb-large') === '1');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('tb-contrast') === '1');

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

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-center">
          <div className="brand">
            <div>
              <h1>{t(lang, 'appTitle')}</h1>
              <p className="tagline">{t(lang, 'tagline')}</p>
            </div>
          </div>
          <div className="mode-bar-wrapper">
            <ModeBar mode={mode} onChange={setMode} lang={lang} />
          </div>
          <div className="header-controls">
            <LanguagePicker lang={lang} onChange={setLang} />
            <AccessibilityPanel
              largeText={largeText}
              highContrast={highContrast}
              onToggleLargeText={() => setLargeText((v) => !v)}
              onToggleHighContrast={() => setHighContrast((v) => !v)}
              lang={lang}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        {mode === 'chat' && <ChatMode lang={lang} />}
        {mode === 'showme' && <ShowMeMode lang={lang} />}
        {mode === 'diagnose' && <DiagnoseMode lang={lang} />}
      </main>

      <footer className="app-footer">
        <p>{t(lang, 'footer')}</p>
      </footer>
    </div>
  );
}
