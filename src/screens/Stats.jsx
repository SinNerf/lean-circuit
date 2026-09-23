import { STATS } from '../catalog.js';
import { StatMark } from '../icons/marks.jsx';
import { formatClock } from '../honors.js';
import { barSegments, beltName } from '../logic.js';
import { useGame } from '../state.jsx';

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
      meta: String(game.state.stats.lifetime[stat.id] || 0),
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
