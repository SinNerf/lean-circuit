import { EXERCISES } from './catalog.js';
import { exerciseById, workoutPath } from './paths.js';

export const STAT_IDS = ['strength', 'power', 'endurance', 'core', 'cardio'];

export const KEYS = {
  name: 'lean-circuit-name',
  device: 'lean-circuit-device',
  checks: 'lean-circuit-checks',
  stats: 'lean-circuit-stats',
  trials: 'lean-circuit-trials',
  skills: 'lean-circuit-skills',
  highest: 'lean-circuit-highest-level',
  seen: 'lean-circuit-seen-unlocks',
  ramp: 'lean-circuit-ramp',
  progression: 'lean-circuit-progression',
  completed: 'lean-circuit-completed-days',
  recovery: 'lean-circuit-recovery-dismissed',
  speed: 'lean-circuit-speed',
  rounds: 'lean-circuit-rounds',
  title: 'lean-circuit-title',
  badges: 'lean-circuit-badges',
  weeklyBadges: 'lean-circuit-weekly-badges',
  training: 'lean-circuit-training-days',
  volume: 'lean-circuit-volume-days',
  seenExercises: 'lean-circuit-seen-exercises',
  weekly: 'lean-circuit-weekly',
  ascend: 'lean-circuit-ascend',
  difficulty: 'lean-circuit-difficulty',
  path: 'lean-circuit-path',
  body: 'lean-circuit-body',
  photo: 'lean-circuit-photo',
  photoURL: 'lean-circuit-photo-url',
  history: 'lean-circuit-history',
  featured: 'lean-circuit-featured',
  account: 'lean-circuit-account',
  pathsOpen: 'lean-circuit-paths-open',
  pathsSeen: 'lean-circuit-paths-seen',
};

export const STAT_POINT = 0.05;
const LEGACY_POINT = 0.2;

