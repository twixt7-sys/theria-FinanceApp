import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../../core/state/AuthContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useData, type Account, type Category, type Stream } from '../../../core/state/DataContext';
import { getCurrencyMeta, type CurrencyCode } from '../../../shared/lib/currencies';
import {
  DEFAULT_REMINDER_SCHEDULE,
  saveOnboardingInsights,
  saveReminderSchedule,
  type ReminderSchedule,
} from '../../../core/lib/onboardingStorage';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
import { AppPageBackground } from '../../../shared/components/AppPageBackground';
import { TheriaBrandLogo, TheriaBrandWordmark } from '../../../shared/components/TheriaBrandLogo';
import {
  ACCOUNT_CATEGORY_TEMPLATES,
  STREAM_CATEGORY_TEMPLATES,
  ACCOUNT_TEMPLATES,
  INCOME_STREAM_TEMPLATES,
  EXPENSE_STREAM_TEMPLATES,
} from '../lib/onboardingTemplates';
import { StepWelcome } from '../components/StepWelcome';
import { StepCurrencies } from '../components/StepCurrencies';
import { StepCategories } from '../components/StepCategories';
import { StepAccounts } from '../components/StepAccounts';
import { StepStreams } from '../components/StepStreams';
import { StepAboutYou, type AboutYouAnswers } from '../components/StepAboutYou';
import { StepReminder } from '../components/StepReminder';
import { StepFinish } from '../components/StepFinish';

interface OnboardingScreenProps {
  /** Called once setup is applied (or skipped) — clears the pending flag upstream. */
  onComplete: () => void;
}

type StepId =
  | 'welcome'
  | 'currencies'
  | 'categories'
  | 'accounts'
  | 'income'
  | 'expenses'
  | 'about'
  | 'reminder'
  | 'finish';

const STEP_ORDER: StepId[] = [
  'welcome',
  'currencies',
  'categories',
  'accounts',
  'income',
  'expenses',
  'about',
  'reminder',
  'finish',
];

/** Steps that count toward the progress bar (welcome/finish are bookends). */
const PROGRESS_STEPS = STEP_ORDER.slice(1, -1);

const TERRY_LINES: Record<StepId, { lines: string[]; mood: BuddyMood }> = {
  welcome: { lines: [], mood: 'happy' },
  currencies: {
    mood: 'happy',
    lines: [
      'First things first — money comes in different flavors!',
      'Tap every currency you use, even the occasional ones.',
      'Crown one as your **main currency** — all totals show up in it.',
    ],
  },
  categories: {
    mood: 'happy',
    lines: [
      'Categories are like labeled drawers for your money.',
      'Pick whatever sounds like your life — no wrong answers.',
      'You can always add your own drawers later!',
    ],
  },
  accounts: {
    mood: 'happy',
    lines: [
      'Accounts are the places your money actually sits.',
      'Wallets, banks, e-wallets — toggle everything you use.',
      'A rough **starting balance** is plenty. We can fix it later!',
    ],
  },
  income: {
    mood: 'happy',
    lines: [
      'Now my favorite part — money coming **in**!',
      'Toggle every way cash reaches you, big or small.',
      'Side hustles count. Birthday money counts too!',
    ],
  },
  expenses: {
    mood: 'neutral',
    lines: [
      'And now… where money sneaks away.',
      "Be honest with these — I don't judge. Much.",
      'The **popular** picks cover most people’s month.',
    ],
  },
  about: {
    mood: 'happy',
    lines: [
      'Mind sharing a little about you? Totally **optional**.',
      'It stays on your device — pinky promise.',
      'It just helps Theria grow up to fit people like you.',
    ],
  },
  reminder: {
    mood: 'happy',
    lines: [
      'Tiny habits beat big plans. When should I nudge you?',
      'Most folks log right after dinner — takes 30 seconds.',
      'You can silence me anytime in Settings. Rude, but allowed.',
    ],
  },
  finish: { lines: [], mood: 'happy' },
};

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 44 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -44 }),
};

