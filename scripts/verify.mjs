import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const base = process.env.APP_URL || 'http://127.0.0.1:47322';
const media = process.env.MEDIA_DIR;
const shots = process.env.SHOTS === '1';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function dismissLevel(page) {
  for (let i = 0; i < 8; i += 1) {
    const button = page.getByTestId('level-continue');
    if (await button.isVisible().catch(() => false)) await button.click();
    else return;
  }
}

async function checkAndRest(page, id, pattern) {
  await page.getByTestId(id).click();
  const rest = page.getByTestId('rest');
  const cont = page.getByTestId('level-continue');
  await Promise.race([rest.waitFor(), cont.waitFor()]);
  await dismissLevel(page);
  await rest.waitFor();
  const text = await rest.innerText();
  assert(pattern.test(text), `${id} rest was ${text}`);
}

async function launch() {
  try {
    return await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    return chromium.launch({ channel: 'chrome', headless: true });
  }
}

async function main() {
  const browser = await launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto(base);
  const input = page.getByTestId('name-input');
  await input.waitFor();
  assert((await input.inputValue()) === '', 'name field was not empty');
  assert(await page.getByTestId('save-name').isDisabled(), 'empty name could be saved');
  if (shots) await page.screenshot({ path: path.join(media, 'first-launch.png') });

  await input.fill('Recruit');
  await page.getByTestId('save-name').click();
  await page.getByRole('heading', { name: 'Circuit' }).waitFor();
  const device = await page.evaluate(() => JSON.parse(localStorage.getItem('lean-circuit-device')));
  assert(device.installId && device.platform && device.userAgent, 'device record missing identity');
  assert(device.screen?.width && device.screen?.height, 'device record missing screen');
  assert('publicIp' in device, 'device record missing ip field');
  const installId = device.installId;

  await page.reload();
  await page.getByRole('heading', { name: 'Circuit' }).waitFor();
  assert((await page.getByTestId('name-input').count()) === 0, 'name was asked again');

  await checkAndRest(page, 'check-0-0', /0:(20|19|18)/);
  if (shots) await page.screenshot({ path: path.join(media, 'circuit.png') });
  await page.getByTestId('rest-skip').click();
  await page.getByTestId('rest').waitFor({ state: 'detached' });

  await checkAndRest(page, 'check-0-7', /1:30/);
  await page.getByTestId('rest-skip').click();

  await page.getByTestId('check-0-7').click();
  await page.waitForTimeout(250);
  assert((await page.getByTestId('rest').count()) === 0, 'uncheck started a timer');

  await checkAndRest(page, 'check-0-1', /0:(20|19|18)/);
  await page.getByTestId('rest-skip').click();

  await page.getByTestId('tab-stats').click();
  await page.getByTestId('counter-strength').waitFor();
  const tierAfterTwo = Number(await page.getByTestId('counter-strength').innerText());
  const lifeAfterTwo = Number(await page.getByTestId('life-strength').innerText());
  const visual = await page.getByTestId('tier-strength').innerText();
  assert(tierAfterTwo === 16, `strength tier counter ${tierAfterTwo}`);
  assert(lifeAfterTwo === 16, `strength lifetime ${lifeAfterTwo}`);
  assert(visual.trim() === '04', `visual tier ${visual}`);
  assert((await page.getByTestId('bar-strength').getAttribute('data-filled')) === '4', 'bar segments');

  await page.getByTestId('tab-circuit').click();
  await page.getByTestId('reset-rounds').click();
  await checkAndRest(page, 'check-0-0', /0:(20|19|18)/);
  await page.getByTestId('rest-skip').click();
  await page.getByTestId('tab-stats').click();
  const tierCapped = Number(await page.getByTestId('counter-strength').innerText());
  const lifeCapped = Number(await page.getByTestId('life-strength').innerText());
  assert(tierCapped === 16, `daily cap moved the tier counter to ${tierCapped}`);
  assert(lifeCapped === 24, `lifetime after capped repeat ${lifeCapped}`);
  assert((await page.getByTestId('today-burpees').innerText()).includes('earned'), 'today credit not marked earned');
  if (shots) await page.screenshot({ path: path.join(media, 'stat-screen.png') });

  await page.getByTestId('tab-trials').click();
  assert((await page.getByTestId('lock-strength-6').innerText()).includes('Strength tier 6'), 'strength gate copy');
  assert((await page.getByTestId('lock-power-3').innerText()).includes('Power tier 3'), 'power gate copy');
  assert((await page.getByTestId('lock-gauntlet').innerText()).includes('Berserker Awakening'), 'class trial gate');
  assert(await page.getByTestId('pass-strength-3').isVisible(), 'tier 3 strength trial stayed locked');
  await page.getByTestId('pass-strength-3').click();
  await page.getByTestId('medal-strength-3').waitFor();
  assert((await page.getByTestId('passed-strength-3').innerText()).includes('Passed'), 'pass did not stamp');

  await page.getByTestId('tab-skills').click();
  assert(await page.getByTestId('confirm-steady-guard').isVisible(), 'ready skill missing');
  assert((await page.getByTestId('skill-lock-spark-step').innerText()).includes('Tier 2'), 'power skill lock');
  assert((await page.getByTestId('skill-lock-piston-strike').innerText()).includes('Tier 5'), 'strength skill lock');
  await page.getByTestId('confirm-steady-guard').click();
  await page.getByTestId('skill-date-steady-guard').waitFor();

  await page.setViewportSize({ width: 1200, height: 900 });
  const wideA = await page.getByTestId('path-bulwark').boundingBox();
  const wideB = await page.getByTestId('path-tempest').boundingBox();
  assert(Math.abs(wideA.y - wideB.y) < 12, 'skill paths did not sit side by side');
  await page.setViewportSize({ width: 390, height: 844 });
  const narrowA = await page.getByTestId('path-bulwark').boundingBox();
  const narrowB = await page.getByTestId('path-tempest').boundingBox();
  assert(narrowB.y > narrowA.y + 40, 'skill paths did not stack on a phone');

  await page.getByTestId('tab-circuit').click();
  await page.getByTestId('info-burpees-0').click();
  await page.getByTestId('form-sheet').waitFor();
  assert((await page.getByTestId('section-form').getAttribute('aria-expanded')) === 'true', 'form block was closed');
  assert((await page.getByTestId('section-notFeel').getAttribute('aria-expanded')) === 'false', 'warning block was open');
  await page.getByTestId('section-notFeel').click();
  const warning = await page.getByTestId('form-sheet').innerText();
  assert(warning.includes('Stop the set'), 'form sheet missing the stop line');
  assert(
    (await page.getByTestId('medical').innerText()) ===
      'This is general form guidance, not medical advice. If pain persists, see a doctor or physiotherapist.',
    'medical line',
  );
  await page.getByTestId('close-form').click();

  await page.getByTestId('cardio-line').scrollIntoViewIfNeeded();
  assert((await page.getByTestId('cardio-line').innerText()).includes('mountain climbers are the cardio'), 'muscle line');

  await page.getByTestId('open-settings').click();
  assert((await page.locator('#settings input, [data-testid="settings"] input').count()) === 1, 'unexpected settings inputs');
  assert(/recruit/i.test(await page.getByTestId('settings-name').innerText()), 'saved name');
  assert((await page.getByTestId('device-id').innerText()) === installId, 'install id changed');
  assert(/week 1/i.test(await page.getByTestId('week-label').innerText()), 'week');
  assert((await page.getByTestId('scale-label').innerText()).includes('55%'), 'scale');
  assert((await page.getByRole('button', { name: /rename/i }).count()) === 0, 'rename control exists');

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export').click();
  const download = await downloadPromise;
  const exported = path.join(process.env.TEMP || '.', 'lean-circuit-progress.json');
  await download.saveAs(exported);
  const saved = JSON.parse(fs.readFileSync(exported, 'utf8'));
  assert(saved.stats.tier.strength === 16, 'export missing tier counter');
  assert(saved.trials['strength-3'], 'export missing trial');
  assert(saved.skills['steady-guard'], 'export missing skill');
  assert(!saved.device, 'export included the device record');

  await page.getByTestId('close-settings').click();
  await page.getByTestId('tab-trials').click();
  await page.getByTestId('pass-cardio-3').click();
  await page.getByTestId('passed-cardio-3').waitFor();
  await page.getByTestId('open-settings').click();
  await page.getByTestId('import-file').setInputFiles(exported);
  await page.getByTestId('import-replace').click();
  await page.getByTestId('import-confirm').waitFor({ state: 'detached' });
  await page.getByTestId('close-settings').click();
  await page.getByTestId('tab-trials').click();
  assert((await page.getByTestId('passed-cardio-3').count()) === 0, 'import did not restore');
  assert(await page.getByTestId('passed-strength-3').isVisible(), 'import dropped a passed trial');

  await page.getByTestId('open-settings').click();
  await page.getByTestId('import-file').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"nope":true}'),
  });
  await page.getByTestId('import-error').waitFor();
  assert((await page.getByTestId('import-error').innerText()).includes('not a Lean Circuit progress file'), 'bad import');
  await page.getByTestId('close-settings').click();

  await page.evaluate(() => {
    const key = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const add = (iso, n) => {
      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCDate(dt.getUTCDate() + n);
      return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
    };
    const today = key(new Date());
    localStorage.setItem('lean-circuit-completed-days', JSON.stringify([add(today, -1), add(today, -2), add(today, -3)]));
    localStorage.setItem('lean-circuit-recovery-dismissed', 'null');
  });
  await page.reload();
  await page.getByTestId('recovery').waitFor();
  await page.getByTestId('dismiss-recovery').click();
  await page.getByTestId('recovery').waitFor({ state: 'detached' });
  await page.reload();
  assert((await page.getByTestId('recovery').count()) === 0, 'recovery dismiss did not stick');

  await page.evaluate(() => {
    const stats = JSON.parse(localStorage.getItem('lean-circuit-stats'));
    stats.tier.strength = 255;
    localStorage.setItem('lean-circuit-stats', JSON.stringify(stats));
  });
  await page.reload();
  await page.getByTestId('suggest-push-ups').waitFor();
  await page.getByTestId('dismiss-push-ups').click();
  await page.reload();
  assert((await page.getByTestId('suggest-push-ups').count()) === 0, 'suggestion returned');
  await page.getByTestId('swap-push-ups').click();
  assert((await page.getByTestId('check-0-1').innerText()).includes('Twin Fang'), 'adopt did not swap the row');
  await page.getByTestId('swap-push-ups').click();
  assert(!(await page.getByTestId('check-0-1').innerText()).includes('Twin Fang'), 'revert failed');

  const ready = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'missing';
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return 'none';
    await navigator.serviceWorker.ready;
    return navigator.serviceWorker.controller ? 'controlled' : 'registered';
  });
  if (ready === 'registered' || ready === 'none') {
    await page.reload();
  }
  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
  assert(controlled, `service worker did not control the page (${ready})`);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('heading', { name: 'Circuit' }).waitFor();
  await context.setOffline(false);

  assert(errors.length === 0, errors.join('\n'));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
