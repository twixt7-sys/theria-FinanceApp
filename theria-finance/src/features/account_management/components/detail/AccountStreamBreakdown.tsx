import React, { useState } from 'react';
import { TrendingDown, TrendingUp } from '@/shared/icons';
import { useData } from '../../../../core/state/DataContext';
import { CapsuleSelector, type CapsuleOption } from '../../../../shared/components/CapsuleSelector';
import { EmptyState } from '../../../../shared/components/EmptyState';
import { IconComponent } from '../../../../shared/components/IconComponent';
import type { StreamShare } from '../../lib/accountInsights';
import { DetailSection } from './DetailSection';

type Kind = 'expense' | 'income';

/** Rows shown before the rest roll up into a "+N more" note. */
const TOP_COUNT = 5;

const KIND_OPTIONS: CapsuleOption<Kind>[] = [
  { value: 'expense', label: 'Spending', icon: <TrendingDown size={13} strokeWidth={2.5} />, color: '#EF4444' },
  { value: 'income', label: 'Income', icon: <TrendingUp size={13} strokeWidth={2.5} />, color: '#10B981' },
];

interface AccountStreamBreakdownProps {
  breakdown: Record<Kind, StreamShare[]>;
  formatCurrency: (amount: number) => string;
}

/** Which streams drain this account, or feed it, over the selected range. */
export const AccountStreamBreakdown: React.FC<AccountStreamBreakdownProps> = ({ breakdown, formatCurrency }) => {
  const { streams } = useData();
  const [kind, setKind] = useState<Kind>('expense');

  const shares = breakdown[kind];
  const top = shares.slice(0, TOP_COUNT);
  const restCount = shares.length - top.length;

  return (
    <DetailSection
      title="Top streams"
      subtitle={kind === 'expense' ? 'Where the spending went' : 'Where the income came from'}
      action={
        <CapsuleSelector
          id="account-streams-kind"
          options={KIND_OPTIONS}
          value={kind}
          onChange={setKind}
          size="sm"
          iconOnly
          className="w-[5.5rem] shrink-0"
        />
      }
    >
      {top.length === 0 ? (
        <EmptyState
          title={kind === 'expense' ? 'No spending yet' : 'No income yet'}
          hint="Nothing logged in this period"
          className="py-6"
        />
      ) : (
        <div className="space-y-3">
          {top.map((share) => {
            const stream = streams.find((s) => s.id === share.streamId);
            const color = stream?.color || '#6B7280';
            const pct = Math.round(share.share * 100);
            return (
              <div key={share.streamId} className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <IconComponent name={stream?.iconName || 'Circle'} size={15} style={{ color: '#ffffff' }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {stream?.name || 'Unknown stream'}
                    </p>
                    <p className="shrink-0 text-xs font-bold tabular-nums text-foreground">
                      {formatCurrency(share.amount)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[10px] font-semibold tabular-nums text-muted-foreground">
                      {pct}% · {share.count}×
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {restCount > 0 && (
            <p className="pt-0.5 text-[11px] font-medium text-muted-foreground">
              + {restCount} more {restCount === 1 ? 'stream' : 'streams'}
            </p>
          )}
        </div>
      )}
    </DetailSection>
  );
};
