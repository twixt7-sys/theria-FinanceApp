import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type TimeFilterValue = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface TimeFilterProps {
  value: TimeFilterValue;
  onChange: (value: TimeFilterValue) => void;
  currentDate?: Date;
  onNavigateDate?: (direction: 'prev' | 'next') => void;
  showNavigation?: boolean;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  value,
  onChange,
  currentDate = new Date(),
  onNavigateDate,
  showNavigation = true,
}) => {
  const filters: TimeFilterValue[] = ['day', 'week', 'month', 'quarter', 'year'];

  const formatDateDisplay = () => {
    const date = currentDate;

    switch (value) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return `${weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`;
      }

      case 'month':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

      case 'quarter': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      }

      case 'year':
        return date.getFullYear().toString();

      default:
        return '';
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* filter buttons */}
      <div className="w-full flex justify-center">
        <div className="inline-flex items-center gap-1 p-1 bg-card rounded-lg shadow-md border border-border">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => onChange(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                value === filter
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* navigation */}
      {showNavigation && onNavigateDate && (
        <div className="w-full flex justify-center">
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => onNavigateDate('prev')}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm"
              title="Previous"
            >
              <ChevronLeft size={16} className="text-foreground" />
            </button>

            <div className="px-4 py-1.5 bg-card rounded-lg border border-border shadow-sm min-w-[160px] text-center">
              <span className="text-xs font-semibold text-foreground">
                {formatDateDisplay()}
              </span>
            </div>

            <button
              onClick={() => onNavigateDate('next')}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm"
              title="Next"
            >
              <ChevronRight size={16} className="text-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
