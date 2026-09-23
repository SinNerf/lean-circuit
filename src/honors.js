import { EXERCISES } from './catalog.js';
import {
  addDays,
  cellKey,
  countChecks,
  daysBetween,
  levelInfo,
  applySessionLog,
  applyWeeklyTargets,
  rollDay,
  roundCount,
  speedTier,
  visualTier,
} from './logic.js';

export const TITLES = [
  { rank: 0, name: 'Recruit' },
  { rank: 1, name: 'Iron Novice' },
  { rank: 2, name: 'The Unbroken' },
  { rank: 3, name: 'Twin-Blade' },
  { rank: 4, name: 'Ascendant' },
];

export const CORE_BADGES = [
  { id: 'first-workout', name: 'Full circuit' },
  { id: 'streak-7', name: '7-day streak' },
  { id: 'comeback', name: 'Comeback' },
  { id: 'unbroken-circuit', name: 'Unbroken' },
  { id: 'burpees-100', name: '100 burpees' },
  { id: 'full-month', name: '30 days' },
];

export const WEEKLY_POOL = [
  { id: 'push-ups', name: '50 push-up reps', kind: 'reps', exercise: 'push-ups', target: 50 },
  { id: 'burpees', name: '40 burpee reps', kind: 'reps', exercise: 'burpees', target: 40 },
  { id: 'jump-squats', name: '60 jump-squat reps', kind: 'reps', exercise: 'jump-squats', target: 60 },
  { id: 'train-days', name: 'Train on 3 days', kind: 'days', target: 3 },
  { id: 'circuits', name: 'Finish 2 full circuits', kind: 'circuits', target: 2 },
  { id: 'best-time', name: 'Beat the current best round time', kind: 'time', target: 1 },
];

const ROMAN = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function roman(value) {
  let n = Math.floor(value || 0);
  if (n <= 0) return '';
  let out = '';
  for (const [step, glyph] of ROMAN) {
    while (n >= step) {
      out += glyph;
      n -= step;
    }
  }
  return out;
}

