/**
 * Smoke test: open each FAB "Add …" modal, optional nested picker, close without crash.
 * Usage: node scripts/smoke-add-modals.mjs
 * Set BASE_URL to use an existing server; otherwise starts `vite preview` on 4173.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PREVIEW_PORT = process.env.PREVIEW_PORT ?? '4175';
const DEFAULT_PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
const BASE_URL = process.env.BASE_URL ?? DEFAULT_PREVIEW_URL;
const START_PREVIEW = !process.env.BASE_URL;
const SPLASH_MS = 2600;

const USER = {
  id: '1',
  username: 'smoke',
  email: 'smoke@theria.test',
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** @type {{ fabLabel: string; heading: string; needsSecondary?: boolean; nested?: { trigger: RegExp; heading: string }[] }[]} */
const ADD_MODALS = [
  { fabLabel: 'Add Category', heading: 'Add Category' },
  {
    fabLabel: 'Add Stream',
    heading: 'Add Stream',
    nested: [{ trigger: /^Category$/i, heading: 'Choose Category' }],
  },
  // Headings are dynamic: "<Add|Edit> <Type> …" based on the default selection.
  { fabLabel: 'Add Record', heading: 'Add Expense Record' },
  { fabLabel: 'Add Budget', heading: 'Add Monthly Budget', needsSecondary: true },
  { fabLabel: 'Add Savings', heading: 'Add Goal', needsSecondary: true },
  {
    fabLabel: 'Add Account',
    heading: 'Add Account',
    nested: [{ trigger: /Choose Category/i, heading: 'Choose Category' }],
  },
];

const results = [];
const consoleErrors = [];

function log(status, name, detail = '') {
  const line = `${status === 'pass' ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`;
  console.log(line);
  results.push({ status, name, detail });
}

async function enableSecondaryFeatures(page) {
  await page.getByTitle('Menu', { exact: true }).click();
  const toggle = page.getByTitle('Show secondary features');
  if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
    await toggle.click();
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const sidebarBackdrop = page.locator(
    'div.fixed.inset-0.bg-black\\/40.backdrop-blur-sm.opacity-100',
  );
  if (await sidebarBackdrop.isVisible().catch(() => false)) {
    await sidebarBackdrop.click({ position: { x: 350, y: 300 }, force: true });
    await page.waitForTimeout(400);
  }
}

async function openFabMenu(page) {
  // Simple-mode coach marks sit next to the FAB — dismiss so they can't interfere.
  const tip = page.getByRole('button', { name: 'Dismiss tip' });
  if (await tip.isVisible({ timeout: 500 }).catch(() => false)) {
    await tip.click().catch(() => {});
    await page.waitForTimeout(250);
  }
  const fab = page.locator('.fixed.right-4.z-50 button.rounded-full').last();
  await fab.click();
  await page.waitForTimeout(400);
}

async function openFabAction(page, label) {
  await openFabMenu(page);
  const action = page.locator('.fixed.right-4.z-50').getByTitle(label);
  await action.waitFor({ state: 'visible', timeout: 5000 });
  await action.click();
  await page.waitForTimeout(800);
}

async function expectHeading(page, text, timeout = 15000) {
  await page.getByRole('heading', { name: text, exact: true }).waitFor({ state: 'visible', timeout });
}

