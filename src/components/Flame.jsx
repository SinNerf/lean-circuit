import { flameStep } from '../challenge.js';

const SIZE = {
  outline: 'h-20 w-16',
  bronze: 'h-24 w-20',
  gold: 'h-28 w-24',
};

export function StreakFlame({ streak, pulse = false, count = false, still = false, testId = 'streak-flame', className = 'h-6 w-6' }) {
  const step = flameStep(streak);
  if (step === 'none' && !count) return null;
  const tone = step === 'bronze' ? 'text-bronze' : step === 'gold' ? 'text-gold' : 'text-muted';
  const outline = step === 'outline';
  const box = count ? SIZE[step] || SIZE.outline : className;
  const figure = (
    <svg
      viewBox="0 0 64 64"
      data-testid={count ? undefined : testId}
      data-step={step}
      aria-hidden="true"
      className={`${count ? 'h-full w-full' : ''} ${still ? '' : 'flame-live'} ${tone} ${pulse ? 'flame-once' : ''}`}
      fill={outline ? 'none' : 'currentColor'}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
    >
      <path d="M32 8c3 8 1 12 4 17 5-6 12 1 10 9 3 12-6 22-14 22S12 46 16 34c2-7-2-12 0-18 5 5 9 3 16-8z" />
    </svg>
  );
  if (!count) {
    if (step === 'none') return null;
    return <span className={`inline-grid ${box}`}>{figure}</span>;
  }
  if (step === 'none') {
    return (
      <span data-testid={testId} className="font-display text-[64px] font-semibold leading-none text-primary">
        {streak}
      </span>
    );
  }
  return (
    <span className={`relative inline-grid place-items-center ${box}`}>
      {figure}
      <span
        data-testid={testId}
        className={`absolute font-display text-[22px] font-semibold leading-none ${step === 'gold' ? 'text-[#101418]' : 'text-primary'}`}
      >
        {streak}
      </span>
    </span>
  );
}
