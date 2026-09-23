import { useEffect, useRef, useState } from 'react';
import { cropRect, loadPicture, paintCrop, renderProfilePhoto, selectFrames } from '../photo.js';
import { proceed } from '../components/ui.jsx';

const VIEW = 240;
const TOO_LARGE = 'Still too large — try a shorter clip or lower quality';

export function PhotoAdjust({ file, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const drag = useRef(null);
  const [media, setMedia] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [quality, setQuality] = useState('standard');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let dead = false;
    loadPicture(file)
      .then((next) => {
        if (dead) return;
        setMedia(next);
        setEnd(next.duration || 0);
        setError('');
      })
      .catch((reason) => {
        if (dead) return;
        setError(reason?.message === 'trim' ? 'This GIF could not be trimmed. Pick a shorter one.' : 'This picture could not be opened.');
      });
    return () => {
      dead = true;
    };
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !media) return undefined;
    const ctx = canvas.getContext('2d');
    if (media.kind === 'still') {
      paintCrop(ctx, media.bitmap, media.width, media.height, VIEW, zoom, pan.x, pan.y);
      return undefined;
    }
    const frames = selectFrames(media.frames, start, end);
    if (!frames.length) return undefined;
    let index = 0;
    let timer = 0;
    let dead = false;
    const tick = () => {
      if (dead) return;
      const frame = frames[index];
      paintCrop(ctx, frame.canvas, media.width, media.height, VIEW, zoom, pan.x, pan.y);
      timer = window.setTimeout(() => {
        index = (index + 1) % frames.length;
        tick();
      }, frame.delay || 100);
    };
    tick();
    return () => {
      dead = true;
      window.clearTimeout(timer);
    };
  }, [media, zoom, pan, start, end]);

  function moveZoom(value) {
    const next = Number(value);
    setZoom(next);
    if (!media) return;
    const box = cropRect(media.width, media.height, VIEW, next, pan.x, pan.y);
    setPan({ x: box.panX, y: box.panY });
    setError('');
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, pan };
  }

  function onPointerMove(event) {
    if (!drag.current || !media) return;
    const box = cropRect(
      media.width,
      media.height,
      VIEW,
      zoom,
      drag.current.pan.x + (event.clientX - drag.current.x),
      drag.current.pan.y + (event.clientY - drag.current.y),
    );
    setPan({ x: box.panX, y: box.panY });
    setError('');
  }

  function onPointerUp() {
    drag.current = null;
  }

  async function save() {
    if (!media || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await renderProfilePhoto(media, {
        zoom,
        panX: pan.x,
        panY: pan.y,
        view: VIEW,
        startMs: start,
        endMs: end,
        quality,
      });
      if (result.error) {
        setError(TOO_LARGE);
        return;
      }
      const saved = onSave(result.dataUrl);
      if (saved === 'large') setError(TOO_LARGE);
      else if (saved === 'device') setError('This photo could not be stored on the device.');
    } catch {
      setError('This picture could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  const clip = Math.max(0, end - start) / 1000;

  return (
    <div className="mt-4">
      <canvas
        ref={canvasRef}
        width={VIEW}
        height={VIEW}
        data-testid="photo-crop"
        className="h-60 w-60 touch-none bg-surface"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <p className="mt-2 font-body text-[13px] font-medium text-muted">Drag to move.</p>
      <label className="mt-4 block font-body text-[13px] font-medium text-muted" htmlFor="photo-zoom">
        Zoom
      </label>
      <input
        id="photo-zoom"
        data-testid="photo-zoom"
        type="range"
        min="1"
        max="3"
        step="0.01"
        value={zoom}
        onChange={(event) => moveZoom(event.target.value)}
        className="mt-2 w-60"
      />
      {media?.kind === 'gif' ? (
        <div className="mt-4">
          <p data-testid="clip-length" className="font-body text-[14px] font-normal text-primary">
            Clip {clip.toFixed(1)} s
          </p>
          <ClipHandles
            duration={media.duration}
            start={start}
            end={end}
            onChange={(nextStart, nextEnd) => {
              setStart(nextStart);
              setEnd(nextEnd);
              setError('');
            }}
          />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              data-testid="quality-standard"
              onClick={() => {
                setQuality('standard');
                setError('');
              }}
              className={`${proceed} ${quality === 'standard' ? 'ring-2 ring-primary' : ''}`}
            >
              Standard
            </button>
            <button
              type="button"
              data-testid="quality-lower"
              onClick={() => {
                setQuality('lower');
                setError('');
              }}
              className={`${proceed} ${quality === 'lower' ? 'ring-2 ring-primary' : ''}`}
            >
              Lower
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p data-testid="photo-error" className="mt-4 font-body text-[14px] font-normal text-primary">
          {error}
        </p>
      ) : null}
      <button type="button" data-testid="set-photo" disabled={!media || busy} onClick={save} className={`mt-4 ${proceed}`}>
        Set photo
      </button>
      <button type="button" data-testid="cancel-photo" onClick={onCancel} className="mt-4 block font-body text-[14px] font-normal text-muted">
        Cancel
      </button>
    </div>
  );
}

function ClipHandles({ duration, start, end, onChange }) {
  const track = useRef(null);
  const drag = useRef(null);
  const span = Math.max(duration, 1);

  function at(clientX) {
    const rect = track.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(duration, Math.max(0, ratio * duration));
  }

  function move(clientX) {
    if (!drag.current) return;
    const value = at(clientX);
    const gap = Math.min(100, Math.max(20, duration * 0.02));
    if (drag.current === 'start') onChange(Math.min(value, Math.max(0, end - gap)), end);
    else onChange(start, Math.max(value, Math.min(duration, start + gap)));
  }

  return (
    <div ref={track} data-testid="clip-handles" className="relative mt-4 h-10 w-60 touch-none">
      <div className="absolute left-0 right-0 top-4 h-1 bg-line" />
      <div
        className="absolute top-4 h-1 bg-accent"
        style={{ left: `${(start / span) * 100}%`, width: `${((end - start) / span) * 100}%` }}
      />
      <button
        type="button"
        aria-label="Clip start"
        className="absolute top-1 h-7 w-7 rounded bg-accent"
        style={{ left: `calc(${(start / span) * 100}% - 14px)` }}
        onPointerDown={(event) => {
          drag.current = 'start';
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => move(event.clientX)}
        onPointerUp={() => {
          drag.current = null;
        }}
      />
      <button
        type="button"
        aria-label="Clip end"
        className="absolute top-1 h-7 w-7 rounded bg-accent"
        style={{ left: `calc(${(end / span) * 100}% - 14px)` }}
        onPointerDown={(event) => {
          drag.current = 'end';
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => move(event.clientX)}
        onPointerUp={() => {
          drag.current = null;
        }}
      />
    </div>
  );
}
