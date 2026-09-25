import { Info } from 'lucide-react';
import { workoutPath } from '../paths.js';
import { currentStreak, elapsedOf, formatClock, openRound } from '../honors.js';
import { GUIDE_ART } from '../guideArt.js';
import { getGuide } from '../guides.js';
import { cellKey, countChecks, doseLine, prescription, roundCount, targetNote } from '../logic.js';
import { StreakFlame } from '../components/Flame.jsx';
import { useGame } from '../state.jsx';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const heroFace = 'mt-2 font-display text-[56px] font-semibold leading-none text-primary';

const MARKS = [
  ['clean', 'Felt clean'],
  ['slipped', 'Form slipped'],
  ['modify', 'Quick Fix'],
  ['easier', 'Easier version'],
];

const FRAME_CAPTION = ['Start', 'Mid', 'End'];

function exerciseRx(game, exercise) {
  const stored = game.state.difficulty?.targets?.[exercise.id];
  const override = game.difficultyOn && typeof stored === 'number' ? stored : undefined;
  return prescription(exercise, game.state.progression, game.week.scale, override);
}

function FormFrames({ pose }) {
  const frames = GUIDE_ART[pose]?.frames;
  if (!frames?.length) return null;
  const captions = frames.length === 3 ? FRAME_CAPTION : frames.length === 2 ? ['Start', 'End'] : ['Form'];
  return (
    <div className="mt-4 flex gap-2">
      {frames.map((frame, index) => (
        <figure key={frame.src} className="min-w-0 flex-1">
          <img src={frame.src} alt={frame.alt} className="h-28 w-full rounded bg-surface object-contain" />
          <figcaption className="mt-1 text-center font-body text-[12px] font-normal leading-none text-muted">{captions[index]}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function FormCues({ guide }) {
  if (!guide) return null;
  if (GUIDE_ART[guide.pose]?.frames?.length) return <FormFrames pose={guide.pose} />;
  const lines = (guide.form || []).filter((line) => line && line !== guide.dose).slice(0, 3);
  if (!lines.length) return null;
  return (
    <ul data-testid="form-cues" className="mt-4 list-disc pl-4 font-body text-[14px] font-normal leading-normal text-primary">
      {lines.map((line) => (
        <li key={line} className="mb-2">
          {line}
        </li>
      ))}
    </ul>
  );
}

function TimedRound() {
  const game = useGame();
  const focus = game.focus;
  const exercise = workoutPath(game.state.path).exercises[focus.index];
  const rx = exercise ? exerciseRx(game, exercise) : null;
  const guide = rx ? getGuide(rx.guideId) : null;
  const paused = Boolean(game.checks.paused);
  const counting = focus.phase === 'prep' || focus.phase === 'rest';
  const label = focus.phase === 'prep' ? 'Get ready' : focus.phase === 'rest' ? 'Rest' : `Exercise ${focus.index + 1} of 8`;

  if (focus.phase === 'flash' || focus.phase === 'choice') {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4" data-testid="timed-round">
        <p className="font-body text-[13px] font-medium leading-none text-muted">Round {focus.round + 1}</p>
        <p data-testid="round-total" className="mt-4 font-display text-[56px] font-semibold leading-none text-primary">
          {formatClock(focus.totalMs)}
        </p>
        {focus.phase === 'choice' ? (
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            {focus.round < 3 ? (
              <button
                type="button"
                data-testid="continue-round"
                onClick={game.continueRound}
                className="rounded bg-accent px-4 py-3 font-body text-[14px] font-normal text-primary"
              >
                Continue to Round {focus.round + 2}
              </button>
            ) : null}
            <button
              type="button"
              data-testid="back-circuit"
              onClick={game.leaveRound}
              className="rounded px-4 py-3 font-body text-[14px] font-normal text-primary"
            >
              Back to circuit
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-4" data-testid="timed-round">
      <p className="font-body text-[13px] font-medium leading-none text-muted">{label}</p>
      {counting ? (
        <p data-testid="prep-count" className={heroFace}>
          {focus.seconds}
        </p>
      ) : (
        <p data-testid="round-clock" className={heroFace}>
          {formatClock(elapsedOf(game.roundTimer, game.clock))}
        </p>
      )}
      {rx ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p data-testid="focus-title" className="mt-6 font-body text-[22px] font-normal leading-none text-primary">
            {rx.title}
          </p>
          <p data-testid="focus-dose" className="mt-2 font-body text-[14px] font-normal leading-none text-muted">
            {doseLine(rx)}
          </p>
          <FormCues guide={guide} />
        </div>
      ) : (
        <div className="min-h-0 flex-1" />
      )}
      <div className="mt-auto shrink-0 pt-6">
        {paused ? (
          <button
            type="button"
            data-testid="resume-today"
            onClick={game.resumeToday}
            className="w-full rounded bg-accent px-4 py-3 font-body text-[14px] font-normal text-primary"
          >
            Resume
          </button>
        ) : focus.phase === 'work' ? (
          <button
            type="button"
            data-testid="set-done"
            onClick={game.finishSet}
            className="w-full rounded bg-accent px-4 py-3 font-body text-[14px] font-normal text-primary"
          >
            Done
          </button>
        ) : focus.phase === 'rest' ? (
          <button
            type="button"
            data-testid="rest-skip"
            onClick={game.skipFocusRest}
            className="w-full rounded bg-accent px-4 py-3 font-body text-[14px] font-normal text-primary"
          >
            Skip
          </button>
        ) : null}
        {paused ? null : (
          <button
            type="button"
            data-testid="stop-today"
            onClick={game.stopToday}
            className="mt-3 w-full font-body text-[14px] font-normal text-muted"
          >
            Stop here for today
          </button>
        )}
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 text-done" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 10.5 8.5 14 15 7" />
    </svg>
  );
}

function RoundRows({ roundIndex }) {
  const game = useGame();
  const exercises = workoutPath(game.state.path).exercises;
  return exercises.map((exercise, index) => {
    const stored = game.state.difficulty?.targets?.[exercise.id];
    const override = game.difficultyOn && typeof stored === 'number' ? stored : undefined;
    const rx = prescription(exercise, game.state.progression, game.week.scale, override);
    const key = cellKey(roundIndex, index);
    const checked = Boolean(game.checks.cells[key]);
    const mark = game.state.difficulty?.ratings?.[game.today]?.[key];
    const note = targetNote(game.state.difficulty, exercise.id, game.today);
    return (
      <div key={`${roundIndex}-${exercise.id}`} className="mb-2 py-2">
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

function Greeting() {
  const game = useGame();
  const streak = currentStreak(game.state.trainingDays, game.today);
  if (streak >= 1) return <StreakFlame streak={streak} className="h-4 w-4" />;
  const [year, month, day] = game.today.split('-').map(Number);
  const name = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return <p data-testid="circuit-greeting" className="font-body text-[13px] font-normal leading-none text-muted">{name}</p>;
}

export function Circuit() {
  const game = useGame();
  if (game.focus) return <TimedRound />;
  const path = workoutPath(game.state.path);
  const done = countChecks(game.checks);
  const paused = Boolean(game.checks.paused);
  const card = game.weeklyCard;
  const live = openRound(game.checks);
  const shown = game.restRound != null ? game.restRound : live;
  const roundNumber = shown == null ? 4 : shown + 1;
  const resting = game.rest != null;
  const clock = game.roundTimer ? formatClock(elapsedOf(game.roundTimer, game.clock)) : null;
  const countLine = `${done}/32`;

  return (
    <div className="pb-8">
      <div className="px-4 pt-4">
        <Greeting />
      </div>
      <section className="mx-4 mt-2 rounded bg-surface p-4">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Today</h2>
        <p data-testid="circuit-path" className="mt-2 font-body text-[12px] font-normal leading-none text-muted">
          {path.name}
        </p>
        <p data-testid="round-label" className="mt-2 font-body text-[14px] font-normal leading-none text-primary">
          Round {roundNumber} of 4
        </p>
        <p className="mt-2 font-body text-[14px] font-normal leading-snug text-muted">
          Check a set after you finish it. Time the round if you want it to count for speed.
        </p>
        {resting ? (
          <p data-testid="rest" className={heroFace}>
            {game.rest}
          </p>
        ) : clock ? (
          <p data-testid="round-clock" className={heroFace}>
            {clock}
          </p>
        ) : (
          <p data-testid="done-count" className={heroFace}>
            {countLine}
          </p>
        )}
        {resting || clock ? (
          <p className="mt-2 font-body text-[14px] font-normal leading-none text-muted" data-testid="done-count">
            {countLine}
          </p>
        ) : null}
        {paused ? (
          <p data-testid="paused-line" className="mt-2 font-body text-[14px] font-normal leading-none text-muted">
            Paused, tap to resume
          </p>
        ) : null}
        <div className="mt-2 h-1.5 overflow-hidden rounded-bar bg-raised">
          <div className="h-full bg-gold" style={{ width: `${(done / 32) * 100}%` }} />
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
                <button type="button" data-testid="rest-skip" onClick={game.skipRest} className="font-body text-[14px] font-normal text-muted">
                  Skip
                </button>
              ) : shown == null || game.roundTimer ? null : (
                <button
                  type="button"
                  data-testid="time-round"
                  onClick={game.startTimer}
                  className="rounded bg-accent px-4 py-2 font-body text-[14px] font-normal text-primary"
                >
                  Time this round
                </button>
              )}
              <button type="button" data-testid="reset-rounds" onClick={game.resetRounds} className="font-body text-[14px] font-normal text-muted">
                Reset
              </button>
              {done < 32 ? (
                <button
                  type="button"
                  data-testid="stop-today"
                  onClick={game.stopToday}
                  className="font-body text-[14px] font-normal text-muted"
                >
                  Stop here for today
                </button>
              ) : null}
            </>
          )}
        </div>
        {paused ? <div data-testid="paused-board" className="mt-4 rounded bg-raised px-4 py-8" /> : null}
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
              <div className="h-full bg-gold" style={{ width: `${(card.current / card.target) * 100}%` }} />
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
                <p key={roundIndex} data-testid={`round-done-${roundIndex}`} className="mb-2 py-2 font-body text-[14px] font-normal text-done">
                  Round {roundIndex + 1} — complete, 8/8
                </p>
              );
            }
            return null;
          })}
          {shown == null ? null : (
            <div className="mt-2 rounded bg-surface p-4">
              <RoundRows roundIndex={shown} />
            </div>
          )}
        </div>
      </section>
      )}

      <section className="mx-4 mt-8 rounded bg-surface p-4">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">What this works</h2>
        <div className="mt-2 font-body text-[14px] font-normal text-muted">
          {path.muscles.map((row) => (
            <p key={row.name} className="mb-2">
              {row.name}. {row.moves}.
            </p>
          ))}
          <p data-testid="cardio-line">{path.cardioLine}</p>
        </div>
      </section>
    </div>
  );
}
