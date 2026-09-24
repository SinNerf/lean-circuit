import { MARK_PATHS } from '../markPictures.js';

export function CraftedMark({ name, className = '', pulse = false, testId, step, outline = false }) {
  const d = MARK_PATHS[name];
  return (
    <svg
      viewBox="0 0 512 512"
      data-testid={testId}
      data-step={step}
      aria-hidden="true"
      className={`${className} ${pulse ? 'flame-once' : ''}`}
      fill={outline ? 'none' : 'currentColor'}
      stroke={outline ? 'currentColor' : 'none'}
      strokeWidth={outline ? 16 : 0}
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
