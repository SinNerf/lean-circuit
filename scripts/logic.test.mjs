import test from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES } from '../src/catalog.js';
import { TRIALS, CLASS_TRIALS } from '../src/catalog.js';
import {
  afterAction,
  ascend,
  canAscend,
  ensureWeekly,
  hasComeback,
  longestStreak,
  mondayOf,
  beginFocus,
  completeFocusStep,
  continueFocus,
  elapsedOf,
  freezeTiming,
  recordRound,
  resumeTiming,
  titleName,
} from '../src/honors.js';
import {
  applyCell,
  bodyweightFactor,
  compareStanding,
  creditFor,
  applyWeeklyTargets,
  barSegments,
  beltName,
  difficultyStart,
  freshState,
  levelInfo,
  nameKey,
  decideNameClaim,
  parseProgress,
  pathSelectionOpen,
  prescription,
  rateCell,
  quarterStats,
  scaleStats,
  settlePaths,
  recoveryDue,
  repeatWeek,
  pauseSession,
  resetRounds,
  resumeSession,
  scaleForWeek,
  serialize,
  statCredit,
  statVisualTier,
  skipWeek,
  speedTier,
  suggestionFor,
  trialOpen,
  visualTier,
  weekState,
} from '../src/logic.js';
import { exercisesFor } from '../src/paths.js';
import {
  banOne,
  draftMatch,
  exerciseCredit,
  flameCrossed,
  flameStep,
  friendCode,
  shouldResolve,
  winnerOf,
} from '../src/challenge.js';
import { shouldRegisterServiceWorker } from '../src/platform.js';
import { isAdmin } from '../src/admin.js';

const burpees = EXERCISES[0];
const pushUps = EXERCISES[1];

test('visual tier, belt, and empty bar on a multiple of 10', () => {
  assert.equal(visualTier(0), 0);
  assert.equal(visualTier(0.05), 1);
  assert.equal(visualTier(0.15), 2);
  assert.equal(visualTier(0.35), 3);
  assert.equal(visualTier(0.4), 3);
  assert.equal(visualTier(51.15), 10);
  assert.equal(visualTier(2.25), 5);
  assert.equal(barSegments(0), 0);
  assert.equal(barSegments(4), 4);
  assert.equal(barSegments(10), 0);
  assert.equal(beltName(0), 'bronze');
  assert.equal(beltName(4), 'bronze');
  assert.equal(beltName(5), 'silver');
  assert.equal(beltName(10), 'gold');
  assert.equal(beltName(15), 'platinum');
  assert.equal(beltName(20), 'bronze');
});

test('week scales and overrides', () => {
  assert.equal(scaleForWeek(1, true), 0.55);
  assert.equal(scaleForWeek(2, true), 0.75);
  assert.equal(scaleForWeek(3, true), 0.9);
  assert.equal(scaleForWeek(4, true), 1);
  assert.equal(scaleForWeek(1, false), 1);
  const ramp = { enabled: true, firstDate: '2026-09-01', anchorDate: '2026-09-01', baseWeek: 1 };
  assert.equal(weekState(ramp, '2026-09-01').week, 1);
  assert.equal(weekState(ramp, '2026-09-11').week, 2);
  assert.equal(weekState({ enabled: true, firstDate: null, anchorDate: null, baseWeek: 1 }, '2026-09-22').scale, 0.55);
  const repeated = repeatWeek(ramp, '2026-09-11');
  assert.equal(weekState(repeated, '2026-09-11').week, 2);
  assert.equal(weekState(repeated, '2026-09-17').week, 2);
  assert.equal(weekState(repeated, '2026-09-18').week, 3);
  const skipped = skipWeek(ramp, '2026-09-01');
  assert.equal(weekState(skipped, '2026-09-01').week, 2);
  assert.equal(weekState(skipped, '2026-09-01').scale, 0.75);
});

test('prescribed credit rounds and push-ups keep the range label at full dose', () => {
  const prog = { adopted: {}, dismissed: {} };
  const week1 = prescription(burpees, prog, 0.55);
  assert.equal(week1.credit, 8);
  const pushFull = prescription(pushUps, prog, 1);
  assert.equal(pushFull.label, '15–18');
  assert.equal(pushFull.credit, 15);
  const pushScaled = prescription(pushUps, prog, 0.55);
  assert.equal(pushScaled.credit, 8);
  const adopted = prescription(pushUps, { adopted: { 'push-ups': true }, dismissed: {} }, 1);
  assert.equal(adopted.credit, 8);
  assert.equal(adopted.guideId, 'twin-fang');
});

