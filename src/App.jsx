import { useEffect } from 'react';
import { GameProvider, useGame } from './state.jsx';
import { Header, Nav } from './components/ui.jsx';
import { FirstLaunch } from './screens/FirstLaunch.jsx';
import { Circuit } from './screens/Circuit.jsx';
import { Stats } from './screens/Stats.jsx';
import { Trials } from './screens/Trials.jsx';
import { Skills } from './screens/Skills.jsx';
import { Settings } from './screens/Settings.jsx';
import { FormSheet } from './screens/FormSheet.jsx';

function Shell() {
  const game = useGame();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && game.settingsOpen) game.closeSettings();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  if (!game.state.name) return <FirstLaunch />;

  let body = <Circuit />;
  if (game.settingsOpen) body = <Settings />;
  else if (game.tab === 'stats') body = <Stats />;
  else if (game.tab === 'trials') body = <Trials />;
  else if (game.tab === 'skills') body = <Skills />;

  return (
    <div className="h-dvh overflow-hidden bg-base text-primary">
      <Header />
      <main className="absolute inset-x-0 bottom-[calc(64px+var(--inset-bottom))] top-[calc(56px+var(--inset-top))] overflow-y-auto">{body}</main>
      {game.formId ? <FormSheet /> : null}
      <Nav />
    </div>
  );
}

export function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
