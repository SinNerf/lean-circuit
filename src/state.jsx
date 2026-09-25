import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TRIALS, CLASS_TRIALS } from './catalog.js';
import { exercisesFor, workoutPath } from './paths.js';
import { draftMatch, flameCrossed, sameScore, scoredMatch, shouldResolve } from './challenge.js';
import { addFriend, banChallenge, claimUsername, clearOwnHistory, cloudEnabled, createChallenge, ensureCode, finishChallenge, loadBoard, loadFriend, pullBody, pullProfile, pushChallengeScore, pushCloud, signIn, signInWithGoogleAccount, signOutAccount, signUp, watchAccount, watchChallenges } from './cloud.js';
import { isAdmin } from './admin.js';
import { isProfilePhoto } from './photo.js';
import { beep, buzz } from './audio.js';
import {
  afterAction,
  ascend,
  canAscend,
  currentStreak,
  noteRest,
  beginFocus,
  completeFocusStep,
  continueFocus,
  elapsedOf,
  freezeTiming,
  recordRound,
  resumeTiming,
  titleName,
  weeklyProgress,
} from './honors.js';
import {
  KEYS,
  STAT_IDS,
  adoptMove,
  applyCell,
  cellKey,
  difficultyStart,
  dismissMove,
  freshState,
  levelInfo,
  lookupPublicIp,
  nameKey,
  newlyUnlockedTrials,
  normalizeChecks,
  parseProgress,
  prescription,
  rateCell,
  creditFor,
  pathChangeEntry,
  quarterStats,
  scaleStats,
  settlePaths,
  readBody,
  readDifficulty,
  readHistory,
  recoveryDue,
  repeatWeek,
  pauseSession,
  resetRounds,
  resumeSession,
  revertMove,
  roundCount,
  serialize,
  skipWeek,
  speedTier,
  todayKey,
  visualTier,
  weekState,
} from './logic.js';
import { get, remove, set } from './storage.js';

const GameContext = createContext(null);

function loadStats() {
  const empty = freshState().stats;
  const saved = get(KEYS.stats, null);
  if (!saved) return empty;
  return {
    point: saved.point,
    tier: { ...empty.tier, ...saved.tier },
    lifetime: { ...empty.lifetime, ...saved.lifetime },
    exerciseLifetime: saved.exerciseLifetime || {},
    daily: saved.daily || {},
  };
}

function loadState() {
  const base = freshState();
  const ramp = get(KEYS.ramp, base.ramp);
  return settlePaths(quarterStats(scaleStats({
    ...base,
    name: get(KEYS.name, null),
    device: get(KEYS.device, null),
    checks: get(KEYS.checks, base.checks),
    stats: loadStats(),
    trials: get(KEYS.trials, {}),
    skills: get(KEYS.skills, {}),
    highestLevel: get(KEYS.highest, 0) || 0,
    seenUnlocks: get(KEYS.seen, []),
    ramp: {
      enabled: ramp.enabled !== false,
      firstDate: ramp.firstDate || null,
      anchorDate: ramp.anchorDate || null,
      baseWeek: ramp.baseWeek || 1,
      offSince: ramp.offSince || null,
    },
    progression: get(KEYS.progression, base.progression),
    completedDays: get(KEYS.completed, []),
    recoveryDismissed: get(KEYS.recovery, null),
    speed: get(KEYS.speed, base.speed) || base.speed,
    roundTimes: get(KEYS.rounds, []),
    titleRank: get(KEYS.title, 0) || 0,
    badges: get(KEYS.badges, {}),
    weeklyBadges: get(KEYS.weeklyBadges, []),
    trainingDays: get(KEYS.training, []),
    volumeByDay: get(KEYS.volume, {}),
    seenExercises: get(KEYS.seenExercises, {}),
    weekly: get(KEYS.weekly, null),
    ascend: get(KEYS.ascend, base.ascend) || base.ascend,
    difficulty: readDifficulty(get(KEYS.difficulty, base.difficulty)),
    path: workoutPath(get(KEYS.path, 'starter')).id,
    pathsUnlocked: Boolean(get(KEYS.pathsOpen, false)),
    pathsUnlockSeen: Boolean(get(KEYS.pathsSeen, false)),
    body: readBody(get(KEYS.body, null)),
    photoData: get(KEYS.photo, null),
    photoURL: get(KEYS.photoURL, '') || '',
    history: readHistory(get(KEYS.history, [])),
    featuredBadge: get(KEYS.featured, '') || '',
    accountUid: get(KEYS.account, null) || null,
  })));
}

