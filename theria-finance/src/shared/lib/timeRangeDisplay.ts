import type { TimeFilterValue } from '../components/TimeFilter';

const PERIOD_LABELS: Record<TimeFilterValue, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
  quarter: 'This quarter',
  year: 'This year',
  custom: 'Custom range',
};

export function getTimeFilterLabel(timeFilter: TimeFilterValue): string {
  return PERIOD_LABELS[timeFilter] ?? timeFilter;
}

export function formatTimeRangeDisplay(
  timeFilter: TimeFilterValue,
  currentDate: Date,
): string {
  switch (timeFilter) {
    case 'day':
      return currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'week': {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return `${weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} – ${weekEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }

    case 'month':
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

    case 'quarter': {
      const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
      return `Q${quarter} ${currentDate.getFullYear()}`;
    }

    case 'year':
      return currentDate.getFullYear().toString();

    case 'custom': {
      const customRange = sessionStorage.getItem('customDateRange');
      if (customRange) {
        try {
          const { startDate, endDate } = JSON.parse(customRange);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return `${start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })} – ${end.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`;
        } catch {
          return 'Custom range';
        }
      }
      return 'Custom range';
    }

    default:
      return '';
  }
}