test('daily cap, uncheck refund, reset keeps credit, and a second exercise still feeds the stat', () => {
  let state = freshState();
  const rx = prescription(burpees, state.progression, 0.55);
  state = applyCell(state, 0, 0, burpees, rx, '2026-09-22');
  assert.equal(state.stats.tier.strength, 8);
  assert.equal(state.stats.tier.cardio, 8);
  assert.equal(state.stats.lifetime.strength, 8);
  state = applyCell(state, 1, 0, burpees, rx, '2026-09-22');
  assert.equal(state.stats.tier.strength, 8);
  assert.equal(state.stats.lifetime.strength, 16);
  state = applyCell(state, 0, 0, burpees, rx, '2026-09-22');
  assert.equal(state.stats.tier.strength, 0);
  assert.equal(state.stats.daily.burpees, undefined);
  state = applyCell(state, 0, 0, burpees, rx, '2026-09-22');
  const push = prescription(pushUps, state.progression, 0.55);
  state = applyCell(state, 0, 1, pushUps, push, '2026-09-22');
  assert.equal(state.stats.tier.strength, 16);
  state = resetRounds(state, '2026-09-22');
  assert.equal(state.stats.tier.strength, 16);
  assert.equal(Object.keys(state.checks.cells).length, 0);
  state = applyCell(state, 0, 0, burpees, rx, '2026-09-22');
  assert.equal(state.stats.tier.strength, 16);
  assert.equal(state.stats.lifetime.strength, 32);
});

test('level is the floor of the average of six visual tiers', () => {
  const info = levelInfo({ strength: 0.8, power: 1.4, endurance: 1.3, core: 1.1, cardio: 1.8 }, 0);
  assert.equal(info.visual.strength, 4);
  assert.equal(info.visual.cardio, 5);
  assert.equal(info.visual.speed, 0);
  assert.equal(info.level, 3);
  assert.ok(Math.abs(info.xp - 0.5) < 1e-9);
});

test('trials and suggestions follow tier and class skills', () => {
  const zeros = { strength: 0, power: 0, endurance: 0, core: 0, cardio: 0 };
  assert.equal(trialOpen(TRIALS[0], { ...zeros, strength: 2 }, {}), true);
  assert.equal(trialOpen(TRIALS[1], { ...zeros, strength: 2 }, {}), false);
  assert.equal(trialOpen(CLASS_TRIALS[0], zeros, {}), false);
  assert.equal(trialOpen(CLASS_TRIALS[0], zeros, { berserker: '2026-09-22' }), true);
  assert.equal(suggestionFor(pushUps, { ...zeros, strength: 63.75 }, { adopted: {}, dismissed: {} }), true);
  assert.equal(suggestionFor(pushUps, { ...zeros, strength: 63.75 }, { adopted: {}, dismissed: { 'push-ups': true } }), false);
});

test('recovery needs three previous full days and import keeps counters', () => {
  assert.equal(recoveryDue(['2026-09-19', '2026-09-20', '2026-09-21'], '2026-09-22', null), true);
  assert.equal(recoveryDue(['2026-09-19', '2026-09-20', '2026-09-21'], '2026-09-22', '2026-09-22'), false);
  assert.equal(recoveryDue(['2026-09-20', '2026-09-21'], '2026-09-22', null), false);
  const state = freshState();
  state.stats.tier.strength = 16;
  state.highestLevel = 2;
  const parsed = parseProgress(serialize(state));
  assert.equal(parsed.stats.tier.strength, 16);
  assert.equal(parsed.highestLevel, 2);
  assert.equal(parseProgress({ nope: true }), null);
});

test('a round clock starts from the tap, freezes on pause, and records that span', () => {
  const started = { round: 0, startedAt: 1000, elapsed: 0, frozen: false };
  assert.equal(elapsedOf(started, 1000), 0);
  assert.equal(elapsedOf(started, 3500), 2500);
  const frozen = freezeTiming(started, 3500);
  assert.equal(frozen.frozen, true);
  assert.equal(elapsedOf(frozen, 9000), 2500);
  const resumed = resumeTiming(frozen, 9000);
  assert.equal(resumed.frozen, false);
  assert.equal(elapsedOf(resumed, 10000), 3500);
  let state = freshState();
  state = recordRound(state, elapsedOf(resumed, 10000), '2026-09-22');
  assert.equal(state.speed.baseline, 3500);
  assert.equal(state.roundTimes[0].ms, 3500);
});

test('a timed round preps, rests, flashes the total, then offers the next round', () => {
  const checks = { cells: {}, skipped: {}, expired: {} };
  const opened = beginFocus(checks);
  assert.equal(opened.phase, 'prep');
  assert.equal(opened.seconds, 10);
  assert.equal(opened.round, 0);
  assert.equal(opened.index, 0);
  checks.cells['0-0'] = true;
  checks.cells['0-1'] = true;
  const mid = beginFocus(checks);
  assert.equal(mid.index, 2);
  const working = { ...mid, phase: 'work', seconds: null };
  const rested = completeFocusStep(working, 4000);
  assert.equal(rested.record, false);
  assert.equal(rested.focus.phase, 'rest');
  assert.equal(rested.focus.seconds, 20);
  assert.equal(rested.focus.restSpan, 20);
  assert.equal(rested.focus.restKey, '0-2');
  assert.equal(rested.focus.index, 3);
  const last = { ...working, index: 7 };
  const finished = completeFocusStep(last, 82000);
  assert.equal(finished.record, true);
  assert.equal(finished.ms, 82000);
  assert.equal(finished.focus.phase, 'flash');
  assert.equal(finished.focus.seconds, 1);
  assert.equal(finished.focus.totalMs, 82000);
  const chosen = { ...finished.focus, phase: 'choice', seconds: null };
  const next = continueFocus(chosen, checks);
  assert.equal(next.round, 1);
  assert.equal(next.phase, 'rest');
  assert.equal(next.seconds, 90);
  assert.equal(next.restSpan, 90);
  assert.equal(continueFocus({ ...chosen, round: 3 }, checks), null);
});

