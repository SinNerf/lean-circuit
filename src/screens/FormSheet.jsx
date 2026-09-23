import { useEffect } from 'react';
import { X } from 'lucide-react';
import { GUIDE_ART } from '../guideArt.js';
import { MEDICAL, TEXT_STEPS, getGuide } from '../guides.js';
import { useGame } from '../state.jsx';

const BLOCKS = [
  ['form', 'Form', 'form'],
  ['feel', 'Should feel', 'feel'],
  ['notFeel', 'Should not feel', 'notFeel'],
  ['mods', 'Quick fix', 'mods'],
];

export function FormSheet() {
  const game = useGame();
  const guide = getGuide(game.formId);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') game.closeForm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  if (!guide) return null;

  const numbered = new Set(
    (guide.strips || [guide.pose]).filter(Boolean).flatMap((pose) => (GUIDE_ART[pose]?.frames?.length ? [] : TEXT_STEPS[pose] || [])),
  );

  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(64px+var(--inset-bottom))] z-40 flex flex-col bg-base pt-[var(--inset-top)]" data-testid="form-sheet">
      <header className="flex min-h-[56px] shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-2">
        <h2 data-testid="guide-title" className="font-display text-[22px] font-semibold leading-normal text-primary">
          {guide.title}
        </h2>
        <button type="button" aria-label="Close" data-testid="close-form" onClick={game.closeForm} className="grid h-10 w-10 place-items-center text-primary">
          <X size={24} />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {BLOCKS.map(([key, label, field]) => (
          <section key={key} data-testid={`section-${key}`} className="mb-8">
            <h3 className="font-body text-[13px] font-medium text-muted">{label}</h3>
            {key === 'form'
              ? (guide.strips || [guide.pose]).filter(Boolean).map((pose) => {
                  const art = GUIDE_ART[pose];
                  if (art?.frames?.length) {
                    return (
                      <div key={pose} className="mt-2">
                        <div data-testid={`guide-art-${pose}`} className="flex gap-2">
                          {art.frames.map((frame) => (
                            <img key={frame.src} src={frame.src} alt={frame.alt} className="h-40 min-w-0 flex-1 rounded bg-surface object-contain" />
                          ))}
                        </div>
                        {art.note ? <p className="mt-2 font-body text-[12px] font-normal text-muted">{art.note}</p> : null}
                      </div>
                    );
                  }
                  const steps = TEXT_STEPS[pose];
                  if (!steps?.length) return null;
                  return (
                    <ol key={pose} data-testid={`guide-steps-${pose}`} className="mt-2 list-decimal pl-4 font-body text-[14px] font-normal leading-normal text-primary">
                      {steps.map((line) => (
                        <li key={line} className="mb-2">
                          {line}
                        </li>
                      ))}
                    </ol>
                  );
                })
              : null}
            <div className="mt-2 font-body text-[14px] font-normal leading-normal text-primary">
              {(guide[field] || []).filter((line) => key !== 'form' || !numbered.has(line)).map((line) => (
                <p key={line} className="mb-2">
                  {line}
                </p>
              ))}
              {key === 'form'
                ? (guide.avoid || []).map((line) => (
                    <p key={line} className="mb-2">
                      {line}
                    </p>
                  ))
                : null}
            </div>
          </section>
        ))}
      </div>
      <p data-testid="medical" className="shrink-0 border-t border-line px-4 py-4 font-body text-[12px] font-normal text-muted">
        {MEDICAL}
      </p>
    </div>
  );
}
