import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const media = process.env.TEMP || process.env.TMP || '.';
const candidates = [
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const executablePath = candidates.find((item) => fs.existsSync(item));
if (!executablePath) throw new Error('no browser');

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error).slice(0, 180)));
const stamp = Date.now();
const handle = `n${stamp}`;
await page.goto('http://127.0.0.1:47329', { waitUntil: 'domcontentloaded' });
await page.getByTestId('email-input').waitFor({ timeout: 20000 });
await page.getByTestId('email-input').fill(`time.${stamp}@example.com`);
await page.getByTestId('password-input').fill(`Cw-${stamp}-time`);
await page.getByTestId('sign-up').click();
await page.getByTestId('name-input').waitFor({ timeout: 20000 });
await page.getByTestId('name-input').fill(handle);
await page.getByTestId('save-name').click();
await page.getByTestId('time-round').waitFor({ timeout: 20000 });
await page.getByTestId('time-round').click();
await page.getByTestId('prep-count').waitFor();
const prep = (await page.getByTestId('prep-count').innerText()).trim();
const clockDuringPrep = await page.getByTestId('round-clock').count();
await page.getByTestId('round-clock').waitFor({ timeout: 15000 });
const working = (await page.getByTestId('round-clock').innerText()).trim();
const title = (await page.getByTestId('focus-title').innerText()).trim();
const dose = (await page.getByTestId('focus-dose').innerText()).trim();
const cues = await page.getByTestId('form-cues').count();
const cueText = cues ? (await page.getByTestId('form-cues').innerText()).replace(/\s+/g, ' ').trim() : '';
const photos = await page.locator('[data-testid="timed-round"] img').count();
await page.screenshot({ path: path.join(media, 'time-cues.png') });
await page.getByTestId('set-done').click();
await page.getByTestId('prep-count').waitFor();
const rest = (await page.getByTestId('prep-count').innerText()).trim();
const nextTitle = (await page.getByTestId('focus-title').innerText()).trim();
const nextCues = await page.getByTestId('form-cues').count();
const nextPhotos = await page.locator('[data-testid="timed-round"] img').count();
await page.getByTestId('tab-profile').click();
await page.getByTestId('badge-shelf').waitFor();
const locked = await page.locator('[data-testid^="badge-locked-"]').count();
const earned = await page.locator('[data-testid^="badge-earned-"]').count();
const medals = await page.locator('[data-testid="badge-shelf"] svg').count();
const adminButton = await page.getByTestId('open-admin').count();
const other = await browser.newPage({ viewport: { width: 420, height: 900 } });
other.on('pageerror', (error) => errors.push(String(error).slice(0, 180)));
await other.goto('http://127.0.0.1:47329', { waitUntil: 'domcontentloaded' });
await other.getByTestId('email-input').waitFor({ timeout: 20000 });
await other.getByTestId('email-input').fill(`time.${stamp}.b@example.com`);
await other.getByTestId('password-input').fill(`Cw-${stamp}-time`);
await other.getByTestId('sign-up').click();
await other.getByTestId('name-input').waitFor({ timeout: 20000 });
await other.getByTestId('name-input').fill(handle);
await other.getByTestId('save-name').click();
const taken = other.getByText('That username is taken.');
const entered = other.getByTestId('time-round');
await Promise.race([
  taken.waitFor({ timeout: 20000 }).then(() => 'taken'),
  entered.waitFor({ timeout: 20000 }).then(() => 'saved'),
]).catch(() => 'neither');
const duplicate = (await taken.count()) ? 'taken' : (await entered.count()) ? 'saved' : 'neither';
await page.screenshot({ path: path.join(media, 'time-round.png') });
console.log(JSON.stringify({ prep, clockDuringPrep, working, title, dose, cues, cueText, photos, rest, nextTitle, nextCues, nextPhotos, locked, earned, medals, handle, duplicate, adminButton, errors }));
await browser.close();