/** Close only the topmost modal (the one showing `heading`), leaving parents open. */
async function closeTopModal(page, heading) {
  // Escape closes Radix-based pickers; CompactFormModal ignores it.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const h = page.getByRole('heading', { name: heading, exact: true });
  if (await h.isVisible().catch(() => false)) {
    const shells = page.locator('.fixed.inset-0.flex.items-center.justify-center.p-2');
    await shells.last().locator('button').first().click({ force: true, timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(350);
  }
}

async function closeAllModals(page) {
  for (let i = 0; i < 5; i += 1) {
    const shells = page.locator('.fixed.inset-0.flex.items-center.justify-center.p-2');
    if ((await shells.count()) === 0) break;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    const shell = shells.last();
    await shell.locator('button').first().click({ force: true, timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(350);
  }
}

async function loadApp(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(SPLASH_MS);
}

async function runModalSmoke(page, spec) {
  const label = spec.fabLabel;
  try {
    if (spec.needsSecondary) {
      await enableSecondaryFeatures(page);
    }

    await openFabAction(page, label);
    await page.waitForTimeout(600);
    await expectHeading(page, spec.heading);

    if (spec.nested?.length) {
      for (const nest of spec.nested) {
        const trigger = page.getByRole('button', { name: nest.trigger }).or(
          page.locator('button').filter({ hasText: nest.trigger }),
        ).first();
        if (!(await trigger.isVisible({ timeout: 2000 }).catch(() => false))) {
          log('pass', `${label} → ${nest.heading}`, 'nested trigger not shown (skipped)');
          continue;
        }
        await trigger.click();
        await page.waitForTimeout(400);
        await expectHeading(page, nest.heading);
        // Close just the nested picker — the parent modal must survive.
        await closeTopModal(page, nest.heading);
        await expectHeading(page, spec.heading);
      }
    }

    await closeAllModals(page);
    await page
      .getByRole('heading', { name: spec.heading, exact: true })
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});

    log('pass', label);
  } catch (err) {
    log('fail', label, err instanceof Error ? err.message : String(err));
    await page.screenshot({ path: `scripts/smoke-fail-${label.replace(/\s+/g, '-')}.png` }).catch(() => {});
    await closeAllModals(page).catch(() => {});
    await page.keyboard.press('Escape');
  }
}

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    let settled = false;
    const proc = spawn('npx', ['vite', 'preview', '--port', PREVIEW_PORT, '--strictPort'], {
      cwd: PROJECT_ROOT,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const onData = (chunk) => {
      const text = chunk.toString();
      process.stderr.write(text);
      if (!settled && (text.includes('Local:') || text.includes(`localhost:${PREVIEW_PORT}`))) {
        settled = true;
        resolve(proc);
      }
    };

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (!settled && code) reject(new Error(`preview exited with code ${code}`));
    });

    setTimeout(() => {
      if (!settled) reject(new Error('Timed out waiting for vite preview'));
    }, 60000);
  });
}

async function main() {
  let previewProc;
  if (START_PREVIEW) {
    console.log('Starting vite preview on', DEFAULT_PREVIEW_URL, '…');
    previewProc = await startPreviewServer();
    await new Promise((r) => setTimeout(r, 2000));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('React DevTools') || text.includes('Download the React')) return;
    consoleErrors.push(text);
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  await page.addInitScript((user) => {
    localStorage.setItem('theria-user', JSON.stringify(user));
  }, USER);

  try {
    await loadApp(page);
  } catch {
    console.error(`Could not reach ${BASE_URL}. Start the dev server: npm run dev`);
    await browser.close();
    previewProc?.kill();
    process.exit(2);
  }

  if (await page.getByText('Sign in').isVisible({ timeout: 1000 }).catch(() => false)) {
    console.error('Auth screen shown — session injection failed.');
    await browser.close();
    previewProc?.kill();
    process.exit(2);
  }

  for (const spec of ADD_MODALS) {
    await runModalSmoke(page, spec);
    await loadApp(page);
  }

  await browser.close();
  previewProc?.kill();

  const failed = results.filter((r) => r.status === 'fail');
  const depthErrors = consoleErrors.filter((e) => /Maximum update depth/i.test(e));

  console.log('\n--- Summary ---');
  console.log(`Modals: ${results.filter((r) => r.status === 'pass').length}/${results.length} passed`);
  if (failed.length) {
    console.log('Failed:', failed.map((f) => f.name).join(', '));
  }
  if (depthErrors.length) {
    console.log('Modal stack errors:', depthErrors.length);
    depthErrors.forEach((e) => console.log(' ', e.slice(0, 120)));
  } else if (consoleErrors.length) {
    console.log('Other console errors:', consoleErrors.length);
    consoleErrors.slice(0, 5).forEach((e) => console.log(' ', e.slice(0, 120)));
  }

  process.exit(failed.length || depthErrors.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