test('speed tier uses the baseline ratio and ignores a slower round', () => {
  assert.equal(speedTier({ baseline: null, best: null }), 0);
  assert.equal(speedTier({ baseline: 1000, best: 1000 }), 0);
  assert.equal(speedTier({ baseline: 1000, best: Math.round(1000 / 1.09) }), 0);
  assert.equal(speedTier({ baseline: 1100, best: 1000 }), 1);
  assert.equal(speedTier({ baseline: 1000, best: 450 }), 12);
  let state = freshState();
  state = recordRound(state, 10000, '2026-09-22');
  assert.equal(state.speed.baseline, 10000);
  assert.equal(state.speed.best, 10000);
  assert.equal(speedTier(state.speed), 0);
  state = recordRound(state, 12000, '2026-09-22');
  assert.equal(state.speed.best, 10000);
  state = recordRound(state, 8000, '2026-09-23');
  assert.equal(state.speed.best, 8000);
  assert.equal(speedTier(state.speed), 2);
});

test('titles keep the highest rung and a skipped streak still reaches twin-blade', () => {
  let state = freshState();
  state = afterAction(state, '2026-09-22', () => 0);
  assert.equal(titleName(state.titleRank), 'Recruit');
  state.stats.tier.strength = 31;
  state = afterAction(state, '2026-09-22', () => 0);
  assert.equal(titleName(state.titleRank), 'Iron Novice');
  state.stats.tier.power = 255;
  state.stats.tier.strength = 255;
  state = afterAction(state, '2026-09-22', () => 0);
  assert.equal(titleName(state.titleRank), 'Twin-Blade');
  assert.equal(longestStreak(state.trainingDays) < 7, true);
  state.stats.tier.strength = 0;
  state.stats.tier.power = 0;
  state = afterAction(state, '2026-09-22', () => 0);
  assert.equal(titleName(state.titleRank), 'Twin-Blade');
});

