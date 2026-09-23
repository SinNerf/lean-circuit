const HERO = 'M32 2 22 16c-4 6-4 12 6 16L8 42c-4 6-2 18 4 28l6 8h28l6-8c6-10 8-22 4-28L36 32c10-4 10-10 6-16z';

export function figureTone(sheet, pace, ascend) {
  const tiers = [...['strength', 'power', 'endurance', 'core', 'cardio'].map((id) => sheet.visual[id] || 0), pace || 0];
  const gold = Boolean(ascend?.accent);
  const accent = !gold && tiers.some((tier) => tier >= 5);
  return {
    tone: gold ? 'gold' : accent ? 'accent' : 'plain',
    cape: tiers.some((tier) => tier >= 8),
    shadow: !gold && tiers.length >= 6 && tiers.every((tier) => tier >= 11),
  };
}

export function Silhouette({ tone, cape, shadow }) {
  const gold = tone === 'gold';
  const color = gold ? '#C9A155' : tone === 'accent' ? '#4A7DB0' : '#EDE6DC';
  return (
    <svg width="88" height="88" viewBox="0 0 64 80" aria-hidden="true" data-testid="silhouette" className={shadow ? 'silhouette-shadow' : undefined}>
      {cape ? <path d="M18 42 8 66" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" /> : null}
      <path d={HERO} fill={gold ? color : 'none'} stroke={gold ? 'none' : color} strokeWidth={gold ? 0 : 2.2} strokeLinejoin="round" />
    </svg>
  );
}

export function Portrait({ src, tone, cape, shadow }) {
  if (src) {
    return <img src={src} alt="" data-testid="profile-photo" className="h-[88px] w-[88px] rounded object-cover" />;
  }
  return <Silhouette tone={tone} cape={cape} shadow={shadow} />;
}
