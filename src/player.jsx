import { useEffect, useRef } from 'react';
import { loadMix, trackBlob } from './tracks.js';
import { useGame } from './state.jsx';

function apply(el, mix) {
  el.volume = mix.volume;
  el.muted = mix.mute;
}

export function TrackPlayer() {
  const game = useGame();
  const openRef = useRef(null);
  const roundRef = useRef(null);
  const urls = useRef({ open: '', round: '' });
  const focusRef = useRef(game.focus);
  focusRef.current = game.focus;

  useEffect(() => {
    const open = new Audio();
    const round = new Audio();
    open.loop = true;
    round.loop = true;
    openRef.current = open;
    roundRef.current = round;
    let dead = false;

    const load = async () => {
      const [openBlob, roundBlob] = await Promise.all([trackBlob('open'), trackBlob('round')]);
      if (dead) return;
      if (urls.current.open) URL.revokeObjectURL(urls.current.open);
      if (urls.current.round) URL.revokeObjectURL(urls.current.round);
      urls.current = {
        open: openBlob ? URL.createObjectURL(openBlob) : '',
        round: roundBlob ? URL.createObjectURL(roundBlob) : '',
      };
      open.pause();
      round.pause();
      open.removeAttribute('src');
      round.removeAttribute('src');
    };

    const playCurrent = () => {
      const mix = loadMix();
      const timed = Boolean(focusRef.current) && Boolean(urls.current.round);
      const el = timed ? round : open;
      const other = timed ? open : round;
      const src = timed ? urls.current.round : urls.current.open;
      other.pause();
      if (!src) {
        el.pause();
        return;
      }
      if (el.src !== src) {
        el.src = src;
        el.loop = true;
      }
      apply(el, mix);
      el.play().catch(() => {});
    };

    load();
    const onTap = () => playCurrent();
    const onMix = () => {
      const mix = loadMix();
      apply(open, mix);
      apply(round, mix);
      if (mix.mute) {
        open.pause();
        round.pause();
      }
    };
    window.addEventListener('pointerdown', onTap);
    window.addEventListener('lean-mix', onMix);
    window.addEventListener('lean-tracks', load);
    return () => {
      dead = true;
      window.removeEventListener('pointerdown', onTap);
      window.removeEventListener('lean-mix', onMix);
      window.removeEventListener('lean-tracks', load);
      open.pause();
      round.pause();
      if (urls.current.open) URL.revokeObjectURL(urls.current.open);
      if (urls.current.round) URL.revokeObjectURL(urls.current.round);
    };
  }, []);

  useEffect(() => {
    const open = openRef.current;
    const round = roundRef.current;
    if (!open || !round) return;
    const mix = loadMix();
    const timed = Boolean(game.focus) && Boolean(urls.current.round);
    const el = timed ? round : open;
    const other = timed ? open : round;
    const src = timed ? urls.current.round : urls.current.open;
    other.pause();
    if (!src) return;
    if (el.src !== src) {
      el.src = src;
      el.loop = true;
    }
    apply(el, mix);
    if (el.paused) el.play().catch(() => {});
  }, [game.focus]);

  return null;
}
