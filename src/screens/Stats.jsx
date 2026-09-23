import { STATS } from '../catalog.js';
import { AccentButton } from '../components/ui.jsx';
import { BadgeEmblem, StatMark } from '../icons/marks.jsx';
import { CORE_BADGES, formatClock, roman } from '../honors.js';
import { barSegments, beltName } from '../logic.js';
import { useGame } from '../state.jsx';

const FILL = {
  bronze: 'bg-bronze',
  silver: 'bg-silver',
  gold: 'bg-gold',
  platinum: 'bg-platinum',
};

const HERO = 'M32 2 22 16c-4 6-4 12 6 16L8 42c-4 6-2 18 4 28l6 8h28l6-8c6-10 8-22 4-28L36 32c10-4 10-10 6-16z';

function Silhouette({ tone, cape, shadow }) {
  const gold = tone === 'gold';
  const color = gold ? '#C9A155' : tone === 'accent' ? '#4A7DB0' : '#EDE6DC';
  return (
    <svg width="88" height="88" viewBox="0 0 64 80" aria-hidden="true" data-testid="silhouette" className={shadow ? 'silhouette-shadow' : undefined}>
      {cape ? <path d="M18 42 8 66" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" /> : null}
      <path d={HERO} fill={gold ? color : 'none'} stroke={gold ? 'none' : color} strokeWidth={gold ? 0 : 2.2} strokeLinejoin="round" />
    </svg>
  );
}

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
  const tiers = [...STATS.map((stat) => game.sheet.visual[stat.id] || 0), game.pace || 0];
  const gold = Boolean(game.state.ascend?.accent);
  const accent = !gold && tiers.some((tier) => tier >= 5);
  const cape = tiers.some((tier) => tier >= 8);
  const shadow = !gold && tiers.length >= 6 && tiers.every((tier) => tier >= 11);
  const mark = roman(game.state.ascend?.count || 0);
  const best = game.state.speed?.best;
  const earned = game.state.badges || {};
  const weekly = game.state.weeklyBadges || [];
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
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Identity</h2>
        <div className="mt-2">
          <Silhouette tone={gold ? 'gold' : accent ? 'accent' : 'plain'} cape={cape} shadow={shadow} />
        </div>
        <p data-testid="player-level" className="mt-2 font-display text-[28px] font-semibold leading-none text-primary">
          {game.sheet.level}
        </p>
        <p data-testid="title-label" className="mt-2 font-display text-[22px] font-semibold leading-none text-primary">
          {game.title}
        </p>
        <p data-testid="hero-name" className="mt-2 font-body text-[14px] font-normal leading-none text-primary">
          {game.state.name}
          {mark ? (
            <span data-testid="ascend-mark"> {mark}</span>
          ) : null}
        </p>
        {game.ascendReady ? (
          <div className="mt-4">
            <AccentButton testId="ascend" onClick={game.confirmAscend}>
              Ascend
            </AccentButton>
          </div>
        ) : null}
      </section>

      <section className="px-4 pt-8">
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

      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Badges</h2>
        <div data-testid="badge-shelf" className="mt-2 flex flex-wrap gap-2">
          {CORE_BADGES.map((badge) => {
            const date = earned[badge.id];
            if (!date) {
              return (
                <div key={badge.id} data-testid={`badge-slot-${badge.id}`} className="text-muted">
                  <BadgeEmblem id={badge.id} className="h-8 w-8" />
                </div>
              );
            }
            return (
              <div key={badge.id} data-testid={`badge-earned-${badge.id}`} className="w-20 text-primary">
                <BadgeEmblem id={badge.id} earned className="h-8 w-8 text-gold" />
                <p className="mt-2 font-body text-[12px] font-normal leading-none text-primary">{badge.name}</p>
              </div>
            );
          })}
          {weekly.map((badge) => (
            <div key={badge.id} data-testid={`badge-earned-${badge.id}`} className="w-20 text-primary">
              <BadgeEmblem id="weekly" earned className="h-8 w-8 text-gold" />
              <p className="mt-2 font-body text-[12px] font-normal leading-none text-primary">Weekly</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
