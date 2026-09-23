import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import { decompressFrames, parseGIF } from 'gifuct-js';

export const PHOTO_BYTE_LIMIT = 300 * 1024;
export const PHOTO_EDGE = 200;

const WORK_EDGE = 480;

export function dataUrlBytes(value) {
  const mark = value.indexOf(',');
  if (mark < 0) return value.length;
  const body = value.slice(mark + 1).replace(/=+$/, '');
  return Math.floor((body.length * 3) / 4);
}

export function profilePhoto(value) {
  if (typeof value !== 'string') return '';
  const jpeg = value.startsWith('data:image/jpeg');
  const gif = value.startsWith('data:image/gif');
  if (!jpeg && !gif) return '';
  if (dataUrlBytes(value) > PHOTO_BYTE_LIMIT) return '';
  return value;
}

export function isProfilePhoto(value) {
  return Boolean(profilePhoto(value));
}

export function cropRect(srcW, srcH, view, zoom, panX, panY) {
  const z = Math.min(3, Math.max(1, zoom || 1));
  const scale = Math.max(view / srcW, view / srcH) * z;
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const maxX = Math.max(0, (drawW - view) / 2);
  const maxY = Math.max(0, (drawH - view) / 2);
  const ox = Math.min(maxX, Math.max(-maxX, panX || 0));
  const oy = Math.min(maxY, Math.max(-maxY, panY || 0));
  return {
    dx: (view - drawW) / 2 + ox,
    dy: (view - drawH) / 2 + oy,
    drawW,
    drawH,
    panX: ox,
    panY: oy,
  };
}

export function paintCrop(ctx, source, srcW, srcH, view, zoom, panX, panY) {
  const box = cropRect(srcW, srcH, view, zoom, panX, panY);
  ctx.clearRect(0, 0, view, view);
  ctx.drawImage(source, box.dx, box.dy, box.drawW, box.drawH);
  return box;
}

export function selectFrames(frames, startMs, endMs) {
  const start = Math.max(0, startMs || 0);
  const end = Math.max(start, endMs || 0);
  let cursor = 0;
  const picked = [];
  for (const frame of frames || []) {
    const next = cursor + (frame.delay || 100);
    const hit = end === start ? cursor <= start && next > start : next > start && cursor < end;
    if (hit) picked.push(frame);
    cursor = next;
  }
  if (!picked.length && frames?.length) picked.push(frames[frames.length - 1]);
  return picked;
}

export function clipMs(frames) {
  return (frames || []).reduce((sum, frame) => sum + (frame.delay || 100), 0);
}

export function encodeGifBytes(frames, colors) {
  const gif = GIFEncoder();
  const count = Math.min(256, Math.max(2, colors || 64));
  frames.forEach((frame, index) => {
    const rgba = frame.rgba instanceof Uint8Array ? frame.rgba : new Uint8Array(frame.rgba);
    const palette = quantize(rgba, count);
    const pixels = applyPalette(rgba, palette);
    gif.writeFrame(pixels, frame.width, frame.height, {
      palette,
      delay: Math.max(20, frame.delay || 100),
      repeat: index === 0 ? 0 : 0,
    });
  });
  gif.finish();
  return gif.bytes();
}

