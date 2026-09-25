import { Capacitor } from '@capacitor/core';
import firebaseConfig from 'virtual:firebase-config';
import { banOne, friendCode, shouldResolve, winnerOf } from './challenge.js';
import { decideNameClaim, nameKey, statCredit, statVisualTier } from './logic.js';
import { titleName } from './honors.js';
import { currentStreak, longestStreak } from './honors.js';
import { publicHistory } from './logic.js';
import { profilePhoto } from './photo.js';
import { workoutPath } from './paths.js';

let auth = null;
let db = null;
let boot = null;

const CHALLENGE_KEY = 'lean-circuit-challenges';
const CHALLENGE_LOCAL = 'lean-circuit-challenge-local';

export async function cloudEnabled() {
  if (!boot) {
    boot = (async () => {
      const config = firebaseConfig;
      if (!config?.apiKey || !config?.projectId || !config?.appId) return false;
      try {
        const { initializeApp } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        const { initializeFirestore, persistentLocalCache } = await import('firebase/firestore');
        const app = initializeApp(config);
        auth = getAuth(app);
        db = initializeFirestore(app, { localCache: persistentLocalCache() });
        return true;
      } catch {
        return false;
      }
    })();
  }
  return boot;
}

export function watchAccount(onChange) {
  let stop = () => {};
  let dead = false;
  cloudEnabled().then(async (on) => {
    if (dead || !on || !auth) {
      onChange(null);
      return;
    }
    const { onAuthStateChanged } = await import('firebase/auth');
    stop = onAuthStateChanged(auth, (user) => {
      onChange(user ? { uid: user.uid, email: user.email || '' } : null);
    });
  });
  return () => {
    dead = true;
    stop();
  };
}

export async function signUp(email, password) {
  const on = await cloudEnabled();
  if (!on || !auth) throw new Error('offline');
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  await createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function signIn(email, password) {
  const on = await cloudEnabled();
  if (!on || !auth) throw new Error('offline');
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithGoogleAccount() {
  const on = await cloudEnabled();
  if (!on || !auth) throw new Error('offline');
  const { GoogleAuthProvider, signInWithCredential, signInWithPopup } = await import('firebase/auth');
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true, useCredentialManager: true });
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error('google');
    await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return;
  }
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutAccount() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      await FirebaseAuthentication.signOut();
    } catch {
    }
  }
  if (!auth) return;
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
}

export function publicCard(state, sheet, today) {
  const earned = [
    ...Object.entries(state.badges || {})
      .filter(([, date]) => date)
      .map(([id]) => id),
    ...(state.weeklyBadges || []).map((badge) => badge.id),
  ];
  return {
    name: state.name || '',
    nameKey: nameKey(state.name || ''),
    title: titleName(state.titleRank),
    level: sheet.level,
    statTier: statVisualTier(state.stats?.tier),
    statCredit: statCredit(state.stats?.tier),
    ascension: state.ascend?.count || 0,
    path: workoutPath(state.path).id,
    photo: profilePhoto(state.photoData),
    workouts: (state.history || []).filter((row) => (row.rounds || 0) > 0).length,
    streak: currentStreak(state.trainingDays, today),
    longest: longestStreak(state.trainingDays),
    badges: earned,
    featuredBadge: earned.includes(state.featuredBadge) ? state.featuredBadge : '',
  };
}

export async function claimUsername({ uid, name, device, keep = false }) {
  const key = nameKey(name);
  if (!key) return 'taken';
  const on = await cloudEnabled();
  if (!on || !db) return 'offline';
  const display = String(name || '').trim().replace(/\s+/g, ' ');
  const locked = await lockNameDoc({ uid, name: display, device, key });
  if (locked === 'ok') {
    if (uid) await tieName(uid, display, key, device);
    return 'ok';
  }
  if (locked === 'taken') {
    if (keep && uid) {
      await tieName(uid, display, key, device);
      return 'kept';
    }
    return 'taken';
  }
  if (!uid) return locked;
  const other = await nameUsedBySomeoneElse(uid, key, display);
  if (other === 'error') return 'error';
  if (other && !keep) return 'taken';
  await tieName(uid, display, key, device);
  return other ? 'kept' : 'ok';
}

async function lockNameDoc({ uid, name, device, key }) {
  const { doc, runTransaction } = await import('firebase/firestore');
  const ref = doc(db, 'names', key);
  const next = { name, uid: uid || null, device: device || null };
  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const action = decideNameClaim(snap.exists() ? snap.data() : null, { uid: uid || null, name, device });
      if (action === 'taken') return 'taken';
      tx.set(ref, next, { merge: action !== 'create' });
      return 'ok';
    });
  } catch (error) {
    const code = String(error?.code || '');
    if (code === 'permission-denied' || code.endsWith('permission-denied')) return 'denied';
    return 'error';
  }
}

