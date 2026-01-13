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
    <div className="w-full flex flex-col gap-3">
      {/* filter buttons */}
      <div className="w-full">
        <div className="grid grid-cols-5 gap-2 p-1 bg-card rounded-lg shadow-md border border-border">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => onChange(filter)}
              className={`w-full px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-300 ease-in-out whitespace-nowrap ${
                value === filter
                  ? 'bg-primary text-white shadow-sm scale-105'
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
        <div className="w-full">
          <div className="grid grid-cols-8 items-center gap-2 w-full">
            <button
              onClick={() => onNavigateDate('prev')}
              className="col-span-1 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[40px]"
              title="Previous"
            >
              <ChevronLeft size={16} className="text-foreground mx-auto" />
            </button>

            <div className="col-span-6 px-4 py-2 bg-card rounded-lg border border-border shadow-sm text-center">
              <span className="text-xs font-semibold text-foreground">
                {formatDateDisplay()}
              </span>
            </div>

            <button
              onClick={() => onNavigateDate('next')}
              className="col-span-1 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[40px]"
              title="Next"
            >
              <ChevronRight size={16} className="text-foreground mx-auto" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
