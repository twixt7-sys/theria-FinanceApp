import type { BuddyMood } from '../components/FinanceBuddy';

/** One tour per main screen; the ids match App's Screen ids so we can auto-start. */
export type TutorialTourId =
  | 'home'
  | 'records'
  | 'streams'
  | 'budget'
  | 'savings'
  | 'categories'
  | 'accounts';

/** Data kinds the tutorial can wait for the user to create hands-on. */
export type TutorialAddKind =
  | 'record'
  | 'account'
  | 'stream'
  | 'budget'
  | 'savings'
  | 'category';

export interface TutorialStep {
  /**
   * `data-tour` value of the element to spotlight. Omit for a centered step
   * with no cutout (used for the welcome / wrap-up beats). If the anchor can't
   * be found at runtime, the overlay falls back to a centered step too.
   */
  target?: string;
  /** Short bold header shown above Terry's line. */
  title: string;
  /** Terry's spoken line — supports **double asterisks** for highlights. */
  body: string;
  mood?: BuddyMood;
  /**
   * Interactive step: instead of a "Next" button, the user taps the spotlighted
   * target (which forwards the real click, e.g. opening the add sheet). Requires
   * `target`.
   */
  interactive?: boolean;
  /**
   * Pairs with `interactive`: after the user taps through, wait for them to
   * actually add an item of this kind before advancing (the overlay steps aside
   * so the add sheet is usable, then resumes on success).
   */
  awaitAdd?: TutorialAddKind;
}

export interface TutorialTour {
  id: TutorialTourId;
  steps: TutorialStep[];
}

/**
 * The home tour doubles as the app-wide welcome: it walks the shared chrome
 * (time filter, bottom nav, add button, menu) so those aren't repeated on every
 * other screen's shorter tour.
 */
const HOME_TOUR: TutorialStep[] = [
  {
    title: "Hi, I'm Terry!",
    body: "Welcome to **Theria**. Let me give you a quick tour so you feel right at home. It only takes a few taps.",
    mood: 'happy',
  },
  {
    target: 'home-balance',
    title: 'Your balance',
    body: 'This ring shows your **total balance** across every account. Tap it any time to jump to your accounts.',
    mood: 'happy',
  },
  {
    target: 'home-flows',
    title: 'Money in and out',
    body: 'Here is your **income**, **expenses** and **net flow** for the period you are viewing.',
    mood: 'neutral',
  },
  {
    target: 'home-overview',
    title: 'Quick insights',
    body: 'These cards cycle through your **cashflow**, **budget health** and **savings momentum**. Swipe or tap the arrows.',
    mood: 'happy',
  },
  {
    target: 'nav-filter',
    title: 'Change the period',
    body: 'Use the filter to switch between **day, week, month** and more. Every screen follows the period you pick.',
    mood: 'neutral',
  },
  {
    target: 'bottom-nav',
    title: 'Get around',
    body: 'Jump between **Records, Streams, Budget, Savings** and more from here. The center button always brings you home.',
    mood: 'happy',
  },
  {
    target: 'fab',
    title: 'Add anything',
    body: 'This button adds a **record, stream, budget** — whatever you need. It is always one tap away.',
    mood: 'happy',
  },
  {
    target: 'nav-menu',
    title: "You're all set!",
    body: 'The full menu and your profile live up here. That is the tour — each new screen has a few tips of its own. Enjoy!',
    mood: 'happy',
  },
];

const RECORDS_TOUR: TutorialStep[] = [
  {
    title: 'Records',
    body: 'This is your **Records** screen — every transaction you log lands here, your complete money history, newest first.',
    mood: 'happy',
  },
  {
    target: 'fab',
    title: "Let's add your first record",
    body: "Tap the **+** and log a quick expense or income. Go ahead — fill it in and save. I'll wait right here!",
    mood: 'happy',
    interactive: true,
    awaitAdd: 'record',
  },
  {
    title: 'Nicely done!',
    body: "That's a real record on the books. Everything you add shows up on this screen — add as many as you like with the **+**.",
    mood: 'happy',
  },
];