const toggleInSet = (set: Set<string>, id: string) => {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

const popularIds = (templates: Array<{ id: string; popular?: boolean }>) =>
  templates.filter((t) => t.popular).map((t) => t.id);

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { setCurrencySelection } = useCurrency();
  const { seedData } = useData();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isApplying, setIsApplying] = useState(false);

  // Selections — popular templates start on so the flow feels alive immediately.
  const [enabledCurrencies, setEnabledCurrencies] = useState<CurrencyCode[]>(['USD']);
  const [mainCurrency, setMain] = useState<CurrencyCode>('USD');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set([...popularIds(ACCOUNT_CATEGORY_TEMPLATES), ...popularIds(STREAM_CATEGORY_TEMPLATES)]),
  );
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(
    () => new Set(popularIds(ACCOUNT_TEMPLATES)),
  );
  const [accountBalances, setAccountBalances] = useState<Record<string, string>>({});
  const [selectedIncome, setSelectedIncome] = useState<Set<string>>(
    () => new Set(popularIds(INCOME_STREAM_TEMPLATES)),
  );
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    () => new Set(popularIds(EXPENSE_STREAM_TEMPLATES)),
  );
  const [aboutYou, setAboutYou] = useState<AboutYouAnswers>({ useCases: [] });
  const [reminder, setReminder] = useState<ReminderSchedule>(DEFAULT_REMINDER_SCHEDULE);

  const step = STEP_ORDER[stepIndex];
  const progressIndex = PROGRESS_STEPS.indexOf(step as (typeof PROGRESS_STEPS)[number]);

  const mainCurrencySymbol = useMemo(
    () => getCurrencyMeta(mainCurrency)?.symbol ?? mainCurrency,
    [mainCurrency],
  );

  /** Categories that must exist because a selected account/stream points at them. */
  const buildSeedPayload = () => {
    const now = new Date().toISOString();
    // Setup can run more than once (developer settings re-launches it), so
    // template ids get a per-run suffix to keep seeded ids unique.
    const runTag = Date.now().toString(36);
    const sid = (id: string) => `${id}-${runTag}`;
    const pickedAccounts = ACCOUNT_TEMPLATES.filter((a) => selectedAccounts.has(a.id));
    const pickedStreams = [
      ...INCOME_STREAM_TEMPLATES.filter((s) => selectedIncome.has(s.id)),
      ...EXPENSE_STREAM_TEMPLATES.filter((s) => selectedExpenses.has(s.id)),
    ];

    // Accounts require a category, so referenced account categories are
    // auto-included even when untoggled; stream categories stay opt-in.
    const requiredAccountCategoryIds = new Set(pickedAccounts.map((a) => a.categoryId));
    const categories: Category[] = [
      ...ACCOUNT_CATEGORY_TEMPLATES.filter(
        (c) => selectedCategories.has(c.id) || requiredAccountCategoryIds.has(c.id),
      ),
      ...STREAM_CATEGORY_TEMPLATES.filter((c) => selectedCategories.has(c.id)),
    ].map((c) => ({
      id: sid(c.id),
      name: c.name,
      scope: c.scope,
      iconName: c.iconName,
      color: c.color,
      createdAt: now,
    }));

    // Template ids of every category that made the cut (before suffixing).
    const includedCategoryIds = new Set([
      ...ACCOUNT_CATEGORY_TEMPLATES.filter(
        (c) => selectedCategories.has(c.id) || requiredAccountCategoryIds.has(c.id),
      ).map((c) => c.id),
      ...STREAM_CATEGORY_TEMPLATES.filter((c) => selectedCategories.has(c.id)).map((c) => c.id),
    ]);

    const accounts: Account[] = pickedAccounts.map((a) => ({
      id: sid(a.id),
      name: a.name,
      balance: parseFloat(accountBalances[a.id] ?? '') || 0,
      categoryId: sid(a.categoryId),
      iconName: a.iconName,
      color: a.color,
      isSavings: a.isSavings,
      cardType: a.cardType,
      currency: mainCurrency,
      createdAt: now,
    }));

    const streams: Stream[] = pickedStreams.map((s) => ({
      id: sid(s.id),
      name: s.name,
      type: s.type,
      iconName: s.iconName,
      color: s.color,
      categoryId:
        s.categoryId && includedCategoryIds.has(s.categoryId) ? sid(s.categoryId) : undefined,
      createdAt: now,
    }));

    return { categories, accounts, streams };
  };

  const seedPreview = useMemo(
    () => (step === 'finish' ? buildSeedPayload() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step],
  );

  const applyAndFinish = () => {
    if (isApplying) return;
    setIsApplying(true);

    setCurrencySelection(mainCurrency, enabledCurrencies);
    seedData(buildSeedPayload());
    saveOnboardingInsights(aboutYou);
    saveReminderSchedule(reminder);
    onComplete();
  };

  const goNext = () => {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const toggleCurrency = (code: CurrencyCode) => {
    if (code === mainCurrency) return; // the main currency stays on
    setEnabledCurrencies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const setMainCurrencyChoice = (code: CurrencyCode) => {
    setMain(code);
    setEnabledCurrencies((prev) => (prev.includes(code) ? prev : [...prev, code]));
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <StepWelcome username={user?.username ?? 'there'} />;
      case 'currencies':
        return (
          <StepCurrencies
            enabled={enabledCurrencies}
            main={mainCurrency}
            onToggle={toggleCurrency}
            onSetMain={setMainCurrencyChoice}
          />
        );
      case 'categories':
        return (
          <StepCategories
            selected={selectedCategories}
            onToggle={(id) => setSelectedCategories((prev) => toggleInSet(prev, id))}
            onSelectPopular={() =>
              setSelectedCategories(
                new Set([
                  ...popularIds(ACCOUNT_CATEGORY_TEMPLATES),
                  ...popularIds(STREAM_CATEGORY_TEMPLATES),
                ]),
              )
            }
            onClear={() => setSelectedCategories(new Set())}
          />
        );
      case 'accounts':
        return (
          <StepAccounts
            selected={selectedAccounts}
            balances={accountBalances}
            currencySymbol={mainCurrencySymbol}
            onToggle={(id) => setSelectedAccounts((prev) => toggleInSet(prev, id))}
            onBalanceChange={(id, value) =>
              setAccountBalances((prev) => ({ ...prev, [id]: value }))
            }
            onSelectPopular={() => setSelectedAccounts(new Set(popularIds(ACCOUNT_TEMPLATES)))}
            onClear={() => setSelectedAccounts(new Set())}
          />
        );
      case 'income':
        return (
          <StepStreams
            type="income"
            templates={INCOME_STREAM_TEMPLATES}
            selected={selectedIncome}
            onToggle={(id) => setSelectedIncome((prev) => toggleInSet(prev, id))}
            onSelectPopular={() => setSelectedIncome(new Set(popularIds(INCOME_STREAM_TEMPLATES)))}
            onClear={() => setSelectedIncome(new Set())}
          />
        );
      case 'expenses':
        return (
          <StepStreams
            type="expense"
            templates={EXPENSE_STREAM_TEMPLATES}
            selected={selectedExpenses}
            onToggle={(id) => setSelectedExpenses((prev) => toggleInSet(prev, id))}
            onSelectPopular={() =>
              setSelectedExpenses(new Set(popularIds(EXPENSE_STREAM_TEMPLATES)))
            }
            onClear={() => setSelectedExpenses(new Set())}
          />
        );
      case 'about':
        return <StepAboutYou answers={aboutYou} onChange={setAboutYou} />;
      case 'reminder':
        return <StepReminder schedule={reminder} onChange={setReminder} />;
      case 'finish':
        return (
          <StepFinish
            currencyCount={enabledCurrencies.length}
            categoryCount={seedPreview?.categories.length ?? 0}
            accountCount={seedPreview?.accounts.length ?? 0}
            streamCount={seedPreview?.streams.length ?? 0}
          />
        );
    }
  };

  const continueLabel = (() => {
    switch (step) {
      case 'welcome':
        return "Let's go!";
      case 'reminder':
        return 'Looks good!';
      case 'finish':
        return 'Take me to my dashboard';
      default:
        return 'Continue';
    }
  })();

  const terry = TERRY_LINES[step];

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-background">
      <AppPageBackground />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/90 pt-safe backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <TheriaBrandLogo size="sm" />
            <div className="flex items-center gap-2">
              <TheriaBrandWordmark />
              <span className="text-muted-foreground" aria-hidden>
                •
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Setup</span>
            </div>
          </div>
          {step !== 'finish' && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Skip setup
            </button>
          )}
        </div>

        {/* Progress */}
        {progressIndex >= 0 && (
          <div className="mx-auto w-full max-w-lg px-4 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {PROGRESS_STEPS.map((s, i) => (
                  <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/70">
                    <motion.div
                      initial={false}
                      animate={{ scaleX: i <= progressIndex ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                ))}
              </div>
              <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
                {progressIndex + 1} / {PROGRESS_STEPS.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-32 pt-4">
        {terry.lines.length > 0 && (
          <div className="mb-4">
            <FinanceBuddy lines={terry.lines} mood={terry.mood} />
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={isApplying}
            onClick={step === 'finish' ? applyAndFinish : goNext}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {step === 'finish' ? <Sparkles size={15} /> : null}
            {continueLabel}
            {step !== 'finish' && <ArrowRight size={15} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
