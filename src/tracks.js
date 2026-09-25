const DB = 'lean-tracks';
const STORE = 'files';
const MIX_KEY = 'lean-circuit-mix';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function loadMix() {
  try {
    const raw = JSON.parse(localStorage.getItem(MIX_KEY) || '{}');
    const volume = Number(raw.volume);
    return {
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.7,
      mute: Boolean(raw.mute),
      openName: typeof raw.openName === 'string' ? raw.openName : '',
      roundName: typeof raw.roundName === 'string' ? raw.roundName : '',
    };
  } catch {
    return { volume: 0.7, mute: false, openName: '', roundName: '' };
  }
}

export function saveMix(mix) {
  localStorage.setItem(MIX_KEY, JSON.stringify(mix));
  window.dispatchEvent(new Event('lean-mix'));
}

export async function saveTrack(key, file) {
  const db = await openDb();
  const buf = await file.arrayBuffer();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ type: file.type || 'audio/mpeg', buf }, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  const mix = loadMix();
  saveMix({ ...mix, [`${key}Name`]: file.name || 'Track' });
  window.dispatchEvent(new Event('lean-tracks'));
}

export async function clearTrack(key) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  const mix = loadMix();
  saveMix({ ...mix, [`${key}Name`]: '' });
  window.dispatchEvent(new Event('lean-tracks'));
}

export async function trackBlob(key) {
  const db = await openDb();
  const row = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  if (!row?.buf) return null;
  return new Blob([row.buf], { type: row.type || 'audio/mpeg' });
}
