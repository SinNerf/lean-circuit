import { Settings, X } from 'lucide-react';
import { useGame } from '../state.jsx';
import { PATHS } from '../catalog.js';

const TABS = [
  ['circuit', 'Circuit'],
  ['stats', 'Stats'],
  ['trials', 'Trials'],
  ['skills', 'Skills'],
];

export const PATH_LABEL = {
  bulwark: 'Bulwark',
  tempest: 'Tempest',
  warden: 'Warden',
  anchor: 'Anchor',
  wildfire: 'Wildfire',
};

export function Header() {
  const game = useGame();
  let title = 'Circuit';
  let icon = null;
  if (game.settingsOpen) {
    title = 'Settings';
    icon = (
      <button type="button" aria-label="Close" data-testid="close-settings" onClick={game.closeSettings} className="grid h-10 w-10 place-items-center text-primary">
        <X size={24} />
      </button>
    );
  } else if (game.tab === 'skills' && game.skillPath) {
    title = PATH_LABEL[game.skillPath] || PATHS.find((path) => path.id === game.skillPath)?.name || 'Skills';
    icon = (
      <button type="button" aria-label="Close" data-testid="close-path" onClick={game.closePath} className="grid h-10 w-10 place-items-center text-primary">
        <X size={24} />
      </button>
    );
  } else if (game.tab === 'circuit') {
    title = 'Circuit';
    icon = (
      <button type="button" aria-label="Settings" data-testid="open-settings" onClick={game.openSettings} className="grid h-10 w-10 place-items-center text-primary">
        <Settings size={24} />
      </button>
    );
  } else {
    title = TABS.find(([id]) => id === game.tab)?.[1] || 'Circuit';
  }
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-base pt-[var(--inset-top)]">
      <div className="flex h-[56px] items-center justify-between px-4">
        <h1 className="font-display text-[22px] font-semibold leading-none text-primary">{title}</h1>
        {icon}
      </div>
    </header>
  );
}

export function Nav() {
  const game = useGame();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-base pb-[var(--inset-bottom)]">
      <div className="grid h-[64px] grid-cols-4">
        {TABS.map(([id, label]) => {
          const on = game.tab === id && !game.settingsOpen;
          return (
            <button
              key={id}
              type="button"
              data-testid={`tab-${id}`}
              onClick={() => {
                game.closeSettings();
                game.setTab(id);
              }}
              className={`font-body text-[14px] font-normal ${on ? 'text-primary' : 'text-muted'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function AccentButton({ children, onClick, testId, className = '' }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={`rounded bg-accent px-4 py-2 font-body text-[14px] font-normal text-primary ${className}`}
    >
      {children}
    </button>
  );
}
