import { flameStep } from '../challenge.js';
import { CraftedMark } from './CraftedMark.jsx';

export function StreakFlame({ streak, pulse = false, testId = 'streak-flame', className = 'h-6 w-6' }) {
  const step = flameStep(streak);
  if (step === 'none') return null;
  const tone = step === 'bronze' ? 'text-bronze' : step === 'gold' ? 'text-gold' : 'text-muted';
  return <CraftedMark name="fire" outline={step === 'outline'} pulse={pulse} testId={testId} step={step} className={`${className} ${tone}`} />;
}
