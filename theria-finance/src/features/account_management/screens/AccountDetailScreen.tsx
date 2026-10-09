import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Edit,
  FileText,
  Plus,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from '@/shared/icons';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { accountLedger } from '../../../core/domain/ledger';
import { AccountCardVisual } from '../../../shared/components/AccountCardVisual';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { EmptyState } from '../../../shared/components/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/components/ui/alert-dialog';
import { formatAccountCurrency } from '../../../shared/lib/currencies';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';
import { compareRecordsNewestFirst } from '../../../shared/lib/recordFilters';
import { accentValue } from '../../../shared/theme/moduleAccents';
import { MetricCard } from '../../analysis/components/analysisUi';
import { AddRecordModal } from '../../records/components/AddRecordModal';
import { RecordDetailsModal } from '../../records/components/RecordDetailsModal';
import { TerryPanel } from '../../terry/TerryPanel';
import { buildAccountDetailTerry } from '../../terry/terryLines';
import { AddAccountModal } from '../components/AddAccountModal';
import { AccountSavingsPartition } from '../components/AccountSavingsPartition';
import { AccountBalanceChart } from '../components/detail/AccountBalanceChart';
import { AccountInfoList } from '../components/detail/AccountInfoList';
import { AccountRecordsSection } from '../components/detail/AccountRecordsSection';
import { AccountStreamBreakdown } from '../components/detail/AccountStreamBreakdown';
import { DetailSection } from '../components/detail/DetailSection';
import {
  ACCOUNT_RANGES,
  balanceSeries,
  isInRange,
  linkedSavingsFor,
  rangeBounds,
  rangeOption,
  streamBreakdown,
  summarizeFlow,
  toDayKey,
  type AccountRange,
} from '../lib/accountInsights';

type NewRecordType = 'income' | 'expense' | 'transfer';

const RANGE_OPTIONS = ACCOUNT_RANGES.map(({ value, label }) => ({
  value,
  label,
  color: accentValue('accounts'),
}));

/** Floating circle for the header's back and edit buttons — a lighter take on the top bar's circles. */
const HEADER_CIRCLE =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm ring-1 ring-border/50 backdrop-blur-md transition-colors hover:bg-muted active:scale-95';

interface AccountDetailScreenProps {
  accountId: string;
  /** Returns wherever the user came from. */
  onBack: () => void;
  /** Leaves for the accounts list, replacing this page in history (after a delete, or a dead link). */
  onExit: () => void;
}

/**
 * The full page behind an account's details panel: its card, what moved
 * through it over a chosen range, the balance line, top streams, linked
 * savings, every stored detail and its records — plus the actions to manage it.
 */
