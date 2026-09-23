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

const EMBLEMS = {
  'first-workout': 'M27 16a11 11 0 1 1-22 0 11 11 0 1 1 22 0z',
  'streak-7': 'M6 25 16 6l10 19h-6l-4-8-4 8z',
  comeback: 'M10 7h10c6 0 6 10 0 10h-6v-4l-7 6 7 6v-4h6c8 0 8-18 0-18H10z',
  'unbroken-circuit': 'M16 4 27 10.5 27 21.5 16 28 5 21.5 5 10.5z',
  'burpees-100': 'M16 3 20 12 29 16 20 20 16 29 12 20 3 16 12 12z',
  'full-month': 'M7 7h14l5 5v14H7z',
  weekly: 'M9 4h6v4h10l-4 5 4 5H15v10H9z',
};

export function BadgeEmblem({ id, earned, className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill={earned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={earned ? 0 : 1.6} strokeLinejoin="round">
      <path d={EMBLEMS[id] || EMBLEMS.weekly} />
    </svg>
  );
}

const MARKS = { sword: Sword, lightning: Lightning, shield: Shield, coil: Coil, flame: Flame, swift: Swift };

export function StatMark({ name, className }) {
  const Mark = MARKS[name] || Sword;
  return <Mark className={className} />;
}
