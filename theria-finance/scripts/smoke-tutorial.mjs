/**
 * Smoke test: after onboarding, verify Terry's guided tutorial —
 * auto-start on the dashboard, stepping + spotlight, "Skip tutorial",
 * per-screen auto-start, and the Settings replay control.
 * Starts `vite preview` on 4180 unless BASE_URL is set.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PREVIEW_PORT = '4180';
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PREVIEW_PORT}`;
const START_PREVIEW = !process.env.BASE_URL;
const SPLASH_MS = 2600;

let preview;
const fail = async (msg) => {
  console.error(`FAIL: ${msg}`);
  await page?.screenshot({ path: path.join(__dirname, 'tutorial-fail.png') }).catch(() => {});
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.setDefaultTimeout(8000);

try {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(SPLASH_MS);

  // --- Register + walk onboarding (mirrors smoke-onboarding) ---
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.fill('#username', 'TourUser');
  await page.fill('#email', 'smoke-tutorial@theria.test');
  await page.fill('#password', 'hunter2secure');
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.getByRole('button', { name: "Let's go!" }).click();
  await page.getByText('Philippine Peso').click();
  await page.getByRole('button', { name: 'Set as main' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click(); // categories
  await page.getByRole('button', { name: 'Continue' }).click(); // accounts
  await page.getByRole('button', { name: 'Continue' }).click(); // income
  await page.getByRole('button', { name: 'Continue' }).click(); // expenses
  await page.getByRole('button', { name: '25–34' }).click();
  await page.getByRole('button', { name: 'Continue' }).click(); // about you
  await page.getByRole('button', { name: 'Looks good!' }).click(); // reminder
  await page.getByRole('button', { name: 'Take me to my dashboard' }).click();

  // --- Tutorial should auto-start on the dashboard ---
  await page.getByRole('button', { name: 'Skip tutorial' }).waitFor();
  await page.getByText("Terry · Hi, I'm Terry!").waitFor();
  await page.getByText('1 of 8').waitFor();
  console.log('ok: home tutorial auto-started with welcome step');

  const sidebar = page.locator('.w-80');
  const gotoFeature = async (label) => {
    await page.locator('[data-tour="nav-menu"]').click();
    await sidebar.getByRole('button', { name: label, exact: true }).click();
  };

  // --- Full home tour: the bottom-nav step (6 of 8) must stay reachable so
  //     Next is clickable there (regression: the bubble ran off-screen). ---
  for (let i = 2; i <= 6; i++) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText(`${i} of 8`).waitFor();
  }
  console.log('ok: stepped down to the bottom-nav step (6 of 8), Next still reachable');
  await page.getByRole('button', { name: 'Next', exact: true }).click(); // bottom-nav → fab
  await page.getByText('7 of 8').waitFor();
  await page.getByRole('button', { name: 'Next', exact: true }).click(); // fab → nav-menu
  await page.getByText('8 of 8').waitFor();

  // --- Finishing with "Got it" must not loop back to the start. ---
  await page.getByRole('button', { name: 'Got it' }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).waitFor({ state: 'detached' });
  await page.waitForTimeout(2500);
  if ((await page.getByRole('button', { name: 'Skip tutorial' }).count()) > 0)
    await fail('home tour re-appeared after Got it (loop)');
  const homeDone = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('theria-tutorial-completed') ?? '[]'),
  );
  if (!homeDone.includes('home')) await fail(`home not completed: ${JSON.stringify(homeDone)}`);
  console.log('ok: home tour finished on "Got it" and did not loop');

  // --- Skip tutorial from a feature screen disables auto-start ---
  await gotoFeature('Streams');
  await page.getByRole('button', { name: 'Skip tutorial' }).waitFor();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).waitFor({ state: 'detached' });
  const afterSkip = await page.evaluate(() => ({
    disabled: localStorage.getItem('theria-tutorial-disabled'),
    completed: JSON.parse(localStorage.getItem('theria-tutorial-completed') ?? '[]'),
  }));
  if (afterSkip.disabled !== 'true') await fail(`disabled not set after skip: ${afterSkip.disabled}`);
  if (!afterSkip.completed.includes('streams'))
    await fail(`streams not completed after skip: ${JSON.stringify(afterSkip.completed)}`);
  console.log('ok: Skip tutorial disables auto-start and marks the screen done');

  // Disabled → no auto-start on Budget.
  await gotoFeature('Budget');
  await page.waitForTimeout(1200);
  if ((await page.getByRole('button', { name: 'Skip tutorial' }).count()) > 0)
    await fail('tutorial auto-started while disabled');
  console.log('ok: no auto-start while disabled');

  // --- Settings replay re-enables and resets progress ---
  await page.getByRole('button', { name: 'Profile menu' }).click();
  await page.getByText('Settings', { exact: true }).first().click();
  await page.getByText('Help & tutorial').click();
  await page.getByText('Replay app tutorial').click();
  const afterReplay = await page.evaluate(() => ({
    disabled: localStorage.getItem('theria-tutorial-disabled'),
    completed: JSON.parse(localStorage.getItem('theria-tutorial-completed') ?? '[]'),
  }));
  if (afterReplay.disabled !== null)
    await fail(`replay did not clear disabled flag: ${afterReplay.disabled}`);
  if (afterReplay.completed.length !== 0)
    await fail(`replay did not reset progress: ${JSON.stringify(afterReplay.completed)}`);
  console.log('ok: Settings replay re-enables tips and resets progress');

  // --- Interactive hands-on add on Records (kept last: leaves a sheet open) ---
  await gotoFeature('Records');
  await page.getByText('Terry · Records').waitFor();
  await page.getByRole('button', { name: 'Next', exact: true }).click(); // intro → add step
  await page.getByText('Tap the highlighted + button').waitFor();
  console.log('ok: records tour reached the hands-on add step');

  await page.getByRole('button', { name: "Let's add your first record" }).click(); // spotlight catcher
  await page.getByText('Add it and Terry will continue…').waitFor();
  await page.getByText('Add Expense Record').waitFor();
  console.log('ok: tapping the spotlight opened the add sheet and Terry stepped aside');

  // Saving a record dispatches this event; simulate it to confirm the resume.
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent('theria:item-added', { detail: { kind: 'record' } })),
  );
  await page.getByText('Terry · Nicely done!').waitFor();
  await page.getByRole('button', { name: 'Got it' }).click();
  const recDone = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('theria-tutorial-completed') ?? '[]'),
  );
  if (!recDone.includes('records')) await fail(`records not completed: ${JSON.stringify(recDone)}`);
  console.log('ok: adding an item resumed the tour and completed the records tour');

  console.log('PASS: tutorial smoke complete');
} catch (err) {
  console.error('FAIL:', err.message);
  await page.screenshot({ path: path.join(__dirname, 'tutorial-fail.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  if (preview) preview.kill();
}
