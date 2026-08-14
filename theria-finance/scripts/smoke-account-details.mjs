import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = '/home/user/theria-FinanceApp/theria-finance';
const PREVIEW_PORT = '4176';
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PREVIEW_PORT}`;
const START_PREVIEW = !process.env.BASE_URL;
const SPLASH_MS = 2600;

const USER = {
  id: '1',
  username: 'smoke',
  email: 'smoke@theria.test',
  createdAt: '2026-01-01T00:00:00.000Z',
};

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
  const previewProc = START_PREVIEW ? await startPreviewServer() : null;
  if (START_PREVIEW) await new Promise((r) => setTimeout(r, 1500));

  const browser = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('React DevTools') || text.includes('Download the React')) return;
    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.addInitScript((user) => {
    localStorage.setItem('theria-user', JSON.stringify(user));
    localStorage.setItem('theria-tutorial-disabled', 'true');
  }, USER);

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(SPLASH_MS);

  const skipSetup = page.getByText('Skip setup');
  if (await skipSetup.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skipSetup.click();
    await page.waitForTimeout(800);
  }

  // Navigate to Accounts tab (bottom nav button, identified by its aria-label)
  await page.getByLabel('Accounts', { exact: true }).click();
  await page.waitForTimeout(600);

  // Dismiss simple-mode tip if present
  const tip = page.getByRole('button', { name: 'Dismiss tip' });
  if (await tip.isVisible({ timeout: 500 }).catch(() => false)) {
    await tip.click().catch(() => {});
    await page.waitForTimeout(250);
  }

  // Add a category first (accounts screen requires a category to add an account)
  const addCategoryBtn = page.getByRole('button', { name: 'Add category' });
  if (await addCategoryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await addCategoryBtn.click();
    await page.waitForTimeout(500);
    await page.getByPlaceholder(/name/i).first().fill('Smoke Category');
    await page.waitForTimeout(200);
    const submitBtn = page.locator('form button[type="submit"]').last();
    await submitBtn.click().catch(async () => {
      await page.getByRole('button', { name: /^(Add|Save)/ }).last().click();
    });
    await page.waitForTimeout(600);
    // Let the "Category added" toast clear before it intercepts clicks below.
    await page.getByText('Added', { exact: true }).waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(500);
  }

  // Click the inline "Add account" tile for the category (accessible name is just
  // "Add" — the fuller label lives in the title attribute).
  const addAccountTile = page.getByTitle(/Add account to/i).first();
  await addAccountTile.waitFor({ state: 'visible', timeout: 5000 });
  await addAccountTile.click();
  await page.waitForTimeout(600);
  await page.getByRole('heading', { name: 'Add Account' }).waitFor({ state: 'visible', timeout: 5000 });

  await page.getByPlaceholder('Account Name').fill('Smoke Checking');
  // balance calculator input
  const balanceField = page.locator('input, [contenteditable]').filter({ hasText: '' });
  await page.getByText('Starting Balance').waitFor({ timeout: 3000 }).catch(() => {});
  // Click calculator display to open keypad, type amount
  await page.locator('text=Starting Balance').first().click().catch(() => {});
  await page.waitForTimeout(300);

  // Try typing directly via keyboard on number pad buttons "1" "0" "0"
  const keypadOne = page.getByRole('button', { name: '1', exact: true });
  if (await keypadOne.isVisible({ timeout: 1000 }).catch(() => false)) {
    await keypadOne.click();
    await page.getByRole('button', { name: '0', exact: true }).first().click();
    await page.getByRole('button', { name: '0', exact: true }).first().click();
  }
  await page.waitForTimeout(300);

  const submitAccount = page.locator('form button[type="submit"]').last();
  await submitAccount.click({ force: true }).catch(() => {});
  await page.waitForTimeout(800);

  await page.screenshot({ path: '/tmp/claude-0/-home-user-theria-FinanceApp/dc2e1d47-13c5-5982-99cb-79162573f6e4/scratchpad/debug-after-account-submit.png' });

  // Click the created account card to open details
  const accountCard = page.getByText('Smoke Checking').first();
  await accountCard.waitFor({ state: 'visible', timeout: 5000 });
  await accountCard.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: '/tmp/claude-0/-home-user-theria-FinanceApp/dc2e1d47-13c5-5982-99cb-79162573f6e4/scratchpad/debug-after-card-click.png' });

  await page.getByRole('heading', { name: 'Account Details' }).waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: '/tmp/claude-0/-home-user-theria-FinanceApp/dc2e1d47-13c5-5982-99cb-79162573f6e4/scratchpad/account-details.png' });
  console.log('Screenshot 1 saved: account details modal with new button row');

  // Click Add Income
  const addIncomeBtn = page.getByRole('button', { name: 'Add Income' });
  await addIncomeBtn.waitFor({ state: 'visible', timeout: 3000 });
  await addIncomeBtn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: '/tmp/claude-0/-home-user-theria-FinanceApp/dc2e1d47-13c5-5982-99cb-79162573f6e4/scratchpad/add-income-record.png' });
  console.log('Screenshot 2 saved: Add Income record modal (prefilled account)');

  const heading = await page.getByRole('heading', { name: /Add Income Record/i }).isVisible().catch(() => false);
  console.log('Add Income Record heading visible:', heading);

  await browser.close();
  previewProc?.kill();

  console.log('Console errors:', consoleErrors.length);
  consoleErrors.slice(0, 10).forEach((e) => console.log(' -', e.slice(0, 200)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
