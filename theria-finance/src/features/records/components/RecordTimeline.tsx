import React from 'react';
import { ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react';
import type { LedgerRecord } from '../../../core/domain/types';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { useTheme } from '../../../core/state/ThemeContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import type { TimeFilterValue } from '../../../shared/components/TimeFilter';

interface RecordTimelineProps {
  records: LedgerRecord[];
  scope: TimeFilterValue;
  onSelect: (recordId: string) => void;
}

/** '14:30' → '2:30 PM'. */
const formatRecordTime = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

/** Rail labels are tight, so a whole hour drops its minutes: '1:00 PM' → '1 PM'. */
const formatRailTime = (value: string) => formatRecordTime(value).replace(':00', '');

const formatRailDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getTypeColor = (type: string) => {
  if (type === 'income') return '#10B981';
  if (type === 'transfer') return '#3B82F6';
  return '#EF4444';
};

interface TimelineGroup {
  key: string;
  label: string;
  records: LedgerRecord[];
}

/**
 * A day's timeline marks each record's clock time; wider scopes mark the day,
 * since a month of individual times would be one label per record.
 */
const slotFor = (record: LedgerRecord, scope: TimeFilterValue) => {
  if (scope === 'day') {
    if (!record.time) return { key: 'untimed', label: 'No time' };
    return { key: `time:${record.time}`, label: formatRailTime(record.time) };
  }
  return { key: `date:${record.date}`, label: formatRailDate(record.date) };
};

/** Consecutive records sharing a slot hang off the same time marker. */
const buildGroups = (records: LedgerRecord[], scope: TimeFilterValue): TimelineGroup[] =>
  records.reduce<TimelineGroup[]>((groups, record) => {
    const { key, label } = slotFor(record, scope);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.records.push(record);
    else groups.push({ key, label, records: [record] });
    return groups;
  }, []);

export const RecordTimeline: React.FC<RecordTimelineProps> = ({ records, scope, onSelect }) => {
  const { streams, accounts } = useData();
  const { formatMoney: formatCurrency } = useCurrency();
  const { isDark } = useTheme();

  const groups = buildGroups(records, scope);

  const getRecordTitle = (record: LedgerRecord) => {
    if (record.type === 'transfer') {
      const fromName = accounts.find((a) => a.id === record.fromAccountId)?.name || 'Unknown account';
      const toName = accounts.find((a) => a.id === record.toAccountId)?.name || 'Unknown account';
      return `${fromName} → ${toName}`;
    }
    return streams.find((s) => s.id === record.streamId)?.name || 'Unknown';
  };

  return (
    <div>
      {groups.map((group, groupIndex) => (
        <div key={`${group.key}-${groupIndex}`}>
          {/* Time marker — the rail breaks here, the way a clock label would */}
          <div className={groupIndex === 0 ? '' : 'pt-2'}>
            <span className="block w-14 pl-0.5 text-[10px] font-bold uppercase leading-tight tracking-wide text-muted-foreground">
              {group.label}
            </span>
          </div>

          {group.records.map((record, recordIndex) => {
            const isLastOverall =
              groupIndex === groups.length - 1 && recordIndex === group.records.length - 1;
            const stream = streams.find((s) => s.id === record.streamId);
            const isIncome = record.type === 'income';
            const isTransfer = record.type === 'transfer';
            const fromAccount = isTransfer
              ? accounts.find((a) => a.id === record.fromAccountId)
              : undefined;
            const iconColor = isTransfer ? fromAccount?.color || '#3B82F6' : stream?.color || '#6B7280';
            const typeColor = getTypeColor(record.type);
            const TypeIcon = isTransfer ? ArrowLeftRight : isIncome ? TrendingUp : TrendingDown;
            const gradient = isDark
              ? `linear-gradient(95deg, ${iconColor}20 0%, transparent 40%, ${typeColor}18 72%, transparent 100%)`
              : 'none';
            // The rail already carries the time on a day view; wider scopes need it.
            const meta =
              scope !== 'day' && record.time
                ? `${record.note || 'No description'} · ${formatRecordTime(record.time)}`
                : record.note || 'No description';

            return (
              <div key={record.id} className="flex items-stretch gap-1">
                {/* Rail: node for this record, line down to the next one */}
                <div className="relative w-14 shrink-0" aria-hidden>
                  <span
                    className={`absolute left-1/2 w-px -translate-x-1/2 bg-border ${
                      isLastOverall ? 'top-0 h-[22px]' : 'inset-y-0'
                    }`}
                  />
                  <span
                    className="absolute left-1/2 top-4 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 bg-card"
                    style={{ borderColor: typeColor }}
                  />
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(record.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(record.id);
                    }
                  }}
                  className="group relative my-1 w-full min-w-0 flex-1 overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all cursor-pointer hover:border-primary/25 hover:shadow-md active:scale-[0.995] dark:border-border/40 dark:bg-zinc-950/45"
                >
                  {isDark && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-70 transition-opacity group-hover:opacity-85"
                      style={{ background: gradient }}
                    />
                  )}
                  <div className="relative flex items-center gap-2.5 px-2.5 py-2">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md shadow-sm"
                      style={{ backgroundColor: iconColor }}
                    >
                      {isTransfer ? (
                        <ArrowLeftRight size={15} style={{ color: '#ffffff' }} />
                      ) : (
                        <IconComponent
                          name={stream?.iconName || 'Circle'}
                          size={15}
                          style={{ color: '#ffffff' }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {getRecordTitle(record)}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-md"
                            style={{
                              backgroundColor: `${typeColor}${isDark ? '16' : '12'}`,
                              color: typeColor,
                            }}
                            title={isTransfer ? 'Transfer' : isIncome ? 'Incoming' : 'Outgoing'}
                          >
                            <TypeIcon size={11} strokeWidth={2.5} />
                          </span>
                          <p
                            className="text-xs font-bold tabular-nums leading-none"
                            style={{ color: typeColor }}
                          >
                            {isTransfer ? '' : isIncome ? '+' : '−'}
                            {formatCurrency(record.amount)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
                        {meta}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