export const PATH_UNLOCK_LINE =
  '5 full circuits on separate days, at least 3 of those days felt-clean as the dominant rating, and no more than 1 Quick Fix modification across those 5 sessions.';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const BELTS = ['bronze', 'silver', 'gold', 'platinum'];

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatRest(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function daysBetween(start, end) {
  const [ay, am, ad] = start.split('-').map(Number);
  const [by, bm, bd] = end.split('-').map(Number);
  const ua = Date.UTC(ay, am - 1, ad);
  const ub = Date.UTC(by, bm - 1, bd);
  return Math.floor((ub - ua) / 86400000);
}

export function emptyStats() {
  const zero = () => ({ strength: 0, power: 0, endurance: 0, core: 0, cardio: 0 });
  return { point: STAT_POINT, tier: zero(), lifetime: zero(), exerciseLifetime: {}, daily: {} };
}

export function freshState() {
  return {
    name: null,
    device: null,
    checks: { date: todayKey(), cells: {}, skipped: {}, expired: {}, paused: false },
    stats: emptyStats(),
    trials: {},
    skills: {},
    highestLevel: 0,
    seenUnlocks: [],
    ramp: { enabled: true, firstDate: null, anchorDate: null, baseWeek: 1 },
    progression: { adopted: {}, dismissed: {} },
    completedDays: [],
    recoveryDismissed: null,
    speed: { baseline: null, best: null },
    roundTimes: [],
    titleRank: 0,
    badges: {},
    weeklyBadges: [],
    trainingDays: [],
    volumeByDay: {},
    seenExercises: {},
    weekly: null,
    ascend: { count: 0, accent: false },
    difficulty: emptyDifficulty(),
    path: 'starter',
    pathsUnlocked: false,
    pathsUnlockSeen: false,
    body: emptyBody(),
    photoData: null,
    photoURL: '',
    history: [],
    featuredBadge: '',
    accountUid: null,
  };
}

export function emptyBody() {
  return { heightCm: null, weightKg: null };
}

export function emptyDifficulty() {
  return { applied: [], targets: {}, streaks: {}, notes: {}, ratings: {} };
}

export function visualTier(stat) {
  const n = Number(stat) || 0;
  if (n <= 0) return 0;
  const equivalent = Math.round((n / STAT_POINT) * 1e6) / 1e6;
  return Math.floor(Math.log2(equivalent + 1));
}

export function formatStat(stat) {
  const rounded = Math.round((Number(stat) || 0) * 100) / 100;
  return String(rounded);
}

export function beltIndex(tier) {
  return Math.floor(tier / 5);
}

export function beltName(tier) {
  return BELTS[beltIndex(tier) % 4];
}

export function barSegments(tier) {
  return tier % 10;
}

export function scaleForWeek(week, enabled) {
  if (!enabled) return 1;
  if (week <= 1) return 0.55;
  if (week === 2) return 0.75;
  if (week === 3) return 0.9;
  return 1;
}

export function weekState(ramp, today) {
  const enabled = ramp.enabled !== false;
  if (!ramp.anchorDate && !ramp.firstDate) {
    return { week: 1, scale: scaleForWeek(1, enabled), dayInWeek: 1 };
  }
  const anchor = ramp.anchorDate || ramp.firstDate;
  const base = ramp.baseWeek || 1;
  const days = Math.max(0, daysBetween(anchor, today));
  const week = base + Math.floor(days / 7);
  return { week, scale: scaleForWeek(week, enabled), dayInWeek: (days % 7) + 1 };
}

export function repeatWeek(ramp, today) {
  const current = weekState(ramp, today);
  return { ...ramp, anchorDate: today, baseWeek: current.week };
}

export function skipWeek(ramp, today) {
  const current = weekState(ramp, today);
  return { ...ramp, anchorDate: today, baseWeek: current.week + 1 };
}

export function prescription(exercise, progression, scale, override) {
  const adopted = Boolean(progression.adopted?.[exercise.id] && exercise.variant);
  const source = adopted ? exercise.variant : exercise;
  const scaled = Math.max(1, Math.round(source.credit * scale));
  const custom = typeof override === 'number';
  const credit = custom ? override : scaled;
  const unit = source.unit;
  let label;
  if (custom) label = unit === 'sec' ? `${credit} sec` : String(credit);
  else if (!adopted && exercise.rangeLabel && scale === 1) label = exercise.rangeLabel;
  else if (unit === 'sec' && scale === 1 && credit >= 120 && credit % 60 === 0) label = `${credit / 60} min`;
  else if (unit === 'sec') label = `${credit} sec`;
  else label = String(credit);
  return {
    credit,
    unit,
    label,
    detail: custom ? '' : adopted ? (scale === 1 ? source.detail : '') : scale === 1 ? exercise.detail || '' : '',
    title: adopted ? source.name : exercise.name,
    guideId: adopted ? source.guideId : exercise.id,
    adopted,
  };
}

export function bodyweightFactor(kg) {
  if (typeof kg !== 'number' || !Number.isFinite(kg) || kg <= 0) return 1;
  const raw = 0.85 + (kg / 100) * 0.3;
  return Math.min(1.3, Math.max(0.85, raw));
}

export function creditFor(base, exercise, pathId, weightKg) {
  const pathFactor = workoutPath(pathId).multiplier;
  const body = exercise?.load ? bodyweightFactor(weightKg) : 1;
  return base * STAT_POINT * pathFactor * body;
}

export function doseLine(rx) {
  if (rx.unit === 'sec') return rx.detail ? `${rx.label} · ${rx.detail}` : rx.label;
  const reps = `${rx.label} reps`;
  return rx.detail ? `${reps} · ${rx.detail}` : reps;
}

export function cellKey(round, index) {
  return `${round}-${index}`;
}

export function normalizeChecks(checks, today) {
  if (!checks || checks.date !== today) return { date: today, cells: {}, skipped: {}, expired: {}, paused: false };
  return {
    date: checks.date,
    cells: { ...(checks.cells || {}) },
    skipped: { ...(checks.skipped || {}) },
    expired: { ...(checks.expired || {}) },
    paused: Boolean(checks.paused),
    round: Number.isInteger(checks.round) ? checks.round : openRoundIndex(checks),
  };
}

function openRoundIndex(checks) {
  for (let round = 0; round < 4; round += 1) {
    if (roundCount(checks, round) < 8) return round;
  }
  return 0;
}

export function rollDay(state, today) {
  if (state.checks?.date === today) return state;
  return {
    ...state,
    checks: { date: today, cells: {}, skipped: {}, expired: {}, paused: false, round: 0 },
  };
}

export function pauseSession(state, today) {
  const checks = normalizeChecks(state.checks, today);
  if (checks.paused || countChecks(checks) >= 32) return state;
  return {
    ...state,
    checks: { ...checks, date: today, paused: true, round: openRoundIndex(checks) },
  };
}

export function resumeSession(state, today) {
  const checks = normalizeChecks(state.checks, today);
  if (!checks.paused) return state;
  return {
    ...state,
    checks: { ...checks, paused: false },
  };
}

function cloneStats(stats) {
  return {
    point: stats?.point,
    tier: { ...stats.tier },
    lifetime: { ...stats.lifetime },
    exerciseLifetime: { ...stats.exerciseLifetime },
    daily: { ...stats.daily },
  };
}

function withCompletion(checks, completedDays, today) {
  const days = new Set(completedDays || []);
  if (Object.keys(checks.cells).length >= 32) days.add(today);
  else days.delete(today);
  return [...days].sort();
}

export function countChecks(checks) {
  return Object.keys(checks?.cells || {}).length;
}

export function roundCount(checks, round) {
  let n = 0;
  for (let i = 0; i < 8; i += 1) {
    if (checks.cells[cellKey(round, i)]) n += 1;
  }
  return n;
}

function addCell(state, checks, key, exercise, rx, today) {
  const stats = cloneStats(state.stats);
  const stamp = stats.daily[exercise.id];
  const already = Boolean(stamp && stamp.date === today);
  const parts = {};
  for (const stat of exercise.stats) {
    parts[stat] = rx.credit;
    stats.lifetime[stat] = (stats.lifetime[stat] || 0) + rx.credit;
    if (!already) stats.tier[stat] = (stats.tier[stat] || 0) + rx.credit;
  }
  stats.exerciseLifetime[exercise.id] = (stats.exerciseLifetime[exercise.id] || 0) + rx.credit;
  if (!already) stats.daily[exercise.id] = { date: today, amount: rx.credit };
  checks.cells[key] = {
    exerciseId: exercise.id,
    credit: rx.credit,
    target: rx.credit,
    tierGranted: !already,
    parts,
  };
  let ramp = state.ramp;
  if (!ramp.firstDate) {
    ramp = {
      ...ramp,
      firstDate: today,
      anchorDate: ramp.anchorDate || today,
      baseWeek: ramp.baseWeek || 1,
    };
  }
  const volumeByDay = { ...(state.volumeByDay || {}) };
  const dayVolume = { ...(volumeByDay[today] || {}) };
  dayVolume[exercise.id] = (dayVolume[exercise.id] || 0) + rx.credit;
  volumeByDay[today] = dayVolume;
  const trainingDays = (state.trainingDays || []).includes(today)
    ? state.trainingDays
    : [...(state.trainingDays || []), today].sort();
  return {
    ...state,
    checks,
    stats,
    ramp,
    volumeByDay,
    trainingDays,
    seenExercises: { ...(state.seenExercises || {}), [exercise.id]: true },
    completedDays: withCompletion(checks, state.completedDays, today),
    difficulty: recordSet(state, today, key, exercise.id),
  };
}

function removeCell(state, checks, key, today) {
  const cell = checks.cells[key];
  delete checks.cells[key];
  const stats = cloneStats(state.stats);
  for (const stat of Object.keys(cell.parts || {})) {
    stats.lifetime[stat] = Math.max(0, (stats.lifetime[stat] || 0) - cell.parts[stat]);
    if (cell.tierGranted) stats.tier[stat] = Math.max(0, (stats.tier[stat] || 0) - cell.parts[stat]);
  }
  stats.exerciseLifetime[cell.exerciseId] = Math.max(
    0,
    (stats.exerciseLifetime[cell.exerciseId] || 0) - cell.credit,
  );
  if (cell.tierGranted) delete stats.daily[cell.exerciseId];
  const volumeByDay = { ...(state.volumeByDay || {}) };
  const dayVolume = { ...(volumeByDay[today] || {}) };
  const left = Math.max(0, (dayVolume[cell.exerciseId] || 0) - (cell.credit || 0));
  if (left) dayVolume[cell.exerciseId] = left;
  else delete dayVolume[cell.exerciseId];
  if (Object.keys(dayVolume).length) volumeByDay[today] = dayVolume;
  else delete volumeByDay[today];
  const skipped = { ...(checks.skipped || {}) };
  const expired = { ...(checks.expired || {}) };
  delete skipped[key];
  delete expired[key];
  checks.skipped = skipped;
  checks.expired = expired;
  const trainingDays = Object.keys(checks.cells).length
    ? state.trainingDays || []
    : (state.trainingDays || []).filter((day) => day !== today);
  return {
    ...state,
    checks,
    stats,
    volumeByDay,
    trainingDays,
    completedDays: withCompletion(checks, state.completedDays, today),
    difficulty: dropSet(state.difficulty, today, key),
  };
}

export function applyCell(state, round, index, exercise, rx, today) {
  const checks = normalizeChecks(state.checks, today);
  const key = cellKey(round, index);
  if (checks.cells[key]) return removeCell(state, checks, key, today);
  return addCell(state, checks, key, exercise, rx, today);
}

export function resetRounds(state, today) {
  return {
    ...state,
    checks: { date: today, cells: {}, skipped: {}, expired: {}, paused: false, round: 0 },
    trainingDays: (state.trainingDays || []).filter((day) => day !== today),
    difficulty: dropDay(state.difficulty, today),
  };
}

export function statCredit(tierStats) {
  let total = 0;
  for (const id of STAT_IDS) total += Number(tierStats?.[id]) || 0;
  return total;
}

export function statVisualTier(tierStats) {
  return visualTier(statCredit(tierStats));
}

export function compareStanding(a, b) {
  return (b.statTier || 0) - (a.statTier || 0) || (b.statCredit || 0) - (a.statCredit || 0) || String(a.name || '').localeCompare(String(b.name || ''));
}

export function levelInfo(tierStats, speedVisual = 0) {
  const visual = {};
  let sum = 0;
  for (const id of STAT_IDS) {
    visual[id] = visualTier(tierStats[id] || 0);
    sum += visual[id];
  }
  visual.speed = speedVisual;
  sum += speedVisual;
  const average = sum / (STAT_IDS.length + 1);
  const level = Math.floor(average);
  return { visual, average, level, xp: average - level };
}

export function trialOpen(trial, tierStats, skills) {
  if (trial.skillId) return Boolean(skills?.[trial.skillId]);
  return visualTier(tierStats?.[trial.stat] || 0) >= trial.need;
}

export function newlyUnlockedTrials(beforeTier, afterTier, beforeSkills, afterSkills, trials) {
  const opened = [];
  for (const trial of trials) {
    const was = trialOpen(trial, beforeTier, beforeSkills);
    const now = trialOpen(trial, afterTier, afterSkills);
    if (!was && now) opened.push(trial.id);
  }
  return opened;
}

export function skillReady(node, tierStats) {
  return node.requires.every((req) => visualTier(tierStats[req.stat] || 0) >= req.tier);
}

export function suggestionFor(exercise, tierStats, progression) {
  if (!exercise.variant) return false;
  if (progression.adopted?.[exercise.id]) return false;
  if (progression.dismissed?.[exercise.id]) return false;
  return visualTier(tierStats[exercise.variant.stat] || 0) >= 8;
}

export function swapAvailable(exercise, tierStats, progression) {
  if (!exercise.variant) return false;
  if (progression.adopted?.[exercise.id]) return true;
  return visualTier(tierStats[exercise.variant.stat] || 0) >= 8;
}

export function dismissMove(progression, id) {
  return { ...progression, dismissed: { ...progression.dismissed, [id]: true } };
}

export function adoptMove(progression, id) {
  return {
    ...progression,
    adopted: { ...progression.adopted, [id]: true },
    dismissed: { ...progression.dismissed, [id]: true },
  };
}

export function revertMove(progression, id) {
  const adopted = { ...progression.adopted };
  delete adopted[id];
  return { ...progression, adopted };
}

export function recoveryDue(completedDays, today, dismissed) {
  if (dismissed === today) return false;
  return [1, 2, 3].every((n) => (completedDays || []).includes(addDays(today, -n)));
}

function weekdayUTC(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function mondayOfIso(iso) {
  const day = weekdayUTC(iso);
  const back = day === 0 ? 6 : day - 1;
  return addDays(iso, -back);
}

export function mondayOnOrAfter(iso) {
  const day = weekdayUTC(iso);
  if (day === 1) return iso;
  return addDays(iso, day === 0 ? 1 : 8 - day);
}

export function mondayAfter(iso) {
  const on = mondayOnOrAfter(iso);
  return on === iso ? addDays(iso, 7) : on;
}

function week4Start(ramp) {
  if (!ramp?.anchorDate && !ramp?.firstDate) return null;
  const anchor = ramp.anchorDate || ramp.firstDate;
  const base = ramp.baseWeek || 1;
  if (base >= 4) return anchor;
  return addDays(anchor, (4 - base) * 7);
}

export function difficultyStart(ramp) {
  if (!ramp) return null;
  const origin = week4Start(ramp);
  const fromWeek = origin ? mondayOnOrAfter(origin) : null;
  if (ramp.enabled !== false) return fromWeek;
  const fromOff = ramp.offSince ? mondayAfter(ramp.offSince) : null;
  const candidates = [fromWeek, fromOff].filter(Boolean);
  if (!candidates.length) return null;
  return candidates.sort()[0];
}

export function readDifficulty(raw) {
  const base = emptyDifficulty();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const targets = {};
  for (const [id, value] of Object.entries(raw.targets || {})) {
    if (typeof value === 'number' && Number.isFinite(value)) targets[id] = value;
  }
  const streaks = {};
  for (const [id, value] of Object.entries(raw.streaks || {})) {
    if (typeof value === 'number' && Number.isFinite(value)) streaks[id] = value;
  }
  const notes = {};
  for (const [id, note] of Object.entries(raw.notes || {})) {
    if (note && typeof note.text === 'string' && typeof note.weekStart === 'string') {
      notes[id] = { text: note.text, weekStart: note.weekStart };
    }
  }
  const ratings = {};
  for (const [day, bag] of Object.entries(raw.ratings || {})) {
    if (!bag || typeof bag !== 'object' || Array.isArray(bag)) continue;
    const next = {};
    for (const [key, set] of Object.entries(bag)) {
      if (!set || typeof set.exerciseId !== 'string') continue;
      next[key] = {
        exerciseId: set.exerciseId,
        rating: set.rating === 'clean' || set.rating === 'slipped' || set.rating === 'modify' ? set.rating : null,
        easier: Boolean(set.easier),
      };
    }
    if (Object.keys(next).length) ratings[day] = next;
  }
  return {
    applied: Array.isArray(raw.applied) ? raw.applied.filter((day) => typeof day === 'string') : [],
    targets,
    streaks,
    notes,
    ratings,
  };
}

function recordSet(state, today, key, exerciseId) {
  const start = difficultyStart(state.ramp);
  const difficulty = state.difficulty || emptyDifficulty();
  if (!start || today < start) return difficulty;
  const ratings = { ...(difficulty.ratings || {}) };
  const day = { ...(ratings[today] || {}) };
  if (!day[key]) day[key] = { exerciseId, rating: null, easier: false };
  ratings[today] = day;
  return { ...readDifficulty(difficulty), ratings };
}

function dropSet(difficulty, today, key) {
  if (!difficulty?.ratings?.[today]?.[key]) return difficulty;
  const ratings = { ...difficulty.ratings };
  const day = { ...ratings[today] };
  delete day[key];
  if (Object.keys(day).length) ratings[today] = day;
  else delete ratings[today];
  return { ...difficulty, ratings };
}

function dropDay(difficulty, today) {
  if (!difficulty?.ratings?.[today]) return difficulty;
  const ratings = { ...difficulty.ratings };
  delete ratings[today];
  return { ...difficulty, ratings };
}

function slotSource(exercise, progression) {
  if (progression?.adopted?.[exercise.id] && exercise.variant) return exercise.variant;
  return exercise;
}

function baseTarget(exercise, progression) {
  return Math.max(1, Math.round(slotSource(exercise, progression).credit));
}

function nearestPercent(value, percent) {
  return Math.round((value * percent) / 100);
}

function leadingRating(counts) {
  const ranked = Object.entries(counts).filter(([, count]) => count > 0);
  if (!ranked.length) return null;
  ranked.sort((a, b) => b[1] - a[1]);
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null;
  return ranked[0][0];
}

function divideCounter(value, by) {
  return (Number(value) || 0) / by;
}

function rescaleState(state, by, point) {
  const tier = {};
  const lifetime = {};
  for (const id of STAT_IDS) {
    tier[id] = divideCounter(state.stats?.tier?.[id], by);
    lifetime[id] = divideCounter(state.stats?.lifetime?.[id], by);
  }
  const exerciseLifetime = {};
  for (const [id, value] of Object.entries(state.stats?.exerciseLifetime || {})) exerciseLifetime[id] = divideCounter(value, by);
  const daily = {};
  for (const [id, row] of Object.entries(state.stats?.daily || {})) {
    daily[id] = row && typeof row === 'object' ? { ...row, amount: divideCounter(row.amount, by) } : row;
  }
  const volumeByDay = {};
  for (const [day, bag] of Object.entries(state.volumeByDay || {})) {
    const next = {};
    for (const [id, value] of Object.entries(bag || {})) next[id] = divideCounter(value, by);
    volumeByDay[day] = next;
  }
  const history = (state.history || []).map((row) => ({
    ...row,
    gains: {
      strength: divideCounter(row.gains?.strength, by),
      power: divideCounter(row.gains?.power, by),
      endurance: divideCounter(row.gains?.endurance, by),
      core: divideCounter(row.gains?.core, by),
      cardio: divideCounter(row.gains?.cardio, by),
    },
  }));
  const cells = {};
  for (const [key, cell] of Object.entries(state.checks?.cells || {})) {
    const parts = {};
    for (const [stat, amount] of Object.entries(cell.parts || {})) parts[stat] = divideCounter(amount, by);
    cells[key] = {
      ...cell,
      credit: divideCounter(cell.credit, by),
      target: typeof cell.target === 'number' ? divideCounter(cell.target, by) : cell.target,
      parts,
    };
  }
  return {
    ...state,
    stats: { ...(state.stats || emptyStats()), point, tier, lifetime, exerciseLifetime, daily },
    volumeByDay,
    history,
    checks: { ...(state.checks || {}), cells },
  };
}

export function scaleStats(state) {
  const point = state.stats?.point;
  if (point === LEGACY_POINT || point === STAT_POINT) return state;
  return rescaleState(state, 5, LEGACY_POINT);
}

export function quarterStats(state) {
  if (state.stats?.point === STAT_POINT) return state;
  return rescaleState(state, 4, STAT_POINT);
}

function circuitDates(state) {
  const dates = [];
  for (const row of state.history || []) {
    if ((row.rounds || 0) < 4) continue;
    if (!dates.includes(row.date)) dates.push(row.date);
  }
  return dates;
}

function dayQuality(state, date) {
  const sets = Object.values(state.difficulty?.ratings?.[date] || {});
  if (sets.length) {
    const counts = { clean: 0, slipped: 0, modify: 0 };
    let fixes = 0;
    for (const set of sets) {
      if (set.rating === 'clean' || set.rating === 'slipped' || set.rating === 'modify') counts[set.rating] += 1;
      if (set.rating === 'modify' || set.easier) fixes += 1;
    }
    return { clean: leadingRating(counts) === 'clean', fixes };
  }
  const row = (state.history || []).find((item) => item.date === date && (item.rounds || 0) >= 4);
  return { clean: false, fixes: row?.modified?.length || 0 };
}

export function pathSelectionOpen(state) {
  const scored = circuitDates(state).map((date) => dayQuality(state, date));
  const zero = scored.filter((day) => day.fixes === 0);
  const single = scored.filter((day) => day.fixes === 1);
  const zeroClean = zero.filter((day) => day.clean).length;
  if (zero.length >= 5 && zeroClean >= 3) return true;
  if (zero.length >= 4 && single.length) {
    if (zeroClean >= 3) return true;
    if (zeroClean >= 2 && single.some((day) => day.clean)) return true;
  }
  return false;
}

export function settlePaths(state) {
  const open = Boolean(state.pathsUnlocked) || pathSelectionOpen(state);
  if (open) {
    if (state.pathsUnlocked) return state;
    return { ...state, pathsUnlocked: true };
  }
  if ((state.path || 'starter') === 'starter' && !state.pathsUnlocked) return state;
  return { ...state, path: 'starter', pathsUnlocked: false };
}

function sessionDays(ratings, weekStart) {
  const end = addDays(weekStart, 6);
  return Object.keys(ratings || {})
    .filter((day) => day >= weekStart && day <= end && Object.keys(ratings[day] || {}).length)
    .sort();
}

function adjustOne(state, difficulty, monday) {
  const prevStart = addDays(monday, -7);
  const days = sessionDays(difficulty.ratings, prevStart);
  const applied = difficulty.applied.includes(monday) ? difficulty.applied : [...difficulty.applied, monday];
  if (!days.length) return { ...difficulty, applied };
  const targets = { ...difficulty.targets };
  const streaks = { ...difficulty.streaks };
  const notes = { ...difficulty.notes };
  for (const exercise of EXERCISES) {
    const id = exercise.id;
    let fullDays = 0;
    let easier = 0;
    const counts = { clean: 0, slipped: 0, modify: 0 };
    for (const day of days) {
      const sets = Object.values(difficulty.ratings[day] || {}).filter((set) => set.exerciseId === id);
      if (sets.length && sets.every((set) => !set.easier && set.rating !== 'modify')) fullDays += 1;
      for (const set of sets) {
        if (set.easier) easier += 1;
        if (set.rating === 'clean' || set.rating === 'slipped' || set.rating === 'modify') counts[set.rating] += 1;
      }
    }
    const completion = fullDays / days.length;
    const most = leadingRating(counts);
    const down = completion < 0.6 || easier >= 2 || most === 'modify';
    const source = slotSource(exercise, state.progression);
    const name = source.name;
    const floor = source.unit === 'sec' ? 15 : 5;
    let target = typeof targets[id] === 'number' ? targets[id] : baseTarget(exercise, state.progression);
    let streak = streaks[id] || 0;
    if (down) {
      streak = 0;
      const reduced = Math.max(floor, nearestPercent(target, 85));
      if (reduced !== target) {
        target = reduced;
        targets[id] = target;
        notes[id] = {
          weekStart: monday,
          text: `${name} target reduced to ${target} this week — building consistency first`,
        };
      }
    } else if (completion === 1 && most === 'clean') {
      streak += 1;
      if (streak >= 2) {
        const increased = nearestPercent(target, 110);
        if (increased !== target) {
          target = increased;
          targets[id] = target;
          notes[id] = {
            weekStart: monday,
            text: `${name} target increased to ${target} this week — you’ve earned it`,
          };
        }
      }
    } else {
      streak = 0;
    }
    streaks[id] = streak;
  }
  return { ...difficulty, applied, targets, streaks, notes };
}

export function applyWeeklyTargets(state, today) {
  const start = difficultyStart(state.ramp);
  if (!start || today < start) return state;
  const difficulty = readDifficulty(state.difficulty);
  const weekMonday = mondayOfIso(today);
  const pending = [];
  for (let cursor = start; cursor <= weekMonday; cursor = addDays(cursor, 7)) {
    if (!difficulty.applied.includes(cursor)) pending.push(cursor);
  }
  if (!pending.length) return state;
  let next = difficulty;
  for (const monday of pending) next = adjustOne(state, next, monday);
  return { ...state, difficulty: next };
}

export function targetNote(difficulty, exerciseId, today) {
  const note = difficulty?.notes?.[exerciseId];
  if (!note?.text || !note.weekStart) return '';
  const end = addDays(note.weekStart, 6);
  if (today < note.weekStart || today > end) return '';
  return note.text;
}

export function rateCell(state, round, index, kind, today) {
  const start = difficultyStart(state.ramp);
  if (!start || today < start) return state;
  const checks = normalizeChecks(state.checks, today);
  const key = cellKey(round, index);
  const cell = checks.cells[key];
  if (!cell) return state;
  const difficulty = readDifficulty(state.difficulty);
  const ratings = { ...difficulty.ratings };
  const day = { ...(ratings[today] || {}) };
  const prev = day[key] || { exerciseId: cell.exerciseId, rating: null, easier: false };
  const mark = { exerciseId: cell.exerciseId, rating: prev.rating, easier: prev.easier };
  if (kind === 'easier') mark.easier = !prev.easier;
  else if (prev.rating === kind) mark.rating = null;
  else mark.rating = kind;
  day[key] = mark;
  ratings[today] = day;
  const target = typeof cell.target === 'number' ? cell.target : cell.credit;
  const scaled = mark.easier ? target * 0.4 : mark.rating === 'modify' ? target * 0.6 : target;
  const stats = cloneStats(state.stats);
  const nextParts = {};
  for (const stat of Object.keys(cell.parts || {})) {
    nextParts[stat] = scaled;
    const delta = scaled - (cell.parts[stat] || 0);
    stats.lifetime[stat] = (stats.lifetime[stat] || 0) + delta;
    if (cell.tierGranted) stats.tier[stat] = (stats.tier[stat] || 0) + delta;
  }
  stats.exerciseLifetime[cell.exerciseId] = (stats.exerciseLifetime[cell.exerciseId] || 0) + (scaled - (cell.credit || 0));
  const volumeByDay = { ...(state.volumeByDay || {}) };
  const dayVolume = { ...(volumeByDay[today] || {}) };
  const left = (dayVolume[cell.exerciseId] || 0) + (scaled - (cell.credit || 0));
  if (left) dayVolume[cell.exerciseId] = left;
  else delete dayVolume[cell.exerciseId];
  if (Object.keys(dayVolume).length) volumeByDay[today] = dayVolume;
  else delete volumeByDay[today];
  checks.cells[key] = { ...cell, credit: scaled, target, parts: nextParts };
  return {
    ...state,
    checks,
    stats,
    volumeByDay,
    difficulty: { ...difficulty, ratings },
  };
}

function gainBag() {
  return { strength: 0, power: 0, endurance: 0, core: 0, cardio: 0 };
}

export function sessionLog(state, today) {
  const checks = normalizeChecks(state.checks, today);
  const cells = Object.values(checks.cells || {});
  if (!cells.length) return null;
  const gains = gainBag();
  for (const cell of cells) {
    for (const [stat, amount] of Object.entries(cell.parts || {})) {
      if (gains[stat] != null) gains[stat] += amount;
    }
  }
  const modified = [];
  const ratings = state.difficulty?.ratings?.[today] || {};
  for (const set of Object.values(ratings)) {
    if (set.rating !== 'modify' && !set.easier) continue;
    const exercise = exerciseById(set.exerciseId);
    if (exercise && !modified.includes(exercise.name)) modified.push(exercise.name);
  }
  let rounds = 0;
  for (let round = 0; round < 4; round += 1) {
    if (roundCount(checks, round) === 8) rounds += 1;
  }
  const durationMs = (state.roundTimes || []).filter((row) => row.date === today).reduce((sum, row) => sum + (row.ms || 0), 0);
  return {
    id: today,
    date: today,
    path: state.path || 'starter',
    rounds,
    durationMs: durationMs || null,
    gains,
    modified,
    pathChange: null,
  };
}

export function applySessionLog(state, today) {
  const log = sessionLog(state, today);
  const history = [...(state.history || [])];
  const index = history.findIndex((row) => row.id === today);
  if (!log) {
    if (index < 0) return state;
    const prev = history[index];
    if (prev.pathChange) {
      const cleared = { ...prev, rounds: 0, durationMs: null, gains: gainBag(), modified: [] };
      if (JSON.stringify(cleared) === JSON.stringify(prev)) return state;
      history[index] = cleared;
      return { ...state, history };
    }
    history.splice(index, 1);
    return { ...state, history };
  }
  const prev = index >= 0 ? history[index] : null;
  const next = { ...log, pathChange: prev?.pathChange || null };
  if (prev && JSON.stringify(prev) === JSON.stringify(next)) return state;
  if (index >= 0) history[index] = next;
  else history.push(next);
  return { ...state, history };
}

export function pathChangeEntry(state, today, nextPath) {
  const from = workoutPath(state.path).name;
  const to = workoutPath(nextPath).name;
  return {
    id: `${today}:path:${state.path || 'starter'}:${nextPath}`,
    date: today,
    path: nextPath,
    rounds: 0,
    durationMs: null,
    gains: gainBag(),
    modified: [],
    pathChange: `${from} to ${to}`,
  };
}

export function readBody(raw) {
  const body = emptyBody();
  if (!raw || typeof raw !== 'object') return body;
  if (typeof raw.heightCm === 'number' && raw.heightCm > 0) body.heightCm = raw.heightCm;
  if (typeof raw.weightKg === 'number' && raw.weightKg > 0) body.weightKg = raw.weightKg;
  return body;
}

export function readHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row) => row && typeof row.date === 'string' && typeof row.path === 'string')
    .map((row) => ({
      id: typeof row.id === 'string' ? row.id : row.date,
      date: row.date,
      path: row.path,
      rounds: typeof row.rounds === 'number' ? row.rounds : 0,
      durationMs: typeof row.durationMs === 'number' ? row.durationMs : null,
      gains: { ...gainBag(), ...(row.gains || {}) },
      modified: Array.isArray(row.modified) ? row.modified.filter((name) => typeof name === 'string') : [],
      pathChange: typeof row.pathChange === 'string' ? row.pathChange : null,
    }));
}

