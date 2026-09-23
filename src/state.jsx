import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TRIALS, CLASS_TRIALS } from './catalog.js';
import { exercisesFor, workoutPath } from './paths.js';
import { addFriend, cloudEnabled, loadBoard, loadFriend, pullBody, pushCloud, signIn, signOutAccount, signUp, watchAccount } from './cloud.js';
import { beep, buzz } from './audio.js';
import {
  afterAction,
  ascend,
  canAscend,
  noteRest,
  openRound,
  recordRound,
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
  newlyUnlockedTrials,
  normalizeChecks,
  parseProgress,
  prescription,
  rateCell,
  creditFor,
  pathChangeEntry,
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
import { get, set } from './storage.js';

const GameContext = createContext(null);

function loadStats() {
  const empty = freshState().stats;
  const saved = get(KEYS.stats, null);
  if (!saved) return empty;
  return {
    tier: { ...empty.tier, ...saved.tier },
    lifetime: { ...empty.lifetime, ...saved.lifetime },
    exerciseLifetime: saved.exerciseLifetime || {},
    daily: saved.daily || {},
  };
}

function loadState() {
  const base = freshState();
  const ramp = get(KEYS.ramp, base.ramp);
  return {
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
    path: workoutPath(get(KEYS.path, 'superhuman')).id,
    body: readBody(get(KEYS.body, null)),
    photoData: get(KEYS.photo, null),
    photoURL: get(KEYS.photoURL, '') || '',
    history: readHistory(get(KEYS.history, [])),
  };
}

function persist(state) {
  if (state.name) set(KEYS.name, state.name);
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
  set(KEYS.path, state.path || 'superhuman');
  set(KEYS.body, state.body);
  if (state.photoData) set(KEYS.photo, state.photoData);
  set(KEYS.photoURL, state.photoURL || '');
  set(KEYS.history, state.history || []);
}

export function GameProvider({ children }) {
  const [today, setToday] = useState(todayKey);
  const [state, setState] = useState(loadState);
  const [tab, setTabState] = useState('circuit');
  const [skillPath, setSkillPath] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [rest, setRest] = useState(null);
  const [restRound, setRestRound] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null);
  const [medalId, setMedalId] = useState(null);
  const [skillFlash, setSkillFlash] = useState(null);
  const [hot, setHot] = useState({});
  const [roundTimer, setRoundTimer] = useState(null);
  const [clock, setClock] = useState(0);
  const [ascendConfirm, setAscendConfirm] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [storeError, setStoreError] = useState('');
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState('');
  const [profileView, setProfileView] = useState('self');
  const [friend, setFriend] = useState(null);
  const [board, setBoard] = useState({ rows: [], activity: null });
  const [account, setAccount] = useState(null);
  const [cloudOn, setCloudOn] = useState(false);
  const [authError, setAuthError] = useState('');
  const boot = useRef(false);
  const prev = useRef(null);
  const stateRef = useRef(state);
  const timerRef = useRef(null);
  const restRef = useRef(null);
  stateRef.current = state;

  useEffect(() => {
    persist(state);
  }, [state]);

  useEffect(() => {
    let stop = () => {};
    cloudEnabled().then((on) => setCloudOn(on));
    stop = watchAccount((user) => setAccount(user));
    return () => stop();
  }, []);

  useEffect(() => {
    if (!account?.uid) return undefined;
    const handle = window.setTimeout(() => {
      pushCloud(account.uid, stateRef.current, levelInfo(stateRef.current.stats.tier, speedTier(stateRef.current.speed)), today).catch(() => {});
    }, 400);
    return () => window.clearTimeout(handle);
  }, [account, state, today]);

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
    if (!roundTimer) return undefined;
    const id = window.setInterval(() => setClock(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [roundTimer]);

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

  const api = {
    state,
    today,
    tab,
    setTab(id) {
      setTabState(id);
      if (id !== 'skills') setSkillPath(null);
      if (id !== 'profile') {
        setProfileView('self');
        setFriend(null);
      }
    },
    profileView,
    friend,
    board,
    account,
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
    clock,
    ascendConfirm,
    title: titleName(state.titleRank),
    weeklyCard: weeklyProgress(state),
    ascendReady: canAscend(state),
    openSettings() {
      setFormId(null);
      setSettingsOpen(true);
    },
    closeSettings() {
      setSettingsOpen(false);
      setPendingImport(null);
      setImportError('');
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
      if (timerRef.current) return;
      const round = openRound(normalizeChecks(stateRef.current.checks, today));
      if (round == null) return;
      const startedAt = Date.now();
      timerRef.current = { round, startedAt };
      setRoundTimer({ round, startedAt });
    },
    cancelTimer() {
      timerRef.current = null;
      setRoundTimer(null);
    },
    async saveName(raw) {
      const name = raw.trim();
      if (!name) return;
      setSavingName(true);
      setStoreError('');
      const publicIp = await lookupPublicIp();
      const device = {
        installId: crypto.randomUUID(),
        platform: navigator.platform || 'unknown',
        userAgent: navigator.userAgent,
        screen: { width: window.screen.width, height: window.screen.height },
        publicIp,
      };
      const nameOk = set(KEYS.name, name);
      const deviceOk = set(KEYS.device, device);
      if (!nameOk || !deviceOk) {
        setStoreError('This browser blocked local storage, so the sheet cannot be saved.');
        setSavingName(false);
        return;
      }
      setState((s) => ({ ...s, name, device }));
      setSavingName(false);
    },
    toggleCheck(round, index) {
      const current = stateRef.current;
      const view = normalizeChecks(current.checks, today);
      const key = cellKey(round, index);
      const was = Boolean(view.cells[key]);
      const exercise = exercisesFor(current.path)[index];
      if (!exercise) return;
      const scale = weekState(current.ramp, today).scale;
      const stored = current.difficulty?.targets?.[exercise.id];
      const override = difficultyStart(current.ramp) && today >= difficultyStart(current.ramp) && typeof stored === 'number' ? stored : undefined;
      const prescribed = prescription(exercise, current.progression, scale, override);
      const rx = { ...prescribed, credit: creditFor(prescribed.credit, exercise, current.path, current.body?.weightKg) };
      const timing = timerRef.current;
      const elapsed = timing ? Date.now() - timing.startedAt : 0;
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
      restRef.current = null;
      setRest(null);
      setRestRound(null);
      setState((s) => afterAction(resetRounds(s, today), today));
    },
    stopToday() {
      timerRef.current = null;
      setRoundTimer(null);
      restRef.current = null;
      setRest(null);
      setRestRound(null);
      setState((s) => afterAction(pauseSession(s, today), today));
    },
    resumeToday() {
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
      setState((s) => ({
        ...s,
        ...pendingImport,
        name: s.name,
        device: s.device,
      }));
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
    async openBoard() {
      setProfileView('board');
      if (!account?.uid) {
        setBoard({ rows: [], activity: null });
        return;
      }
      try {
        setBoard(await loadBoard(account.uid));
      } catch {
        setBoard({ rows: [], activity: null });
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
        setProfileView('board');
        setFriend(null);
        return;
      }
      setProfileView('self');
      setFriend(null);
    },
    openFriendHistory() {
      setProfileView('friend-history');
    },
    setPath(id) {
      setState((s) => {
        if (workoutPath(s.path).id === id) return s;
        const entry = pathChangeEntry(s, today, id);
        const history = [...(s.history || [])];
        const day = history.findIndex((row) => row.id === today);
        if (day >= 0) history[day] = { ...history[day], path: id, pathChange: entry.pathChange };
        else history.push(entry);
        return afterAction({ ...s, path: id, history }, today);
      });
    },
    setBody(next) {
      setState((s) => afterAction({ ...s, body: { heightCm: next.heightCm ?? null, weightKg: next.weightKg ?? null } }, today));
    },
    async setLocalPhoto(file) {
      const data = await resizePhoto(file);
      const saved = set(KEYS.photo, data);
      if (!saved) {
        setAuthError('This photo could not be stored on the device.');
        return;
      }
      setAuthError('');
      setState((s) => ({ ...s, photoData: data }));
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
  if (error?.message === 'offline') return 'Sign-in waits until Firebase is configured. Training still works.';
  return 'Sign-in did not finish.';
}

function blobToData(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function resizePhoto(file) {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 200 / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);
  img.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.6));
  return blobToData(blob);
}

export function useGame() {
  return useContext(GameContext);
}
