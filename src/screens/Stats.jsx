import { STATS } from '../catalog.js';
import { StatMark } from '../icons/marks.jsx';
import { formatClock } from '../honors.js';
import { formatStat, barSegments, beltName } from '../logic.js';
import { WORKOUT_PATHS } from '../paths.js';
import { proceed } from '../components/ui.jsx';
import { useGame } from '../state.jsx';

const PATH_COPY = {
  starter: ['Starter Path', 'low-impact basics, 0.75\u00d7 credit.'],
  superhuman: ['Superhuman', 'the original circuit, full credit.'],
  warrior: ['Warrior\u2019s', 'jumps and explosive reps, 1.25\u00d7 credit.'],
  monk: ['Monk\u2019s', 'slow and held work, 0.9\u00d7 credit.'],
  recruit: ['Recruit\u2019s', 'low-impact basics, 0.75\u00d7 credit.'],
};

const LOCK_LINE = '5 full days, 3 felt clean, at most 1 Quick Fix.';
const LOCK_NOTE = new Set(['superhuman', 'warrior', 'monk']);

const FILL = {
  bronze: 'bg-bronze',
  silver: 'bg-silver',
  gold: 'bg-gold',
  platinum: 'bg-platinum',
};

function MetalBar({ tier, testId }) {
  const segments = barSegments(tier);
  const belt = beltName(tier);
  return (
    <div className="relative h-1.5 overflow-hidden rounded-bar bg-raised" data-testid={testId} data-filled={segments}>
      <div className={`h-full ${FILL[belt]}`} style={{ width: `${segments * 10}%` }} />
    </div>
  );
}

export function Stats() {
  const game = useGame();
  const best = game.state.speed?.best;
  const rows = [
    ...STATS.map((stat) => ({
      id: stat.id,
      name: stat.name,
      mark: stat.mark,
      tier: game.sheet.visual[stat.id] || 0,
      meta: formatStat(game.state.stats.lifetime[stat.id] || 0),
      metaId: `life-${stat.id}`,
    })),
    {
      id: 'speed',
      name: 'Speed',
      mark: 'swift',
      tier: game.pace || 0,
      meta: best == null ? 'No time yet' : `Best ${formatClock(best)}`,
      metaId: 'speed-best',
    },
  ];

  return (
    <div className="pb-8">
      <section className="px-4 pt-4">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Stats</h2>
        <div className="mt-2">
          {rows.map((row) => (
            <div key={row.id} className="mb-2" data-testid={`stat-${row.id}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatMark name={row.mark} className="h-5 w-5 text-primary" />
                  <p className="font-body text-[14px] font-normal leading-none text-primary">{row.name}</p>
                </div>
                <p data-testid={`tier-${row.id}`} className="font-display text-[28px] font-semibold leading-none text-primary">
                  {row.tier}
                </p>
              </div>
              <MetalBar tier={row.tier} testId={`bar-${row.id}`} />
              <p data-testid={row.metaId} className="font-body text-[12px] font-normal leading-none text-muted">
                {row.meta}
              </p>
              <p className="font-body text-[12px] font-normal leading-snug text-muted">
                {row.id === 'speed' ? `Tier ${row.tier}. That line is the best round.` : `Tier ${row.tier}. That line is lifetime credit.`}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Paths</h2>
        <div className="mt-2">
          {WORKOUT_PATHS.map((path) => {
            const [title, sentence] = PATH_COPY[path.id];
            const locked = !game.state.pathsUnlocked && path.id !== 'starter';
            const active = game.state.path === path.id;
            const note = locked && LOCK_NOTE.has(path.id);
            return (
              <div key={path.id} className="mt-2 w-full">
                <button
                  type="button"
                  data-testid={`stats-path-${path.id}`}
                  data-active={active ? 'true' : 'false'}
                  data-locked={locked ? 'true' : 'false'}
                  onClick={() => {
                    if (!locked) game.setPath(path.id);
                  }}
                  className={active ? `${proceed} w-full text-center` : 'w-full rounded px-4 py-2 text-center font-body text-[14px] font-normal text-primary'}
                >
                  <span className="block">{title}</span>
                  {note ? null : (
                    <span className={`mt-2 block font-body text-[12px] font-normal leading-snug ${active ? 'text-[#101418]' : 'text-muted'}`}>{sentence}</span>
                  )}
                </button>
                {note ? (
                  <p data-testid={`path-lock-${path.id}`} className="mt-2 text-center font-body text-[12px] font-normal leading-snug text-muted">
                    {LOCK_LINE}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
