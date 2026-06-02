import React, { useEffect, useState } from 'react';
import { CalendarRange, RotateCcw } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from './ui/calendar';
import { SimpleFormModal } from './SimpleFormModal';

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange: (startDate: Date, endDate: Date) => void;
}

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  isOpen,
  onClose,
  onSelectRange,
}) => {
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (!isOpen) return;

    try {
      const stored = sessionStorage.getItem('customDateRange');
      if (stored) {
        const { startDate, endDate } = JSON.parse(stored) as {
          startDate: string;
          endDate: string;
        };
        setRange({
          from: startOfDay(new Date(startDate)),
          to: startOfDay(new Date(endDate)),
        });
        return;
      }
    } catch {
      /* use defaults */
    }

    const today = startOfDay(new Date());
    setRange({ from: today, to: today });
  }, [isOpen]);

  const handleReset = () => {
    const today = startOfDay(new Date());
    setRange({ from: today, to: today });
  };

  const handleSubmit = () => {
    if (!range?.from) return;

    const from = startOfDay(range.from);
    const to = startOfDay(range.to ?? range.from);
    const startDate = from <= to ? from : to;
    const endDate = from <= to ? to : from;

    onSelectRange(startDate, endDate);
    onClose();
  };

  const canApply = Boolean(range?.from);
  const dayCount =
    range?.from && range?.to
      ? Math.round(
          (startOfDay(range.to).getTime() - startOfDay(range.from).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : range?.from
        ? 1
        : 0;

  return (
    <SimpleFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Date Range"
      className="max-w-[min(100%,22rem)] sm:max-w-md"
    >
      <div className="space-y-4 -mx-1 sm:mx-0">
        <p className="text-xs text-muted-foreground text-center leading-relaxed px-1">
          Tap a start date, then an end date on the calendar below.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div
            className={`rounded-xl border px-3 py-2.5 transition-colors ${
              range?.from
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-muted/20'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Start
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground truncate">
              {range?.from ? formatDateLabel(range.from) : '—'}
            </p>
          </div>
          <div
            className={`rounded-xl border px-3 py-2.5 transition-colors ${
              range?.to
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-muted/20'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              End
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground truncate">
              {range?.to ? formatDateLabel(range.to) : range?.from ? 'Same day' : '—'}
            </p>
          </div>
        </div>

        {dayCount > 0 && (
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-muted/40 py-1.5 text-xs text-muted-foreground">
            <CalendarRange size={14} className="text-primary shrink-0" />
            <span>
              {dayCount} day{dayCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-muted/20 p-1 shadow-inner overflow-hidden">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            defaultMonth={range?.from}
            numberOfMonths={1}
            initialFocus
            className="w-full p-0"
            classNames={{
              months: 'flex w-full justify-center',
              month: 'w-full space-y-3',
              caption: 'flex justify-center pt-1 relative items-center px-8',
              caption_label: 'text-sm font-semibold text-foreground',
              nav: 'flex items-center gap-1',
              nav_button:
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground opacity-80 hover:bg-muted hover:opacity-100',
              nav_button_previous: 'absolute left-0',
              nav_button_next: 'absolute right-0',
              table: 'w-full border-collapse',
              head_row: 'flex w-full',
              head_cell:
                'text-muted-foreground w-full font-medium text-[0.65rem] sm:text-xs flex-1 text-center',
              row: 'flex w-full mt-1',
              cell: [
                'relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20 overflow-hidden',
                '[&:has(.day-range-middle)]:bg-primary/15',
                '[&:has(.day-range-start)]:bg-primary/15 [&:has(.day-range-start)]:rounded-l-xl',
                '[&:has(.day-range-end)]:bg-primary/15 [&:has(.day-range-end)]:rounded-r-xl',
              ].join(' '),
              day: 'h-8 w-full max-w-[2.25rem] mx-auto p-0 font-normal aria-selected:opacity-100 hover:bg-muted/60',
              day_range_start:
                'day-range-start rounded-l-xl rounded-r-none bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground [&.day-range-end]:rounded-xl',
              day_range_end:
                'day-range-end rounded-r-xl rounded-l-none bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground [&.day-range-start]:rounded-xl',
              day_selected: 'text-foreground',
              day_today: 'ring-1 ring-primary/40 font-semibold',
              day_outside: 'text-muted-foreground/40 aria-selected:text-muted-foreground',
              day_disabled: 'text-muted-foreground opacity-40',
              day_range_middle:
                'day-range-middle rounded-none bg-transparent text-foreground aria-selected:bg-transparent aria-selected:text-foreground',
            }}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center pt-1 border-t border-border">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors sm:flex-1"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors sm:flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canApply}
            className="rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:flex-[1.25]"
          >
            Apply Range
          </button>
        </div>
      </div>
    </SimpleFormModal>
  );
};
