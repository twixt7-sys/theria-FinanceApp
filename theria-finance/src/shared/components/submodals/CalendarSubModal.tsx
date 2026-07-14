import React from 'react';
import { Clock } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { SimpleFormModal } from '../SimpleFormModal';

interface CalendarSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  /** When true, shows a time-of-day picker and a Done button instead of closing on date pick. */
  showTime?: boolean;
  /** Current time as 'HH:MM' (24h); only used when showTime. */
  time?: string;
  onTimeChange?: (time: string) => void;
}

export const CalendarSubModal: React.FC<CalendarSubModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate,
  showTime = false,
  time = '',
  onTimeChange,
}) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    // Create a new date object with +1 offset to fix timezone issues
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    onSelectDate(normalized);
    // With a time picker the user still needs to confirm; otherwise close right away.
    if (!showTime) onClose();
  };

  return (
    <SimpleFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={showTime ? 'Select Date & Time' : 'Select Date'}
    >
      <div className="w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          className="w-full"
        />

        {showTime && (
          <div className="mt-3 space-y-3 border-t border-border/70 pt-3">
            <label className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock size={15} className="text-primary" strokeWidth={2.25} />
                Time
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => onTimeChange?.(e.target.value)}
                className="rounded-lg border border-border bg-input-background px-3 py-2 text-sm font-semibold tabular-nums shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </label>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </SimpleFormModal>
  );
};