function persist(state) {
  if (state.name) set(KEYS.name, state.name);
  else remove(KEYS.name);
  if (state.device) set(KEYS.device, state.device);
  set(KEYS.checks, state.checks);
  set(KEYS.stats, state.stats);
  set(KEYS.trials, state.trials);
  set(KEYS.skills, state.skills);
  set(KEYS.highest, state.highestLevel);
  set(KEYS.seen, state.seenUnlocks);
  set(KEYS.ramp, state.ramp);
  set(KEYS.progression, state.progression);
  set(KEYS.completed, state.completedDays);
  set(KEYS.recovery, state.recoveryDismissed);
  set(KEYS.speed, state.speed);
  set(KEYS.rounds, state.roundTimes);
  set(KEYS.title, state.titleRank);
  set(KEYS.badges, state.badges);
  set(KEYS.weeklyBadges, state.weeklyBadges);
  set(KEYS.training, state.trainingDays);
  set(KEYS.volume, state.volumeByDay);
  set(KEYS.seenExercises, state.seenExercises);
  set(KEYS.weekly, state.weekly);
  set(KEYS.ascend, state.ascend);
  set(KEYS.difficulty, state.difficulty);
  set(KEYS.path, state.path || 'starter');
  set(KEYS.pathsOpen, Boolean(state.pathsUnlocked));
  set(KEYS.pathsSeen, Boolean(state.pathsUnlockSeen));
  set(KEYS.body, state.body);
  if (state.photoData) set(KEYS.photo, state.photoData);
  else remove(KEYS.photo);
  set(KEYS.photoURL, state.photoURL || '');
  set(KEYS.history, state.history || []);
  set(KEYS.featured, state.featuredBadge || '');
  if (state.accountUid) set(KEYS.account, state.accountUid);
  else remove(KEYS.account);
}

