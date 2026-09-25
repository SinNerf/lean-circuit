import { useState } from 'react';
import { CORE_BADGES, currentStreak } from '../honors.js';
import { workoutPath } from '../paths.js';
import { useGame } from '../state.jsx';

const label = 'font-body text-[13px] font-medium leading-none text-muted';
const value = 'mt-2 font-body text-[14px] font-normal text-primary';

export function Admin() {
  const game = useGame();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const path = workoutPath(game.state.path);
  const earned = CORE_BADGES.filter((badge) => game.state.badges?.[badge.id]).map((badge) => badge.name);
  const weekly = (game.state.weeklyBadges || []).length;
  const checked = Object.keys(game.checks.cells || {}).length;
  const focus = game.focus ? `${game.focus.phase} · round ${game.focus.round + 1} · exercise ${game.focus.index + 1}` : 'Not timing';

  async function reset() {
    if (busy) return;
    setBusy(true);
    await game.resetOwnProgress();
    setBusy(false);
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
        <h2 className={label}>Reset</h2>
        <p className="mt-2 font-body text-[14px] font-normal text-muted">Clears progress, history, body, and the friend list on this account. The login and username stay. Challenges already sent stay.</p>
        {confirm ? (
          <div className="mt-4">
            <button type="button" data-testid="admin-reset" disabled={busy} onClick={reset} className="font-body text-[14px] font-normal text-primary disabled:opacity-40">
              Reset this account
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="mt-4 block font-body text-[14px] font-normal text-muted">
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" data-testid="admin-reset-ask" onClick={() => setConfirm(true)} className="mt-4 font-body text-[14px] font-normal text-primary">
            Reset this account
          </button>
        )}
      </section>
    </div>
  );
}
