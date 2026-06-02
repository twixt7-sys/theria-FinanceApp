import React from 'react';
import {
  ArrowLeftRight,
  Calendar,
  Edit2,
  MessageSquare,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useData } from '../../../core/state/DataContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { SimpleFormModal } from '../../../shared/components/SimpleFormModal';
import type { Record as FinanceRecord } from '../../../core/state/DataContext';

interface RecordDetailsModalProps {
  recordId: string | null;
  onClose: () => void;
  onEdit: (recordId: string) => void;
  onDelete: (recordId: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

function getTypeStyles(record: FinanceRecord) {
  if (record.type === 'income') {
    return {
      shell: 'from-emerald-500/20 via-card to-card border-emerald-500/25',
      amount: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
      icon: TrendingUp,
      label: 'Incoming',
    };
  }
  if (record.type === 'transfer') {
    return {
      shell: 'from-blue-500/20 via-card to-card border-blue-500/25',
      amount: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
      icon: ArrowLeftRight,
      label: 'Transfer',
    };
  }
  return {
    shell: 'from-red-500/20 via-card to-card border-red-500/25',
    amount: 'text-destructive',
    badge: 'bg-red-500/15 text-red-700 dark:text-red-300',
    icon: TrendingDown,
    label: 'Outgoing',
  };
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  recordId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { records, streams, accounts } = useData();
  const record = recordId ? records.find((r) => r.id === recordId) : undefined;

  if (!record) return null;

  const stream = streams.find((s) => s.id === record.streamId);
  const fromAccount = record.fromAccountId
    ? accounts.find((a) => a.id === record.fromAccountId)
    : undefined;
  const toAccount = record.toAccountId
    ? accounts.find((a) => a.id === record.toAccountId)
    : undefined;
  const styles = getTypeStyles(record);
  const TypeIcon = styles.icon;
  const accentColor = stream?.color || (record.type === 'transfer' ? '#3B82F6' : '#6B7280');

  return (
    <SimpleFormModal
      isOpen={!!recordId}
      onClose={onClose}
      title="Record Details"
      className="max-w-[min(100%,23.5rem)]"
    >
      <div className="space-y-3.5">
        <div
          className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3.5 ${styles.shell}`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              {record.type === 'transfer' ? (
                <ArrowLeftRight size={18} className="text-white" />
              ) : (
                <IconComponent
                  name={stream?.iconName || 'Circle'}
                  size={18}
                  style={{ color: 'white' }}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-foreground truncate">
                {stream?.name || 'Unknown stream'}
              </p>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
              >
                <TypeIcon size={12} />
                {styles.label}
              </span>
            </div>
          </div>
          <p className={`mt-3 text-[1.35rem] leading-none font-bold tabular-nums ${styles.amount}`}>
            {record.type === 'income' ? '+' : '−'}
            {formatCurrency(record.amount)}
          </p>
        </div>

        <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-2.5">
          <DetailRow
            icon={<Calendar size={14} className="text-primary" />}
            label="Date"
            value={formatDate(record.date)}
          />
          <DetailRow
            icon={<MessageSquare size={14} className="text-primary" />}
            label="Note"
            value={record.note?.trim() || 'No description'}
          />
          {fromAccount && (
            <DetailRow
              icon={<Wallet size={14} className="text-primary" />}
              label="From account"
              value={fromAccount.name}
            />
          )}
          {toAccount && (
            <DetailRow
              icon={<Wallet size={14} className="text-primary" />}
              label="To account"
              value={toAccount.name}
            />
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/80">
          <button
            type="button"
            onClick={() => onDelete(record.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/15 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
          <button
            type="button"
            onClick={() => onEdit(record.id)}
            className="flex flex-[1.2] items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Edit2 size={14} />
            Edit Record
          </button>
        </div>
      </div>
    </SimpleFormModal>
  );
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className="mt-0.5 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md bg-primary/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-[13px] font-medium text-foreground leading-snug break-words">{value}</p>
      </div>
    </div>
  );
}
