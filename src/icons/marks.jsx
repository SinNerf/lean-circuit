function Line({ className, children }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function Sword({ className }) {
  return (
    <Line className={className}>
      <path d="M32 6v34" />
      <path d="M22 28h20" />
      <path d="M32 40v8" />
      <path d="M26 54h12" />
    </Line>
  );
}

export function Lightning({ className }) {
  return (
    <Line className={className}>
      <path d="M36 6 18 34h12l-4 24 22-32H34l2-20z" />
    </Line>
  );
}

export function Shield({ className }) {
  return (
    <Line className={className}>
      <path d="M32 8 14 16v14c0 12 7 20 18 24 11-4 18-12 18-24V16L32 8z" />
    </Line>
  );
}

export function Coil({ className }) {
  return (
    <Line className={className}>
      <path d="M40 16c-2 8-10 8-12 4s2-10 8-8 14 6 12 16-10 16-20 12" />
    </Line>
  );
}

export function Flame({ className }) {
  return (
    <Line className={className}>
      <path d="M32 8c2 8-4 12 0 20 6-8 14-6 12 2 8 6 6 20-4 26-14 6-26-2-22-16 2-6 2-10-2-14 6-4 10 2 12 8 0-10-2-18 4-26z" />
    </Line>
  );
}

export function Swift({ className }) {
  return (
    <Line className={className}>
      <path d="M14 22 28 32 14 42" />
      <path d="M30 22 44 32 30 42" />
    </Line>
  );
}

export function MedalMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13.2-1.5 8.3 5-3 5 3-1.5-8.3" />
    </svg>
  );
}

const KINDS = {
  'first-workout': 'circuit',
  'streak-7': 'streak',
  comeback: 'return',
  'unbroken-circuit': 'shield',
  'burpees-100': 'fist',
  'full-month': 'calendar',
  weekly: 'weekly',
};

function MedalGlyph({ kind }) {
  if (kind === 'circuit') {
    return (
      <>
        <circle cx="32" cy="32" r="3" />
        <path d="M32 18v6M32 40v6M18 32h6M40 32h6" />
      </>
    );
  }
  if (kind === 'streak') return <path d="M22 40l10-8 10 8M22 32l10-8 10 8M22 24l10-8 10 8" />;
  if (kind === 'return') return <path d="M42 26c-2-7-8-10-14-10-8 0-14 6-14 14s6 16 16 16c6 0 10-3 12-7M40 30l6-6-8-2" />;
  if (kind === 'shield') return <path d="M32 18 44 23v10c0 7-5 12-12 14-7-2-12-7-12-14V23z" />;
  if (kind === 'fist') {
    return (
      <>
        <path d="M30 44V32H26c-1-6 3-12 8-12s9 6 8 12h-4v12" />
        <path d="M26 32H22c-2 0-2 6 2 6h2" />
      </>
    );
  }
  if (kind === 'calendar') return <path d="M22 24h20v18H22zM22 30h20M26 20v6M38 20v6" />;
  return <path d="M32 22a6 6 0 1 1 0 12 6 6 0 0 1 0-12M32 16v3M32 43v3M18 32h3M43 32h3M22 22l2 2M40 40l2 2M40 22l-2 2M24 40l-2 2" />;
}

export function BadgeEmblem({ id, earned, className, pulse = false }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`${className || ''} ${pulse && earned ? 'flame-once' : ''} ${earned ? '' : 'opacity-40'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="32" cy="32" r="27" fill="currentColor" fillOpacity={earned ? 0.18 : 0.08} />
      <circle cx="32" cy="32" r="27" />
      <circle cx="32" cy="32" r="21" />
      <MedalGlyph kind={KINDS[id] || 'weekly'} />
    </svg>
  );
}

const MARKS = { sword: Sword, lightning: Lightning, shield: Shield, coil: Coil, flame: Flame, swift: Swift };

export function StatMark({ name, className }) {
  const Mark = MARKS[name] || Sword;
  return <Mark className={className} />;
}
