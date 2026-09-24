import { creditFor, difficultyStart, normalizeChecks, prescription, weekState } from './logic.js';
import { exerciseById } from './paths.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function friendCode(uid) {
  const text = String(uid || '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let out = '';
  let n = hash >>> 0;
  for (let i = 0; i < 6; i += 1) {
    out += ALPHABET[n % ALPHABET.length];
    n = Math.imul(n ^ (hash >>> (i + 1)), 16777619) >>> 0;
  }
  return out;
}

export function flameStep(streak) {
  const n = Number(streak) || 0;
  if (n <= 0) return 'none';
  if (n < 7) return 'outline';
  if (n < 30) return 'bronze';
  return 'gold';
}

export function flameCrossed(prev, next) {
  const from = Number(prev) || 0;
  const to = Number(next) || 0;
  if (to <= from) return false;
  return (from < 7 && to >= 7) || (from < 30 && to >= 30);
}

export function draftMatch(exercises, picked) {
  const ids = (exercises || []).map((exercise) => exercise.id);
  const unique = [...new Set(picked || [])];
  if (unique.length !== 3) return null;
  if (!unique.every((id) => ids.includes(id))) return null;
  return unique;
}

export function banOne(drafted, banned) {
  if (!Array.isArray(drafted) || drafted.length !== 3) return null;
  if (!drafted.includes(banned)) return null;
  return drafted.filter((id) => id !== banned);
}

export function exerciseCredit(state, today, exercise) {
  const week = weekState(state.ramp, today);
  const start = difficultyStart(state.ramp);
  const on = Boolean(start && today >= start);
  const stored = state.difficulty?.targets?.[exercise.id];
  const override = on && typeof stored === 'number' ? stored : undefined;
  const progression = state.progression || { adopted: {}, dismissed: {} };
  const rx = prescription(exercise, progression, week.scale, override);
  return creditFor(rx.credit, exercise, state.path, state.body?.weightKg);
}

export function scoredMatch(state, today, matchIds, marked) {
  const ids = Array.isArray(matchIds) ? matchIds : [];
  const checks = normalizeChecks(state.checks, today);
  const onCircuit = new Set();
  for (const cell of Object.values(checks.cells || {})) {
    if (ids.includes(cell.exerciseId)) onCircuit.add(cell.exerciseId);
  }
  const marks = new Set(Array.isArray(marked) ? marked : []);
  const done = [];
  let credit = 0;
  for (const id of ids) {
    if (!onCircuit.has(id) && !marks.has(id)) continue;
    done.push(id);
    const exercise = exerciseById(id);
    if (exercise) credit += exerciseCredit(state, today, exercise);
  }
  return { done, credit: Math.round(credit * 10) / 10 };
}

export function sameScore(a, b) {
  const left = [...(a?.done || [])].sort().join('|');
  const right = [...(b?.done || [])].sort().join('|');
  return left === right && Math.abs((Number(a?.credit) || 0) - (Number(b?.credit) || 0)) < 0.05;
}

export function shouldResolve(challenge, today) {
  if (!challenge || challenge.status !== 'live') return false;
  const need = (challenge.match || []).length || 2;
  const fromDone = (challenge.scores?.[challenge.from]?.done || []).length >= need;
  const toDone = (challenge.scores?.[challenge.to]?.done || []).length >= need;
  return (fromDone && toDone) || Boolean(challenge.day && today > challenge.day);
}

export function winnerOf(challenge) {
  const a = Number(challenge?.scores?.[challenge.from]?.credit) || 0;
  const b = Number(challenge?.scores?.[challenge.to]?.credit) || 0;
  if (a === b) return 'tie';
  return a > b ? challenge.from : challenge.to;
}

export function pairChallenge(list, me, them, today) {
  const rows = (list || []).filter((row) => (row.from === me && row.to === them) || (row.from === them && row.to === me));
  rows.sort((a, b) => (b.created || 0) - (a.created || 0));
  const open = rows.find((row) => row.status === 'ban' || row.status === 'live');
  if (open) return open;
  return rows.find((row) => row.status === 'done' && row.day === today) || null;
}
