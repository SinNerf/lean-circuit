import { titleName } from './honors.js';
import { currentStreak, longestStreak } from './honors.js';
import { publicHistory } from './logic.js';
import { workoutPath } from './paths.js';

const loaders = import.meta.glob('../firebase.local.json');

let auth = null;
let db = null;
let boot = null;

export async function cloudEnabled() {
  if (!boot) {
    boot = (async () => {
      const key = Object.keys(loaders)[0];
      if (!key) return false;
      try {
        const mod = await loaders[key]();
        const config = mod.default || mod;
        if (!config?.apiKey || !config?.projectId || !config?.appId) return false;
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

export async function signOutAccount() {
  if (!auth) return;
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
}

export function publicCard(state, sheet, today) {
  const earned = Object.entries(state.badges || {})
    .filter(([, date]) => date)
    .map(([id]) => id);
  return {
    name: state.name || '',
    title: titleName(state.titleRank),
    level: sheet.level,
    ascension: state.ascend?.count || 0,
    path: workoutPath(state.path).id,
    photo: typeof state.photoData === 'string' && state.photoData.startsWith('data:image/jpeg') ? state.photoData : '',
    workouts: (state.history || []).filter((row) => (row.rounds || 0) > 0).length,
    streak: currentStreak(state.trainingDays, today),
    longest: longestStreak(state.trainingDays),
    badges: earned,
  };
}

export async function pushCloud(uid, state, sheet, today) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return;
  const { doc, setDoc } = await import('firebase/firestore');
  const card = publicCard(state, sheet, today);
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

export async function pullBody(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', uid, 'private', 'body'));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function addFriend(uid, friendId) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) throw new Error('offline');
  const { doc, setDoc, getDoc } = await import('firebase/firestore');
  const profile = await getDoc(doc(db, 'users', friendId));
  if (!profile.exists()) throw new Error('missing');
  await setDoc(doc(db, 'users', uid, 'friends', friendId), { since: Date.now() });
  return { uid: friendId, ...profile.data() };
}

export async function loadBoard(uid) {
  const on = await cloudEnabled();
  if (!on || !db || !uid) return { rows: [], activity: null };
  const { collection, doc, getDoc, getDocs } = await import('firebase/firestore');
  const friends = await getDocs(collection(db, 'users', uid, 'friends'));
  const rows = [];
  let activity = null;
  for (const friend of friends.docs) {
    const profile = await getDoc(doc(db, 'users', friend.id));
    if (!profile.exists()) continue;
    const card = { uid: friend.id, ...profile.data() };
    rows.push(card);
    try {
      const logs = await getDocs(collection(db, 'users', friend.id, 'history'));
      for (const log of logs.docs) {
        const data = log.data();
        if ((data.rounds || 0) <= 0) continue;
        if (!activity || data.date > activity.date) {
          activity = {
            name: card.name,
            photo: card.photo || '',
            path: card.path,
            date: data.date,
            sentence: `${card.name} logged ${workoutPath(data.path).name}.`,
          };
        }
      }
    } catch {
      continue;
    }
  }
  rows.sort((a, b) => (b.level || 0) - (a.level || 0) || String(a.name).localeCompare(String(b.name)));
  return { rows, activity };
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
    return { ...profile.data(), uid, history: null };
  }
  history.sort((a, b) => (a.date < b.date ? 1 : -1));
  return { ...profile.data(), uid, history };
}