export function GameProvider({ children }) {
  const [today, setToday] = useState(todayKey);
  const [state, setState] = useState(loadState);
  const [tab, setTabState] = useState('circuit');
  const [skillPath, setSkillPath] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [rest, setRest] = useState(null);
  const [restRound, setRestRound] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null);
  const [medalId, setMedalId] = useState(null);
  const [skillFlash, setSkillFlash] = useState(null);
  const [hot, setHot] = useState({});
  const [roundTimer, setRoundTimer] = useState(null);
  const [focus, setFocus] = useState(null);
  const [clock, setClock] = useState(0);
  const [ascendConfirm, setAscendConfirm] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [storeError, setStoreError] = useState('');
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState('');
  const [profileView, setProfileView] = useState('self');
  const [friend, setFriend] = useState(null);
  const [board, setBoard] = useState({ rows: [] });
  const [challenges, setChallenges] = useState([]);
  const [challengeWith, setChallengeWith] = useState(null);
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [challengeError, setChallengeError] = useState('');
  const [flamePulse, setFlamePulse] = useState(false);
  const [badgePulse, setBadgePulse] = useState('');
  const [pathUnlock, setPathUnlock] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [account, setAccount] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [resolvedUid, setResolvedUid] = useState(null);
  const [cloudOn, setCloudOn] = useState(false);
  const [authError, setAuthError] = useState('');
  const boot = useRef(false);
  const prev = useRef(null);
  const streakPrev = useRef(null);
  const seenDone = useRef(null);
  const pathNoted = useRef(false);
  const badgePrev = useRef(null);
  const stateRef = useRef(state);
  const timerRef = useRef(null);
  const restRef = useRef(null);
  const focusRef = useRef(null);
  const nameKept = useRef(false);
  focusRef.current = focus;
  stateRef.current = state;

  useEffect(() => {
    persist(state);
  }, [state]);

  useEffect(() => {
    let stop = () => {};
    cloudEnabled().then((on) => setCloudOn(on));
    stop = watchAccount((user) => {
      setAccount(user);
      setAuthReady(true);
      if (!user) setResolvedUid(null);
    });
    return () => stop();
  }, []);

  useEffect(() => {
    if (!account?.uid) return undefined;
    let dead = false;
    const uid = account.uid;
    pullProfile(uid)
      .then((card) => {
        if (dead) return;
        const before = stateRef.current;
        const remoteName = (card?.name || '').trim();
        nameKept.current = Boolean(remoteName) || (before.accountUid === uid && Boolean(before.name));
        setState((s) => applyAccountProfile(s, uid, card));
        setResolvedUid(uid);
      })
      .catch(() => {
        if (dead) return;
        const before = stateRef.current;
        nameKept.current = before.accountUid === uid && Boolean(before.name);
        setState((s) => applyAccountProfile(s, uid, null));
        setResolvedUid(uid);
      });
    return () => {
      dead = true;
    };
  }, [account]);

  useEffect(() => {
    if (!account?.uid || resolvedUid !== account.uid) return undefined;
    ensureCode(account.uid).catch(() => {});
    return undefined;
  }, [account, resolvedUid]);

  useEffect(() => {
    if (!account?.uid || resolvedUid !== account.uid) return undefined;
    const live = stateRef.current;
    if (!live.name || live.accountUid !== account.uid) return undefined;
    let dead = false;
    claimUsername({ uid: account.uid, name: live.name, device: live.device, keep: nameKept.current }).then((result) => {
      if (dead || result !== 'taken' || nameKept.current) return;
      setStoreError('That username is taken.');
      setState((s) => ({ ...s, name: null }));
    });
    return () => {
      dead = true;
    };
  }, [account, resolvedUid, state.name, state.accountUid]);

  useEffect(() => {
    if (!account?.uid || resolvedUid !== account.uid) return undefined;
    const uid = account.uid;
    const handle = window.setTimeout(() => {
      pushCloud(uid, stateRef.current, levelInfo(stateRef.current.stats.tier, speedTier(stateRef.current.speed)), today).catch(() => {});
    }, 400);
    return () => window.clearTimeout(handle);
  }, [account, resolvedUid, state, today]);

  useEffect(() => {
    if (!account?.uid) return undefined;
    return watchChallenges(account.uid, setChallenges);
  }, [account]);

  useEffect(() => {
    const streakNow = currentStreak(state.trainingDays, today);
    if (streakPrev.current == null) {
      streakPrev.current = streakNow;
      return undefined;
    }
    const previous = streakPrev.current;
    streakPrev.current = streakNow;
    if (!flameCrossed(previous, streakNow)) return undefined;
    setFlamePulse(true);
    const id = window.setTimeout(() => setFlamePulse(false), 700);
    return () => window.clearTimeout(id);
  }, [state.trainingDays, today]);

  useEffect(() => {
    const ids = Object.keys(state.badges || {});
    if (badgePrev.current == null) {
      badgePrev.current = new Set(ids);
      return undefined;
    }
    const fresh = ids.filter((id) => !badgePrev.current.has(id));
    badgePrev.current = new Set(ids);
    if (!fresh.length) return undefined;
    setBadgePulse(fresh[0]);
    const id = window.setTimeout(() => setBadgePulse(''), 700);
    return () => window.clearTimeout(id);
  }, [state.badges]);

  useEffect(() => {
    if (!account?.uid) return undefined;
    if (!seenDone.current) {
      seenDone.current = new Set(challenges.filter((row) => row.status === 'done').map((row) => row.id));
      return undefined;
    }
    for (const row of challenges) {
      if (row.status !== 'done' || seenDone.current.has(row.id)) continue;
      seenDone.current.add(row.id);
      if (row.winner && row.winner === account.uid) {
        const name = row.winner === row.from ? row.fromName : row.toName;
        setCelebration(name || 'Won');
        const id = window.setTimeout(() => setCelebration(null), 900);
        return () => window.clearTimeout(id);
      }
    }
    return undefined;
  }, [challenges, account]);

  useEffect(() => {
    if (!account?.uid) return undefined;
    let dead = false;
    const uid = account.uid;
    for (const challenge of challenges) {
      if (challenge.status !== 'live') continue;
      if (challenge.from !== uid && challenge.to !== uid) continue;
      const remote = challenge.scores?.[uid] || { done: [], credit: 0 };
      const next = scoredMatch(stateRef.current, today, challenge.match, remote.done);
      if (!sameScore(remote, next)) {
        pushChallengeScore(challenge.id, uid, next).catch(() => {});
      }
      const merged = { ...challenge, scores: { ...(challenge.scores || {}), [uid]: next } };
      if (!dead && shouldResolve(merged, today)) finishChallenge(challenge.id, today).catch(() => {});
    }
    return () => {
      dead = true;
    };
  }, [account, challenges, state.checks, state.path, state.body, today]);

  useEffect(() => {
    if (!account?.uid) return undefined;
    pullBody(account.uid)
      .then((remote) => {
        if (!remote) return;
        setState((s) => {
          const local = s.body || {};
          if (local.heightCm || local.weightKg) return s;
          return { ...s, body: readBody(remote) };
        });
      })
      .catch(() => {});
    return undefined;
  }, [account]);

  useEffect(() => {
    const tick = () => setToday(todayKey());
    document.addEventListener('visibilitychange', tick);
    const id = window.setInterval(tick, 60000);
    return () => {
      document.removeEventListener('visibilitychange', tick);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    setState((s) => afterAction(s, today));
  }, [today]);

  useEffect(() => {
    if (!roundTimer || roundTimer.frozen) return undefined;
    setClock(Date.now());
    const id = window.setInterval(() => setClock(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [roundTimer]);

  useEffect(() => {
    const paused = Boolean(normalizeChecks(state.checks, today).paused);
    if (!focus || paused) return undefined;
    if (focus.phase !== 'prep' && focus.phase !== 'rest' && focus.phase !== 'flash') return undefined;
    if (focus.seconds == null || focus.seconds <= 0) return undefined;
    const id = window.setTimeout(() => {
      const current = focusRef.current;
      if (!current || current.phase !== focus.phase || current.seconds !== focus.seconds) return;
      if (current.seconds > 1) {
        const next = { ...current, seconds: current.seconds - 1 };
        focusRef.current = next;
        setFocus(next);
        return;
      }
      if (current.phase === 'rest' && current.restSpan === 20 && current.restKey) {
        const key = current.restKey;
        setState((s) => {
          const nextChecks = noteRest(normalizeChecks(s.checks, today), key, 'expire');
          return afterAction({ ...s, checks: nextChecks }, today);
        });
      }
      if ((current.phase === 'prep' || current.phase === 'rest') && !timerRef.current) {
        const startedAt = Date.now();
        const timing = { round: current.round, startedAt, elapsed: 0, frozen: false };
        timerRef.current = timing;
        setClock(startedAt);
        setRoundTimer(timing);
      }
      if (current.phase === 'prep' || current.phase === 'rest') {
        beep();
        buzz();
      }
      const next = current.phase === 'flash'
        ? { ...current, phase: 'choice', seconds: null }
        : { ...current, phase: 'work', seconds: null, restKey: null, restSpan: null };
      focusRef.current = next;
      setFocus(next);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [focus, state.checks, today]);

  useEffect(() => {
    if (rest == null) return undefined;
    if (rest <= 0) {
      const meta = restRef.current;
      if (meta?.seconds === 20) {
        const key = meta.key;
        setState((s) => {
          const checks = noteRest(normalizeChecks(s.checks, today), key, 'expire');
          return afterAction({ ...s, checks }, today);
        });
      }
      restRef.current = null;
      beep();
      buzz();
      setRest(null);
      setRestRound(null);
      return undefined;
    }
    const id = window.setTimeout(() => setRest((n) => (n == null ? null : n - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [rest, today]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const id = window.setTimeout(() => setToasts((q) => q.slice(1)), 3200);
    return () => window.clearTimeout(id);
  }, [toasts]);

  const pace = speedTier(state.speed);
  const sheet = useMemo(() => levelInfo(state.stats.tier, pace), [state.stats, pace]);
  const week = useMemo(() => weekState(state.ramp, today), [state.ramp, today]);
  const checks = useMemo(() => normalizeChecks(state.checks, today), [state.checks, today]);
  const recovery = recoveryDue(state.completedDays, today, state.recoveryDismissed);
  const difficultyOn = (() => {
    const start = difficultyStart(state.ramp);
    return Boolean(start && today >= start);
  })();

  useEffect(() => {
    if (!state.name) return;
    if (!boot.current) {
      boot.current = true;
      prev.current = { tier: { ...state.stats.tier }, skills: { ...state.skills }, speed: speedTier(state.speed) };
      return;
    }
    const before = prev.current;
    prev.current = { tier: { ...state.stats.tier }, skills: { ...state.skills }, speed: speedTier(state.speed) };
    if (!before) return;
    const visual = levelInfo(state.stats.tier, speedTier(state.speed));
    if (visual.level > stateRef.current.highestLevel) {
      setLevelUp(visual.level);
      setState((s) => ({ ...s, highestLevel: visual.level }));
    }
    const opened = newlyUnlockedTrials(before.tier, state.stats.tier, before.skills, state.skills, [
      ...TRIALS,
      ...CLASS_TRIALS,
    ]).filter((id) => !stateRef.current.seenUnlocks.includes(id));
    if (opened.length) {
      setToasts((q) => [...q, ...opened]);
      setState((s) => ({ ...s, seenUnlocks: [...new Set([...s.seenUnlocks, ...opened])] }));
    }
    const nextHot = {};
    for (const id of STAT_IDS) {
      if (visualTier(state.stats.tier[id]) > visualTier(before.tier[id] || 0)) nextHot[id] = true;
    }
    if (speedTier(state.speed) > (before.speed || 0)) nextHot.speed = true;
    if (Object.keys(nextHot).length) {
      setHot(nextHot);
      window.setTimeout(() => setHot({}), 900);
    }
  }, [state.stats, state.skills, state.speed, state.name]);

  function prescribedRx(current, exercise) {
    const scale = weekState(current.ramp, today).scale;
    const stored = current.difficulty?.targets?.[exercise.id];
    const override = difficultyStart(current.ramp) && today >= difficultyStart(current.ramp) && typeof stored === 'number' ? stored : undefined;
    const prescribed = prescription(exercise, current.progression, scale, override);
    return { ...prescribed, credit: creditFor(prescribed.credit, exercise, current.path, current.body?.weightKg) };
  }

  function armClock(round) {
    if (timerRef.current) return;
    const startedAt = Date.now();
    const timing = { round, startedAt, elapsed: 0, frozen: false };
    timerRef.current = timing;
    setClock(startedAt);
    setRoundTimer(timing);
  }

  const api = {
    state,
    today,
    tab,
    setTab(id) {
      setTabState(id);
      setAdminOpen(false);
      setSkillPath(null);
      setProfileView('self');
      setFriend(null);
      setChallengeWith(null);
      if (id === 'leaderboard') {
        setChallengeError('');
        if (!account?.uid) {
          setBoard({ rows: [] });
          return;
        }
        ensureCode(account.uid)
          .then(() => loadBoard(account.uid))
          .then((next) => setBoard(next))
          .catch(() => setBoard({ rows: [] }));
      }
    },
    profileView,
    friend,
    board,
    challenges,
    challengeWith,
    challengeBusy,
    challengeError,
    flamePulse,
    badgePulse,
    pathUnlock,
    celebration,
    account,
    authReady,
    profileReady: !account || resolvedUid === account.uid,
    cloudOn,
    authError,
    skillPath,
    openPath(id) {
      setSkillPath(id);
    },
    closePath() {
      setSkillPath(null);
    },
    settingsOpen,
    adminOpen,
    admin: isAdmin(account?.email),
    formId,
    rest,
    restRound,
    toasts,
    levelUp,
    medalId,
    skillFlash,
    hot,
    savingName,
    storeError,
    pendingImport,
    importError,
    sheet,
    week,
    checks,
    recovery,
    difficultyOn,
    pace,
    roundTimer,
    focus,
    clock,
    ascendConfirm,
    title: titleName(state.titleRank),
    weeklyCard: weeklyProgress(state),
    ascendReady: canAscend(state),
    openSettings() {
      setFormId(null);
      setAdminOpen(false);
      setSettingsOpen(true);
    },
    closeSettings() {
      setSettingsOpen(false);
      setPendingImport(null);
      setImportError('');
    },
    openAdmin() {
      if (!isAdmin(account?.email)) return;
      setFormId(null);
      setSettingsOpen(false);
      setAdminOpen(true);
    },
    closeAdmin() {
      setAdminOpen(false);
    },
    async resetOwnProgress() {
      if (!isAdmin(account?.email)) return;
      const current = stateRef.current;
      const kept = { name: current.name, device: current.device, accountUid: current.accountUid };
      timerRef.current = null;
      setRoundTimer(null);
      focusRef.current = null;
      setFocus(null);
      restRef.current = null;
      setRest(null);
      setRestRound(null);
      setAdminOpen(false);
      setSettingsOpen(false);
      setProfileView('self');
      setTabState('circuit');
      setState(() => settlePaths({ ...freshState(), ...kept }));
      if (account?.uid) await clearOwnHistory(account.uid);
    },
    openForm(id) {
      setSettingsOpen(false);
      setFormId(id);
    },
    closeForm() {
      setFormId(null);
    },
    dismissLevel() {
      setLevelUp(null);
    },
    skipRest() {
      const meta = restRef.current;
      if (meta?.seconds === 20) {
        const key = meta.key;
        setState((s) => {
          const checks = noteRest(normalizeChecks(s.checks, today), key, 'skip');
          return afterAction({ ...s, checks }, today);
        });
      }
      restRef.current = null;
      setRest(null);
      setRestRound(null);
    },
    startTimer() {
      if (focusRef.current) return;
      const view = normalizeChecks(stateRef.current.checks, today);
      if (view.paused) return;
      const next = beginFocus(view);
      if (!next) return;
      timerRef.current = null;
      setRoundTimer(null);
      restRef.current = null;
      setRest(null);
      setRestRound(null);
      focusRef.current = next;
      setFocus(next);
    },
    finishSet() {
      const live = focusRef.current;
      if (!live || live.phase !== 'work') return;
      const current = stateRef.current;
      const view = normalizeChecks(current.checks, today);
      if (view.paused) return;
      const key = cellKey(live.round, live.index);
      if (view.cells[key]) return;
      const exercise = exercisesFor(current.path)[live.index];
      if (!exercise) return;
      const rx = prescribedRx(current, exercise);
      const elapsed = elapsedOf(timerRef.current, Date.now());
      const step = completeFocusStep(live, elapsed);
      if (step.record) {
        timerRef.current = null;
        setRoundTimer(null);
      }
      setState((s) => {
        let next = applyCell(s, live.round, live.index, exercise, rx, today);
        if (step.record) next = recordRound(next, step.ms, today);
        return afterAction(next, today);
      });
      focusRef.current = step.focus;
      setFocus(step.focus);
    },
    skipFocusRest() {
      const live = focusRef.current;
      if (!live || live.phase !== 'rest') return;
      if (normalizeChecks(stateRef.current.checks, today).paused) return;
      if (live.restSpan === 20 && live.restKey) {
        const key = live.restKey;
        setState((s) => {
          const nextChecks = noteRest(normalizeChecks(s.checks, today), key, 'skip');
          return afterAction({ ...s, checks: nextChecks }, today);
        });
      }
      armClock(live.round);
      const next = { ...live, phase: 'work', seconds: null, restKey: null, restSpan: null };
      focusRef.current = next;
      setFocus(next);
    },
    continueRound() {
      const live = focusRef.current;
      const view = normalizeChecks(stateRef.current.checks, today);
      const next = continueFocus(live, view);
      if (!next) return;
      timerRef.current = null;
      setRoundTimer(null);
      focusRef.current = next;
      setFocus(next);
    },
    leaveRound() {
      timerRef.current = null;
      setRoundTimer(null);
      focusRef.current = null;
      setFocus(null);
    },
    cancelTimer() {
      timerRef.current = null;
      setRoundTimer(null);
    },
    async saveName(raw) {
      const name = raw.trim().replace(/\s+/g, ' ');
      if (!nameKey(name)) return;
      setSavingName(true);
      setStoreError('');
      const publicIp = await lookupPublicIp();
      const previous = stateRef.current.device;
      const device = {
        installId: previous?.installId || crypto.randomUUID(),
        platform: navigator.platform || 'unknown',
        userAgent: navigator.userAgent,
        screen: { width: window.screen.width, height: window.screen.height },
        publicIp,
      };
      const uid = account?.uid || null;
      if (uid) {
        const result = await claimUsername({ uid, name, device, keep: false });
        if (result === 'taken') {
          setStoreError('That username is taken.');
          setSavingName(false);
          return;
        }
        if (result === 'error') {
          setStoreError('The username could not be saved.');
          setSavingName(false);
          return;
        }
        if (result === 'ok' || result === 'kept') nameKept.current = true;
      }
      const nameOk = set(KEYS.name, name);
      const deviceOk = set(KEYS.device, device);
      if (!nameOk || !deviceOk) {
        setStoreError('This browser blocked local storage, so the sheet cannot be saved.');
        setSavingName(false);
        return;
      }
      setState((s) => ({ ...s, name, device, accountUid: uid || s.accountUid }));
      setSavingName(false);
    },
    toggleCheck(round, index) {
      const current = stateRef.current;
      const view = normalizeChecks(current.checks, today);
      const key = cellKey(round, index);
      const was = Boolean(view.cells[key]);
      const exercise = exercisesFor(current.path)[index];
      if (!exercise) return;
      const rx = prescribedRx(current, exercise);
      const timing = timerRef.current;
      const elapsed = elapsedOf(timing, Date.now());
      setState((s) => {
        let next = applyCell(s, round, index, exercise, rx, today);
        if (was) next = { ...next, checks: noteRest(next.checks, key, 'clear') };
        if (!was && timing && timing.round === round && roundCount(next.checks, round) === 8) {
          next = recordRound(next, elapsed, today);
          timerRef.current = null;
          setRoundTimer(null);
        }
        return afterAction(next, today);
      });
      if (!was) {
        const seconds = index === 7 ? 90 : 20;
        restRef.current = { key, seconds };
        setRest(seconds);
        setRestRound(index === 7 ? round : null);
      } else if (restRef.current?.key === key) {
        restRef.current = null;
        setRest(null);
        setRestRound(null);
      }
    },
    resetRounds() {
      timerRef.current = null;
      setRoundTimer(null);
      focusRef.current = null;
      setFocus(null);
      restRef.current = null;
      setRest(null);
      setRestRound(null);
      setState((s) => afterAction(resetRounds(s, today), today));
    },
    stopToday() {
      const frozen = freezeTiming(timerRef.current, Date.now());
      timerRef.current = frozen;
      setRoundTimer(frozen);
      restRef.current = null;
      setRest(null);
      setRestRound(null);
      setState((s) => afterAction(pauseSession(s, today), today));
    },
    resumeToday() {
      const thawed = resumeTiming(timerRef.current, Date.now());
      timerRef.current = thawed;
      if (thawed) {
        setClock(Date.now());
        setRoundTimer(thawed);
      }
      restRef.current = null;
      setRest(null);
      setRestRound(null);
      setState((s) => afterAction(resumeSession(s, today), today));
    },
    passTrial(id) {
      if (stateRef.current.trials[id]) return;
      setState((s) => ({ ...s, trials: { ...s.trials, [id]: today } }));
      setMedalId(id);
      window.setTimeout(() => setMedalId(null), 900);
    },
    confirmSkill(id) {
      if (stateRef.current.skills[id]) return;
      setState((s) => ({ ...s, skills: { ...s.skills, [id]: today } }));
      setSkillFlash(id);
      window.setTimeout(() => setSkillFlash(null), 900);
    },
    rateSet(round, index, kind) {
      setState((s) => afterAction(rateCell(s, round, index, kind, today), today));
    },
    setRampEnabled(enabled) {
      setState((s) => {
        const ramp = { ...s.ramp, enabled };
        if (enabled) ramp.offSince = null;
        else if (!ramp.offSince) ramp.offSince = today;
        return afterAction({ ...s, ramp }, today);
      });
    },
    repeatWeek() {
      setState((s) => ({ ...s, ramp: repeatWeek(s.ramp, today) }));
    },
    skipWeek() {
      setState((s) => ({ ...s, ramp: skipWeek(s.ramp, today) }));
    },
    dismissSuggestion(id) {
      setState((s) => ({ ...s, progression: dismissMove(s.progression, id) }));
    },
    adopt(id) {
      setState((s) => ({ ...s, progression: adoptMove(s.progression, id) }));
    },
    revert(id) {
      setState((s) => ({ ...s, progression: revertMove(s.progression, id) }));
    },
    dismissRecovery() {
      setState((s) => ({ ...s, recoveryDismissed: today }));
    },
    askAscend() {
      if (!canAscend(stateRef.current)) return;
      setAscendConfirm(true);
    },
    cancelAscend() {
      setAscendConfirm(false);
    },
    confirmAscend() {
      setAscendConfirm(false);
      setState((s) => afterAction(ascend(s), today));
    },
    exportProgress() {
      const blob = new Blob([JSON.stringify(serialize(stateRef.current), null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lean-circuit-progress.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    stageImport(text) {
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setImportError('That file is not a Lean Circuit progress file.');
        setPendingImport(null);
        return;
      }
      const parsed = parseProgress(data);
      if (!parsed) {
        setImportError('That file is not a Lean Circuit progress file.');
        setPendingImport(null);
        return;
      }
      setImportError('');
      setPendingImport(parsed);
    },
    confirmImport() {
      if (!pendingImport) return;
      boot.current = true;
      prev.current = {
        tier: { ...pendingImport.stats.tier },
        skills: { ...pendingImport.skills },
        speed: speedTier(pendingImport.speed),
      };
      setState((s) => settlePaths(quarterStats(scaleStats({
        ...s,
        ...pendingImport,
        name: s.name,
        device: s.device,
        photoData: s.photoData,
        accountUid: s.accountUid,
      }))));
      setPendingImport(null);
      setLevelUp(null);
      setToasts([]);
    },
    cancelImport() {
      setPendingImport(null);
    },
    openEdit() {
      setAuthError('');
      setProfileView('edit');
    },
    openHistory() {
      setProfileView('history');
    },
    openSkills() {
      setProfileView('skills');
    },
    async openBoard() {
      setChallengeError('');
      setTabState('leaderboard');
      setProfileView('self');
      setFriend(null);
      setChallengeWith(null);
      if (!account?.uid) {
        setBoard({ rows: [] });
        return;
      }
      try {
        await ensureCode(account.uid);
        setBoard(await loadBoard(account.uid));
      } catch {
        setBoard({ rows: [] });
      }
    },
    async openFriend(uid) {
      setProfileView('friend');
      setFriend(null);
      try {
        setFriend(await loadFriend(uid));
      } catch {
        setFriend(null);
      }
    },
    closeProfilePane() {
      if (profileView === 'friend-history') {
        setProfileView('friend');
        return;
      }
      if (profileView === 'friend') {
        setProfileView('self');
        setFriend(null);
        return;
      }
      if (profileView === 'challenge') {
        setProfileView('self');
        setChallengeWith(null);
        setChallengeError('');
        return;
      }
      setProfileView('self');
      setFriend(null);
      setChallengeWith(null);
    },
    openChallenge(row) {
      if (!row?.uid || row.uid === account?.uid) return;
      setChallengeError('');
      setChallengeWith(row);
      setProfileView('challenge');
    },
    async confirmDraft(picked) {
      const friendRow = challengeWith;
      const drafted = draftMatch(exercisesFor(stateRef.current.path), picked);
      if (!drafted || !account?.uid || !friendRow?.uid) return;
      setChallengeBusy(true);
      setChallengeError('');
      try {
        await createChallenge({
          from: account.uid,
          to: friendRow.uid,
          fromName: stateRef.current.name || '',
          toName: friendRow.name || '',
          path: workoutPath(stateRef.current.path).id,
          drafted,
          banned: null,
          match: [],
          status: 'ban',
          day: today,
          created: Date.now(),
          scores: {
            [account.uid]: { done: [], credit: 0 },
            [friendRow.uid]: { done: [], credit: 0 },
          },
          winner: null,
        });
      } catch {
        setChallengeError('The challenge did not send.');
      }
      setChallengeBusy(false);
    },
    async confirmBan(challenge, banned) {
      if (!challenge?.id) return;
      setChallengeBusy(true);
      setChallengeError('');
      try {
        await banChallenge(challenge.id, challenge.drafted, banned);
      } catch {
        setChallengeError('The ban did not send.');
      }
      setChallengeBusy(false);
    },
    async toggleChallenge(challenge, exerciseId) {
      if (!account?.uid || !challenge?.id || challenge.status === 'done') return;
      const remote = challenge.scores?.[account.uid] || { done: [], credit: 0 };
      const marks = new Set(remote.done || []);
      if (marks.has(exerciseId)) marks.delete(exerciseId);
      else marks.add(exerciseId);
      const next = scoredMatch(stateRef.current, today, challenge.match, [...marks]);
      try {
        await pushChallengeScore(challenge.id, account.uid, next);
        const merged = { ...challenge, scores: { ...(challenge.scores || {}), [account.uid]: next } };
        if (shouldResolve(merged, today)) await finishChallenge(challenge.id, today);
      } catch {
        setChallengeError('The match did not update.');
      }
    },
    openFriendHistory() {
      setProfileView('friend-history');
    },
    setPath(id) {
      setState((s) => {
        if (!s.pathsUnlocked && id !== 'starter') return s;
        if (workoutPath(s.path).id === id) return s;
        const entry = pathChangeEntry(s, today, id);
        const history = [...(s.history || [])];
        const day = history.findIndex((row) => row.id === today);
        if (day >= 0) history[day] = { ...history[day], path: id, pathChange: entry.pathChange };
        else history.push(entry);
        return afterAction({ ...s, path: id, history }, today);
      });
    },
    notePathUnlock() {
      if (pathNoted.current) return;
      pathNoted.current = true;
      setPathUnlock(true);
      setState((s) => (s.pathsUnlockSeen ? s : { ...s, pathsUnlockSeen: true }));
      window.setTimeout(() => setPathUnlock(false), 900);
    },
    setBody(next) {
      setState((s) => afterAction({ ...s, body: { heightCm: next.heightCm ?? null, weightKg: next.weightKg ?? null } }, today));
    },
    setProfilePhoto(dataUrl) {
      if (!isProfilePhoto(dataUrl)) return 'large';
      const saved = set(KEYS.photo, dataUrl);
      if (!saved) return 'device';
      setAuthError('');
      setState((s) => ({ ...s, photoData: dataUrl }));
      return 'ok';
    },
    setFeatured(id) {
      setState((s) => {
        const core = Boolean(s.badges?.[id]);
        const weekly = (s.weeklyBadges || []).some((badge) => badge.id === id);
        if (!core && !weekly) return s;
        return { ...s, featuredBadge: id };
      });
    },
    async createAccount(email, password) {
      setAuthError('');
      try {
        await signUp(email, password);
      } catch (error) {
        setAuthError(authMessage(error));
      }
    },
    async enterAccount(email, password) {
      setAuthError('');
      try {
        await signIn(email, password);
      } catch (error) {
        setAuthError(authMessage(error));
      }
    },
    async enterWithGoogle() {
      setAuthError('');
      try {
        await signInWithGoogleAccount();
      } catch (error) {
        setAuthError(authMessage(error));
      }
    },
    async leaveAccount() {
      setAuthError('');
      await signOutAccount();
    },
    async saveFriend(code) {
      if (!account?.uid) {
        setAuthError('Sign in before adding a friend.');
        return;
      }
      const friendId = code.trim();
      if (!friendId || friendId === account.uid) return;
      try {
        await addFriend(account.uid, friendId);
        setBoard(await loadBoard(account.uid));
        setAuthError('');
      } catch {
        setAuthError('That code is not on the board.');
      }
    },
  };

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

function authMessage(error) {
  const code = error?.code || '';
  if (code === 'auth/email-already-in-use') return 'That email already has an account.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Email or password did not match.';
  if (code === 'auth/invalid-email') return 'Enter an email address.';
  if (code === 'auth/weak-password') return 'Use at least 6 characters.';
  if (code === 'auth/account-exists-with-different-credential') return 'That email already has an account.';
  if (code === 'auth/unauthorized-domain') return 'This browser is not an authorized domain.';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || /cancel/i.test(code) || /cancel/i.test(error?.message || '')) return 'Google sign-in was canceled.';
  if (error?.message === 'offline') return 'Sign-in is not available in this build.';
  if (error?.message === 'google') return 'Google sign-in did not finish.';
  return 'Sign-in did not finish.';
}

function applyAccountProfile(s, uid, card) {
  const remoteName = (card?.name || '').trim();
  const same = !s.accountUid || s.accountUid === uid;
  const name = remoteName ? remoteName : s.name && same ? s.name : null;
  const photo = isProfilePhoto(card?.photo) ? card.photo : same ? s.photoData : null;
  const featured = (card?.featuredBadge || (same ? s.featuredBadge : '')) || '';
  let path = card?.path ? workoutPath(card.path).id : s.path;
  if (!s.pathsUnlocked) path = 'starter';
  return {
    ...s,
    name,
    accountUid: uid,
    photoData: photo || null,
    featuredBadge: featured,
    path,
  };
}

export function useGame() {
  return useContext(GameContext);
}
