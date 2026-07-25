import { describe, expect, it } from 'vitest';
import {
  buildAccountsTerry,
  buildBudgetTerry,
  buildCategoriesTerry,
  buildDashboardTerry,
  buildRecordsTerry,
  buildSavingsTerry,
  buildStreamsTerry,
} from './terryLines';

const money = (amount: number) => `$${amount.toFixed(2)}`;
const joined = (content: { lines: string[] }) => content.lines.join(' ');

describe('buildDashboardTerry', () => {
  const base = { periodLabel: 'this month', formattedBalance: '$1.2k', money };

  it('nudges a first record when nothing is logged', () => {
    const terry = buildDashboardTerry({ ...base, hasActivity: false, netFlow: 0 });
    expect(terry.mood).toBe('neutral');
    expect(joined(terry)).toContain('Nothing logged for this month');
  });

  it('celebrates a surplus and worries about a deficit', () => {
    expect(buildDashboardTerry({ ...base, hasActivity: true, netFlow: 500 }).mood).toBe('happy');
    expect(buildDashboardTerry({ ...base, hasActivity: true, netFlow: -500 }).mood).toBe('concerned');
  });

  it('calls a break-even period balanced rather than negative', () => {
    const terry = buildDashboardTerry({ ...base, hasActivity: true, netFlow: 0 });
    expect(terry.mood).toBe('happy');
    expect(joined(terry)).toContain('Perfectly balanced');
  });

  it('mentions the top spending category only when there is one', () => {
    const withTop = buildDashboardTerry({
      ...base,
      hasActivity: true,
      netFlow: 10,
      topSpending: { name: 'Groceries', share: 42 },
    });
    expect(joined(withTop)).toContain('**Groceries**');
    expect(joined(withTop)).toContain('**42%**');
    expect(joined(buildDashboardTerry({ ...base, hasActivity: true, netFlow: 10 }))).not.toContain('spending went to');
  });
});

describe('buildRecordsTerry', () => {
  it('prompts when the period is empty', () => {
    const terry = buildRecordsTerry({ count: 0, netFlow: 0, income: 0, expenses: 0, money });
    expect(terry.mood).toBe('neutral');
    expect(joined(terry)).toContain('No records for this period');
  });

  it('flips to concerned when spending outpaces income', () => {
    const terry = buildRecordsTerry({ count: 3, netFlow: -50, income: 100, expenses: 150, money });
    expect(terry.mood).toBe('concerned');
    expect(joined(terry)).toContain('$50.00');
  });

  it('uses the singular for a single record', () => {
    const terry = buildRecordsTerry({ count: 1, netFlow: 10, income: 10, expenses: 0, money });
    expect(joined(terry)).toContain('**1** record:');
  });
});

describe('buildBudgetTerry', () => {
  const base = { totalSpent: 250, totalBudget: 500, overallPct: 0.5, money };

  it('warns when any budget is over its limit', () => {
    const terry = buildBudgetTerry({ ...base, budgetCount: 3, overBudgetCount: 1 });
    expect(terry.mood).toBe('concerned');
    expect(joined(terry)).toContain('**1** budget is over the limit');
  });

  it('is happy when everything is within its limit', () => {
    const terry = buildBudgetTerry({ ...base, budgetCount: 3, overBudgetCount: 0 });
    expect(terry.mood).toBe('happy');
    expect(joined(terry)).toContain('All **3** budgets');
  });

  it('reports the used percentage', () => {
    const terry = buildBudgetTerry({ ...base, budgetCount: 1, overBudgetCount: 0 });
    expect(joined(terry)).toContain('**50%**');
  });
});

describe('buildSavingsTerry', () => {
  const base = { totalSaved: 500, fundedCount: 0, money };

  it('encourages a first goal when there are none', () => {
    const terry = buildSavingsTerry({ ...base, savingsCount: 0, overallPct: 0 });
    expect(terry.mood).toBe('neutral');
  });

  it('turns happy past the halfway mark', () => {
    expect(buildSavingsTerry({ ...base, savingsCount: 2, overallPct: 0.5 }).mood).toBe('happy');
    expect(buildSavingsTerry({ ...base, savingsCount: 2, overallPct: 0.49 }).mood).toBe('neutral');
  });

  it('points at the closest goal and never shows a negative remainder', () => {
    const terry = buildSavingsTerry({
      ...base,
      savingsCount: 2,
      overallPct: 0.8,
      nextWin: { name: 'New Car', remaining: -25 },
    });
    expect(joined(terry)).toContain('**New Car**');
    expect(joined(terry)).toContain('$0.00');
  });
});

describe('buildStreamsTerry', () => {
  it('explains streams when there are none', () => {
    const terry = buildStreamsTerry({ totalStreamCount: 0, incomeCount: 0, expenseCount: 0, money });
    expect(terry.mood).toBe('neutral');
  });

  it('describes the busiest stream by direction', () => {
    const out = buildStreamsTerry({
      totalStreamCount: 2,
      incomeCount: 1,
      expenseCount: 1,
      topStream: { name: 'Rent', net: -1200 },
      money,
    });
    expect(joined(out)).toContain('**Rent**');
    expect(joined(out)).toContain('$1200.00');
    expect(joined(out)).toContain('out overall');
  });
});

describe('buildCategoriesTerry', () => {
  it('pluralises the account category count', () => {
    const one = buildCategoriesTerry({ categoryCount: 1, accountCategoryCount: 1, streamCategoryCount: 0 });
    expect(joined(one)).toContain('**1** account category');

    const many = buildCategoriesTerry({ categoryCount: 3, accountCategoryCount: 2, streamCategoryCount: 1 });
    expect(joined(many)).toContain('**2** account categories');
  });
});

describe('buildAccountsTerry', () => {
  const base = { allBalance: 1000, savingsAccountCount: 0, money };

  it('turns concerned when the total is negative', () => {
    expect(buildAccountsTerry({ ...base, accountCount: 2, allBalance: -5 }).mood).toBe('concerned');
  });

  it('shows the biggest account in its own currency', () => {
    const terry = buildAccountsTerry({
      ...base,
      accountCount: 2,
      biggest: { name: 'Payroll', formattedBalance: '€8,450.65' },
    });
    expect(joined(terry)).toContain('**Payroll**');
    expect(joined(terry)).toContain('€8,450.65');
  });

  it('mentions savings accounts only when some exist', () => {
    expect(joined(buildAccountsTerry({ ...base, accountCount: 2, savingsAccountCount: 2 }))).toContain('future you approves');
    expect(joined(buildAccountsTerry({ ...base, accountCount: 2 }))).not.toContain('future you approves');
  });
});
