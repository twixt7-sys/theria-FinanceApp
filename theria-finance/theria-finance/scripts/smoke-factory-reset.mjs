/**
 * Smoke test: the Developer "Factory reset" wipes all local state and routes
 * the next sign-in back through onboarding + the guided tutorial. Verifies the
 * login path (not just a fresh registration) re-arms onboarding.
 * Starts `vite preview` on 4183 unless BASE_URL is set.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PREVIEW_PORT = '4183';
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PREVIEW_PORT}`;
const START_PREVIEW = !process.env.BASE_URL;
const SPLASH_MS = 2600;

let preview;
let browser;
let page;
const fail = async (msg) => {
  console.error(`FAIL: ${msg}`);
  await page?.screenshot({ path: path.join(__dirname, 'factory-reset-fail.png') }).catch(() => {});
  if (browser) await browser.close();
  if (preview) preview.kill();
  process.exit(1);
};

if (START_PREVIEW) {
  preview = spawn('npx', ['vite', 'preview', '--port', PREVIEW_PORT, '--strictPort'], {
    cwd: PROJECT_ROOT,
    shell: true,
    stdio: 'ignore',
  });
  await new Promise((r) => setTimeout(r, 3000));
}

browser = await chromium.launch();
page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.setDefaultTimeout(8000);

const walkOnboarding = async () => {
  await page.getByRole('button', { name: "Let's go!" }).click();
  await page.getByText('Philippine Peso').click();
  await page.getByRole('button', { name: 'Set as main' }).click();
  await page.getByRole('button', { name: 'Continue' }).click(); // currencies
  await page.getByRole('button', { name: 'Continue' }).click(); // categories
  await page.getByRole('button', { name: 'Continue' }).click(); // accounts
  await page.getByRole('button', { name: 'Continue' }).click(); // income
  await page.getByRole('button', { name: 'Continue' }).click(); // expenses
  await page.getByRole('button', { name: '25–34' }).click();
  await page.getByRole('button', { name: 'Continue' }).click(); // about you
  await page.getByRole('button', { name: 'Looks good!' }).click(); // reminder
  await page.getByRole('button', { name: 'Take me to my dashboard' }).click();
};

try {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(SPLASH_MS);

  // Register + onboard once so there's real state to wipe.
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.fill('#username', 'ResetUser');
  await page.fill('#email', 'smoke-reset@theria.test');
  await page.fill('#password', 'hunter2secure');
  await page.getByRole('button', { name: 'Create account' }).click();
  await walkOnboarding();

  // Dismiss the auto tutorial so we can reach Settings.
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).waitFor({ state: 'detached' });

  // Load sample data so the wipe has something to remove.
  await page.getByRole('button', { name: 'Profile menu' }).click();
  await page.getByText('Settings', { exact: true }).first().click();
  await page.getByText('Developer').click();
  await page.getByRole('button', { name: 'Populate database' }).click();
  await page.getByRole('button', { name: 'Populate sample data' }).click();
  const before = await page.evaluate(() => ({
    accounts: JSON.parse(localStorage.getItem('theria-accounts') ?? '[]').length,
    user: !!localStorage.getItem('theria-user'),
  }));
  if (before.accounts < 1 || !before.user) await fail(`no state to wipe: ${JSON.stringify(before)}`);
  console.log(`ok: seeded state before reset (${before.accounts} accounts, session present)`);

  // --- Factory reset ---
  await page.getByText('Factory reset').click();
  await page.getByRole('button', { name: 'Wipe and reload' }).click();
  await page.waitForTimeout(SPLASH_MS + 800);

  const after = await page.evaluate(() => ({
    user: localStorage.getItem('theria-user'),
    accounts: localStorage.getItem('theria-accounts'),
    tutorialCompleted: localStorage.getItem('theria-tutorial-completed'),
    tutorialDisabled: localStorage.getItem('theria-tutorial-disabled'),
    pending: localStorage.getItem('theria-onboarding-pending'),
  }));
  if (after.user !== null) await fail(`session survived reset: ${after.user}`);
  if (after.accounts !== null) await fail(`accounts survived reset: ${after.accounts}`);
  if (after.tutorialCompleted !== null)
    await fail(`tutorial progress survived reset: ${after.tutorialCompleted}`);
  if (after.tutorialDisabled !== null)
    await fail(`tutorial-disabled survived reset: ${after.tutorialDisabled}`);
  if (after.pending !== 'true') await fail(`onboarding not re-armed: ${after.pending}`);
  console.log('ok: factory reset wiped data, signed out, and re-armed onboarding');

  // Auth screen should be back (login mode by default).
  await page.getByRole('button', { name: 'Sign in' }).waitFor();

  // --- Signing in (NOT registering) must still run onboarding ---
  await page.fill('#email', 'smoke-reset@theria.test');
  await page.fill('#password', 'hunter2secure');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: "Let's go!" }).waitFor();
  console.log('ok: signing in after reset launches onboarding again');

  await walkOnboarding();

  // Tutorial must auto-start again on the fresh dashboard.
  await page.getByRole('button', { name: 'Skip tutorial' }).waitFor();
  await page.getByText("Terry · Hi, I'm Terry!").waitFor();
  console.log('ok: guided tutorial auto-starts again after reset');

  console.log('PASS: factory reset smoke complete');
} catch (err) {
  console.error('FAIL:', err.message);
  await page.screenshot({ path: path.join(__dirname, 'factory-reset-fail.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  if (preview) preview.kill();
}
