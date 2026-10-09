import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, ChevronDown, Search, TrendingDown, TrendingUp, X } from '@/shared/icons';
import { useData } from '../../../../core/state/DataContext';
import type { AccountLedgerEntry } from '../../../../core/domain/ledger';
import type { LedgerRecord } from '../../../../core/domain/types';
import { CapsuleSelector, type CapsuleOption } from '../../../../shared/components/CapsuleSelector';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { formatCompactCurrency } from '../../../../shared/lib/compactCurrency';
import { accentValue } from '../../../../shared/theme/moduleAccents';
import { RecordTimeline } from '../../../records/components/RecordTimeline';
import { groupByMonth, type AccountRangeOption } from '../../lib/accountInsights';
import { DetailSection } from './DetailSection';

type KindFilter = 'all' | 'income' | 'expense' | 'transfer';

/** Records rendered per "Show more" step, so years of history stay light. */
const PAGE_SIZE = 30;

const KIND_OPTIONS: CapsuleOption<KindFilter>[] = [
  { value: 'all', label: 'All', color: accentValue('accounts') },
  { value: 'income', label: 'Income', icon: <TrendingUp size={12} strokeWidth={2.5} />, color: '#10B981' },
  { value: 'expense', label: 'Expense', icon: <TrendingDown size={12} strokeWidth={2.5} />, color: '#EF4444' },
  { value: 'transfer', label: 'Transfer', icon: <ArrowLeftRight size={12} strokeWidth={2.5} />, color: '#3B82F6' },
];

interface AccountRecordsSectionProps {
  /** The range's statement, newest first. */
  entries: AccountLedgerEntry[];
  range: AccountRangeOption;
  formatCurrency: (amount: number) => string;
  onSelect: (recordId: string) => void;
}

/** The account's records, searchable and filterable by type, grouped by month. */
export const AccountRecordsSection: React.FC<AccountRecordsSectionProps> = ({
  entries,
  range,
  formatCurrency,
  onSelect,
}) => {
  const { streams, accounts } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const query = searchQuery.trim().toLowerCase();

  // Paging restarts whenever what's being paged changes — derived, not synced in an effect.
  const pageKey = `${range.value}|${kind}|${query}`;
  const [page, setPage] = useState({ key: pageKey, count: PAGE_SIZE });
  const visibleCount = page.key === pageKey ? page.count : PAGE_SIZE;

  const filtered = useMemo(() => {
    const nameOf = (list: { id: string; name: string }[], id?: string) =>
      list.find((item) => item.id === id)?.name ?? '';
    const matchesQuery = (record: LedgerRecord) =>
      [
        record.type === 'transfer' ? nameOf(accounts, record.fromAccountId) : nameOf(streams, record.streamId),
        record.type === 'transfer' ? nameOf(accounts, record.toAccountId) : '',
        record.note ?? '',
        String(record.amount),
      ].some((text) => text.toLowerCase().includes(query));

    return entries.filter(
      ({ record }) => (kind === 'all' || record.type === kind) && (query === '' || matchesQuery(record)),
    );
  }, [entries, kind, query, streams, accounts]);

  // Month totals come from the whole filtered set, even when a month is only partly shown.
  const groups = useMemo(() => groupByMonth(filtered), [filtered]);
  const visibleGroups = useMemo(() => {
    let budget = visibleCount;
    return groups.flatMap((group) => {
      if (budget <= 0) return [];
      const shown = group.entries.slice(0, budget);
      budget -= shown.length;
      return [{ ...group, entries: shown }];
    });
  }, [groups, visibleCount]);

  const remaining = filtered.length - Math.min(visibleCount, filtered.length);
  const compact = (amount: number) => formatCompactCurrency(amount, formatCurrency);

  return (
    <DetailSection
      title="Records"
      subtitle={`${filtered.length} ${filtered.length === 1 ? 'record' : 'records'} · ${range.title}`}
      bodyClassName="space-y-3"
    >
      <div className="flex h-9 min-w-0 items-center gap-2 rounded-full border border-border/40 bg-muted px-3 shadow-sm">
        <Search size={14} className="shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search this account's records"
          aria-label="Search this account's records"
          className="min-w-0 flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <CapsuleSelector id="account-records-kind" options={KIND_OPTIONS} value={kind} onChange={setKind} size="sm" />

      {visibleGroups.map((group) => (
        <div key={group.key}>
          <div className="flex items-center justify-between gap-2 border-b border-border/40 px-0.5 pb-1.5 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">{group.label}</p>
            <p className="flex shrink-0 items-center gap-2 text-[11px] font-semibold tabular-nums">
              {group.inflow > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">+{compact(group.inflow)}</span>
              )}
              {group.outflow > 0 && <span className="text-destructive">−{compact(group.outflow)}</span>}
            </p>
          </div>
          {/* pr-3 leaves room for the timeline's type badge, which straddles the card edge */}
          <div className="pr-3 pt-2">
            <RecordTimeline
              records={group.entries.map((entry) => entry.record)}
              scope="month"
              onSelect={onSelect}
              formatAmount={formatCurrency}
            />
          </div>
        </div>
      ))}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setPage({ key: pageKey, count: visibleCount + PAGE_SIZE })}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/30 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronDown size={14} />
          Show {Math.min(PAGE_SIZE, remaining)} more
        </button>
      )}

      {filtered.length === 0 && (
        <EmptyState
          className="py-8"
          title={entries.length === 0 ? 'No records yet' : 'No records match'}
          hint={
            entries.length === 0
              ? `Nothing has moved through this account ${range.phrase}`
              : 'Try a different word, amount or type'
          }
        />
      )}
    </DetailSection>
  );
};
