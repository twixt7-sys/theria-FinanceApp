import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Sparkles, Newspaper, Clock3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../../core/state/DataContext';
import { useSimpleMode } from '../../core/state/SimpleModeContext';
import { AnalysisScreen } from '../../features/analysis/screens/AnalysisScreen';
import { SimpleDashboard } from './SimpleDashboard';
import { DashboardTimeRange } from '../../shared/components/DashboardTimeRange';
import type { TimeFilterValue } from '../../shared/components/TimeFilter';

type HomeTab = 'dashboard' | 'newsfeed' | 'analysis';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  activeTab?: HomeTab;
  onActiveTabChange?: (tab: HomeTab) => void;
  onOpenTimeFilter?: () => void;
  onQuickAddRecord?: (type: 'income' | 'expense' | 'transfer') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  timeFilter,
  currentDate,
  activeTab: activeTabProp,
  onActiveTabChange,
  onOpenTimeFilter,
  onQuickAddRecord,
}) => {
  const { records, streams, accounts, budgets, savings, categories } = useData();
  const { simpleMode } = useSimpleMode();
  const [localActiveTab, setLocalActiveTab] = useState<HomeTab>('dashboard');
  const activeTab = activeTabProp ?? localActiveTab;
  const setActiveTab = onActiveTabChange ?? setLocalActiveTab;
  const [showNavToggle, setShowNavToggle] = useState(true);
  const [overviewIndex, setOverviewIndex] = useState(0);
  const [financeOverviewIndex, setFinanceOverviewIndex] = useState(0);
  const [selectedSpendingCategory, setSelectedSpendingCategory] = useState<string | null>(null);
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string | null>(null);

  const activeTimeFilter = timeFilter ?? 'month';
  const activeDate = currentDate ?? new Date();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const getFilteredRecords = () => {
    const now = currentDate || new Date();
    return records.filter(r => {
      const recordDate = new Date(r.date);
      switch (timeFilter) {
        case 'day':
          return recordDate.toDateString() === now.toDateString();
        case 'week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return recordDate >= weekStart && recordDate <= weekEnd;
        }
        case 'month':
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        case 'quarter': {
          const quarter = Math.floor(now.getMonth() / 3);
          const recordQuarter = Math.floor(recordDate.getMonth() / 3);
          return recordQuarter === quarter && recordDate.getFullYear() === now.getFullYear();
        }
        case 'year':
          return recordDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredRecords = getFilteredRecords();

  const totalIncome = filteredRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = filteredRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const prevPeriodRecords = useMemo(() => {
    const now = currentDate || new Date();
    return records.filter((r) => {
      const recordDate = new Date(r.date);
      switch (timeFilter) {
        case 'day': {
          const prev = new Date(now);
          prev.setDate(now.getDate() - 1);
          return recordDate.toDateString() === prev.toDateString();
        }
        case 'week': {
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay() - 7);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return recordDate >= start && recordDate <= end;
        }
        case 'month': {
          const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return recordDate.getMonth() === prev.getMonth() && recordDate.getFullYear() === prev.getFullYear();
        }
        case 'quarter': {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
          const prevYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return Math.floor(recordDate.getMonth() / 3) === prevQuarter && recordDate.getFullYear() === prevYear;
        }
        case 'year':
          return recordDate.getFullYear() === now.getFullYear() - 1;
        default:
          return false;
      }
    });
  }, [records, currentDate, timeFilter]);

  const previousIncome = prevPeriodRecords.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const previousExpenses = prevPeriodRecords.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

  const cashflowSeries = useMemo(() => {
    const sorted = [...filteredRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const slice = sorted.slice(-8);
    const values = slice.map((r) => {
      if (r.type === 'income') return r.amount;
      if (r.type === 'expense') return -r.amount;
      return 0; // transfers don't change net cashflow
    });
    // Ensure stable chart layout even with too few records.
    return values.length ? values : [0, 0, 0, 0, 0, 0];
  }, [filteredRecords]);

  const cashflowMaxAbs = Math.max(...cashflowSeries.map((v) => Math.abs(v)), 1);

  const cashflowChartRects = useMemo(() => {
    const values = cashflowSeries;
    const n = Math.max(values.length, 1);
    const chartW = 240;
    const padX = 10;
    const gap = 4;
    const baselineY = 36;
    const topY = 12;
    const bottomY = 62;
    const barW = (chartW - padX * 2 - gap * (n - 1)) / n;

    return values.map((v, i) => {
      const isPos = v >= 0;
      const abs = Math.abs(v);
      const usable = isPos ? baselineY - topY : bottomY - baselineY;
      const h = (abs / cashflowMaxAbs) * usable;
      const x = padX + i * (barW + gap);
      const y = isPos ? baselineY - h : baselineY;
      const height = Math.max(h, 1);
      return {
        x,
        y,
        w: Math.max(barW - 0.5, 2),
        h: height,
        color: v === 0 ? '#94A3B8' : isPos ? '#10B981' : '#EF4444',
        opacity: v === 0 ? 0.35 : 0.9,
      };
    });
  }, [cashflowSeries, cashflowMaxAbs]);

  const budgetHealthyPercent = budgets.length
    ? Math.round((budgets.filter((b) => b.spent <= b.limit).length / budgets.length) * 100)
    : 0;
  const overLimitCount = budgets.filter((b) => b.spent > b.limit).length;

  const budgetHealthBars = useMemo(() => {
    const source = budgets.slice(0, 8).map((b) => (b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 140) : 0));
    const values = source.length ? source : [0, 0, 0, 0, 0, 0];
    const n = values.length;
    const chartW = 240;
    const padX = 10;
    const gap = 5;
    const barW = (chartW - padX * 2 - gap * (n - 1)) / n;

    return values.map((v, i) => {
      const h = Math.max((v / 140) * 44, 2);
      return {
        x: padX + i * (barW + gap),
        y: 50 - h,
        w: Math.max(barW - 0.5, 2),
        h,
        color: v > 100 ? '#EF4444' : '#10B981',
      };
    });
  }, [budgets]);

  const savingsMomentumPercent = savings.length
    ? Math.round((savings.reduce((sum, s) => sum + Math.min(s.current / Math.max(s.target, 1), 1), 0) / savings.length) * 100)
    : 0;

  const savingsMomentumLine = useMemo(() => {
    const source = savings.slice(0, 8).map((s) => Math.min((s.current / Math.max(s.target, 1)) * 100, 100));
    const values = source.length ? source : [0, 0, 0, 0, 0, 0];
    const chartW = 240;
    const chartH = 56;
    const padX = 12;
    const padY = 8;
    const stepX = values.length > 1 ? (chartW - padX * 2) / (values.length - 1) : 0;

    const points = values
      .map((v, i) => {
        const x = padX + i * stepX;
        const y = chartH - padY - (v / 100) * (chartH - padY * 2);
        return `${x},${y}`;
      })
      .join(' ');

    return { points, values };
  }, [savings]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const recordsByCategory = (type: 'expense' | 'income') => {
    const bucket = new Map<string, { id: string; name: string; total: number; color: string }>();
    filteredRecords
      .filter((r) => r.type === type)
      .forEach((r) => {
        const stream = streams.find((s) => s.id === r.streamId);
        const categoryId = stream?.categoryId || 'uncategorized';
        const category = categories.find((c) => c.id === categoryId);
        const current = bucket.get(categoryId);
        if (current) {
          current.total += r.amount;
        } else {
          bucket.set(categoryId, {
            id: categoryId,
            name: category?.name || 'Uncategorized',
            total: r.amount,
            color: category?.color || stream?.color || (type === 'income' ? '#10B981' : '#6B7280'),
          });
        }
      });
    return Array.from(bucket.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  };

  const expenseByCategory = useMemo(
    () => recordsByCategory('expense'),
    [filteredRecords, streams, categories],
  );

  const incomeByCategory = useMemo(
    () => recordsByCategory('income'),
    [filteredRecords, streams, categories],
  );

  const buildDonutItems = (
    byCategory: typeof expenseByCategory,
    periodTotal: number,
  ) => {
    const items = [...byCategory];
    const topTotal = items.reduce((sum, i) => sum + i.total, 0);
    const remainder = Math.max(periodTotal - topTotal, 0);
    if (remainder > 0.01) {
      items.push({ id: 'other', name: 'Other', total: remainder, color: '#94A3B8' });
    }
    return items;
  };

  const buildDonutSegments = (
    items: ReturnType<typeof buildDonutItems>,
    periodTotal: number,
  ) => {
    const total = periodTotal || 0;
    if (!total || items.length === 0) return [];

    const cx = 50;
    const cy = 50;
    const r = 36;

    const polarToCartesian = (angleDeg: number) => {
      const a = (angleDeg - 90) * (Math.PI / 180);
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };

    const describeArc = (startAngle: number, endAngle: number) => {
      const start = polarToCartesian(startAngle);
      const end = polarToCartesian(endAngle);
      const delta = endAngle - startAngle;
      const largeArcFlag = delta <= 180 ? 0 : 1;
      return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    };

    let startAngle = -90;
    return items
      .map((item) => {
        const pct = item.total / total;
        const sweep = pct * 360;
        const endAngle = startAngle + sweep;
        const d = describeArc(startAngle, endAngle);
        const seg = {
          id: item.id,
          name: item.name,
          total: item.total,
          color: item.color,
          pct,
          d,
        };
        startAngle = endAngle;
        return seg;
      })
      .filter((s) => s.total > 0 && s.pct > 0);
  };

  const expenseDonutItems = useMemo(
    () => buildDonutItems(expenseByCategory, totalExpenses),
    [expenseByCategory, totalExpenses],
  );

  const incomeDonutItems = useMemo(
    () => buildDonutItems(incomeByCategory, totalIncome),
    [incomeByCategory, totalIncome],
  );

  const spendingDonutSegments = useMemo(
    () => buildDonutSegments(expenseDonutItems, totalExpenses),
    [expenseDonutItems, totalExpenses],
  );

  const incomeDonutSegments = useMemo(
    () => buildDonutSegments(incomeDonutItems, totalIncome),
    [incomeDonutItems, totalIncome],
  );

  const selectedSpendingSegment = useMemo(() => {
    if (!spendingDonutSegments.length) return null;
    return (
      spendingDonutSegments.find((s) => s.id === selectedSpendingCategory) ||
      spendingDonutSegments[0]
    );
  }, [spendingDonutSegments, selectedSpendingCategory]);

  const selectedIncomeSegment = useMemo(() => {
    if (!incomeDonutSegments.length) return null;
    return (
      incomeDonutSegments.find((s) => s.id === selectedIncomeCategory) || incomeDonutSegments[0]
    );
  }, [incomeDonutSegments, selectedIncomeCategory]);

  const spendingInsightChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onClick?: () => void }> = [];
    const net = totalIncome - totalExpenses;
    chips.push({
      id: 'net',
      label: net >= 0 ? `Net positive ${formatCurrency(net)}` : `Net negative ${formatCurrency(net)}`,
    });
    if (expenseByCategory[0]) {
      chips.push({
        id: 'top-cat',
        label: `Top spend: ${expenseByCategory[0].name}`,
        onClick: () => setSelectedSpendingCategory(expenseByCategory[0].id),
      });
    }
    const closeGoals = savings.filter((s) => s.target > 0 && s.current / s.target >= 0.8).length;
    if (closeGoals > 0) {
      chips.push({
        id: 'goals',
        label: `${closeGoals} goal(s) almost complete`,
        onClick: () => onNavigate?.('savings'),
      });
    }
    return chips;
  }, [totalIncome, totalExpenses, expenseByCategory, savings, onNavigate]);

  const incomeInsightChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onClick?: () => void }> = [];
    const net = totalIncome - totalExpenses;
    const incomeDelta = totalIncome - previousIncome;
    chips.push({
      id: 'total',
      label: `Total income ${formatCurrency(totalIncome)}`,
    });
    if (previousIncome > 0 || totalIncome > 0) {
      chips.push({
        id: 'delta',
        label:
          incomeDelta >= 0
            ? `Up ${formatCurrency(incomeDelta)} vs prior`
            : `Down ${formatCurrency(Math.abs(incomeDelta))} vs prior`,
      });
    }
    if (incomeByCategory[0]) {
      chips.push({
        id: 'top-source',
        label: `Top source: ${incomeByCategory[0].name}`,
        onClick: () => setSelectedIncomeCategory(incomeByCategory[0].id),
      });
    }
    if (net >= 0 && totalIncome > 0) {
      chips.push({
        id: 'net',
        label: `Net positive ${formatCurrency(net)}`,
      });
    }
    return chips;
  }, [totalIncome, totalExpenses, previousIncome, incomeByCategory]);

  useEffect(() => {
    if (simpleMode && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [simpleMode, activeTab, setActiveTab]);

  useEffect(() => {
    if (activeTab !== 'dashboard' || simpleMode) return;
    const timer = window.setInterval(() => {
      setOverviewIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeTab, simpleMode]);

  useEffect(() => {
    if (activeTab !== 'dashboard' || simpleMode) return;
    const timer = window.setInterval(() => {
      setFinanceOverviewIndex((prev) => (prev + 1) % 2);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [activeTab, simpleMode]);

  const renderFinanceDonutPanel = (
    mode: 'spending' | 'income',
  ) => {
    const isSpending = mode === 'spending';
    const segments = isSpending ? spendingDonutSegments : incomeDonutSegments;
    const selected = isSpending ? selectedSpendingSegment : selectedIncomeSegment;
    const selectedId = isSpending ? selectedSpendingCategory : selectedIncomeCategory;
    const setSelectedId = isSpending ? setSelectedSpendingCategory : setSelectedIncomeCategory;
    const periodTotal = isSpending ? totalExpenses : totalIncome;
    const chips = isSpending ? spendingInsightChips : incomeInsightChips;
    const centerLabel = isSpending ? 'Top spend' : 'Top source';
    const emptyLabel = isSpending
      ? 'No expense breakdown for this period.'
      : 'No income breakdown for this period.';

    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" width="112" height="112" className="block text-muted-foreground">
              <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="10" fill="none" opacity="0.35" />
              {segments.map((seg) => {
                const active = selectedId === seg.id;
                return (
                  <path
                    key={seg.id}
                    d={seg.d}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={active ? 12 : 10}
                    strokeLinecap="round"
                    opacity={active ? 1 : 0.55}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedId(active ? null : seg.id)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
              <p className="text-[10px] text-muted-foreground">{selected ? centerLabel : 'No data'}</p>
              <p className="text-sm font-bold leading-tight">
                {selected ? formatCurrency(selected.total) : '$0.00'}
              </p>
              {selected && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {Math.round(selected.pct * 100)}%
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Breakdown</p>
              <p
                className={`text-xs font-semibold ${
                  isSpending ? 'text-foreground' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatCurrency(periodTotal)}
              </p>
            </div>

            {segments.length > 0 ? (
              <div className="space-y-1">
                {segments.slice(0, 4).map((seg) => {
                  const active = selectedId === seg.id;
                  return (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => setSelectedId(active ? null : seg.id)}
                      className={`w-full rounded-lg border px-2.5 py-1 text-left flex items-center justify-between gap-2 transition-all ${
                        active
                          ? isSpending
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-border bg-muted/15 hover:bg-muted/25'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-[11px] font-medium truncate">{seg.name}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                        {formatCurrency(seg.total)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{emptyLabel}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onClick}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2 py-1 text-[11px] hover:bg-muted/50 transition-colors"
            >
              <Sparkles
                size={11}
                className={isSpending ? 'text-primary' : 'text-emerald-500'}
              />
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (  
    <div className="space-y-4 pb-6 w-full">
      {/* Top toggle */}
      <AnimatePresence initial={false}>
        {showNavToggle && !simpleMode && (
          <motion.div
            key="nav-toggle"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex w-full rounded-xl bg-card border border-border shadow-sm p-0.5">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'analysis'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('newsfeed')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'newsfeed'
                    ? 'bg-primary text-white shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Newsfeed
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'dashboard' && simpleMode && (
        <SimpleDashboard
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netFlow={totalIncome - totalExpenses}
          formatCurrency={formatCurrency}
          timeFilter={activeTimeFilter}
          currentDate={activeDate}
          onOpenTimeFilter={onOpenTimeFilter}
          records={filteredRecords}
          streams={streams}
          topSpending={expenseByCategory}
          topIncome={incomeByCategory}
          onNavigate={onNavigate}
          onQuickAddRecord={onQuickAddRecord}
        />
      )}

      {activeTab === 'dashboard' && !simpleMode && (
        <div className="space-y-4">
          <DashboardTimeRange
            timeFilter={activeTimeFilter}
            currentDate={activeDate}
            onChangeClick={onOpenTimeFilter}
            action={
              <button
                type="button"
                onClick={() => setShowNavToggle(!showNavToggle)}
                className={`shrink-0 p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  showNavToggle
                    ? 'bg-primary/15 text-primary ring-1 ring-primary/25 shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="Toggle dashboard tabs"
                aria-pressed={showNavToggle}
              >
                {showNavToggle ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            }
          />

          {/* Simple Blue Balance Card */}
          <motion.div
            whileHover={{ y: -2, scale: 1.005 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-white overflow-hidden transition-all"
            style={{ 
              background: 'linear-gradient(135deg, #2563ebdd, #1e3a8a99)'
            }}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20"></div>
              <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15"></div>
              <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10"></div>
            </div>
            
            {/* Background icon */}
            <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
              <BarChart3 size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
            </div>
            
            <div className="space-y-3 relative z-10">
              <div>
                <p className="text-white/80 mb-0.5 text-sm">Total Balance</p>
                <h2 className="text-2xl font-bold mb-0.5">{formatCurrency(totalBalance)}</h2>
                <p className="text-white/70 text-sm">Dashboard Overview</p>
              </div>
              
              <div className="pt-2 border-t border-white/20 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-white/80 text-sm">Income</p>
                  <p className="text-sm font-semibold text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/80 text-sm">Expenses</p>
                  <p className="text-sm font-semibold text-red-400">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/80 text-sm">Net Flow</p>
                  <p className={`text-sm font-semibold ${totalIncome - totalExpenses >= 0 ? 'text-white' : 'text-white/70'}`}>
                    {totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Overview carousel + visual insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="order-2 rounded-2xl border border-border bg-card/80 p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Overview</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setOverviewIndex((i) => (i + 2) % 3)}
                    className="h-7 w-7 rounded-md border border-border bg-card hover:bg-muted flex items-center justify-center"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverviewIndex((i) => (i + 1) % 3)}
                    className="h-7 w-7 rounded-md border border-border bg-card hover:bg-muted flex items-center justify-center"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`overview-${overviewIndex}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-border/70 p-3 bg-gradient-to-br from-muted/30 to-card"
                >
                  {overviewIndex === 0 && (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">Cashflow snapshot</p>
                          <p className="text-xl font-bold">{formatCurrency(totalIncome - totalExpenses)}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground text-right mt-1">
                          Prev: {formatCurrency(previousIncome - previousExpenses)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-card/70 p-2">
                        <svg viewBox="0 0 240 72" width="100%" height="56" className="block">
                          <line x1="10" y1="36" x2="230" y2="36" stroke="currentColor" opacity="0.15" strokeWidth="2" />
                          {cashflowChartRects.map((r, idx) => (
                            <rect
                              key={`cashflow-${idx}`}
                              x={r.x}
                              y={r.y}
                              width={r.w}
                              height={r.h}
                              rx={3}
                              fill={r.color}
                              opacity={r.opacity}
                            />
                          ))}
                        </svg>
                      </div>
                    </div>
                  )}
                  {overviewIndex === 1 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Budget health</p>
                      <p className="text-xl font-bold">{budgets.length ? `${budgetHealthyPercent}%` : '0%'}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {overLimitCount} budget(s) over limit
                      </p>
                      <div className="rounded-xl border border-border/70 bg-card/70 p-2">
                        <svg viewBox="0 0 240 56" width="100%" height="56" className="block">
                          <line x1="10" y1="50" x2="230" y2="50" stroke="currentColor" opacity="0.16" strokeWidth="2" />
                          {budgetHealthBars.map((bar, idx) => (
                            <rect
                              key={`budget-health-${idx}`}
                              x={bar.x}
                              y={bar.y}
                              width={bar.w}
                              height={bar.h}
                              rx={3}
                              fill={bar.color}
                              opacity={0.9}
                            />
                          ))}
                        </svg>
                      </div>
                    </div>
                  )}
                  {overviewIndex === 2 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Savings momentum</p>
                      <p className="text-xl font-bold">{savingsMomentumPercent}%</p>
                      <div className="rounded-xl border border-border/70 bg-card/70 p-2">
                        <svg viewBox="0 0 240 56" width="100%" height="56" className="block">
                          <line x1="10" y1="48" x2="230" y2="48" stroke="currentColor" opacity="0.16" strokeWidth="2" />
                          <polyline
                            fill="none"
                            stroke="currentColor"
                            opacity="0.2"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={savingsMomentumLine.points}
                          />
                          <polyline
                            fill="none"
                            stroke="#8B5CF6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={savingsMomentumLine.points}
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 flex justify-center gap-1">
                {[0, 1, 2].map((dot) => (
                  <button
                    key={`overview-dot-${dot}`}
                    onClick={() => setOverviewIndex(dot)}
                    className={`h-1.5 rounded-full transition-all ${overviewIndex === dot ? 'w-4 bg-primary' : 'w-1.5 bg-border'}`}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -1 }} className="order-1 rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">
                  {financeOverviewIndex === 0 ? 'Spending Overview' : 'Income Overview'}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFinanceOverviewIndex((i) => (i + 1) % 2)}
                    className="h-7 w-7 rounded-md border border-border bg-card hover:bg-muted flex items-center justify-center"
                    aria-label="Previous overview"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinanceOverviewIndex((i) => (i + 1) % 2)}
                    aria-label="Next overview"
                    className="h-7 w-7 rounded-md border border-border bg-card hover:bg-muted flex items-center justify-center"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`finance-${financeOverviewIndex}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  {financeOverviewIndex === 0
                    ? renderFinanceDonutPanel('spending')
                    : renderFinanceDonutPanel('income')}
                </motion.div>
              </AnimatePresence>

              <div className="mt-2 flex justify-center gap-1">
                {[0, 1].map((dot) => (
                  <button
                    key={`finance-dot-${dot}`}
                    type="button"
                    onClick={() => setFinanceOverviewIndex(dot)}
                    className={`h-1.5 rounded-full transition-all ${
                      financeOverviewIndex === dot ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                    }`}
                    aria-label={dot === 0 ? 'Spending overview' : 'Income overview'}
                  />
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      )}
      {activeTab === 'analysis' && !simpleMode && (
          <AnalysisScreen showInlineFilter={false} />
      )}
      {activeTab === 'newsfeed' && !simpleMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mx-auto max-w-lg text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Newspaper size={24} className="text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Newsfeed is coming soon</h3>
              <p className="text-sm text-muted-foreground">
                We are preparing smarter finance stories, market highlights, and personalized updates for this section.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Clock3 size={13} />
              Under development
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};