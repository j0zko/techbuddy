import { useState } from 'react';
import { sendChat, fetchHardware } from '../api.js';
import { t } from '../i18n/index.js';
import EscalationCard from './EscalationCard.jsx';

const STATUS_ICON = { good: '✅', ok: '✅', warn: '⚠️', bad: '❌' };
const HEALTH_KEY = {
  good: 'healthGood',
  ok: 'healthOk',
  attention: 'healthAttention',
  serious: 'healthSerious',
};

export default function DiagnoseMode({ lang }) {
  const [stage, setStage] = useState('idle'); // idle | scanning | thinking | done
  const [hardware, setHardware] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function run() {
    setStage('scanning');
    setError(null);
    setReport(null);
    try {
      const hw = await fetchHardware();
      setHardware(hw);
      setStage('thinking');
      const { data } = await sendChat({
        messages: [],
        mode: 'diagnose',
        hardwareData: hw,
      });
      setReport(data);
      setStage('done');
    } catch (e) {
      setError(e.message || t(lang, 'error'));
      setStage('idle');
    }
  }

  if (stage === 'idle' && !report) {
    return (
      <div className="diagnose-mode">
        <div className="diagnose-intro">
          <span aria-hidden="true" className="diagnose-icon">🩺</span>
          <p>{t(lang, 'tagline')}</p>
          <button className="btn-primary big" onClick={run}>
            {t(lang, 'runDiagnose')}
          </button>
          {error && <div className="error" role="alert">{error}</div>}
        </div>
      </div>
    );
  }

  if (stage === 'scanning' || stage === 'thinking') {
    return (
      <div className="diagnose-mode">
        <div className="diagnose-loading" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p>{t(lang, 'scanning')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diagnose-mode">
      <div className={`health-banner health-${report.overall_health}`}>
        <h2>{t(lang, HEALTH_KEY[report.overall_health] || 'healthOk')}</h2>
        <p>{report.summary}</p>
      </div>

      <div className="findings">
        {report.findings.map((f, i) => (
          <div key={i} className={`finding-card status-${f.status}`}>
            <div className="finding-header">
              <span aria-hidden="true" className="finding-icon">{STATUS_ICON[f.status] || '•'}</span>
              <h3>{f.area}</h3>
            </div>
            <p>{f.message}</p>
          </div>
        ))}
      </div>

      <div className="top-tip">
        <strong>💡 {t(lang, 'topTip')}:</strong>
        <p>{report.top_tip}</p>
      </div>

      {report.escalate && hardware && (
        <EscalationCard
          summary={buildSummary(report, hardware)}
          lang={lang}
        />
      )}

      <button className="btn-secondary" onClick={run}>
        ↻ {t(lang, 'rescan')}
      </button>
    </div>
  );
}

function buildSummary(report, hw) {
  const lines = [
    `Overall: ${report.overall_health}`,
    `Summary: ${report.summary}`,
    '',
    'Findings:',
    ...report.findings.map((f) => `- [${f.status}] ${f.area}: ${f.message}`),
    '',
    `Top tip: ${report.top_tip}`,
    '',
    '— Computer info —',
    `OS: ${hw.os.distro} ${hw.os.release} (${hw.os.platform}, ${hw.os.arch})`,
    `CPU: ${hw.cpu.manufacturer} ${hw.cpu.brand} (${hw.cpu.cores} cores)`,
    `Memory: ${hw.memory.usedGB} / ${hw.memory.totalGB} GB used (${hw.memory.usedPercent}%)`,
    ...hw.disks.map((d) => `Disk ${d.mount}: ${d.usedGB} / ${d.sizeGB} GB used (${d.usedPercent}%)`),
    hw.battery.hasBattery
      ? `Battery: ${hw.battery.percent}%${hw.battery.maxCapacity ? `, max capacity ${hw.battery.maxCapacity}` : ''}${hw.battery.cycleCount ? `, ${hw.battery.cycleCount} cycles` : ''}`
      : 'Battery: none',
    hw.temperature.cpuMainC ? `CPU temperature: ${hw.temperature.cpuMainC}°C` : '',
  ].filter(Boolean);
  return lines.join('\n');
}
