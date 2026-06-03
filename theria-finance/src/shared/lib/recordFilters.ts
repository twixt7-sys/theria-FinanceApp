import type { Record } from '../../core/state/DataContext';
import type { TimeFilterValue } from '../components/TimeFilter';

export function filterRecordsByTimeFilter(
  records: Record[],
  activeTimeFilter: TimeFilterValue,
  activeDate: Date
): Record[] {
  return records.filter((r) => {
    const recordDate = new Date(r.date);
    switch (activeTimeFilter) {
      case 'day':
        return recordDate.toDateString() === activeDate.toDateString();
      case 'week': {
        const weekAgo = new Date(activeDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        return recordDate >= weekAgo;
      }
      case 'month':
        return (
          recordDate.getMonth() === activeDate.getMonth() &&
          recordDate.getFullYear() === activeDate.getFullYear()
        );
      case 'quarter': {
        const quarter = Math.floor(activeDate.getMonth() / 3);
        const recordQuarter = Math.floor(recordDate.getMonth() / 3);
        return recordQuarter === quarter && recordDate.getFullYear() === activeDate.getFullYear();
      }
      case 'year':
        return recordDate.getFullYear() === activeDate.getFullYear();
      case 'custom': {
        const customRange = sessionStorage.getItem('customDateRange');
        if (customRange) {
          try {
            const { startDate, endDate } = JSON.parse(customRange);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return recordDate >= start && recordDate <= end;
          } catch {
            return true;
          }
        }
        return true;
      }
      default:
        return true;
    }
  });
}

export function computeStreamExpenseTotal(
  records: Record[],
  streamId: string | undefined
): number {
  if (!streamId) return 0;
  return records
    .filter((r) => r.streamId === streamId && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
}
