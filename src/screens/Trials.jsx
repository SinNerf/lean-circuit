import { CLASS_TRIALS, STATS, TRIALS } from '../catalog.js';
import { AccentButton } from '../components/ui.jsx';
import { MedalMark } from '../icons/marks.jsx';
import { formatDate, trialOpen } from '../logic.js';
import { useGame } from '../state.jsx';

function TrialRow({ trial, requirement, accent }) {
  const game = useGame();
  const passed = game.state.trials[trial.id];
  const open = trialOpen(trial, game.state.stats.tier, game.state.skills) || Boolean(passed);
  const locked = !open;
  return (
    <div data-testid={`trial-${trial.id}`} className={`mb-2 border-b border-line py-2 ${passed ? 'text-done' : locked ? 'text-muted' : 'text-primary'}`}>
      <p className="font-body text-[14px] font-normal leading-none">{trial.name}</p>
      {locked ? (
        <p data-testid={`lock-${trial.id}`} className="mt-2 font-body text-[12px] font-normal leading-none text-muted">
          {requirement}
        </p>
      ) : null}
      {passed ? (
        <p data-testid={`passed-${trial.id}`} className="mt-2 font-body text-[12px] font-normal leading-none text-muted">
          {formatDate(passed)}
        </p>
      ) : null}
      {!locked && !passed ? (
        <div className="mt-2">
          {accent ? (
            <AccentButton testId={`pass-${trial.id}`} onClick={() => game.passTrial(trial.id)}>
              Passed
            </AccentButton>
          ) : (
            <button type="button" data-testid={`pass-${trial.id}`} onClick={() => game.passTrial(trial.id)} className="font-body text-[14px] font-normal text-primary">
              Passed
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function Trials() {
  const game = useGame();
  const earned = [...TRIALS, ...CLASS_TRIALS].filter((trial) => game.state.trials[trial.id]);
  const accentId = [...TRIALS, ...CLASS_TRIALS].find((trial) => {
    const passed = game.state.trials[trial.id];
    return trialOpen(trial, game.state.stats.tier, game.state.skills) && !passed;
  })?.id;

  return (
    <div className="pb-8">
      <section className="px-4 pt-4">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Trophy case</h2>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {earned.map((trial) => (
            <div key={trial.id} data-testid={`medal-${trial.id}`} className="shrink-0 text-primary">
              <MedalMark className="h-5 w-5 text-gold" />
              <p className="mt-2 whitespace-nowrap font-body text-[12px] font-normal leading-none text-primary">{trial.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Tests</h2>
        <div className="mt-2">
          {TRIALS.map((trial) => {
            const stat = STATS.find((item) => item.id === trial.stat);
            return <TrialRow key={trial.id} trial={trial} requirement={`${stat.name} tier ${trial.need}`} accent={accentId === trial.id} />;
          })}
        </div>
      </section>

      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Trials</h2>
        <div className="mt-2">
          {CLASS_TRIALS.map((trial) => (
            <TrialRow key={trial.id} trial={trial} requirement={trial.skillName} accent={accentId === trial.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
