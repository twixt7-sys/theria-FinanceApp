import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { TimeFilterValue } from '../../shared/components/TimeFilter';
import { pathFor, type Screen } from '../routes';

type RecordType = 'income' | 'expense' | 'transfer';
type StreamType = 'income' | 'expense';
export type ModalName =
  | 'record'
  | 'budget'
  | 'savings'
  | 'account'
  | 'stream'
  | 'customDate';

interface UiContextType {
  timeFilter: TimeFilterValue;
  setTimeFilter: (value: TimeFilterValue) => void;
  leaveCustomMode: () => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  navigateDate: (direction: 'prev' | 'next') => void;

  filterOpen: boolean;
  toggleFilter: () => void;
  /** Reveals the range control, or the range picker when already custom. */
  openTimeFilter: () => void;
  /** Reveals the range control, whatever the current scope is. */
  showTimeFilter: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  fabOpen: boolean;
  setFabOpen: (open: boolean) => void;
  homeTab: 'dashboard' | 'newsfeed' | 'analysis';
  setHomeTab: (tab: 'dashboard' | 'newsfeed' | 'analysis') => void;

  openModal: ModalName | null;
  closeModal: () => void;
  recordType: RecordType;
  streamType: StreamType;
  /** Navigates to the owning screen, then opens its add modal. */
  openAdd: (modal: Exclude<ModalName, 'customDate'>, type?: RecordType) => void;
  openCustomDate: () => void;
  applyCustomDateRange: (startDate: Date, endDate: Date) => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

/** Which screen each add action belongs to. */
const SCREEN_FOR_MODAL: Record<Exclude<ModalName, 'customDate'>, Screen> = {
  record: 'records',
  budget: 'budget',
  savings: 'savings',
  account: 'accounts',
  stream: 'streams',
};

/**
 * Ephemeral chrome state shared by the shell and the screens: filters, the
 * sidebar, and the global add modals. Deliberately not in the URL — it is
 * transient view state, not a location.
 */
export const UiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const [timeFilter, setTimeFilterState] = useState<TimeFilterValue>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const lastStandardTimeFilter = useRef<TimeFilterValue>('month');

  const [filterOpen, setFilterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [homeTab, setHomeTab] = useState<'dashboard' | 'newsfeed' | 'analysis'>('dashboard');

  const [openModal, setOpenModal] = useState<ModalName | null>(null);
  const [recordType, setRecordType] = useState<RecordType>('expense');
  const [streamType, setStreamType] = useState<StreamType>('income');

  const setTimeFilter = useCallback((value: TimeFilterValue) => {
    if (value !== 'custom') lastStandardTimeFilter.current = value;
    setTimeFilterState(value);
  }, []);

  const leaveCustomMode = useCallback(() => {
    setTimeFilterState(lastStandardTimeFilter.current);
  }, []);

  const navigateDate = useCallback(
    (direction: 'prev' | 'next') => {
      const step = direction === 'next' ? 1 : -1;
      // A custom range has no natural step, so stepping falls back to months.
      const unit = timeFilter === 'custom' ? 'month' : timeFilter;
      if (timeFilter === 'custom') setTimeFilter('month');

      setCurrentDate((current) => {
        const next = new Date(current);
        switch (unit) {
          case 'day':
            next.setDate(current.getDate() + step);
            break;
          case 'week':
            next.setDate(current.getDate() + step * 7);
            break;
          case 'month':
            next.setMonth(current.getMonth() + step);
            break;
          case 'quarter':
            next.setMonth(current.getMonth() + step * 3);
            break;
          case 'year':
            next.setFullYear(current.getFullYear() + step);
            break;
        }
        return next;
      });
    },
    [timeFilter, setTimeFilter],
  );

  const openAdd = useCallback<UiContextType['openAdd']>(
    (modal, type) => {
      if (modal === 'record' && type) setRecordType(type);
      if (modal === 'stream') setStreamType('income');
      setFabOpen(false);
      navigate(pathFor(SCREEN_FOR_MODAL[modal]));
      setOpenModal(modal);
    },
    [navigate],
  );

  const applyCustomDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      setTimeFilter('custom');
      setCurrentDate(startDate);
      sessionStorage.setItem(
        'customDateRange',
        JSON.stringify({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
      );
    },
    [setTimeFilter],
  );

  const value = useMemo<UiContextType>(
    () => ({
      timeFilter,
      setTimeFilter,
      leaveCustomMode,
      currentDate,
      setCurrentDate,
      navigateDate,
      filterOpen,
      toggleFilter: () => setFilterOpen((open) => !open),
      openTimeFilter: () => {
        if (timeFilter === 'custom') setOpenModal('customDate');
        else setFilterOpen(true);
      },
      showTimeFilter: () => setFilterOpen(true),
      sidebarOpen,
      setSidebarOpen,
      fabOpen,
      setFabOpen,
      homeTab,
      setHomeTab,
      openModal,
      closeModal: () => setOpenModal(null),
      recordType,
      streamType,
      openAdd,
      openCustomDate: () => setOpenModal('customDate'),
      applyCustomDateRange,
    }),
    [
      timeFilter,
      setTimeFilter,
      leaveCustomMode,
      currentDate,
      navigateDate,
      filterOpen,
      sidebarOpen,
      fabOpen,
      homeTab,
      openModal,
      recordType,
      streamType,
      openAdd,
      applyCustomDateRange,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) throw new Error('useUi must be used within UiProvider');
  return context;
};

/** The filter props every screen takes, assembled once. */
export const useScreenFilterProps = () => {
  const { timeFilter, setTimeFilter, currentDate, navigateDate } = useUi();
  return {
    timeFilter,
    onTimeFilterChange: setTimeFilter,
    currentDate,
    onNavigateDate: navigateDate,
    showInlineFilter: false,
  };
};