export function publicHistory(row) {
  return {
    id: row.id,
    date: row.date,
    path: row.path,
    rounds: row.rounds || 0,
    durationMs: row.durationMs || null,
    gains: { ...gainBag(), ...(row.gains || {}) },
    modified: row.modified || [],
    pathChange: row.pathChange || null,
  };
}

export function serialize(state) {
  return {
    version: 2,
    stats: state.stats,
    trials: state.trials,
    skills: state.skills,
    ramp: state.ramp,
    progression: state.progression,
    checks: state.checks,
    highestLevel: state.highestLevel,
    seenUnlocks: state.seenUnlocks,
    completedDays: state.completedDays,
    recoveryDismissed: state.recoveryDismissed,
    speed: state.speed,
    roundTimes: state.roundTimes,
    titleRank: state.titleRank,
    badges: state.badges,
    weeklyBadges: state.weeklyBadges,
    trainingDays: state.trainingDays,
    volumeByDay: state.volumeByDay,
    seenExercises: state.seenExercises,
    weekly: state.weekly,
    ascend: state.ascend,
    difficulty: state.difficulty,
    path: state.path,
    pathsUnlocked: Boolean(state.pathsUnlocked),
    pathsUnlockSeen: Boolean(state.pathsUnlockSeen),
    body: state.body,
    photoURL: state.photoURL || '',
    history: (state.history || []).map(publicHistory),
  };
}

