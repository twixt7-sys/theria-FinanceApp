import type { BuddyMood } from '../../shared/components/FinanceBuddy';

/** What Terry says on a screen, and how he feels about it. */
export interface TerryContent {
  lines: string[];
  mood: BuddyMood;
}

/** Screens format money with the user's currency, so they pass their formatter in. */
type Money = (amount: number) => string;

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

export function buildDashboardTerry(p: {
  hasActivity: boolean;
  netFlow: number;
  periodLabel: string;
  formattedBalance: string;
  topSpending?: { name: string; share: number } | null;
  money: Money;
}): TerryContent {
  const { hasActivity, netFlow, periodLabel, formattedBalance, topSpending, money } = p;
  const lines: string[] = [];

  if (!hasActivity) {
    lines.push(`Nothing logged for ${periodLabel} yet. Tap the + button and I'll keep track for you!`);
  } else if (netFlow > 0) {
    lines.push(`You kept **${money(netFlow)}** ${periodLabel}. That's how it's done!`);
  } else if (netFlow === 0) {
    lines.push(`Perfectly balanced — money in matched money out ${periodLabel}.`);
  } else {
    lines.push(
      `Heads up — you spent **${money(Math.abs(netFlow))}** more than you made ${periodLabel}. Let's ease up a little.`,
    );
  }

  if (topSpending) {
    lines.push(`Most of your spending went to **${topSpending.name}** — about **${topSpending.share}%** of it.`);
  }
  lines.push(`Your total balance sits at **${formattedBalance}**. I'm keeping an eye on it!`);
  lines.push('Tip: logging records right after you spend keeps everything accurate.');

  return { lines, mood: !hasActivity ? 'neutral' : netFlow >= 0 ? 'happy' : 'concerned' };
}

export function buildRecordsTerry(p: {
  count: number;
  netFlow: number;
  income: number;
  expenses: number;
  money: Money;
}): TerryContent {
  const { count, netFlow, income, expenses, money } = p;

  if (count === 0) {
    return {
      mood: 'neutral',
      lines: [
        'No records for this period — tap the + button and log your first one!',
        'Logging right after you spend takes 30 seconds. Future you says thanks.',
      ],
    };
  }

  return {
    mood: netFlow >= 0 ? 'happy' : 'concerned',
    lines: [
      netFlow >= 0
        ? `Nice — you're **${money(netFlow)}** ahead this period. Money in beat money out!`
        : `Heads up — you spent **${money(Math.abs(netFlow))}** more than you earned this period.`,
      `That's **${count}** ${plural(count, 'record', 'records')}: **${money(income)}** in, **${money(expenses)}** out.`,
      'Tap any record to see its full story — or fix a typo.',
    ],
  };
}

export function buildBudgetTerry(p: {
  budgetCount: number;
  overBudgetCount: number;
  totalSpent: number;
  totalBudget: number;
  overallPct: number;
  money: Money;
}): TerryContent {
  const { budgetCount, overBudgetCount, totalSpent, totalBudget, overallPct, money } = p;

  if (budgetCount === 0) {
    return {
      mood: 'neutral',
      lines: [
        'No budgets yet — tap the + button and give your spending some guardrails!',
        'Start with one budget for your biggest expense. Groceries is a classic.',
      ],
    };
  }

  return {
    mood: overBudgetCount > 0 ? 'concerned' : 'happy',
    lines: [
      `You've used **${money(totalSpent)}** of **${money(totalBudget)}** budgeted — that's **${Math.round(overallPct * 100)}%**.`,
      overBudgetCount > 0
        ? `Careful — **${overBudgetCount}** ${plural(overBudgetCount, 'budget is', 'budgets are')} over the limit. Let's rein it in!`
        : `All **${budgetCount}** budgets are within their limits. Look at you go!`,
      'Tip: a budget you never bust might be ready for a lower limit.',
    ],
  };
}