export const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({ accountId, onBack, onExit }) => {
  const { accounts, categories, records, savings, streams, updateAccount, deleteAccount, deleteRecord } = useData();
  const { mainCurrency } = useCurrency();

  const [range, setRange] = useState<AccountRange>('all');
  const [newRecordType, setNewRecordType] = useState<NewRecordType | null>(null);
  const [recordDetailsId, setRecordDetailsId] = useState<string | null>(null);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  // Set on delete, so the frame before navigation lands renders nothing rather than "not found".
  const [leaving, setLeaving] = useState(false);

  // Arriving from a scrolled list shouldn't land halfway down the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [accountId]);

  const account = accounts.find((a) => a.id === accountId);
  const currency = account?.currency ?? mainCurrency;
  const formatCurrency = (amount: number) => formatAccountCurrency(amount, currency);
  const option = rangeOption(range);
  const bounds = useMemo(() => rangeBounds(range, new Date()), [range]);

  const ledger = useMemo(() => (account ? accountLedger(account, records) : []), [account, records]);
  const rangeEntries = useMemo(
    () =>
      ledger
        .filter((entry) => isInRange(entry, bounds))
        .sort((a, b) => compareRecordsNewestFirst(a.record, b.record)),
    [ledger, bounds],
  );
  // Stable between unrelated re-renders (a modal opening), so the chart doesn't redraw.
  const points = useMemo(
    () =>
      account
        ? balanceSeries(ledger, account.initialBalance, bounds, toDayKey(new Date(account.createdAt)), new Date())
        : [],
    [ledger, account, bounds],
  );
  const breakdown = useMemo(
    () => ({ expense: streamBreakdown(rangeEntries, 'expense'), income: streamBreakdown(rangeEntries, 'income') }),
    [rangeEntries],
  );

  if (leaving) return null;

  if (!account) {
    return (
      <div className="space-y-4 pb-6">
        <button type="button" onClick={onBack} className={HEADER_CIRCLE} title="Back" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <EmptyState title="Account not found" hint="It may have been deleted, or the link is out of date" />
        <button
          type="button"
          onClick={onExit}
          className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ArrowLeft size={16} />
          Back to accounts
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === account.categoryId);
  const isArchived = !!account.archived;
  const summary = summarizeFlow(ledger, account.initialBalance, bounds);
  const linkedSavings = linkedSavingsFor(savings, account.id);
  const reserved = linkedSavings.reduce((sum, s) => sum + s.current, 0);
  // The ledger is chronological, so its last entry is the newest record.
  const lastActivity = ledger[ledger.length - 1]?.record.date;
  const topSpending = breakdown.expense[0];
  const topSpendingName = topSpending && streams.find((s) => s.id === topSpending.streamId)?.name;

  const compact = (amount: number) => formatCompactCurrency(amount, formatCurrency);
  const signed = (amount: number) => `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${compact(Math.abs(amount))}`;

  const terry = buildAccountDetailTerry({
    name: account.name,
    periodPhrase: option.phrase,
    recordCount: summary.count,
    net: summary.net,
    formattedBalance: formatCurrency(account.balance),
    topSpending: topSpendingName ? { name: topSpendingName, share: Math.round(topSpending.share * 100) } : null,
    reserved,
    archived: isArchived,
    money: formatCurrency,
  });

  const handleDeleteAccount = () => {
    setLeaving(true);
    onExit();
    deleteAccount(account.id);
  };

  const handleDeleteRecord = () => {
    if (deleteRecordId) deleteRecord(deleteRecordId);
    setDeleteRecordId(null);
  };

  return (
    <div className="space-y-4 pb-6">
      <TerryPanel content={terry} />

      {/* Header — back, identity, edit */}
      <div className="flex items-center gap-2.5">
        <button type="button" onClick={onBack} className={HEADER_CIRCLE} title="Back" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: category?.color || '#6B7280' }}
              aria-hidden
            />
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {category?.name || 'Uncategorized'}
            </p>
            {isArchived && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <Archive size={11} strokeWidth={2.5} />
                Archived
              </span>
            )}
          </div>
          <h1 className="truncate text-lg font-bold leading-tight text-foreground">{account.name}</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsEditingAccount(true)}
          className={HEADER_CIRCLE}
          title="Edit account"
          aria-label="Edit account"
        >
          <Edit size={16} />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
        {/* Left — the card itself and what you can do with it */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/70 p-4 shadow-sm sm:p-5">
            {/* Blooms in the account's own colour, echoing the overview card */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
              style={{ backgroundColor: `${account.color}26` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: `${account.color}1a` }}
            />
            <AccountCardVisual
              size="hero"
              className="relative mx-auto max-w-sm"
              displayStyle={account.displayStyle}
              name={account.name}
              bankName={account.bankName}
              balanceText={formatCurrency(account.balance)}
              categoryName={category?.name}
              accountNumber={account.accountNumber}
              iconName={account.iconName}
              color={account.color}
              cardType={account.cardType}
              isSavings={account.isSavings}
            />
          </div>

          {isArchived ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3">
              <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                This account is archived. Restore it to log new records and show it in your lists again.
              </p>
              <button
                type="button"
                onClick={() => updateAccount(account.id, { archived: false })}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <ArchiveRestore size={14} />
                Restore
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <QuickAction
                icon={<Plus size={16} />}
                label="Income"
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => setNewRecordType('income')}
              />
              <QuickAction
                icon={<Plus size={16} />}
                label="Expense"
                className="bg-red-500 hover:bg-red-600"
                onClick={() => setNewRecordType('expense')}
              />
              <QuickAction
                icon={<ArrowLeftRight size={16} />}
                label="Transfer"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => setNewRecordType('transfer')}
              />
            </div>
          )}

          <AccountSavingsPartition savings={linkedSavings} balance={account.balance} formatCurrency={formatCurrency} />
        </div>

        {/* Right — the selected range at a glance */}
        <div className="space-y-3">
          <CapsuleSelector id="account-range" options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Money in"
              value={compact(summary.inflow)}
              icon={<TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />}
              tone="income"
            />
            <MetricCard
              label="Money out"
              value={compact(summary.outflow)}
              icon={<TrendingDown size={15} className="text-destructive" />}
              tone="expense"
            />
            <MetricCard
              label="Net change"
              value={signed(summary.net)}
              icon={<Scale size={15} className="text-muted-foreground" />}
              tone={summary.net > 0 ? 'income' : summary.net < 0 ? 'expense' : 'neutral'}
            />
            <MetricCard
              label="Records"
              value={String(summary.count)}
              icon={<FileText size={15} className="text-primary" />}
              tone="neutral"
            />
          </div>

          {/* Where the range started and ended, plus any balance corrections in between */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-[11px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              {range === 'all' ? 'Starting balance' : 'Period start'}
              <span className="font-semibold text-foreground">{formatCurrency(summary.opening)}</span>
              <ArrowRight size={12} />
              <span className="font-semibold text-foreground">{formatCurrency(summary.closing)}</span>
            </span>
            {summary.adjustments !== 0 && (
              <span className="tabular-nums">Includes {signed(summary.adjustments)} in balance corrections</span>
            )}
          </div>

          <DetailSection title="Balance history" subtitle={option.title} bodyClassName="px-1 pb-3 pt-2 sm:px-2">
            <AccountBalanceChart points={points} color={account.color} formatCurrency={formatCurrency} />
          </DetailSection>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
        <AccountRecordsSection
          entries={rangeEntries}
          range={option}
          formatCurrency={formatCurrency}
          onSelect={setRecordDetailsId}
        />

        <div className="space-y-4">
          <AccountStreamBreakdown breakdown={breakdown} formatCurrency={formatCurrency} />
          <AccountInfoList
            account={account}
            category={category}
            currency={currency}
            lastActivity={lastActivity}
            formatCurrency={formatCurrency}
          />

          {/* Manage — the same three actions as the details panel */}
          <DetailSection title="Manage account" bodyClassName="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditingAccount(true)}
              className="flex flex-[1.2] items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => updateAccount(account.id, { archived: !isArchived })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              {isArchived ? 'Restore' : 'Archive'}
            </button>
            <button
              type="button"
              onClick={() => setIsDeletingAccount(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </DetailSection>
        </div>
      </div>

      {/* New record, pre-filled with this account on the side the type moves money */}
      <AddRecordModal
        isOpen={!!newRecordType}
        onClose={() => setNewRecordType(null)}
        initialType={newRecordType ?? undefined}
        initialAccountId={account.id}
      />

      <RecordDetailsModal
        recordId={recordDetailsId}
        onClose={() => setRecordDetailsId(null)}
        onEdit={(id) => {
          setRecordDetailsId(null);
          setEditRecordId(id);
        }}
        onDelete={(id) => {
          setRecordDetailsId(null);
          setDeleteRecordId(id);
        }}
      />

      <AddRecordModal isOpen={!!editRecordId} onClose={() => setEditRecordId(null)} editId={editRecordId} />

      <AddAccountModal isOpen={isEditingAccount} onClose={() => setIsEditingAccount(false)} editId={account.id} />

      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeletingAccount} onOpenChange={setIsDeletingAccount}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/** Same button recipe as the details panel's Income/Expense shortcuts. */
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  className: string;
  onClick: () => void;
}> = ({ icon, label, className, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${className}`}
  >
    {icon}
    {label}
  </button>
);