export function parseProgress(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  if (!data.stats?.tier || !data.stats?.lifetime || !data.stats.exerciseLifetime || !data.stats.daily) return null;
  for (const id of STAT_IDS) {
    if (typeof data.stats.tier[id] !== 'number') return null;
    if (typeof data.stats.lifetime[id] !== 'number') return null;
  }
  if (!data.trials || !data.skills || !data.ramp || !data.progression || !data.checks) return null;
  if (typeof data.highestLevel !== 'number') return null;
  const speed = {
    baseline: typeof data.speed?.baseline === 'number' ? data.speed.baseline : null,
    best: typeof data.speed?.best === 'number' ? data.speed.best : null,
  };
  const level = levelInfo(data.stats.tier, speedTier(speed)).level;
  const checks = data.checks.date ? data.checks : { date: todayKey(), cells: {} };
  return {
    stats: data.stats,
    trials: data.trials,
    skills: data.skills,
    ramp: {
      enabled: data.ramp.enabled !== false,
      firstDate: data.ramp.firstDate || null,
      anchorDate: data.ramp.anchorDate || null,
      baseWeek: data.ramp.baseWeek || 1,
      offSince: data.ramp.offSince || null,
    },
    progression: {
      adopted: data.progression.adopted || {},
      dismissed: data.progression.dismissed || {},
    },
    checks: {
      date: checks.date,
      cells: checks.cells || {},
      skipped: checks.skipped || {},
      expired: checks.expired || {},
      paused: Boolean(checks.paused),
      round: Number.isInteger(checks.round) ? checks.round : 0,
    },
    highestLevel: Math.max(data.highestLevel, level),
    seenUnlocks: Array.isArray(data.seenUnlocks) ? data.seenUnlocks : [],
    completedDays: Array.isArray(data.completedDays) ? data.completedDays : [],
    recoveryDismissed: data.recoveryDismissed || null,
    speed,
    roundTimes: Array.isArray(data.roundTimes) ? data.roundTimes : [],
    titleRank: typeof data.titleRank === 'number' ? data.titleRank : 0,
    badges: data.badges && typeof data.badges === 'object' && !Array.isArray(data.badges) ? data.badges : {},
    weeklyBadges: Array.isArray(data.weeklyBadges) ? data.weeklyBadges : [],
    trainingDays: Array.isArray(data.trainingDays) ? data.trainingDays : [],
    volumeByDay: data.volumeByDay && typeof data.volumeByDay === 'object' ? data.volumeByDay : {},
    seenExercises: data.seenExercises && typeof data.seenExercises === 'object' ? data.seenExercises : {},
    weekly: data.weekly?.weekStart && data.weekly?.objective ? data.weekly : null,
    ascend: {
      count: typeof data.ascend?.count === 'number' ? data.ascend.count : 0,
      accent: Boolean(data.ascend?.accent),
    },
    difficulty: readDifficulty(data.difficulty),
    path: data.path ? workoutPath(data.path).id : 'starter',
    pathsUnlocked: Boolean(data.pathsUnlocked),
    pathsUnlockSeen: Boolean(data.pathsUnlockSeen),
    body: readBody(data.body),
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
    history: readHistory(data.history),
  };
}

export function speedTier(speed) {
  if (!speed?.baseline || !speed?.best || speed.best >= speed.baseline) return 0;
  return Math.min(12, Math.floor((speed.baseline / speed.best - 1) / 0.1));
}

export async function lookupPublicIp() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.ip === 'string' && data.ip ? data.ip : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