export function formatClock(ms) {
  if (ms == null) return '';
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function mondayOf(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.getDay();
  const back = weekday === 0 ? 6 : weekday - 1;
  date.setDate(date.getDate() - back);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function inWeek(iso, start) {
  if (!iso || !start) return false;
  return iso >= start && iso <= addDays(start, 6);
}

export function currentStreak(days, today) {
  const set = new Set(days || []);
  let cursor = set.has(today) ? today : addDays(today, -1);
  if (!set.has(cursor)) return 0;
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function longestStreak(days) {
  const sorted = [...new Set(days || [])].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const day of sorted) {
    run = prev && daysBetween(prev, day) === 1 ? run + 1 : 1;
    prev = day;
    if (run > best) best = run;
  }
  return best;
}

export function hasComeback(days) {
  const sorted = [...new Set(days || [])].sort();
  for (let i = 1; i < sorted.length; i += 1) {
    if (daysBetween(sorted[i - 1], sorted[i]) >= 2) return true;
  }
  return false;
}

export function openRound(checks) {
  for (let round = 0; round < 4; round += 1) {
    if (roundCount(checks, round) < 8) return round;
  }
  return null;
}

export function noteRest(checks, key, how) {
  const skipped = { ...(checks.skipped || {}) };
  const expired = { ...(checks.expired || {}) };
  if (how === 'skip') {
    skipped[key] = true;
    delete expired[key];
  } else if (how === 'expire') {
    expired[key] = true;
    delete skipped[key];
  } else {
    delete skipped[key];
    delete expired[key];
  }
  return { ...checks, skipped, expired };
}

function unbrokenReady(checks) {
  if (countChecks(checks) < 32) return false;
  for (let round = 0; round < 4; round += 1) {
    for (let index = 0; index < 7; index += 1) {
      const key = cellKey(round, index);
      if (!checks.skipped?.[key]) return false;
    }
  }
  return true;
}

export function titleName(rank) {
  return TITLES[Math.max(0, Math.min(TITLES.length - 1, rank || 0))].name;
}

function earnedRank(state) {
  const visual = levelInfo(state.stats.tier, speedTier(state.speed)).visual;
  const tiers = [...Object.values(visual)];
  let rank = 0;
  if (tiers.some((tier) => tier >= 5)) rank = 1;
  if (longestStreak(state.trainingDays) >= 7) rank = Math.max(rank, 2);
  if (tiers.filter((tier) => tier >= 8).length >= 2) rank = Math.max(rank, 3);
  if (tiers.length >= 6 && tiers.every((tier) => tier >= 11)) rank = Math.max(rank, 4);
  return Math.max(rank, state.titleRank || 0);
}

function weekVolume(state, start, exercise) {
  let total = 0;
  for (const [day, bag] of Object.entries(state.volumeByDay || {})) {
    if (inWeek(day, start)) total += bag?.[exercise] || 0;
  }
  return total;
}

export function weeklySpec(weekly) {
  return WEEKLY_POOL.find((item) => item.id === weekly?.objective) || null;
}

export function weeklyProgress(state) {
  const weekly = state.weekly;
  const spec = weeklySpec(weekly);
  if (!weekly || !spec) return null;
  let current = 0;
  if (spec.kind === 'reps') current = weekVolume(state, weekly.weekStart, spec.exercise);
  if (spec.kind === 'days') current = (state.trainingDays || []).filter((day) => inWeek(day, weekly.weekStart)).length;
  if (spec.kind === 'circuits') current = (state.completedDays || []).filter((day) => inWeek(day, weekly.weekStart)).length;
  if (spec.kind === 'time') {
    const times = (state.roundTimes || []).filter((row) => inWeek(row.date, weekly.weekStart));
    if (weekly.bestAtStart == null) current = times.length ? 1 : 0;
    else current = times.some((row) => row.ms < weekly.bestAtStart) ? 1 : 0;
  }
  return {
    ...spec,
    current: Math.min(spec.target, current),
    done: current >= spec.target || Boolean(weekly.completed),
  };
}

export function ensureWeekly(state, today, rng = Math.random) {
  const start = mondayOf(today);
  if (state.weekly?.weekStart === start && state.weekly.objective) return state;
  const objective = WEEKLY_POOL[Math.floor(rng() * WEEKLY_POOL.length) % WEEKLY_POOL.length].id;
  return {
    ...state,
    weekly: {
      weekStart: start,
      objective,
      bestAtStart: state.speed?.best ?? null,
      completed: null,
    },
  };
}

function award(badges, id, today) {
  if (badges[id]) return badges;
  return { ...badges, [id]: today };
}

export function recordRound(state, ms, today) {
  const duration = Math.max(1, Math.round(ms));
  const speed = {
    baseline: state.speed?.baseline ?? null,
    best: state.speed?.best ?? null,
  };
  if (speed.baseline == null) {
    speed.baseline = duration;
    speed.best = duration;
  } else if (duration < speed.best) {
    speed.best = duration;
  }
  return {
    ...state,
    speed,
    roundTimes: [...(state.roundTimes || []), { ms: duration, date: today }],
  };
}

export function canAscend(state) {
  const visual = levelInfo(state.stats.tier, speedTier(state.speed)).visual;
  return Object.values(visual).length >= 6 && Object.values(visual).every((tier) => tier >= 12);
}

export function ascend(state) {
  if (!canAscend(state)) return state;
  const best = state.speed?.best ?? null;
  const tier = { strength: 0, power: 0, endurance: 0, core: 0, cardio: 0 };
  return {
    ...state,
    stats: { ...state.stats, tier },
    speed: { baseline: best, best },
    ascend: { count: (state.ascend?.count || 0) + 1, accent: true },
  };
}

export function afterAction(state, today, rng = Math.random) {
  let next = applyWeeklyTargets(ensureWeekly(rollDay(state, today), today, rng), today);
  next = applySessionLog(next, today);
  let badges = next.badges || {};
  const exerciseIds = EXERCISES.map((exercise) => exercise.id);
  if (exerciseIds.every((id) => next.seenExercises?.[id])) badges = award(badges, 'first-workout', today);
  if (longestStreak(next.trainingDays) >= 7) badges = award(badges, 'streak-7', today);
  if (hasComeback(next.trainingDays)) badges = award(badges, 'comeback', today);
  if (unbrokenReady(next.checks)) badges = award(badges, 'unbroken-circuit', today);
  if ((next.stats?.exerciseLifetime?.burpees || 0) >= 100) badges = award(badges, 'burpees-100', today);
  if (new Set(next.trainingDays || []).size >= 30) badges = award(badges, 'full-month', today);

  let weekly = next.weekly;
  let weeklyBadges = next.weeklyBadges || [];
  const progress = weeklyProgress({ ...next, badges, weekly });
  if (progress?.done && weekly && !weekly.completed) {
    weekly = { ...weekly, completed: today };
    const id = `${weekly.weekStart}:${weekly.objective}`;
    if (!weeklyBadges.some((badge) => badge.id === id)) {
      weeklyBadges = [...weeklyBadges, { id, name: progress.name, date: today }];
    }
  }

  const titleRank = earnedRank({ ...next, badges });
  if (
    next === state &&
    badges === (state.badges || {}) &&
    weekly === state.weekly &&
    weeklyBadges === (state.weeklyBadges || []) &&
    titleRank === (state.titleRank || 0) &&
    next.history === state.history
  ) {
    return state;
  }
  return { ...next, badges, weekly, weeklyBadges, titleRank };
}

export function sheetVisual(state) {
  return levelInfo(state.stats.tier, speedTier(state.speed));
}

export { speedTier, visualTier };