const STREAMS_TOUR: TutorialStep[] = [
  {
    title: 'Streams',
    body: 'This is your **Streams** screen. Streams are your recurring income and expenses — like salary, rent or a subscription.',
    mood: 'happy',
  },
  {
    target: 'fab',
    title: 'Create your first stream',
    body: "Tap the **+** and set one up — a paycheck or a monthly bill works great. Save it and I'll continue.",
    mood: 'happy',
    interactive: true,
    awaitAdd: 'stream',
  },
  {
    title: 'Great — that will track itself now',
    body: "I'll help you keep an eye on this stream over time. You can add more whenever you like.",
    mood: 'happy',
  },
];

const BUDGET_TOUR: TutorialStep[] = [
  {
    title: 'Budgets',
    body: 'This is your **Budget** screen. Set spending limits per category and I will show you how close you are before you overspend.',
    mood: 'neutral',
  },
  {
    target: 'fab',
    title: 'Set your first budget',
    body: "Tap the **+** and pick a limit for a category. Save it — then we'll track it together.",
    mood: 'happy',
    interactive: true,
    awaitAdd: 'budget',
  },
  {
    title: "You're in control now",
    body: "I'll warn you as you get close to this limit. Add a budget for any category you want to watch.",
    mood: 'happy',
  },
];

const SAVINGS_TOUR: TutorialStep[] = [
  {
    title: 'Savings',
    body: 'This is your **Savings** screen. Track the goals and funds you are growing toward — and watch the progress add up.',
    mood: 'happy',
  },
  {
    target: 'fab',
    title: 'Start your first goal',
    body: "Tap the **+** and name something you're saving for. Save it and watch the progress bar begin.",
    mood: 'happy',
    interactive: true,
    awaitAdd: 'savings',
  },
  {
    title: 'Off to a great start!',
    body: "Every bit you add moves this goal forward. Start as many goals or funds as you like.",
    mood: 'happy',
  },
];

const CATEGORIES_TOUR: TutorialStep[] = [
  {
    title: 'Categories',
    body: 'This is your **Categories** screen. Group your streams and accounts into categories so your reports stay tidy and meaningful.',
    mood: 'neutral',
  },
  {
    target: 'fab',
    title: 'Make your first category',
    body: "Tap the **+** and create a category — like Food or Transport. Save it to keep things organised.",
    mood: 'happy',
    interactive: true,
    awaitAdd: 'category',
  },
  {
    title: 'Tidy!',
    body: "Now you can group streams and accounts under this. Add as many categories as make sense for you.",
    mood: 'happy',
  },
];

const ACCOUNTS_TOUR: TutorialStep[] = [
  {
    title: 'Accounts',
    body: 'This is your **Accounts** screen. Your wallets and bank accounts live here — your total balance is the sum of all of them.',
    mood: 'happy',
  },
  {
    target: 'fab',
    title: 'Add your first account',
    body: "Tap the **+** and add a wallet or bank account with its starting balance. Save it and I'll continue.",
    mood: 'happy',
    interactive: true,
    awaitAdd: 'account',
  },
  {
    title: 'That counts toward your balance now',
    body: "Your total balance is the sum of every account here. Add each place you keep money.",
    mood: 'happy',
  },
];

export const TUTORIAL_TOURS: Record<TutorialTourId, TutorialTour> = {
  home: { id: 'home', steps: HOME_TOUR },
  records: { id: 'records', steps: RECORDS_TOUR },
  streams: { id: 'streams', steps: STREAMS_TOUR },
  budget: { id: 'budget', steps: BUDGET_TOUR },
  savings: { id: 'savings', steps: SAVINGS_TOUR },
  categories: { id: 'categories', steps: CATEGORIES_TOUR },
  accounts: { id: 'accounts', steps: ACCOUNTS_TOUR },
};

/** App Screen ids that have a tour. Used to auto-start on first visit. */
export const TUTORIAL_TOUR_IDS = Object.keys(TUTORIAL_TOURS) as TutorialTourId[];

export function getTour(id: string): TutorialTour | null {
  return id in TUTORIAL_TOURS ? TUTORIAL_TOURS[id as TutorialTourId] : null;
}