function blobToData(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function isGifFile(file) {
  if (file.type === 'image/gif') return true;
  const head = new Uint8Array(await file.slice(0, 6).arrayBuffer());
  const sig = String.fromCharCode(...head);
  return sig === 'GIF87a' || sig === 'GIF89a';
}

function fitCanvas(source, sw, sh) {
  const scale = Math.min(1, WORK_EDGE / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function loadGifDecoder(file) {
  if (typeof ImageDecoder === 'undefined') throw new Error('trim');
  const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type: 'image/gif' });
  await decoder.tracks.ready;
  const track = decoder.tracks.selectedTrack;
  if (!track?.frameCount) throw new Error('trim');
  const frames = [];
  for (let i = 0; i < track.frameCount; i += 1) {
    const { image } = await decoder.decode({ frameIndex: i });
    const sw = image.displayWidth || image.codedWidth;
    const sh = image.displayHeight || image.codedHeight;
    const canvas = fitCanvas(image, sw, sh);
    const delay = image.duration ? Math.max(20, Math.round(image.duration / 1000)) : 100;
    image.close();
    frames.push({ canvas, delay });
  }
  decoder.close?.();
  if (!frames.length) throw new Error('trim');
  return {
    kind: 'gif',
    width: frames[0].canvas.width,
    height: frames[0].canvas.height,
    frames,
    duration: clipMs(frames),
  };
}

function loadGifParsed(file) {
  return file.arrayBuffer().then((buffer) => {
    const parsed = parseGIF(buffer);
    const decoded = decompressFrames(parsed, true);
    if (!decoded.length) throw new Error('trim');
    const width = parsed.lsd.width;
    const height = parsed.lsd.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const patch = document.createElement('canvas');
    const patchCtx = patch.getContext('2d');
    const frames = [];
    let restore = null;
    for (const frame of decoded) {
      const disposal = frame.disposalType || 1;
      if (disposal === 3) restore = ctx.getImageData(0, 0, width, height);
      patch.width = Math.max(1, frame.dims.width);
      patch.height = Math.max(1, frame.dims.height);
      const image = patchCtx.createImageData(patch.width, patch.height);
      image.data.set(frame.patch);
      patchCtx.putImageData(image, 0, 0);
      ctx.drawImage(patch, frame.dims.left, frame.dims.top);
      frames.push({
        canvas: fitCanvas(canvas, width, height),
        delay: frame.delay || 100,
      });
      if (disposal === 2) ctx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
      else if (disposal === 3 && restore) ctx.putImageData(restore, 0, 0);
    }
    return {
      kind: 'gif',
      width: frames[0].canvas.width,
      height: frames[0].canvas.height,
      frames,
      duration: clipMs(frames),
    };
  });
}

export async function loadPicture(file) {
  if (await isGifFile(file)) {
    try {
      return await loadGifDecoder(file);
    } catch {
      try {
        return await loadGifParsed(file);
      } catch {
        throw new Error('trim');
      }
    }
  }
  const bitmap = await createImageBitmap(file);
  return { kind: 'still', bitmap, width: bitmap.width, height: bitmap.height, frames: [], duration: 0 };
}

function cropRgba(source, srcW, srcH, zoom, panX, panY) {
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_EDGE;
  canvas.height = PHOTO_EDGE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  paintCrop(ctx, source, srcW, srcH, PHOTO_EDGE, zoom, panX, panY);
  const image = ctx.getImageData(0, 0, PHOTO_EDGE, PHOTO_EDGE);
  const rgba = new Uint8Array(PHOTO_EDGE * PHOTO_EDGE * 4);
  rgba.set(image.data);
  for (let i = 0; i < rgba.length; i += 4) {
    const alpha = rgba[i + 3] / 255;
    if (alpha >= 1) continue;
    rgba[i] = Math.round(rgba[i] * alpha + 22 * (1 - alpha));
    rgba[i + 1] = Math.round(rgba[i + 1] * alpha + 27 * (1 - alpha));
    rgba[i + 2] = Math.round(rgba[i + 2] * alpha + 31 * (1 - alpha));
    rgba[i + 3] = 255;
  }
  return rgba;
}

function exportStill(bitmap, zoom, panX, panY, view) {
  const scale = PHOTO_EDGE / view;
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_EDGE;
  canvas.height = PHOTO_EDGE;
  const ctx = canvas.getContext('2d');
  paintCrop(ctx, bitmap, bitmap.width, bitmap.height, PHOTO_EDGE, zoom, panX * scale, panY * scale);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('jpeg'));
          return;
        }
        resolve(await blobToData(blob));
      },
      'image/jpeg',
      0.6,
    );
  });
}

export async function renderProfilePhoto(media, crop) {
  const zoom = crop.zoom;
  const view = crop.view || PHOTO_EDGE;
  if (media.kind === 'still') {
    const dataUrl = await exportStill(media.bitmap, zoom, crop.panX, crop.panY, view);
    if (!isProfilePhoto(dataUrl)) return { error: 'large' };
    return { dataUrl };
  }
  const frames = selectFrames(media.frames, crop.startMs, crop.endMs);
  const step = crop.quality === 'lower' ? 2 : 1;
  const colors = crop.quality === 'lower' ? 16 : 64;
  const scale = PHOTO_EDGE / view;
  const packed = [];
  for (let i = 0; i < frames.length; i += step) {
    let delay = 0;
    const last = Math.min(frames.length, i + step);
    for (let j = i; j < last; j += 1) delay += frames[j].delay || 100;
    packed.push({
      rgba: cropRgba(frames[i].canvas, media.width, media.height, zoom, crop.panX * scale, crop.panY * scale),
      width: PHOTO_EDGE,
      height: PHOTO_EDGE,
      delay,
    });
  }
  const bytes = encodeGifBytes(packed, colors);
  if (bytes.length > PHOTO_BYTE_LIMIT) return { error: 'large' };
  const dataUrl = await blobToData(new Blob([bytes], { type: 'image/gif' }));
  if (!isProfilePhoto(dataUrl)) return { error: 'large' };
  return { dataUrl };
}
