import React, { useMemo, useState } from 'react';
import { CalendarClock, PartyPopper, ShieldCheck, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';
import { useData, type Savings } from '../../../core/state/DataContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { AddSavingsModal } from '../components/AddSavingsModal';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
import { STORAGE_KEYS } from '../../../core/constants/appStorage';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';

interface SavingsScreenProps {
  timeFilter?: TimeFilterValue;
  onTimeFilterChange?: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showInlineFilter?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const PINK = '#EC4899';

/** Older stored items have no kind — treat them as goals. kind 'savings' = fund. */
const kindOf = (item: Savings): 'savings' | 'goal' => (item.kind === 'savings' ? 'savings' : 'goal');

const progressOf = (item: Savings) =>
  item.target > 0 ? Math.min(item.current / item.target, 1) : 0;

const milestoneMessage = (pct: number) => {
  if (pct >= 1) return 'Achieved — treat yourself! 🎉';
  if (pct >= 0.75) return 'So close — the finish line is in sight!';
  if (pct >= 0.5) return 'Over halfway there. Keep it up!';
  if (pct >= 0.25) return 'Momentum is building nicely.';
  if (pct > 0) return 'Every bit counts — great start!';
  return 'Ready when you are — the first deposit starts the journey.';
};

const daysLeft = (item: Savings): number | null => {
  if (!item.endDate) return null;
  const end = new Date(item.endDate);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

/** Picture for a savings item: photo beats emoji beats icon. */
const SavingsPicture: React.FC<{ item: Savings; size?: 'banner' | 'chip' }> = ({
  item,
  size = 'chip',
}) => {
  if (item.emoji) {
    return (
      <span className={size === 'banner' ? 'text-4xl leading-none' : 'text-xl leading-none'} aria-hidden>
        {item.emoji}
      </span>
    );
  }
  return (
    <IconComponent
      name={item.iconName || 'PiggyBank'}
      size={size === 'banner' ? 30 : 18}
      style={{ color: item.color || 'var(--primary)' }}
    />
  );
};

export const SavingsScreen: React.FC<SavingsScreenProps> = () => {
  const { savings, accounts, deleteSavings } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [view, setView] = useState<'goals' | 'funds'>('goals');
  const [buddyDismissed, setBuddyDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.savingsBuddyDismissed) === '1';
    } catch {
      return false;
    }
  });

  const dismissBuddy = () => {
    setBuddyDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEYS.savingsBuddyDismissed, '1');
    } catch {
      // Storage unavailable — dismissal just won't persist.
    }
  };

  const goals = useMemo(() => savings.filter((s) => kindOf(s) === 'goal'), [savings]);
  const funds = useMemo(() => savings.filter((s) => kindOf(s) === 'savings'), [savings]);

  const totalSaved = savings.reduce((sum, s) => sum + s.current, 0);
  const totalTarget = savings.reduce((sum, s) => sum + s.target, 0);
  const overallPct = totalTarget > 0 ? Math.min(totalSaved / totalTarget, 1) : 0;
  const fundedCount = savings.filter((s) => s.target > 0 && s.current >= s.target).length;

  // Terry's encouragement, fed by real numbers
  const nextWin = useMemo(() => {
    const inProgress = savings.filter((s) => s.target > 0 && s.current < s.target);
    if (!inProgress.length) return null;
    return inProgress.reduce((best, s) => (progressOf(s) > progressOf(best) ? s : best));
  }, [savings]);

  const buddyMood: BuddyMood = savings.length === 0 ? 'neutral' : overallPct >= 0.5 ? 'happy' : 'neutral';
  const buddyLines: string[] = [];
  if (savings.length === 0) {
    buddyLines.push("Nothing saved yet — tap the + button and let's start your first goal!");
    buddyLines.push('A small emergency fund is a great first step. I believe in you!');
  } else {
    buddyLines.push(
      `You've saved **${formatCurrency(totalSaved)}** — that's **${Math.round(overallPct * 100)}%** of everything you're aiming for!`,
    );
    if (nextWin) {
      buddyLines.push(
        `${nextWin.emoji ? `${nextWin.emoji} ` : ''}**${nextWin.name}** is closest to the finish — just **${formatCurrency(Math.max(nextWin.target - nextWin.current, 0))}** to go!`,
      );
    }
    if (fundedCount > 0) {
      buddyLines.push(
        `**${fundedCount}** of your savings ${fundedCount === 1 ? 'is' : 'are'} fully funded. That's how it's done!`,
      );
    }
    buddyLines.push('Tip: small, regular deposits beat big rare ones. Keep it steady!');
  }

  // Overview progress ring geometry
  const RING_R = 40;
  const RING_C = 2 * Math.PI * RING_R;

  const renderGoalCard = (item: Savings, index: number) => {
    const pct = progressOf(item);
    const complete = item.target > 0 && item.current >= item.target;
    const remaining = Math.max(item.target - item.current, 0);
    const days = daysLeft(item);
    const accent = item.color || PINK;

    return (
      <motion.button
        key={item.id}
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedId(item.id)}
        className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/25"
      >
        {/* Picture banner */}
        <div
          className="relative flex h-20 items-end justify-between overflow-hidden px-3.5 pb-2.5"
          style={{
            background: item.photoUrl
              ? undefined
              : `linear-gradient(135deg, ${accent}33, ${accent}0d)`,
          }}
        >
          {item.photoUrl && (
            <>
              <img
                src={item.photoUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            </>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${accent}2e` }}
          />
          <span className="relative transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <SavingsPicture item={item} size="banner" />
          </span>
          {complete ? (
            <span className="relative flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              <Trophy size={10} strokeWidth={2.5} aria-hidden />
              Achieved
            </span>
          ) : (
            days !== null && (
              <span
                className={`relative flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
                  item.photoUrl
                    ? 'bg-black/40 text-white backdrop-blur-sm'
                    : 'bg-card text-muted-foreground'
                }`}
              >
                <CalendarClock size={10} strokeWidth={2.5} aria-hidden />
                {days > 0 ? `${days}d left` : 'Past target date'}
              </span>
            )
          )}
        </div>

        {/* Body */}
        <div className="space-y-2 p-3.5 pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {item.name || 'Untitled goal'}
            </p>
            {item.note && <p className="truncate text-[11px] text-muted-foreground">{item.note}</p>}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: complete ? '#10B981' : accent }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct * 100, 3)}%` }}
              transition={{ duration: 0.7, delay: 0.15 + index * 0.05, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <p className="min-w-0 truncate text-[12px] tabular-nums text-foreground">
              <span className="font-bold">{formatCurrency(item.current)}</span>
              <span className="text-muted-foreground"> of {formatCurrency(item.target)}</span>
            </p>
            <span
              className="shrink-0 text-[12px] font-bold tabular-nums"
              style={{ color: complete ? '#10B981' : accent }}
            >
              {Math.round(pct * 100)}%
            </span>
          </div>

          <p className="text-[11px] leading-snug text-muted-foreground">
            {complete
              ? milestoneMessage(1)
              : `${formatCurrency(remaining)} to go · ${milestoneMessage(pct)}`}
          </p>
        </div>
      </motion.button>
    );
  };

  const renderFundRow = (item: Savings, index: number) => {
    const pct = progressOf(item);
    const complete = item.target > 0 && item.current >= item.target;
    const accent = item.color || '#0EA5E9';

    return (
      <motion.button
        key={item.id}
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedId(item.id)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card p-3 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/25"
      >
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm ring-1 ring-black/5"
          style={{ backgroundColor: `${accent}1a` }}
        >
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <SavingsPicture item={item} />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
              {item.name || 'Untitled fund'}
            </p>
            <span
              className="shrink-0 text-[11px] font-bold tabular-nums"
              style={{ color: complete ? '#10B981' : accent }}
            >
              {Math.round(pct * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: complete ? '#10B981' : accent }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct * 100, 3)}%` }}
              transition={{ duration: 0.7, delay: 0.15 + index * 0.05, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {formatCurrency(item.current)} of {formatCurrency(item.target)}
            {complete && ' · fully funded 🎉'}
          </p>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="savings" />

      {/* Terry cheers the saving on */}
      {!buddyDismissed && (
        <FinanceBuddy lines={buddyLines} mood={buddyMood} onDismiss={dismissBuddy} />
      )}

      {/* Savings overview — pink take on the dashboard balance widget */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-pink-100/80 p-4 shadow-sm dark:bg-pink-950/40 sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-pink-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl"
        />

        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Ring + funded count */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="rounded-full border border-border/40 bg-card/40 p-1.5 shadow-sm">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_R}
                    fill="var(--card)"
                    stroke="var(--muted)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={RING_R}
                    fill="none"
                    stroke={PINK}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    initial={{ strokeDashoffset: RING_C }}
                    animate={{ strokeDashoffset: RING_C * (1 - overallPct) }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Saved
                  </span>
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {Math.round(overallPct * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Saved + Remaining — plain, no boxes; compact so they never wrap */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">Saved</p>
              <p
                className="whitespace-nowrap text-base font-bold tabular-nums text-pink-600 dark:text-pink-400"
                title={formatCurrency(totalSaved)}
              >
                {formatCompactCurrency(totalSaved, formatCurrency)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight text-muted-foreground">Remaining</p>
              <p
                className="whitespace-nowrap text-base font-bold tabular-nums text-foreground"
                title={formatCurrency(Math.max(totalTarget - totalSaved, 0))}
              >
                {formatCompactCurrency(Math.max(totalTarget - totalSaved, 0), formatCurrency)}
              </p>
            </div>
          </div>

          {/* Counts — the single box */}
          <div className="flex shrink-0 flex-col justify-center gap-2 rounded-2xl bg-card/70 px-3.5 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy size={13} strokeWidth={2.25} className="text-pink-500" aria-hidden />
              <p className="text-[11px] font-medium text-muted-foreground">
                Goals{' '}
                <span className="font-bold tabular-nums text-foreground">{goals.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} strokeWidth={2.25} className="text-sky-500" aria-hidden />
              <p className="text-[11px] font-medium text-muted-foreground">
                Funds{' '}
                <span className="font-bold tabular-nums text-foreground">{funds.length}</span>
              </p>
            </div>
            <p className="text-[10px] font-medium leading-tight text-muted-foreground">
              {fundedCount}/{savings.length} savings funded
            </p>
          </div>
        </div>
      </div>

      {/* Goals / Funds capsule nav */}
      <div className="flex w-full rounded-full bg-card border border-border shadow-sm p-0.5">
        {(
          [
            { key: 'goals', label: 'Goals', icon: Trophy, activeClass: 'bg-pink-500 text-white shadow' },
            { key: 'funds', label: 'Funds', icon: ShieldCheck, activeClass: 'bg-sky-500 text-white shadow' },
          ] as const
        ).map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.key}
              onClick={() => setView(option.key)}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                view === option.key
                  ? option.activeClass
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon size={14} />
              {option.label}
            </button>
          );
        })}
      </div>

      {view === 'goals' ? (
        goals.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{goals.map(renderGoalCard)}</div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-border bg-card/60 p-3.5">
            <PartyPopper size={16} className="shrink-0 text-pink-500" aria-hidden />
            <p className="text-[12px] text-muted-foreground">
              No goals yet — dream something up. A trip, a car, a guitar… tap + to start one.
            </p>
          </div>
        )
      ) : funds.length > 0 ? (
        <div className="space-y-2">{funds.map(renderFundRow)}</div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-border bg-card/60 p-3.5">
          <ShieldCheck size={16} className="shrink-0 text-sky-500" aria-hidden />
          <p className="text-[12px] text-muted-foreground">
            No funds yet — an emergency fund is a great first safety net.
          </p>
        </div>
      )}

      {savings.length === 0 && (
        <EmptyState title="Nothing saved yet" hint="Use the + button to start saving for something" />
      )}

      {/* Details */}
      {selectedId && (() => {
        const item = savings.find((s) => s.id === selectedId);
        if (!item) return null;
        const account = accounts.find((a) => a.id === item.accountId);
        const pct = progressOf(item);
        const complete = item.target > 0 && item.current >= item.target;
        const remaining = Math.max(item.target - item.current, 0);
        const days = daysLeft(item);
        const accent = item.color || PINK;

        return (
          <DetailsModal
            isOpen={!!selectedId}
            onClose={() => setSelectedId(null)}
            title="Savings details"
            onDelete={() => setDeleteId(selectedId)}
            onEdit={() => {
              setEditId(selectedId);
              setSelectedId(null);
            }}
          >
            <div className="space-y-2.5">
              <div
                className="flex items-center gap-3 rounded-2xl border border-border/50 p-3"
                style={{ background: `linear-gradient(135deg, ${accent}24, ${accent}08)` }}
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card shadow-sm">
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <SavingsPicture item={item} size="banner" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {kindOf(item) === 'goal' ? 'Goal' : 'Fund'} ·{' '}
                    {account?.name || 'No linked account'}
                  </p>
                </div>
                <span
                  className="shrink-0 text-sm font-bold tabular-nums"
                  style={{ color: complete ? '#10B981' : accent }}
                >
                  {Math.round(pct * 100)}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${Math.max(pct * 100, 3)}%`,
                    backgroundColor: complete ? '#10B981' : accent,
                  }}
                />
              </div>

              <p className="text-center text-[11px] text-muted-foreground">{milestoneMessage(pct)}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">Saved</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(item.current)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(item.target)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">Still to go</p>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      complete ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {formatCurrency(remaining)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {days === null ? '—' : days > 0 ? `${days} days left` : 'Passed'}
                  </p>
                </div>
              </div>

              {item.note && (
                <div className="rounded-xl bg-muted/30 p-2.5">
                  <p className="text-xs text-muted-foreground">Note</p>
                  <p className="text-sm text-foreground">{item.note}</p>
                </div>
              )}
            </div>
          </DetailsModal>
        );
      })()}

      {/* Edit */}
      <AddSavingsModal isOpen={!!editId} onClose={() => setEditId(null)} editId={editId} />

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete savings</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteSavings(deleteId);
                setDeleteId(null);
                setSelectedId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
