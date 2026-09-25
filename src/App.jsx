import { useEffect } from 'react';
import { GameProvider, useGame } from './state.jsx';
import { Header, Nav } from './components/ui.jsx';
import { AccountGate, BootScreen, UsernameGate } from './screens/FirstLaunch.jsx';
import { Circuit } from './screens/Circuit.jsx';
import { Stats } from './screens/Stats.jsx';
import { Trials } from './screens/Trials.jsx';
import { Skills } from './screens/Skills.jsx';
import { Leaderboard, Profile } from './screens/Profile.jsx';
import { Settings } from './screens/Settings.jsx';
import { Admin } from './screens/Admin.jsx';
import { FormSheet } from './screens/FormSheet.jsx';

function Shell() {
  const game = useGame();

  const inApp = Boolean(game.authReady && game.profileReady && game.account && game.state.name && game.state.accountUid === game.account.uid);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && game.settingsOpen) game.closeSettings();
      if (event.key === 'Escape' && game.adminOpen) game.closeAdmin();
      if (event.key === 'Escape' && (game.tab === 'profile' || game.tab === 'leaderboard') && game.profileView !== 'self') game.closeProfilePane();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  useEffect(() => {
    if (!inApp || !game.state.pathsUnlocked || game.state.pathsUnlockSeen) return;
    game.notePathUnlock();
  }, [inApp, game]);

  if (!game.authReady || !game.profileReady) return <BootScreen />;
  if (!game.account) return <AccountGate />;
  if (!game.state.name || game.state.accountUid !== game.account.uid) return <UsernameGate />;

  let body = <Circuit />;
  if (game.adminOpen && game.admin) body = <Admin />;
  else if (game.settingsOpen) body = <Settings />;
  else if (game.tab === 'stats') body = <Stats />;
  else if (game.tab === 'leaderboard') body = <Leaderboard />;
  else if (game.tab === 'trials') body = <Trials />;
  else if (game.tab === 'profile' && game.profileView === 'skills') body = <Skills />;
  else if (game.tab === 'profile') body = <Profile />;

  return (
    <div className="h-dvh overflow-hidden bg-base text-primary">
      <Header />
      <main className="absolute inset-x-0 bottom-[calc(64px+var(--inset-bottom))] top-[calc(56px+var(--inset-top))] overflow-y-auto">{body}</main>
      {game.celebration ? (
        <div data-testid="challenge-celebration" className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
          <p className="rise-once font-display text-[28px] font-semibold text-gold">{game.celebration}</p>
        </div>
      ) : null}
      {game.pathUnlock ? (
        <div data-testid="path-unlock" className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
          <p className="rise-once font-display text-[28px] font-semibold text-gold">Path Selection Unlocked</p>
        </div>
      ) : null}
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
