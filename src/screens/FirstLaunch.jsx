import { useState } from 'react';
import { proceed } from '../components/ui.jsx';
import { useGame } from '../state.jsx';

export function BootScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-base px-4 pb-[var(--inset-bottom)] pt-[var(--inset-top)]">
      <p className="font-body text-[14px] font-normal text-muted">Lean Circuit</p>
    </main>
  );
}

export function AccountGate() {
  const game = useGame();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const ready = game.cloudOn && email.trim().length > 0 && password.length > 0 && !busy;

  async function run(action) {
    if (!ready) return;
    setBusy(true);
    await action(email, password);
    setBusy(false);
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-base px-4 pb-[var(--inset-bottom)] pt-[var(--inset-top)] text-primary">
      <form
        className="w-full max-w-sm"
        onSubmit={(event) => {
          event.preventDefault();
          run(game.enterAccount);
        }}
      >
        <h1 className="font-display text-[22px] font-semibold leading-none">Account</h1>
        <p className="mt-2 font-body text-[14px] font-normal text-muted">Sign in to open the circuit.</p>
        {!game.cloudOn ? <p className="mt-2 font-body text-[14px] font-normal text-primary">Sign-in is not available in this build.</p> : null}
        <label className="mt-4 block font-body text-[13px] font-medium text-muted" htmlFor="account-email">
          Email
        </label>
        <input
          id="account-email"
          data-testid="email-input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
        />
        <label className="mt-4 block font-body text-[13px] font-medium text-muted" htmlFor="account-password">
          Password
        </label>
        <input
          id="account-password"
          data-testid="password-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
        />
        {game.authError ? <p className="mt-2 font-body text-[14px] font-normal text-primary">{game.authError}</p> : null}
        <button type="submit" data-testid="sign-in" disabled={!ready} className={`mt-4 ${proceed}`}>
          Sign in
        </button>
        <button type="button" data-testid="sign-up" disabled={!ready} onClick={() => run(game.createAccount)} className={`mt-4 block ${proceed}`}>
          Create account
        </button>
      </form>
    </main>
  );
}

export function UsernameGate() {
  const game = useGame();
  const [value, setValue] = useState('');
  const ready = value.trim().length > 0 && !game.savingName;

  return (
    <main className="grid min-h-dvh place-items-center bg-base px-4 pb-[var(--inset-bottom)] pt-[var(--inset-top)] text-primary">
      <form
        className="w-full max-w-sm"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) game.saveName(value);
        }}
      >
        <h1 className="font-display text-[22px] font-semibold leading-none">Username</h1>
        <p className="mt-2 font-body text-[14px] font-normal text-muted">Asked once.</p>
        <input
          id="display-name"
          data-testid="name-input"
          value={value}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={24}
          onChange={(event) => setValue(event.target.value)}
          className="mt-4 h-12 w-full border-b border-line bg-base px-2 font-body text-[14px] font-normal outline-none"
        />
        {game.storeError ? <p className="mt-2 font-body text-[14px] font-normal text-primary">{game.storeError}</p> : null}
        <button type="submit" data-testid="save-name" disabled={!ready} className={`mt-4 ${proceed}`}>
          Save
        </button>
      </form>
    </main>
  );
}
