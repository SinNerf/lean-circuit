import { useRef } from 'react';
import { useGame } from '../state.jsx';

const textBtn = 'mt-4 block font-body text-[14px] font-normal text-primary';

export function Settings() {
  const game = useGame();
  const fileRef = useRef(null);
  const percent = Math.round(game.week.scale * 100);

  return (
    <div data-testid="settings" className="px-4 pb-8 pt-4">
      <section>
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Week ramp</h2>
        <p data-testid="week-label" className="mt-2 font-body text-[14px] font-normal leading-none text-primary">
          Week {game.week.week}
        </p>
        <p data-testid="scale-label" className="mt-2 font-body text-[12px] font-normal leading-none text-muted">
          Targets at {percent}%
        </p>
        <button
          type="button"
          data-testid="ramp-toggle"
          aria-pressed={game.state.ramp.enabled}
          onClick={() => game.setRampEnabled(!game.state.ramp.enabled)}
          className={textBtn}
        >
          Week 1–3 ramp {game.state.ramp.enabled ? 'on' : 'off'}
        </button>
        <button type="button" data-testid="repeat-week" onClick={game.repeatWeek} className={textBtn}>
          Repeat this week
        </button>
        <button type="button" data-testid="skip-week" onClick={game.skipWeek} className={textBtn}>
          Skip to the next week
        </button>
      </section>

      <section className="pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Backup</h2>
        <button type="button" data-testid="export" onClick={game.exportProgress} className={textBtn}>
          Export
        </button>
        <button type="button" data-testid="import" onClick={() => fileRef.current?.click()} className={textBtn}>
          Import
        </button>
        <input
          ref={fileRef}
          data-testid="import-file"
          type="file"
          accept="application/json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => game.stageImport(String(reader.result || ''));
            reader.readAsText(file);
          }}
        />
        {game.importError ? (
          <p data-testid="import-error" className="mt-2 font-body text-[14px] font-normal text-primary">
            {game.importError}
          </p>
        ) : null}
        {game.pendingImport ? (
          <div className="mt-4" data-testid="import-confirm">
            <p className="font-body text-[14px] font-normal text-primary">Replace the progress on this device with this file?</p>
            <button type="button" data-testid="import-replace" onClick={game.confirmImport} className={textBtn}>
              Replace
            </button>
            <button type="button" onClick={game.cancelImport} className={textBtn}>
              Cancel
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