async function nameUsedBySomeoneElse(uid, key, display) {
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  try {
    const byKey = await getDocs(query(collection(db, 'users'), where('nameKey', '==', key)));
    const byName = await getDocs(query(collection(db, 'users'), where('name', '==', display)));
    const ids = new Set([...byKey.docs, ...byName.docs].map((item) => item.id));
    ids.delete(uid);
    return ids.size > 0;
  } catch {
    return 'error';
  }
}

async function tieName(uid, display, key, device) {
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', uid), { name: display, nameKey: key }, { merge: true });
  if (!device) return;
  await setDoc(doc(db, 'users', uid, 'private', 'device'), device, { merge: true });
}

export async function pushCloud(uid, state, sheet, today) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return;
  const { doc, setDoc } = await import('firebase/firestore');
  const card = publicCard(state, sheet, today);
  if (!card.nameKey) delete card.nameKey;
  card.code = friendCode(uid);
  await setDoc(doc(db, 'users', uid), card, { merge: true });
  await setDoc(
    doc(db, 'users', uid, 'private', 'body'),
    {
      heightCm: state.body?.heightCm ?? null,
      weightKg: state.body?.weightKg ?? null,
    },
    { merge: true },
  );
  for (const row of state.history || []) {
    await setDoc(doc(db, 'users', uid, 'history', row.id), publicHistory(row), { merge: true });
  }
}

export async function clearOwnHistory(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return;
  const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
  for (const folder of ['history', 'friends']) {
    const rows = await getDocs(collection(db, 'users', uid, folder));
    for (const item of rows.docs) await deleteDoc(item.ref);
  }
}

export async function pullProfile(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data() || {};
  return {
    name: typeof data.name === 'string' ? data.name : '',
    path: typeof data.path === 'string' ? data.path : '',
    photo: typeof data.photo === 'string' ? data.photo : '',
    featuredBadge: typeof data.featuredBadge === 'string' ? data.featuredBadge : '',
  };
}

export async function pullBody(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid, 'private', 'body'));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function ensureCode(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return friendCode(uid);
  const { doc, setDoc } = await import('firebase/firestore');
  const code = friendCode(uid);
  await setDoc(doc(db, 'users', uid), { code }, { merge: true });
  return code;
}

function publicFriend(id, data) {
  const card = data || {};
  return {
    uid: id,
    name: card.name || '',
    title: card.title || '',
    level: card.level || 0,
    statTier: card.statTier || 0,
    statCredit: card.statCredit || 0,
    ascension: card.ascension || 0,
    path: card.path || '',
    photo: card.photo || '',
    workouts: card.workouts || 0,
    streak: card.streak || 0,
    longest: card.longest || 0,
    badges: card.badges || [],
    featuredBadge: card.featuredBadge || '',
    code: card.code || '',
  };
}

async function findUser(code) {
  const trimmed = String(code || '').trim();
  if (!trimmed) throw new Error('missing');
  const { collection, doc, getDoc, getDocs, query, where } = await import('firebase/firestore');
  if (trimmed.length > 6) {
    const direct = await getDoc(doc(db, 'users', trimmed));
    if (direct.exists()) return publicFriend(direct.id, direct.data());
  }
  const snap = await getDocs(query(collection(db, 'users'), where('code', '==', trimmed.toUpperCase())));
  if (snap.empty) throw new Error('missing');
  const hit = snap.docs[0];
  return publicFriend(hit.id, hit.data());
}

export async function addFriend(uid, code) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) throw new Error('offline');
  const { doc, setDoc } = await import('firebase/firestore');
  const found = await findUser(code);
  if (!found?.uid || found.uid === uid) throw new Error('missing');
  await setDoc(doc(db, 'users', uid, 'friends', found.uid), { since: Date.now() });
  return found;
}

export async function loadBoard(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return { rows: [] };
  const { collection, doc, getDoc, getDocs } = await import('firebase/firestore');
  const friends = await getDocs(collection(db, 'users', uid, 'friends'));
  const rows = [];
  for (const friend of friends.docs) {
    const profile = await getDoc(doc(db, 'users', friend.id));
    if (!profile.exists()) continue;
    rows.push(publicFriend(friend.id, profile.data()));
  }
  rows.sort((a, b) => (b.statTier || 0) - (a.statTier || 0) || (b.statCredit || 0) - (a.statCredit || 0) || String(a.name).localeCompare(String(b.name)));
  return { rows };
}

export async function loadFriend(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return null;
  const { collection, doc, getDoc, getDocs } = await import('firebase/firestore');
  const profile = await getDoc(doc(db, 'users', uid));
  if (!profile.exists()) return null;
  const history = [];
  try {
    const logs = await getDocs(collection(db, 'users', uid, 'history'));
    logs.forEach((log) => history.push(publicHistory({ id: log.id, ...log.data() })));
  } catch {
    return { ...publicFriend(uid, profile.data()), history: null };
  }
  history.sort((a, b) => (a.date < b.date ? 1 : -1));
  return { ...publicFriend(uid, profile.data()), history };
}

