import { t } from '../i18n/index.js';

const MODE_ICON = { chat: '💬', showme: '👣', diagnose: '🩺' };
const MODE_LABEL_KEY = { chat: 'modeChat', showme: 'modeShowMe', diagnose: 'modeDiagnose' };

function formatTitle(conv, lang) {
  if (conv.title && conv.title !== 'Untitled') return conv.title;
  if (conv.mode === 'diagnose') {
    const d = new Date(conv.createdAt);
    return `${t(lang, 'modeDiagnose')} · ${d.toLocaleDateString(lang)}`;
  }
  return t(lang, 'historyUntitled');
}

export default function HistorySidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  lang,
}) {
  return (
    <div className="history-sidebar" aria-label={t(lang, 'history')}>
      <div className="history-header">
        <span className="history-title">{t(lang, 'history')}</span>
        <button type="button" className="btn-ghost history-new" onClick={onNew}>
          + {t(lang, 'newChat')}
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="history-empty">{t(lang, 'historyEmpty')}</p>
      ) : (
        <ul className="history-list">
          {conversations.map((c) => {
            const isActive = c.id === activeId;
            return (
              <li
                key={c.id}
                className={`history-item ${isActive ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="history-row"
                  onClick={() => onSelect(c)}
                  title={formatTitle(c, lang)}
                >
                  <span className="history-icon" aria-hidden="true">
                    {MODE_ICON[c.mode] || '💬'}
                  </span>
                  <span className="history-text">
                    <span className="history-row-title">{formatTitle(c, lang)}</span>
                    <span className="history-row-mode">
                      {t(lang, MODE_LABEL_KEY[c.mode] || 'modeChat')}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className="history-delete"
                  aria-label={t(lang, 'delete')}
                  title={t(lang, 'delete')}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(t(lang, 'deleteConfirm'))) onDelete(c.id);
                  }}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {conversations.length > 0 && (
        <button type="button" className="btn-ghost history-clear" onClick={() => {
          if (window.confirm(t(lang, 'clearAllConfirm'))) onClearAll();
        }}>
          {t(lang, 'clearAll')}
        </button>
      )}
    </div>
  );
}
