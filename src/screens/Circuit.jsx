import { Info } from 'lucide-react';
import { EXERCISES, MUSCLES } from '../catalog.js';
import { openRound } from '../honors.js';
import { cellKey, countChecks, doseLine, prescription, roundCount, targetNote } from '../logic.js';
import { useGame } from '../state.jsx';

const MARKS = [
  ['clean', 'Felt clean'],
  ['slipped', 'Form slipped'],
  ['modify', 'Had to modify'],
  ['easier', 'Easier version'],
];

function CheckMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 text-done" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 10.5 8.5 14 15 7" />
    </svg>
  );
}

function RoundRows({ roundIndex }) {
  const game = useGame();
  return EXERCISES.map((exercise, index) => {
    const stored = game.state.difficulty?.targets?.[exercise.id];
    const override = game.difficultyOn && typeof stored === 'number' ? stored : undefined;
    const rx = prescription(exercise, game.state.progression, game.week.scale, override);
    const key = cellKey(roundIndex, index);
    const checked = Boolean(game.checks.cells[key]);
    const mark = game.state.difficulty?.ratings?.[game.today]?.[key];
    const note = targetNote(game.state.difficulty, exercise.id, game.today);
    return (
      <div key={`${roundIndex}-${exercise.id}`} className="mb-2 border-b border-line py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid={`check-${roundIndex}-${index}`}
            aria-pressed={checked}
            onClick={() => game.toggleCheck(roundIndex, index)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? 'border-done' : 'border-line'}`}>
              {checked ? <CheckMark /> : null}
            </span>
            <span className="min-w-0">
              <span className={`block font-body text-[14px] font-normal leading-none ${checked ? 'text-done' : 'text-primary'}`}>{rx.title}</span>
              <span className="mt-2 block font-body text-[12px] font-normal leading-none text-muted">{doseLine(rx)}</span>
            </span>
          </button>
          <button
            type="button"
            aria-label={`Form guide for ${rx.title}`}
            data-testid={`info-${exercise.id}-${roundIndex}`}
            onClick={() => game.openForm(rx.guideId)}
            className="grid h-5 w-5 shrink-0 place-items-center text-primary"
          >
            <Info size={20} />
          </button>
        </div>
        {game.difficultyOn && checked ? (
          <div data-testid={`form-line-${roundIndex}-${index}`} className="mt-2 flex flex-wrap gap-x-4 gap-y-2 pl-8">
            {MARKS.map(([id, label]) => {
              const selected = id === 'easier' ? Boolean(mark?.easier) : mark?.rating === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-testid={`mark-${roundIndex}-${index}-${id}`}
                  aria-pressed={selected}
                  onClick={() => game.rateSet(roundIndex, index, id)}
                  style={{ color: selected ? '#EDE6DC' : '#8E979F' }}
                  className="font-body text-[12px] font-normal leading-none"
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}
        {note && roundIndex === 0 ? (
          <p data-testid={`target-note-${exercise.id}`} className="mt-2 pl-8 font-body text-[12px] font-normal leading-none text-muted">
            {note}
          </p>
        ) : null}
      </div>
    );
  });
}

export function Circuit() {
  const game = useGame();
  const done = countChecks(game.checks);
  const paused = Boolean(game.checks.paused);
  const card = game.weeklyCard;
  const live = openRound(game.checks);
  const shown = game.restRound != null ? game.restRound : live;
  const roundNumber = shown == null ? 4 : shown + 1;
  const resting = game.rest != null;

  return (
    <div className="pb-8">
      <section className="px-4 pt-4">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Today</h2>
        <p data-testid="round-label" className="mt-2 font-body text-[22px] font-normal leading-none text-primary">
          Round {roundNumber} of 4
        </p>
        <p className="mt-2 font-body text-[22px] font-normal leading-none text-primary" data-testid="done-count">
          {done}/32
        </p>
        {paused ? (
          <p data-testid="paused-line" className="mt-2 font-body text-[14px] font-normal leading-none text-primary">
            Paused, tap to resume
          </p>
        ) : null}
        <div className="mt-2 h-1.5 overflow-hidden rounded-bar bg-surface">
          <div className="h-full bg-accent" style={{ width: `${(done / 32) * 100}%` }} />
        </div>
        {paused ? (
          <p data-testid="pause-confirm" className="mt-2 font-body text-[14px] font-normal leading-none text-muted">
            {done}/32 done today
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {paused ? (
            <button
              type="button"
              data-testid="resume-today"
              onClick={game.resumeToday}
              className="rounded bg-accent px-4 py-2 font-body text-[14px] font-normal text-primary"
            >
              Resume
            </button>
          ) : (
            <>
              {resting ? (
                <>
                  <p data-testid="rest" className="font-body text-[28px] font-normal leading-none text-primary">
                    {game.rest}
                  </p>
                  <button type="button" data-testid="rest-skip" onClick={game.skipRest} className="font-body text-[14px] font-normal text-primary">
                    Skip
                  </button>
                </>
              ) : shown == null ? null : (
                <button
                  type="button"
                  data-testid="time-round"
                  onClick={() => {
                    if (game.roundTimer) game.cancelTimer();
                    else game.startTimer();
                  }}
                  className="rounded bg-accent px-4 py-2 font-body text-[14px] font-normal text-primary"
                >
                  Time this round
                </button>
              )}
              <button type="button" data-testid="reset-rounds" onClick={game.resetRounds} className="font-body text-[14px] font-normal text-primary">
                Reset
              </button>
              {done < 32 ? (
                <button
                  type="button"
                  data-testid="stop-today"
                  onClick={game.stopToday}
                  className="font-body text-[14px] font-normal text-primary"
                >
                  Stop here for today
                </button>
              ) : null}
            </>
          )}
        </div>
        {paused ? <div data-testid="paused-board" className="mt-4 rounded bg-surface px-4 py-8" /> : null}
        {game.recovery ? (
          <p data-testid="recovery" className="mt-2 font-body text-[12px] font-normal text-muted">
            Three full circuits in a row. Muscles need the recovery.
          </p>
        ) : null}
      </section>

      {card ? (
        <section className="px-4 pt-8">
          <h2 className="font-body text-[13px] font-medium leading-none text-muted">This week</h2>
          <div data-testid="weekly-card" className="mt-2 rounded bg-surface p-4">
            <p data-testid="weekly-name" className="font-body text-[14px] font-normal text-primary">
              {card.name}
            </p>
            <p data-testid="weekly-progress" className="mt-2 font-body text-[12px] font-normal text-muted">
              {card.current} / {card.target}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-bar bg-raised">
              <div className="h-full bg-muted" style={{ width: `${(card.current / card.target) * 100}%` }} />
            </div>
          </div>
        </section>
      ) : null}

      {paused ? null : (
      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Rounds</h2>
        <div className="mt-2">
          {[0, 1, 2, 3].map((roundIndex) => {
            const finished = roundCount(game.checks, roundIndex) === 8;
            const earlier = shown == null || roundIndex < shown;
            if (earlier && finished) {
              return (
                <p key={roundIndex} data-testid={`round-done-${roundIndex}`} className="mb-2 border-b border-line py-2 font-body text-[14px] font-normal text-done">
                  Round {roundIndex + 1} — complete, 8/8
                </p>
              );
            }
            return null;
          })}
          {shown == null ? null : <RoundRows roundIndex={shown} />}
        </div>
      </section>
      )}

      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">What this works</h2>
        <div className="mt-2 font-body text-[14px] font-normal text-muted">
          {MUSCLES.map((row) => (
            <p key={row.name} className="mb-2">
              {row.name}. {row.moves}.
            </p>
          ))}
          <p data-testid="cardio-line">Burpees, jump squats, and mountain climbers are the cardio.</p>
        </div>
      </section>
    </div>
  );
}
