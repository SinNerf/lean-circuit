import { useState } from 'react';
import { banOne, draftMatch, pairChallenge } from '../challenge.js';
import { proceed } from '../components/ui.jsx';
import { exercisesFor, workoutPath } from '../paths.js';
import { useGame } from '../state.jsx';

function CheckBox({ on, testId, onClick, label, detail }) {
  return (
    <button type="button" data-testid={testId} aria-pressed={on} onClick={onClick} className="flex w-full items-center gap-2 border-b border-line py-2 text-left">
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${on ? 'border-done' : 'border-line'}`}>
        {on ? (
          <svg viewBox="0 0 20 20" className="h-5 w-5 text-done" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 10.5 8.5 14 15 7" />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0">
        <span className={`block font-body text-[14px] font-normal leading-none ${on ? 'text-done' : 'text-primary'}`}>{label}</span>
        {detail ? <span className="mt-2 block font-body text-[12px] font-normal leading-none text-muted">{detail}</span> : null}
      </span>
    </button>
  );
}

function Centered({ children }) {
  return <div className="mt-4 flex justify-center">{children}</div>;
}

export function Challenge() {
  const game = useGame();
  const friend = game.challengeWith;
  const me = game.account?.uid;
  const current = friend ? pairChallenge(game.challenges, me, friend.uid, game.today) : null;
  if (!friend) {
    return (
      <div className="px-4 pt-4">
        <p className="font-body text-[14px] font-normal text-muted">That challenge is not available.</p>
      </div>
    );
  }
  if (!current) return <Draft />;
  if (current.status === 'ban' && current.to === me) return <Ban challenge={current} />;
  if (current.status === 'ban') return <Waiting challenge={current} />;
  return <Match challenge={current} />;
}

function Draft() {
  const game = useGame();
  const pool = exercisesFor(game.state.path);
  const [picked, setPicked] = useState([]);
  const ready = draftMatch(pool, picked);

  function toggle(id) {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <p className="text-center font-body text-[14px] font-normal text-primary">Pick 3. They ban 1.</p>
      <div className="mt-4">
        {pool.map((exercise) => (
          <CheckBox
            key={exercise.id}
            testId={`draft-${exercise.id}`}
            on={picked.includes(exercise.id)}
            onClick={() => toggle(exercise.id)}
            label={exercise.name}
          />
        ))}
      </div>
      <Centered>
        <button type="button" data-testid="draft-confirm" disabled={!ready || game.challengeBusy} onClick={() => game.confirmDraft(picked)} className={proceed}>
          Confirm
        </button>
      </Centered>
      {game.challengeError ? <p className="mt-4 text-center font-body text-[14px] font-normal text-primary">{game.challengeError}</p> : null}
    </div>
  );
}

function Waiting({ challenge }) {
  const names = exerciseNames(challenge.path, challenge.drafted);
  return (
    <div className="px-4 pb-8 pt-4">
      <p data-testid="ban-wait" className="text-center font-body text-[14px] font-normal text-primary">
        Waiting for a ban.
      </p>
      <div className="mt-4">
        {names.map((name) => (
          <p key={name} className="border-b border-line py-2 text-center font-body text-[14px] font-normal text-muted">
            {name}
          </p>
        ))}
      </div>
    </div>
  );
}

function Ban({ challenge }) {
  const game = useGame();
  const [banned, setBanned] = useState(null);
  const names = exerciseNames(challenge.path, challenge.drafted);
  const ready = Boolean(banOne(challenge.drafted, banned));
  return (
    <div className="px-4 pb-8 pt-4">
      <p className="text-center font-body text-[14px] font-normal text-primary">Ban 1 of these 3.</p>
      <div className="mt-4">
        {challenge.drafted.map((id, index) => (
          <CheckBox key={id} testId={`ban-${id}`} on={banned === id} onClick={() => setBanned(id)} label={names[index]} />
        ))}
      </div>
      <Centered>
        <button type="button" data-testid="ban-confirm" disabled={!ready || game.challengeBusy} onClick={() => game.confirmBan(challenge, banned)} className={proceed}>
          Ban
        </button>
      </Centered>
      {game.challengeError ? <p className="mt-4 text-center font-body text-[14px] font-normal text-primary">{game.challengeError}</p> : null}
    </div>
  );
}

function Match({ challenge }) {
  const game = useGame();
  const me = game.account?.uid;
  const path = workoutPath(challenge.path);
  const match = challenge.match || [];
  const fromScore = challenge.scores?.[challenge.from] || { done: [], credit: 0 };
  const toScore = challenge.scores?.[challenge.to] || { done: [], credit: 0 };
  const mine = me === challenge.from ? fromScore : toScore;
  const winnerName = challenge.winner === 'tie' ? '' : challenge.winner === challenge.from ? challenge.fromName : challenge.toName;
  return (
    <div className="px-4 pb-8 pt-4" data-testid="challenge-live">
      <ScoreLine testId="challenge-from" name={challenge.fromName} done={(fromScore.done || []).length} credit={fromScore.credit || 0} />
      <ScoreLine testId="challenge-to" name={challenge.toName} done={(toScore.done || []).length} credit={toScore.credit || 0} />
      {challenge.status === 'done' ? (
        <p data-testid="challenge-result" className="mt-4 text-center font-display text-[22px] font-semibold leading-none text-primary">
          {challenge.winner === 'tie' ? 'Tie' : `${winnerName} wins`}
        </p>
      ) : null}
      <div className="mt-4">
        {match.map((id) => {
          const exercise = path.exercises.find((item) => item.id === id);
          const on = (mine.done || []).includes(id);
          return (
            <CheckBox
              key={id}
              testId={`match-${id}`}
              on={on}
              onClick={() => {
                if (challenge.status === 'done') return;
                game.toggleChallenge(challenge, id);
              }}
              label={exercise?.name || id}
            />
          );
        })}
      </div>
    </div>
  );
}

function ScoreLine({ testId, name, done, credit }) {
  return (
    <div data-testid={testId} className="mt-2 text-center">
      <p className="font-body text-[14px] font-normal text-primary">
        {name} {done}/2
      </p>
      <p className="mt-2 font-body text-[12px] font-normal text-muted">Credit {credit}</p>
    </div>
  );
}

function exerciseNames(pathId, ids) {
  const path = workoutPath(pathId);
  return (ids || []).map((id) => path.exercises.find((exercise) => exercise.id === id)?.name || id);
}