export function buildSavingsTerry(p: {
  savingsCount: number;
  totalSaved: number;
  overallPct: number;
  fundedCount: number;
  nextWin?: { name: string; remaining: number } | null;
  money: Money;
}): TerryContent {
  const { savingsCount, totalSaved, overallPct, fundedCount, nextWin, money } = p;

  if (savingsCount === 0) {
    return {
      mood: 'neutral',
      lines: [
        "Nothing saved yet — tap the + button and let's start your first goal!",
        'A small emergency fund is a great first step. I believe in you!',
      ],
    };
  }

  const lines = [
    `You've saved **${money(totalSaved)}** — that's **${Math.round(overallPct * 100)}%** of everything you're aiming for!`,
  ];
  if (nextWin) {
    lines.push(
      `**${nextWin.name}** is closest to the finish — just **${money(Math.max(nextWin.remaining, 0))}** to go!`,
    );
  }
  if (fundedCount > 0) {
    lines.push(
      `**${fundedCount}** of your savings ${plural(fundedCount, 'is', 'are')} fully funded. That's how it's done!`,
    );
  }
  lines.push('Tip: small, regular deposits beat big rare ones. Keep it steady!');

  return { lines, mood: overallPct >= 0.5 ? 'happy' : 'neutral' };
}

export function buildStreamsTerry(p: {
  totalStreamCount: number;
  incomeCount: number;
  expenseCount: number;
  topStream?: { name: string; net: number } | null;
  money: Money;
}): TerryContent {
  const { totalStreamCount, incomeCount, expenseCount, topStream, money } = p;

  if (totalStreamCount === 0) {
    return {
      mood: 'neutral',
      lines: [
        'No streams yet — they name where money comes from and where it goes!',
        'Tap the + button and start with your salary and your groceries.',
      ],
    };
  }

  const lines = [
    `You track **${incomeCount}** income ${plural(incomeCount, 'stream', 'streams')} and **${expenseCount}** expense ${plural(expenseCount, 'stream', 'streams')}.`,
  ];
  if (topStream) {
    lines.push(
      `**${topStream.name}** is your busiest stream — **${money(Math.abs(topStream.net))}** ${topStream.net >= 0 ? 'in' : 'out'} overall.`,
    );
  }
  lines.push('Tip: a stream per habit beats one giant "Other" bucket.');

  return { lines, mood: 'happy' };
}

export function buildCategoriesTerry(p: {
  categoryCount: number;
  accountCategoryCount: number;
  streamCategoryCount: number;
}): TerryContent {
  const { categoryCount, accountCategoryCount, streamCategoryCount } = p;

  if (categoryCount === 0) {
    return {
      mood: 'neutral',
      lines: [
        'No categories yet — they keep your accounts and streams tidy!',
        'Tap the + button to make your first drawer. "Cash & Bank" is a classic.',
      ],
    };
  }

  return {
    mood: 'happy',
    lines: [
      `Your filing system: **${accountCategoryCount}** account ${plural(accountCategoryCount, 'category', 'categories')} and **${streamCategoryCount}** for streams.`,
      'Tap a category to peek inside — colors and icons are all editable.',
      'Tip: fewer, clearer categories beat a drawer for everything.',
    ],
  };
}

export function buildAccountsTerry(p: {
  accountCount: number;
  allBalance: number;
  savingsAccountCount: number;
  biggest?: { name: string; formattedBalance: string } | null;
  money: Money;
}): TerryContent {
  const { accountCount, allBalance, savingsAccountCount, biggest, money } = p;

  if (accountCount === 0) {
    return {
      mood: 'neutral',
      lines: [
        'No accounts yet — tap the + button and tell me where your money lives!',
        'Start with your wallet and your main bank account.',
      ],
    };
  }

  const lines = [
    `You've got **${money(allBalance)}** across **${accountCount}** ${plural(accountCount, 'account', 'accounts')}.`,
  ];
  if (biggest) {
    lines.push(`**${biggest.name}** holds the most — **${biggest.formattedBalance}**.`);
  }
  if (savingsAccountCount > 0) {
    lines.push(
      `**${savingsAccountCount}** of them ${plural(savingsAccountCount, 'is', 'are')} savings — future you approves!`,
    );
  }
  lines.push('Tap an account to edit it, or use the filter to browse by category.');

  return { lines, mood: allBalance >= 0 ? 'happy' : 'concerned' };
}
