/**
 * Smoke test: register a fresh account and walk Terry's guided setup
 * end-to-end, then assert the seeded data landed in localStorage.
 * Starts `vite preview` on 4179 unless BASE_URL is set.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PREVIEW_PORT = '4179';
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PREVIEW_PORT}`;
const START_PREVIEW = !process.env.BASE_URL;
const SPLASH_MS = 2600;

let preview;
const fail = async (msg) => {
  console.error(`FAIL: ${msg}`);
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.setDefaultTimeout(8000);

try {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(SPLASH_MS);

  // Register a brand-new account
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.fill('#username', 'SmokeUser');
  await page.fill('#email', 'smoke-onboarding@theria.test');
  await page.fill('#password', 'hunter2secure');
  await page.getByRole('button', { name: 'Create account' }).click();

  // Welcome
  await page.getByText("I'm", { exact: false }).waitFor();
  console.log('ok: welcome step shown after registration');
  await page.getByRole('button', { name: "Let's go!" }).click();

  // Currencies: enable PHP and crown it main
  await page.getByText('Philippine Peso').click();
  await page.getByRole('button', { name: 'Set as main' }).click();
  await page.getByRole('button', { name: 'Main currency' }).waitFor();
  console.log('ok: PHP enabled and set as main');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Categories: toggle one non-popular on top of defaults
  await page.getByRole('button', { name: 'Health', exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Accounts: give Cash Wallet a starting balance
  await page.getByPlaceholder('Starting balance').first().fill('5000');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Income + expenses: keep popular defaults
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // About you
  await page.getByRole('button', { name: '25–34' }).click();
  await page.getByRole('button', { name: 'Track daily spending' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Reminder: weekdays
  await page.getByRole('button', { name: 'Weekdays' }).click();
  await page.getByRole('button', { name: 'Looks good!' }).click();

  // Finish
  await page.getByText("You're all set!").waitFor();
  console.log('ok: finish step reached');
  await page.getByRole('button', { name: 'Take me to my dashboard' }).click();

  // Dashboard appears
  await page.getByText('Dashboard').first().waitFor();
  console.log('ok: dashboard visible after finishing setup');

  const state = await page.evaluate(() => ({
    pending: localStorage.getItem('theria-onboarding-pending'),
    currencies: JSON.parse(localStorage.getItem('theria-currencies') ?? 'null'),
    accounts: JSON.parse(localStorage.getItem('theria-accounts') ?? '[]'),
    streams: JSON.parse(localStorage.getItem('theria-streams') ?? '[]'),
    categories: JSON.parse(localStorage.getItem('theria-categories') ?? '[]'),
    reminder: JSON.parse(localStorage.getItem('theria-reminder-schedule') ?? 'null'),
    insights: JSON.parse(localStorage.getItem('theria-onboarding-insights') ?? 'null'),
  }));

  if (state.pending !== null) await fail('onboarding pending flag not cleared');
  if (state.currencies?.mainCurrency !== 'PHP') await fail(`main currency: ${state.currencies?.mainCurrency}`);
  if (!state.currencies?.enabledCurrencies?.includes('USD')) await fail('USD dropped from enabled');
  const wallet = state.accounts.find((a) => a.name === 'Cash Wallet');
  if (!wallet || wallet.balance !== 5000) await fail(`Cash Wallet balance: ${wallet?.balance}`);
  if (wallet.currency !== 'PHP') await fail(`Cash Wallet currency: ${wallet.currency}`);
  if (state.accounts.length < 5) await fail(`too few accounts: ${state.accounts.length}`);
  const incomes = state.streams.filter((s) => s.type === 'income').length;
  const expenses = state.streams.filter((s) => s.type === 'expense').length;
  if (incomes < 2 || expenses < 5) await fail(`streams thin: ${incomes} income / ${expenses} expense`);
  if (!state.streams.some((s) => s.id === 'unaccounted')) await fail('system stream missing');
  const healthCat = state.categories.find((c) => c.name === 'Health');
  if (!healthCat) await fail('extra-toggled Health category not seeded');
  if (!state.categories.some((c) => c.scope === 'account')) await fail('no account categories');
  if (state.reminder?.frequency !== 'weekdays' || state.reminder?.enabled !== true)
    await fail(`reminder: ${JSON.stringify(state.reminder)}`);
  if (state.insights?.ageRange !== '25–34' || !state.insights?.useCases?.includes('track-spending'))
    await fail(`insights: ${JSON.stringify(state.insights)}`);

  // Every account's category must exist (schema requires it)
  const catIds = new Set(state.categories.map((c) => c.id));
  const orphan = state.accounts.find((a) => !catIds.has(a.categoryId));
  if (orphan) await fail(`account with missing category: ${orphan.name}`);

  console.log(`ok: seeded ${state.accounts.length} accounts, ${state.streams.length} streams, ${state.categories.length} categories`);

  // Reload: onboarding must NOT reappear for the now-existing user
  await page.reload();
  await page.waitForTimeout(SPLASH_MS);
  await page.getByText('Dashboard').first().waitFor();
  const buddyIntro = await page.getByRole('button', { name: "Let's go!" }).count();
  if (buddyIntro > 0) await fail('onboarding reappeared after completion');
  console.log('ok: onboarding does not reappear after reload');

  console.log('PASS: onboarding smoke complete');
} catch (err) {
  console.error('FAIL:', err.message);
  await page.screenshot({ path: new URL('./onboarding-fail.png', import.meta.url).pathname.slice(1) }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  if (preview) preview.kill();
}