function localMode() {
  try {
    return sessionStorage.getItem(CHALLENGE_LOCAL) === '1';
  } catch {
    return false;
  }
}

function setLocalMode() {
  try {
    sessionStorage.setItem(CHALLENGE_LOCAL, '1');
  } catch {
  }
}

function readLocalChallenges() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHALLENGE_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeLocalChallenges(rows) {
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event('lean-challenges'));
}

function patchLocal(id, patch) {
  const rows = readLocalChallenges();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return null;
  rows[index] = { ...rows[index], ...patch };
  writeLocalChallenges(rows);
  return rows[index];
}

function visibleLocal(uid) {
  return readLocalChallenges().filter((row) => row.from === uid || row.to === uid);
}

export function watchChallenges(uid, onChange) {
  let stopFrom = () => {};
  let stopTo = () => {};
  let dead = false;
  const bag = { from: [], to: [] };
  const emitRemote = () => {
    const map = new Map();
    for (const row of [...bag.from, ...bag.to]) map.set(row.id, row);
    onChange([...map.values()]);
  };
  const emitLocal = () => onChange(visibleLocal(uid));
  const onLocal = () => {
    if (!dead && localMode()) emitLocal();
  };
  window.addEventListener('lean-challenges', onLocal);
  cloudEnabled().then(async (on) => {
    if (dead || !on || !db || localMode()) {
      emitLocal();
      return;
    }
    const { collection, onSnapshot, query, where } = await import('firebase/firestore');
    const listen = (field, key) =>
      onSnapshot(
        query(collection(db, 'challenges'), where(field, '==', uid)),
        (snap) => {
          if (dead || localMode()) return;
          bag[key] = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          emitRemote();
        },
        () => {
          if (dead) return;
          setLocalMode();
          emitLocal();
        },
      );
    stopFrom = listen('from', 'from');
    stopTo = listen('to', 'to');
  });
  return () => {
    dead = true;
    stopFrom();
    stopTo();
    window.removeEventListener('lean-challenges', onLocal);
  };
}

export async function createChallenge(payload) {
  const on = await cloudEnabled();
  if ((!on || !db || localMode()) && typeof localStorage !== 'undefined') {
    const row = { id: `local-${Date.now()}`, ...payload };
    writeLocalChallenges([...readLocalChallenges(), row]);
    return row;
  }
  try {
    const { addDoc, collection } = await import('firebase/firestore');
    const ref = await addDoc(collection(db, 'challenges'), payload);
    return { id: ref.id, ...payload };
  } catch {
    setLocalMode();
    const row = { id: `local-${Date.now()}`, ...payload };
    writeLocalChallenges([...readLocalChallenges(), row]);
    return row;
  }
}

export async function banChallenge(id, drafted, banned) {
  const match = banOne(drafted, banned);
  if (!match) throw new Error('ban');
  const patch = { banned, match, status: 'live' };
  if (localMode() || String(id).startsWith('local-')) {
    patchLocal(id, patch);
    return;
  }
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'challenges', id), patch);
  } catch {
    setLocalMode();
    patchLocal(id, patch);
  }
}

export async function pushChallengeScore(id, uid, score) {
  if (localMode() || String(id).startsWith('local-')) {
    const row = readLocalChallenges().find((item) => item.id === id);
    if (!row) return;
    patchLocal(id, { scores: { ...(row.scores || {}), [uid]: score } });
    return;
  }
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'challenges', id), { [`scores.${uid}`]: score });
  } catch {
    setLocalMode();
    const row = readLocalChallenges().find((item) => item.id === id);
    if (!row) return;
    patchLocal(id, { scores: { ...(row.scores || {}), [uid]: score } });
  }
}

export async function finishChallenge(id, today) {
  if (localMode() || String(id).startsWith('local-')) {
    const row = readLocalChallenges().find((item) => item.id === id);
    if (!row || !shouldResolve(row, today)) return;
    patchLocal(id, { status: 'done', winner: winnerOf(row) });
    return;
  }
  const on = await cloudEnabled();
  if (!on || !db) return;
  const { doc, runTransaction } = await import('firebase/firestore');
  const ref = doc(db, 'challenges', id);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      if (!shouldResolve({ ...data, status: data.status }, today)) return;
      tx.update(ref, { status: 'done', winner: winnerOf(data) });
    });
  } catch {
    setLocalMode();
    const row = readLocalChallenges().find((item) => item.id === id);
    if (!row || !shouldResolve(row, today)) return;
    patchLocal(id, { status: 'done', winner: winnerOf(row) });
  }
}
