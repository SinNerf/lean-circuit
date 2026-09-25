import { flameStep } from '../challenge.js';

export function StreakFlame({ streak, pulse = false, testId = 'streak-flame', className = 'h-6 w-6' }) {
  const step = flameStep(streak);
  if (step === 'none') return null;
  const tone = step === 'bronze' ? 'text-bronze' : step === 'gold' ? 'text-gold' : 'text-muted';
  const outline = step === 'outline';
  return (
    <svg
      viewBox="0 0 64 64"
      data-testid={testId}
      data-step={step}
      aria-hidden="true"
      className={`${className} ${tone} ${pulse ? 'flame-once' : ''}`}
      fill={outline ? 'none' : 'currentColor'}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
    >
      <path d="M32 8c3 8 1 12 4 17 5-6 12 1 10 9 3 12-6 22-14 22S12 46 16 34c2-7-2-12 0-18 5 5 9 3 16-8z" />
    </svg>
  );
}
