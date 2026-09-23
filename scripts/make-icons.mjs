import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function inside(points, x, y) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const xi = points[i][0];
    const yi = points[i][1];
    const xj = points[j][0];
    const yj = points[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
    if (intersect) hit = !hit;
  }
  return hit;
}

const FLAME = [
  [0.5, 0.16],
  [0.6, 0.34],
  [0.74, 0.26],
  [0.66, 0.48],
  [0.82, 0.44],
  [0.7, 0.7],
  [0.56, 0.58],
  [0.5, 0.84],
  [0.44, 0.58],
  [0.3, 0.7],
  [0.18, 0.44],
  [0.34, 0.48],
  [0.26, 0.26],
  [0.4, 0.34],
];

const CORE = [
  [0.5, 0.4],
  [0.58, 0.5],
  [0.54, 0.66],
  [0.5, 0.74],
  [0.46, 0.66],
  [0.42, 0.5],
];

function badge(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const set = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = a;
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) set(x, y, 22, 19, 15);
  }
  const inset = Math.round(size * 0.06);
  const thick = Math.max(2, Math.round(size * 0.018));
  for (let y = inset; y < size - inset; y += 1) {
    for (let x = inset; x < size - inset; x += 1) {
      const edge =
        x < inset + thick ||
        y < inset + thick ||
        x >= size - inset - thick ||
        y >= size - inset - thick;
      if (edge) set(x, y, 141, 110, 62);
    }
  }
  const ox = size * 0.18;
  const oy = size * 0.14;
  const w = size * 0.64;
  const h = size * 0.72;
  const poly = (points) => points.map(([px, py]) => [ox + px * w, oy + py * h]);
  const flame = poly(FLAME);
  const core = poly(CORE);
  const x0 = Math.floor(ox);
  const x1 = Math.ceil(ox + w);
  const y0 = Math.floor(oy);
  const y1 = Math.ceil(oy + h);
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      if (inside(flame, x, y)) set(x, y, 216, 90, 34);
      if (inside(core, x, y)) set(x, y, 232, 176, 96);
    }
  }
  return rgba;
}

function scale(src, sw, tw) {
  const out = Buffer.alloc(tw * tw * 4);
  for (let y = 0; y < tw; y += 1) {
    const sy = Math.min(sw - 1, Math.floor((y * sw) / tw));
    for (let x = 0; x < tw; x += 1) {
      const sx = Math.min(sw - 1, Math.floor((x * sw) / tw));
      const si = (sy * sw + sx) * 4;
      const di = (y * tw + x) * 4;
      out[di] = src[si];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si + 2];
      out[di + 3] = src[si + 3];
    }
  }
  return out;
}

function splash(badgeSize, badgeRgba) {
  const size = 2732;
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    const o = i * 4;
    rgba[o] = 22;
    rgba[o + 1] = 19;
    rgba[o + 2] = 15;
    rgba[o + 3] = 255;
  }
  const target = 900;
  const scaled = scale(badgeRgba, badgeSize, target);
  const ox = Math.floor((size - target) / 2);
  const oy = Math.floor((size - target) / 2);
  for (let y = 0; y < target; y += 1) {
    for (let x = 0; x < target; x += 1) {
      const si = (y * target + x) * 4;
      const di = ((oy + y) * size + (ox + x)) * 4;
      rgba[di] = scaled[si];
      rgba[di + 1] = scaled[si + 1];
      rgba[di + 2] = scaled[si + 2];
      rgba[di + 3] = 255;
    }
  }
  return png(size, size, rgba);
}

const master = badge(512);
fs.mkdirSync(path.join(root, 'resources'), { recursive: true });
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'resources', 'icon.png'), png(1024, 1024, scale(master, 512, 1024)));
fs.writeFileSync(path.join(root, 'public', 'icon-512.png'), png(512, 512, master));
fs.writeFileSync(path.join(root, 'public', 'icon-192.png'), png(192, 192, scale(master, 512, 192)));
fs.writeFileSync(path.join(root, 'resources', 'splash.png'), splash(512, master));
