import { useState } from 'react';
import { useGame } from '../state.jsx';

export function FirstLaunch() {
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
        <h1 className="font-display text-[22px] font-semibold leading-none">Name</h1>
        <p className="mt-2 font-body text-[14px] font-normal text-muted">Asked once. It stays on this device.</p>
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
        <button
          type="submit"
          data-testid="save-name"
          disabled={!ready}
          className={`mt-4 px-4 py-2 font-body text-[14px] font-normal ${ready ? 'rounded bg-raised text-primary' : 'text-muted'}`}
        >
          Save
        </button>
      </form>
    </main>
  );
}