test('weekly objective stays for the monday week and a one-day gap is a comeback', () => {
  assert.equal(mondayOf('2026-09-22'), '2026-09-21');
  assert.equal(mondayOf('2026-09-27'), '2026-09-21');
  assert.equal(mondayOf('2026-09-28'), '2026-09-28');
  assert.equal(hasComeback(['2026-09-01', '2026-09-02']), false);
  assert.equal(hasComeback(['2026-09-01', '2026-09-03']), true);
  assert.equal(longestStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07']), 7);
  let calls = 0;
  let state = ensureWeekly(freshState(), '2026-09-22', () => {
    calls += 1;
    return 0;
  });
  const objective = state.weekly.objective;
  state = ensureWeekly(state, '2026-09-26', () => {
    calls += 1;
    return 0.9;
  });
  assert.equal(state.weekly.objective, objective);
  assert.equal(calls, 1);
  state = ensureWeekly(state, '2026-09-28', () => 0.99);
  assert.equal(state.weekly.weekStart, '2026-09-28');
  assert.notEqual(state.weekly.objective, objective);
});

test('ascend clears tiers, keeps lifetime, and rebases speed', () => {
  let state = freshState();
  state.stats.tier = { strength: 4095, power: 4095, endurance: 4095, core: 4095, cardio: 4095 };
  state.stats.lifetime = { ...state.stats.tier };
  state.speed = { baseline: 1000, best: 450 };
  state.titleRank = 4;
  state.badges = { 'burpees-100': '2026-09-01' };
  assert.equal(canAscend(state), true);
  state = ascend(state);
  assert.equal(state.stats.tier.strength, 0);
  assert.equal(state.stats.lifetime.strength, 4095);
  assert.equal(state.speed.baseline, 450);
  assert.equal(state.speed.best, 450);
  assert.equal(speedTier(state.speed), 0);
  assert.equal(state.ascend.count, 1);
  assert.equal(state.ascend.accent, true);
  assert.equal(state.titleRank, 4);
  assert.equal(state.badges['burpees-100'], '2026-09-01');
  assert.equal(canAscend(state), false);
});

test('pause keeps the checks and the next day clears only the checklist', () => {
  let state = freshState();
  const rx = prescription(burpees, state.progression, 1);
  state = applyCell(state, 0, 0, burpees, rx, '2026-09-22');
  state = applyCell(state, 0, 1, pushUps, prescription(pushUps, state.progression, 1), '2026-09-22');
  const strength = state.stats.tier.strength;
  const lifetime = state.stats.lifetime.strength;
  state = pauseSession(state, '2026-09-22');
  assert.equal(state.checks.paused, true);
  assert.equal(state.checks.date, '2026-09-22');
  assert.equal(state.checks.round, 0);
  assert.equal(Object.keys(state.checks.cells).length, 2);
  assert.equal(state.stats.tier.strength, strength);
  assert.equal(state.stats.lifetime.strength, lifetime);
  assert.deepEqual(state.trainingDays, ['2026-09-22']);
  state = resumeSession(state, '2026-09-22');
  assert.equal(state.checks.paused, false);
  assert.equal(Object.keys(state.checks.cells).length, 2);
  state = pauseSession(state, '2026-09-22');
  const paused = serialize(state);
  assert.equal(paused.checks.paused, true);
  assert.equal(paused.checks.date, '2026-09-22');
  assert.equal(Object.keys(paused.checks.cells).length, 2);
  const imported = parseProgress(paused);
  assert.equal(imported.checks.paused, true);
  assert.equal(imported.checks.date, '2026-09-22');
  assert.equal(Object.keys(imported.checks.cells).length, 2);
  const legacy = parseProgress(serialize(freshState()));
  assert.equal(legacy.checks.paused, false);
  state = afterAction(state, '2026-09-23', () => 0);
  assert.equal(state.checks.date, '2026-09-23');
  assert.equal(state.checks.paused, false);
  assert.equal(Object.keys(state.checks.cells).length, 0);
  assert.equal(state.checks.round, 0);
  assert.equal(state.stats.tier.strength, strength);
  assert.equal(state.stats.lifetime.strength, lifetime);
  assert.deepEqual(state.trainingDays, ['2026-09-22']);
  const quiet = pauseSession(
    { ...freshState(), checks: { date: '2026-09-22', cells: {}, skipped: {}, expired: {}, paused: false } },
    '2026-09-22',
  );
  assert.equal(quiet.checks.paused, true);
  assert.deepEqual(quiet.trainingDays, []);
  const cells = {};
  for (let n = 0; n < 32; n += 1) cells[`${Math.floor(n / 8)}-${n % 8}`] = true;
  const full = {
    ...freshState(),
    checks: { date: '2026-09-23', cells, skipped: {}, expired: {}, paused: false },
  };
  assert.equal(pauseSession(full, '2026-09-23'), full);
});

function weekRamp(anchor, extra = {}) {
  return { enabled: true, firstDate: anchor, anchorDate: anchor, baseWeek: 1, offSince: null, ...extra };
}

function logSet(ratings, day, exerciseId, rating, easier = false) {
  const bag = ratings[day] || {};
  let n = 0;
  while (bag[String(n)]) n += 1;
  bag[String(n)] = { exerciseId, rating, easier };
  ratings[day] = bag;
}

function logDays(ratings, days, rating = 'clean', skipId = null) {
  for (const day of days) {
    for (const exercise of EXERCISES) {
      if (exercise.id === skipId) continue;
      logSet(ratings, day, exercise.id, rating, false);
    }
  }
}

test('weekly targets wait for week 4, then move each exercise on its own', () => {
  const early = weekRamp('2026-09-01');
  assert.equal(difficultyStart(early), '2026-09-28');
  assert.equal(difficultyStart(weekRamp('2026-08-17')), '2026-09-07');
  assert.equal(
    difficultyStart({ enabled: false, firstDate: '2026-09-01', anchorDate: '2026-09-01', baseWeek: 1, offSince: '2026-09-22' }),
    '2026-09-28',
  );
  assert.equal(
    difficultyStart({ enabled: false, firstDate: '2026-09-01', anchorDate: '2026-09-01', baseWeek: 1, offSince: '2026-09-21' }),
    '2026-09-28',
  );
  assert.equal(
    difficultyStart({ enabled: false, firstDate: '2026-09-01', anchorDate: '2026-09-01', baseWeek: 1, offSince: '2026-09-10' }),
    '2026-09-14',
  );

  let held = freshState();
  held.ramp = early;
  held.difficulty.ratings = { '2026-09-16': { a: { exerciseId: 'push-ups', rating: 'modify', easier: true } } };
  assert.equal(applyWeeklyTargets(held, '2026-09-21'), held);
  held = applyCell(held, 0, 1, pushUps, prescription(pushUps, held.progression, 0.9), '2026-09-21');
  assert.equal(held.difficulty.ratings['2026-09-21'], undefined);

  const days = ['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'];
  let state = freshState();
  state.ramp = early;
  const ratings = {};
  logDays(ratings, days);
  for (const day of days.slice(2)) delete ratings[day]['1'];
  logSet(ratings, '2026-09-22', 'burpees', 'clean', true);
  logSet(ratings, '2026-09-22', 'burpees', 'clean', true);
  state.difficulty = { ...state.difficulty, ratings };
  state = applyWeeklyTargets(state, '2026-09-28');
  assert.equal(state.difficulty.targets['push-ups'], 13);
  assert.equal(state.difficulty.streaks['push-ups'], 0);
  assert.equal(
    state.difficulty.notes['push-ups'].text,
    'Push-ups target reduced to 13 this week — building consistency first',
  );
  assert.equal(state.difficulty.targets.burpees, 13);
  assert.equal(state.difficulty.targets['jump-squats'], undefined);
  assert.equal(state.difficulty.streaks['jump-squats'], 1);
  const again = applyWeeklyTargets(state, '2026-09-28');
  assert.equal(again, state);

  const boundary = freshState();
  boundary.ramp = early;
  const even = {};
  logDays(even, days);
  for (const day of days.slice(3)) delete even[day]['1'];
  boundary.difficulty = { ...boundary.difficulty, ratings: even };
  const stayed = applyWeeklyTargets(boundary, '2026-09-28');
  assert.equal(stayed.difficulty.targets['push-ups'], undefined);
  assert.equal(stayed.difficulty.streaks['push-ups'], 0);

  const rated = freshState();
  rated.ramp = early;
  const modifyHeavy = {};
  logDays(modifyHeavy, days.slice(0, 4));
  delete modifyHeavy['2026-09-25']['1'];
  logSet(modifyHeavy, '2026-09-25', 'push-ups', 'modify');
  logSet(modifyHeavy, '2026-09-25', 'push-ups', 'modify');
  logSet(modifyHeavy, '2026-09-25', 'push-ups', 'modify');
  logSet(modifyHeavy, '2026-09-25', 'push-ups', 'modify');
  rated.difficulty = { ...rated.difficulty, ratings: modifyHeavy };
  const modified = applyWeeklyTargets(rated, '2026-09-28');
  assert.equal(modified.difficulty.targets['push-ups'], 13);
  assert.equal(modified.difficulty.notes['push-ups'].text.includes('building consistency first'), true);

  const quiet = freshState();
  quiet.ramp = early;
  quiet.difficulty = {
    ...quiet.difficulty,
    applied: ['2026-09-28'],
    streaks: { 'push-ups': 1 },
    targets: { 'push-ups': 15 },
  };
  const skipped = applyWeeklyTargets(quiet, '2026-10-05');
  assert.equal(skipped.difficulty.streaks['push-ups'], 1);
  assert.equal(skipped.difficulty.targets['push-ups'], 15);
  assert.equal(skipped.difficulty.notes['push-ups'], undefined);

  let climb = freshState();
  climb.ramp = early;
  const first = {};
  logDays(first, ['2026-09-22', '2026-09-23', '2026-09-24']);
  climb.difficulty = { ...climb.difficulty, ratings: first };
  climb = applyWeeklyTargets(climb, '2026-09-28');
  assert.equal(climb.difficulty.targets['push-ups'], undefined);
  assert.equal(climb.difficulty.streaks['push-ups'], 1);
  const second = { ...climb.difficulty.ratings };
  logDays(second, ['2026-09-29', '2026-09-30', '2026-10-01']);
  climb = { ...climb, difficulty: { ...climb.difficulty, ratings: second } };
  climb = applyWeeklyTargets(climb, '2026-10-05');
  assert.equal(climb.difficulty.targets['push-ups'], 17);
  assert.equal(climb.difficulty.targets['jump-squats'], 22);
  assert.equal(climb.difficulty.streaks['push-ups'], 2);
  assert.equal(climb.difficulty.notes['push-ups'].text, 'Push-ups target increased to 17 this week — you’ve earned it');
  assert.equal(climb.difficulty.notes['jump-squats'].text, 'Jump squats target increased to 22 this week — you’ve earned it');

  const blank = {};
  logDays(blank, ['2026-09-22', '2026-09-23']);
  for (const day of Object.keys(blank)) {
    for (const set of Object.values(blank[day])) set.rating = null;
  }
  let unrated = freshState();
  unrated.ramp = early;
  unrated.difficulty = { ...unrated.difficulty, ratings: blank };
  unrated = applyWeeklyTargets(unrated, '2026-09-28');
  assert.equal(unrated.difficulty.targets['push-ups'], undefined);
  assert.equal(unrated.difficulty.streaks['push-ups'], 0);

  let floor = freshState();
  floor.ramp = early;
  const low = {};
  logDays(low, ['2026-09-22']);
  delete low['2026-09-22']['1'];
  delete low['2026-09-22']['6'];
  floor.difficulty = {
    ...floor.difficulty,
    targets: { 'push-ups': 5, 'bear-crawl': 16 },
    ratings: low,
  };
  floor = applyWeeklyTargets(floor, '2026-09-28');
  assert.equal(floor.difficulty.targets['push-ups'], 5);
  assert.equal(floor.difficulty.notes['push-ups'], undefined);
  assert.equal(floor.difficulty.targets['bear-crawl'], 15);
  assert.equal(floor.difficulty.notes['bear-crawl'].text, 'Bear crawl target reduced to 15 this week — building consistency first');

  const saved = serialize(climb);
  assert.equal(saved.difficulty.targets['push-ups'], 17);
  assert.equal(saved.difficulty.streaks['jump-squats'], 2);
  assert.equal(saved.difficulty.ratings['2026-09-22']['1'].rating, 'clean');
  const imported = parseProgress(saved);
  assert.equal(imported.difficulty.targets['push-ups'], 17);
  assert.equal(imported.difficulty.streaks['push-ups'], 2);
  assert.equal(imported.difficulty.ratings['2026-09-29']['1'].exerciseId, 'push-ups');
  const legacy = serialize(freshState());
  delete legacy.difficulty;
  assert.deepEqual(parseProgress(legacy).difficulty.targets, {});
  assert.deepEqual(parseProgress(legacy).difficulty.streaks, {});
  assert.deepEqual(parseProgress(legacy).difficulty.ratings, {});
});

test('a form mark scales that set and an easier mark wins', () => {
  let state = freshState();
  state.ramp = weekRamp('2026-08-03');
  const rx = prescription(pushUps, state.progression, 1);
  state = applyCell(state, 0, 1, pushUps, rx, '2026-09-22');
  assert.equal(state.stats.tier.strength, 15);
  assert.equal(state.difficulty.ratings['2026-09-22']['0-1'].rating, null);
  state = rateCell(state, 0, 1, 'modify', '2026-09-22');
  assert.equal(state.stats.tier.strength, 9);
  assert.equal(state.stats.lifetime.strength, 9);
  assert.equal(state.volumeByDay['2026-09-22']['push-ups'], 9);
  state = rateCell(state, 0, 1, 'easier', '2026-09-22');
  assert.equal(state.checks.cells['0-1'].credit, 6);
  assert.equal(state.stats.tier.strength, 6);
  assert.equal(state.difficulty.ratings['2026-09-22']['0-1'].easier, true);
  assert.equal(state.difficulty.ratings['2026-09-22']['0-1'].rating, 'modify');
  state = applyCell(state, 1, 1, pushUps, rx, '2026-09-22');
  assert.equal(state.stats.tier.strength, 6);
  assert.equal(state.stats.lifetime.strength, 21);
  state = rateCell(state, 1, 1, 'slipped', '2026-09-22');
  assert.equal(state.stats.tier.strength, 6);
  assert.equal(state.stats.lifetime.strength, 21);
  const before = state.stats.tier.strength;
  state = rateCell(state, 0, 1, 'clean', '2026-09-21');
  assert.equal(state.stats.tier.strength, before);
});

test('path and bodyweight multipliers stack on loaded moves only', () => {
  assert.equal(bodyweightFactor(null), 1);
  assert.equal(bodyweightFactor(0), 1);
  assert.ok(Math.abs(bodyweightFactor(50) - 1) < 1e-9);
  assert.equal(bodyweightFactor(200), 1.3);
  assert.ok(bodyweightFactor(10) >= 0.85);
  assert.equal(creditFor(15, pushUps, 'superhuman', null), 0.75);
  assert.ok(Math.abs(creditFor(15, pushUps, 'warrior', null) - 0.9375) < 1e-9);
  assert.ok(Math.abs(creditFor(15, pushUps, 'warrior', 100) - 0.9375 * 1.15) < 1e-9);
  const jump = EXERCISES.find((exercise) => exercise.id === 'jump-squats');
  assert.equal(creditFor(20, jump, 'warrior', 100), 1.25);
  const shared = { id: 'day', date: '2026-09-22', path: 'warrior', rounds: 1, gains: { strength: 1 }, modified: [], pathChange: null };
  assert.equal('heightCm' in shared, false);
  assert.equal('weightKg' in shared, false);
});

test('streak flame steps and a draft-and-ban match', () => {
  assert.equal(flameStep(0), 'none');
  assert.equal(flameStep(1), 'outline');
  assert.equal(flameStep(6), 'outline');
  assert.equal(flameStep(7), 'bronze');
  assert.equal(flameStep(29), 'bronze');
  assert.equal(flameStep(30), 'gold');
  assert.equal(flameCrossed(6, 7), true);
  assert.equal(flameCrossed(7, 10), false);
  assert.equal(flameCrossed(29, 30), true);
  assert.equal(flameCrossed(12, 0), false);
  const pool = exercisesFor('superhuman');
  const drafted = draftMatch(pool, [pool[0].id, pool[1].id, pool[2].id]);
  assert.deepEqual(drafted, [pool[0].id, pool[1].id, pool[2].id]);
  assert.equal(draftMatch(pool, [pool[0].id, pool[0].id, pool[1].id]), null);
  const match = banOne(drafted, pool[1].id);
  assert.deepEqual(match, [pool[0].id, pool[2].id]);
  const challenge = {
    from: 'a',
    to: 'b',
    status: 'live',
    day: '2026-09-23',
    match,
    scores: { a: { done: match, credit: 10 }, b: { done: match, credit: 12 } },
  };
  assert.equal(winnerOf(challenge), 'b');
  challenge.scores.b.credit = 10;
  assert.equal(winnerOf(challenge), 'tie');
  assert.equal(shouldResolve(challenge, '2026-09-23'), true);
  assert.equal(shouldResolve({ ...challenge, status: 'ban' }, '2026-09-24'), false);
  const code = friendCode('player-one');
  assert.equal(code, friendCode('player-one'));
  assert.equal(code.length, 6);
  const warrior = freshState();
  warrior.path = 'warrior';
  const recruit = freshState();
  recruit.path = 'recruit';
  assert.ok(exerciseCredit(warrior, '2026-09-23', pool[0]) > exerciseCredit(recruit, '2026-09-23', pool[0]));
  assert.equal(exercisesFor('starter')[0].id, 'knee-push-ups');
  assert.equal(exercisesFor('starter').length, exercisesFor('recruit').length);
});

function gateDay(date, kind) {
  const ratings = {};
  if (kind === 'clean') {
    ratings.a = { rating: 'clean', easier: false };
    ratings.b = { rating: 'clean', easier: false };
  } else if (kind === 'fix') {
    ratings.a = { rating: 'modify', easier: false };
  } else if (kind === 'two') {
    ratings.a = { rating: 'modify', easier: false };
    ratings.b = { rating: 'easier', easier: true };
  } else if (kind === 'clean-fix') {
    ratings.a = { rating: 'clean', easier: false };
    ratings.b = { rating: 'clean', easier: false };
    ratings.c = { rating: 'modify', easier: false };
  }
  return { date, kind, ratings: kind === 'quiet' ? null : ratings };
}

function gateState(days) {
  const history = days.map((day) => ({
    id: day.date,
    date: day.date,
    path: 'superhuman',
    rounds: 4,
    durationMs: null,
    gains: { strength: 1, power: 0, endurance: 0, core: 0, cardio: 0 },
    modified: [],
    pathChange: null,
  }));
  const ratings = {};
  for (const day of days) {
    if (day.ratings) ratings[day.date] = day.ratings;
  }
  return {
    ...freshState(),
    path: 'superhuman',
    pathsUnlocked: false,
    history,
    difficulty: { ...freshState().difficulty, ratings },
  };
}

test('starter path stays locked until five clean-enough circuits, and history stays', () => {
  assert.equal(freshState().path, 'starter');
  assert.equal(freshState().pathsUnlocked, false);
  assert.equal(freshState().stats.point, 0.05);
  const dates = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'];
  const five = gateState(dates.map((date) => gateDay(date, 'clean')));
  assert.equal(pathSelectionOpen(five), true);
  const opened = settlePaths(five);
  assert.equal(opened.pathsUnlocked, true);
  assert.equal(opened.path, 'superhuman');
  assert.equal(opened.history.length, 5);
  const short = gateState(dates.slice(0, 4).map((date) => gateDay(date, 'clean')));
  assert.equal(pathSelectionOpen(short), false);
  const forced = settlePaths(short);
  assert.equal(forced.path, 'starter');
  assert.equal(forced.history.length, 4);
  const mixed = gateState([
    gateDay(dates[0], 'clean'),
    gateDay(dates[1], 'clean'),
    gateDay(dates[2], 'clean'),
    gateDay(dates[3], 'quiet'),
    gateDay(dates[4], 'fix'),
  ]);
  assert.equal(pathSelectionOpen(mixed), true);
  const heavy = gateState([
    gateDay(dates[0], 'clean'),
    gateDay(dates[1], 'clean'),
    gateDay(dates[2], 'clean'),
    gateDay(dates[3], 'quiet'),
    gateDay(dates[4], 'two'),
  ]);
  assert.equal(pathSelectionOpen(heavy), false);
  const thin = gateState(dates.map((date, index) => gateDay(date, index < 2 ? 'clean' : 'quiet')));
  assert.equal(pathSelectionOpen(thin), false);
  const held = settlePaths({ ...freshState(), path: 'monk', pathsUnlocked: true, history: [] });
  assert.equal(held.path, 'monk');
  assert.equal(held.pathsUnlocked, true);
});

test('saved counters divide by 5 once and a starter week stays a small strength total', () => {
  let state = freshState();
  delete state.stats.point;
  state.stats.tier.strength = 45;
  state.stats.lifetime.strength = 180;
  state.stats.exerciseLifetime.burpees = 100;
  state.volumeByDay = { '2026-09-22': { 'push-ups': 50 } };
  state.history = [
    {
      id: '2026-09-22',
      date: '2026-09-22',
      path: 'superhuman',
      rounds: 4,
      durationMs: null,
      gains: { strength: 45, power: 0, endurance: 0, core: 0, cardio: 0 },
      modified: [],
      pathChange: null,
    },
  ];
  state.checks.cells['0-0'] = { exerciseId: 'burpees', credit: 10, target: 10, tierGranted: true, parts: { strength: 10 } };
  state.difficulty.targets['push-ups'] = 15;
  const once = scaleStats(state);
  assert.equal(once.stats.point, 0.2);
  assert.equal(once.stats.tier.strength, 9);
  assert.equal(once.stats.lifetime.strength, 36);
  assert.equal(once.stats.exerciseLifetime.burpees, 20);
  assert.equal(once.volumeByDay['2026-09-22']['push-ups'], 10);
  assert.equal(once.history[0].gains.strength, 9);
  assert.equal(once.checks.cells['0-0'].credit, 2);
  assert.equal(once.difficulty.targets['push-ups'], 15);
  const twice = scaleStats(once);
  assert.equal(twice, once);
  assert.equal(twice.stats.tier.strength, 9);
  const knee = exercisesFor('starter')[0];
  const bridge = exercisesFor('starter').find((exercise) => exercise.id === 'glute-bridges');
  const prog = freshState().progression;
  assert.equal(prescription(knee, prog, 0.55).credit, 7);
  assert.equal(prescription(bridge, prog, 0.55).credit, 8);
  const kneeSet = creditFor(7, knee, 'starter', null);
  const bridgeSet = creditFor(8, bridge, 'starter', null);
  assert.ok(Math.abs(kneeSet - 0.2625) < 1e-9);
  assert.ok(Math.abs(bridgeSet - 0.3) < 1e-9);
  const weekTier = 4 * (kneeSet + bridgeSet);
  assert.ok(Math.abs(weekTier - 2.25) < 1e-9);
  assert.equal(visualTier(weekTier), 5);
  assert.equal(visualTier(4 * 4 * (kneeSet + bridgeSet)), 7);
});

test('saved counters divide by 4 once and the older point flag is left at 0.2', () => {
  let state = freshState();
  state.stats.point = 0.2;
  state.stats.tier.strength = 9;
  state.stats.lifetime.strength = 36;
  state.stats.exerciseLifetime.burpees = 20;
  state.volumeByDay = { '2026-09-22': { 'push-ups': 10 } };
  state.history = [
    {
      id: '2026-09-22',
      date: '2026-09-22',
      path: 'starter',
      rounds: 4,
      durationMs: null,
      gains: { strength: 9, power: 0, endurance: 0, core: 0, cardio: 0 },
      modified: [],
      pathChange: null,
    },
  ];
  state.checks.cells['0-0'] = { exerciseId: 'burpees', credit: 2, target: 2, tierGranted: true, parts: { strength: 2 } };
  state.difficulty.targets['push-ups'] = 15;
  const legacy = scaleStats(state);
  assert.equal(legacy, state);
  assert.equal(legacy.stats.point, 0.2);
  const once = quarterStats(state);
  assert.equal(once.stats.point, 0.05);
  assert.equal(once.stats.tier.strength, 2.25);
  assert.equal(once.stats.lifetime.strength, 9);
  assert.equal(once.stats.exerciseLifetime.burpees, 5);
  assert.equal(once.volumeByDay['2026-09-22']['push-ups'], 2.5);
  assert.equal(once.history[0].gains.strength, 2.25);
  assert.equal(once.checks.cells['0-0'].credit, 0.5);
  assert.equal(once.difficulty.targets['push-ups'], 15);
  const twice = quarterStats(once);
  assert.equal(twice, once);
  const kept = scaleStats(once);
  assert.equal(kept, once);
  assert.equal(kept.stats.tier.strength, 2.25);
});

test('leaderboard standing uses visual tier of raw stats, then raw credit', () => {
  const zeros = { strength: 0, power: 0, endurance: 0, core: 0, cardio: 0 };
  assert.equal(statCredit({ ...zeros, strength: 0.15, power: 0.15 }), 0.3);
  assert.equal(statVisualTier({ ...zeros, strength: 0.15, power: 0.15 }), visualTier(0.3));
  const ahead = { name: 'Ahead', statTier: 3, statCredit: 1.2, level: 1, wins: 0, challengeCredit: 0 };
  const behind = { name: 'Behind', statTier: 3, statCredit: 0.4, level: 9, wins: 4, challengeCredit: 80 };
  const listed = [behind, ahead].sort(compareStanding);
  assert.equal(listed[0].name, 'Ahead');
  assert.equal(listed[0].level, 1);
  const same = [behind, ahead].sort(compareStanding);
  behind.wins = 0;
  behind.challengeCredit = 0;
  ahead.wins = 12;
  ahead.challengeCredit = 400;
  assert.deepEqual([behind, ahead].sort(compareStanding).map((row) => row.name), same.map((row) => row.name));
});

test('service worker stays off inside the native webview', () => {
  assert.equal(shouldRegisterServiceWorker({ isNativePlatform: () => true }), false);
  assert.equal(shouldRegisterServiceWorker({ isNativePlatform: () => false }), true);
});

test('only the admin email opens the panel', () => {
  assert.equal(isAdmin('nukelauncher7@gmail.com'), true);
  assert.equal(isAdmin(' Nukelauncher7@gmail.com '), true);
  assert.equal(isAdmin('someone@example.com'), false);
  assert.equal(isAdmin(''), false);
});

test('a username is one claim, kept for its account, or held by the same device', () => {
  assert.equal(nameKey('  Alex '), 'alex');
  assert.equal(nameKey('Alex'), nameKey('ALEX'));
  assert.equal(nameKey(''), '');
  assert.equal(nameKey('/'), '');
  const device = { installId: 'device-a' };
  const other = { installId: 'device-b' };
  assert.equal(decideNameClaim(null, { uid: 'u1', device, name: 'Alex' }), 'create');
  assert.equal(decideNameClaim(null, { uid: null, device, name: 'Alex' }), 'create');
  assert.equal(decideNameClaim(null, { uid: null, device: null, name: 'Alex' }), 'taken');
  assert.equal(decideNameClaim({ uid: 'u1', device }, { uid: 'u1', device, name: 'Alex' }), 'refresh');
  assert.equal(decideNameClaim({ uid: 'u1', device }, { uid: 'u2', device: other, name: 'Alex' }), 'taken');
  assert.equal(decideNameClaim({ uid: null, device }, { uid: null, device, name: 'Alex' }), 'refresh');
  assert.equal(decideNameClaim({ uid: null, device }, { uid: 'u1', device, name: 'Alex' }), 'upgrade');
  assert.equal(decideNameClaim({ uid: null, device }, { uid: 'u1', device: other, name: 'Alex' }), 'taken');
  assert.equal(decideNameClaim({ uid: 'u1', device }, { uid: null, device, name: 'Alex' }), 'taken');
});
