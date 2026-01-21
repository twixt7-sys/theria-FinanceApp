import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type TimeFilterValue = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

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
  const filters: TimeFilterValue[] = ['day', 'week', 'month', 'quarter', 'year', 'custom'];

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

      case 'custom': {
        // Try to get custom range from sessionStorage
        const customRange = sessionStorage.getItem('customDateRange');
        if (customRange) {
          try {
            const { startDate, endDate } = JSON.parse(customRange);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return `${start.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })} - ${end.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}`;
          } catch (e) {
            return 'Custom Range';
          }
        }
        return 'Custom Range';
      }

      default:
        return '';
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* filter buttons - hide when custom is selected */}
      {value !== 'custom' && (
        <div className="w-full">
          <div className="grid grid-cols-5 gap-1.5 p-0.5 bg-card rounded-lg shadow-md border border-border">
            {filters.filter(filter => filter !== 'custom').map(filter => (
              <button
                key={filter}
                onClick={() => onChange(filter)}
                className={`w-full px-2 py-1 rounded-md text-[11px] font-semibold capitalize transition-all duration-300 ease-in-out whitespace-nowrap ${
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
      )}

      {/* navigation - always show for custom, show for others if enabled */}
      {showNavigation && onNavigateDate && (value === 'custom' || filters.includes(value)) && (
        <div className="w-full">
          <div className="grid grid-cols-8 items-center gap-1.5 w-full">
            <button
              onClick={() => onNavigateDate('prev')}
              className="col-span-1 p-1.5 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[34px]"
              title="Previous"
            >
              <ChevronLeft size={14} className="text-foreground mx-auto" />
            </button>

            <div className="col-span-6 px-3 py-1.5 bg-card rounded-lg border border-border shadow-sm text-center">
              <span className="text-[11px] font-semibold text-foreground">
                {formatDateDisplay()}
              </span>
            </div>

            <button
              onClick={() => onNavigateDate('next')}
              className="col-span-1 p-1.5 rounded-lg bg-card border border-border hover:bg-muted transition-all shadow-sm min-w-[34px]"
              title="Next"
            >
              <ChevronRight size={14} className="text-foreground mx-auto" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
