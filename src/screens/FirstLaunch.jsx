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
        className="flex w-full max-w-sm flex-col items-center"
        onSubmit={(event) => {
          event.preventDefault();
          run(game.enterAccount);
        }}
      >
        <h1 className="text-center font-display text-[22px] font-semibold leading-none">Account</h1>
        <p className="mt-2 text-center font-body text-[14px] font-normal text-muted">Sign in to open the circuit.</p>
        {!game.cloudOn ? <p className="mt-2 font-body text-[14px] font-normal text-primary">Sign-in is not available in this build.</p> : null}
        <label className="mt-4 w-full text-center font-body text-[13px] font-medium text-muted" htmlFor="account-email">
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
        <label className="mt-4 w-full text-center font-body text-[13px] font-medium text-muted" htmlFor="account-password">
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
        <button
          type="button"
          data-testid="google-sign-in"
          aria-label="Google"
          disabled={!game.cloudOn || busy}
          onClick={async () => {
            if (!game.cloudOn || busy) return;
            setBusy(true);
            await game.enterWithGoogle();
            setBusy(false);
          }}
          className="mt-6 grid h-10 w-10 place-items-center rounded-[9999px] bg-primary disabled:opacity-40"
        >
          <GoogleMark />
        </button>
        <button type="submit" data-testid="sign-in" disabled={!ready} className={`mt-4 ${proceed}`}>
          Log in
        </button>
        <button type="button" data-testid="sign-up" disabled={!ready} onClick={() => run(game.createAccount)} className={`mt-4 ${proceed}`}>
          Create the account
        </button>
        {game.authError ? <p className="mt-4 text-center font-body text-[14px] font-normal text-primary">{game.authError}</p> : null}
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
        <p className="mt-2 font-body text-[14px] font-normal text-muted">This is the name other people see.</p>
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
        <div className="mt-4 flex justify-center">
          <button type="submit" data-testid="save-name" disabled={!ready} className={proceed}>
            Save
          </button>
        </div>
      </form>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
