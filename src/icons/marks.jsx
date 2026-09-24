import { CraftedMark } from '../components/CraftedMark.jsx';

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

const PICTURES = {
  'first-workout': 'medal',
  'streak-7': 'celebration',
  comeback: 'return',
  'unbroken-circuit': 'shield',
  'burpees-100': 'fist',
  'full-month': 'calendar',
  weekly: 'sunrise',
};

export function BadgeEmblem({ id, earned, className, pulse = false }) {
  return <CraftedMark name={PICTURES[id] || PICTURES.weekly} pulse={pulse && earned} className={`${className || ''} ${earned ? '' : 'opacity-40'}`} />;
}

const MARKS = { sword: Sword, lightning: Lightning, shield: Shield, coil: Coil, flame: Flame, swift: Swift };

export function StatMark({ name, className }) {
  const Mark = MARKS[name] || Sword;
  return <Mark className={className} />;
}
