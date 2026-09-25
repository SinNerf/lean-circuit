import { useState } from 'react';
import { listOpenReports, setReportStatus } from '../cloud.js';
import { CORE_BADGES, currentStreak, formatClock } from '../honors.js';
import { workoutPath } from '../paths.js';
import { useGame } from '../state.jsx';

const label = 'font-body text-[13px] font-medium leading-none text-muted';
const value = 'mt-2 font-body text-[14px] font-normal text-primary';
const button = 'mt-4 block font-body text-[14px] font-normal text-primary disabled:opacity-40';

export function Admin() {
  const game = useGame();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('home');
  const [reports, setReports] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const path = workoutPath(game.state.path);
  const earned = CORE_BADGES.filter((badge) => game.state.badges?.[badge.id]).map((badge) => badge.name);
  const weekly = (game.state.weeklyBadges || []).length;
  const checked = Object.keys(game.checks.cells || {}).length;
  const focus = game.focus ? `${game.focus.phase}, round ${game.focus.round + 1}, exercise ${game.focus.index + 1}` : 'Not timing';

  async function reset() {
    if (busy) return;
    setBusy(true);
    await game.resetOwnProgress();
    setBusy(false);
  }

  async function openReports() {
    setError('');
    setView('reports');
    try {
      setReports(await listOpenReports());
    } catch {
      setError('Reports could not be loaded.');
    }
  }

  async function decide(status) {
    if (!report || busy) return;
    setBusy(true);
    try {
      await setReportStatus(report.id, status);
      if (status === 'revert') game.applyReport(report);
      setReports((rows) => rows.filter((row) => row.id !== report.id));
      setReport(null);
      setView('reports');
    } catch {
      setError('That report could not be updated.');
    }
    setBusy(false);
  }

  if (view === 'report' && report) {
    const reasons = Array.isArray(report.reasons) ? report.reasons : [];
    return (
      <div data-testid="admin-report" className="px-4 pb-8 pt-4">
        <button type="button" onClick={() => setView('reports')} className="font-body text-[14px] font-normal text-muted">
          Reports
        </button>
        <h2 className={`mt-4 ${label}`}>{report.name || 'Account'}</h2>
        <p className={value}>{report.date}</p>
        <p className={value}>
          {report.rounds || 0} rounds, {report.credit || 0} credit
        </p>
        <p className={value}>Time {formatClock(report.durationMs || 0)}</p>
        <h2 className={`pt-8 ${label}`}>Why</h2>
        {reasons.map((line) => (
          <p key={line} className={value}>
            {line}
          </p>
        ))}
        {error ? <p className={value}>{error}</p> : null}
        <button type="button" data-testid="report-pass" disabled={busy} onClick={() => decide('pass')} className={button}>
          Pass
        </button>
        <button type="button" data-testid="report-revert" disabled={busy} onClick={() => decide('revert')} className={button}>
          Revert
        </button>
      </div>
    );
  }

  if (view === 'reports') {
    return (
      <div data-testid="admin-reports" className="px-4 pb-8 pt-4">
        <button type="button" onClick={() => setView('home')} className="font-body text-[14px] font-normal text-muted">
          Admin
        </button>
        <h2 className={`mt-4 ${label}`}>Reports</h2>
        {error ? <p className={value}>{error}</p> : null}
        {reports.length ? (
          reports.map((row) => (
            <button
              key={row.id}
              type="button"
              data-testid={`report-${row.id}`}
              onClick={() => {
                setReport(row);
                setView('report');
              }}
              className="mt-4 block text-left"
            >
              <span className="block font-body text-[14px] font-normal text-primary">{row.name || row.uid}</span>
              <span className="mt-2 block font-body text-[12px] font-normal text-muted">
                {row.date} · {(Array.isArray(row.reasons) ? row.reasons[0] : '') || 'Flagged'}
              </span>
            </button>
          ))
        ) : (
          <p className={value}>No open reports</p>
        )}
      </div>
    );
  }

  return (
    <div data-testid="admin" className="px-4 pb-8 pt-4">
      <section>
        <h2 className={label}>Account</h2>
        <p data-testid="admin-email" className={value}>
          {game.account?.email}
        </p>
        <p className={value}>{game.state.name}</p>
      </section>
      <section className="pt-8">
        <h2 className={label}>Now</h2>
        <p className={value}>{path.name}</p>
        <p className={value}>Paths {game.state.pathsUnlocked ? 'unlocked' : 'locked'}</p>
        <p className={value}>
          Week {game.week.week} · level {game.sheet.level} · {game.title}
        </p>
        <p className={value}>
          {checked} sets checked · streak {currentStreak(game.state.trainingDays, game.today)}
        </p>
        <p className={value}>{game.checks.paused ? 'Paused today' : 'Not paused'}</p>
        <p className={value}>{focus}</p>
        <p className={value}>{earned.length ? earned.join(', ') : 'No core badges'}</p>
        <p className={value}>{weekly ? `${weekly} weekly badges` : 'No weekly badges'}</p>
      </section>
      <section className="pt-8">
        <h2 className={label}>Reports</h2>
        <button type="button" data-testid="open-reports" onClick={openReports} className={button}>
          Reports
        </button>
      </section>
      <section className="pt-8">
        <h2 className={label}>Reset</h2>
        <p className="mt-2 font-body text-[14px] font-normal text-muted">Clears progress, history, body, and the friend list on this account. The login, username, and profile photo stay. Challenges already sent stay.</p>
        {confirm ? (
          <div className="mt-4">
            <button type="button" data-testid="admin-reset" disabled={busy} onClick={reset} className={button}>
              Reset this account
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="mt-4 block font-body text-[14px] font-normal text-muted">
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" data-testid="admin-reset-ask" onClick={() => setConfirm(true)} className={button}>
            Reset this account
          </button>
        )}
      </section>
    </div>
  );
}
