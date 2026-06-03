import React, { useState, useEffect, useRef } from 'react';
import { Home, FileText, Target, PiggyBank, Wallet, Filter, Bell, FolderOpen, TrendingUp, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from '../core/state/ThemeContext';
import { CurrencyProvider } from '../core/state/CurrencyContext';
import { SimpleModeProvider, useSimpleMode } from '../core/state/SimpleModeContext';
import { AuthProvider, useAuth } from '../core/state/AuthContext';
import { DataProvider } from '../core/state/DataContext';
import { AlertProvider, useAlert } from '../core/state/AlertContext';
import { ModalStackProvider } from '../core/state/ModalStackContext';
import { AlertContainer } from '../shared/components/Alert';
import { SplashScreen } from '../features/authentication/screens/SplashScreen';
import { AuthScreen } from '../features/authentication/screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RecordsScreen } from '../features/records/screens/RecordsScreen';
import { BudgetScreen } from '../features/budgets/screens/BudgetScreen';
import { SavingsScreen } from '../features/savings/screens/SavingsScreen';
import { StreamsScreen } from '../features/streams/screens/StreamsScreen';
import { AccountsScreen } from '../features/account_management/screens/AccountsScreen';
import { CategoriesScreen } from '../features/categories/screens/CategoriesScreen';
import { AnalysisScreen } from '../features/analysis/screens/AnalysisScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { RecentActivityScreen } from '../features/activity_logging/screens/RecentActivityScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { Sidebar } from '../shared/components/Sidebar';
import { TheriaBrandLogo, TheriaBrandWordmark } from '../shared/components/TheriaBrandLogo';
import { FloatingActionButton } from '../shared/components/FloatingActionButton';
import { CustomDateRangeModal } from '../shared/components/CustomDateRangeModal';
import { FloatingCustomPeriodButton } from '../shared/components/FloatingCustomPeriodButton';
import { FloatingTimeDisplay } from '../shared/components/FloatingTimeDisplay';
import { AddRecordModal } from '../features/records/components/AddRecordModal';
import { AddBudgetModal } from '../features/budgets/components/AddBudgetModal';
import { AddSavingsModal } from '../features/savings/components/AddSavingsModal';
import { AddAccountModal } from '../features/account_management/components/AddAccountModal';
import { AddStreamModal } from '../features/streams/components/AddStreamModal';
import { AddCategoryModal } from '../features/categories/components/AddCategoryModal';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { StreakScreen } from '../features/streaks/screens/StreakScreen';
import { AboutScreen } from '../features/about/screens/AboutScreen';
import { TimeFilter, type TimeFilterValue } from '../shared/components/TimeFilter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shared/components/ui/dropdown-menu';

type Screen = 'home' | 'records' | 'budget' | 'savings' | 'streams' | 'accounts' | 'categories' | 'analysis' | 'profile' | 'activity' | 'notifications' | 'settings' | 'streak' | 'about';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { alerts, removeAlert } = useAlert();
  const { simpleMode } = useSimpleMode();
  const simpleModeInitialized = useRef(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Modal states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [recordType, setRecordType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [streamType, setStreamType] = useState<'income' | 'expense'>('income');
  const [showSecondaryFeatures, setShowSecondaryFeatures] = useState(false);
  const [homeTab, setHomeTab] = useState<'dashboard' | 'newsfeed' | 'analysis'>('dashboard');

  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const lastStandardTimeFilterRef = useRef<TimeFilterValue>('month');

  const handleTimeFilterChange = (value: TimeFilterValue) => {
    if (value !== 'custom') {
      lastStandardTimeFilterRef.current = value;
    }
    setTimeFilter(value);
  };

  const leaveCustomMode = () => {
    setTimeFilter(lastStandardTimeFilterRef.current);
  };

  const handleSidebarNavigate = (screen: string) => {
    if (screen === 'newsfeed') {
      setHomeTab('newsfeed');
      setCurrentScreen('home');
      return;
    }
    if (screen === 'home') {
      setHomeTab('dashboard');
    }
    setCurrentScreen(screen as Screen);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!simpleModeInitialized.current) {
      simpleModeInitialized.current = true;
      return;
    }
    setSidebarOpen(false);
    setHomeTab('dashboard');
    setCurrentScreen('home');
  }, [simpleMode]);

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const navItems = [
    { id: 'records' as Screen, icon: FileText, label: 'Records', color: 'blue' },
    { id: 'streams' as Screen, icon: TrendingUp, label: 'Streams', color: 'yellow' },
    { id: 'budget' as Screen, icon: Target, label: 'Budget', color: 'peach' },
    { id: 'home' as Screen, icon: Home, label: 'Home', color: 'primary' },
    { id: 'savings' as Screen, icon: PiggyBank, label: 'Savings', color: 'pink' },
    { id: 'categories' as Screen, icon: FolderOpen, label: 'Categories', color: 'violet' },
    { id: 'accounts' as Screen, icon: Wallet, label: 'Accounts', color: 'brown' },
  ];
  const visibleNavItems = showSecondaryFeatures
    ? navItems
    : navItems.filter((item) => item.id !== 'budget' && item.id !== 'savings');
  const homeNavIndex = visibleNavItems.findIndex((item) => item.id === 'home');
  const leftWingItems = visibleNavItems.slice(0, homeNavIndex);
  const rightWingItems = visibleNavItems.slice(homeNavIndex + 1);
  
  const viewportScrollLockScreens: Screen[] = ['records'];
  const lockViewportScroll = viewportScrollLockScreens.includes(currentScreen);

  const filterableScreens: Screen[] = [
  'home',
  'budget',
  'savings',
  'analysis',
  'records',
  'activity',
  'streams',
  'categories',
  'accounts'
];

const timeFilterScreens: Screen[] = [
  'home',
  'budget',
  'savings',
  'analysis',
  'records',
  'activity',
  'accounts'
];

  const getPageTitle = () => {
    switch (currentScreen) {
      case 'home': return 'Dashboard';
      case 'records': return 'Records';
      case 'budget': return 'Budget';
      case 'savings': return 'Savings';
      case 'streams': return 'Streams';
      case 'accounts': return 'Accounts';
      case 'categories': return 'Categories';
      case 'analysis': return 'Analysis';
      case 'profile': return 'Profile';
      case 'activity': return 'Recent Activity';
      case 'notifications': return 'Notifications';
      case 'settings': return 'Settings';
      case 'streak': return 'Streak';
      case 'about': return 'About';
      default: return 'Dashboard';
    }
  };

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    // If currently in custom mode, switch to month and then navigate
    if (timeFilter === 'custom') {
      handleTimeFilterChange('month');
    }

    switch (timeFilter === 'custom' ? 'month' : timeFilter) {
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }

    setCurrentDate(newDate);
  };

  const openTimeFilter = () => {
    if (timeFilter === 'custom') {
      setShowCustomDateModal(true);
      return;
    }
    setFilterOpen(true);
  };

  const renderScreen = () => {
    const sharedFilterProps = {
      timeFilter,
      onTimeFilterChange: handleTimeFilterChange,
      currentDate,
      onNavigateDate: handleNavigateDate,
      showInlineFilter: false,
    };

    switch (currentScreen) {
      case 'home': return <HomeScreen 
            onNavigate={(screen) => setCurrentScreen(screen as Screen)} 
            timeFilter={timeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            currentDate={currentDate}
            onNavigateDate={handleNavigateDate}
            activeTab={homeTab}
            onActiveTabChange={setHomeTab}
            onOpenTimeFilter={openTimeFilter}
          />;
      case 'records': return <RecordsScreen {...sharedFilterProps} />;
      case 'budget': return <BudgetScreen {...sharedFilterProps} />;
      case 'savings': return <SavingsScreen {...sharedFilterProps} />;
      case 'streams': return (
        <StreamsScreen
          filterOpen={filterOpen}/>
      );
      case 'accounts': return (
        <AccountsScreen
          {...sharedFilterProps}
          filterOpen={filterOpen}/>
      );
      case 'categories': return (
        <CategoriesScreen
          filterOpen={filterOpen}
          onToggleFilter={() => setFilterOpen((v) => !v)}
        />
      );
      case 'analysis': return <AnalysisScreen {...sharedFilterProps} />;
      case 'profile': return <ProfileScreen />;
      case 'activity': return <RecentActivityScreen {...sharedFilterProps} />;
      case 'notifications': return <NotificationsScreen />;
      case 'settings': return <SettingsScreen />;
      case 'streak': return <StreakScreen />;
      case 'about': return <AboutScreen />;
      default: return <HomeScreen />;
    }
  };

  const navigateAndOpen = (screen: Screen, open: () => void) => {
    setCurrentScreen(screen);
    setFabOpen(false);
    open();
  };

  const openRecordModal = (type: 'income' | 'expense' | 'transfer') => {
    setRecordType(type);
    navigateAndOpen('records', () => setShowRecordModal(true));
  };

  const handleAddStream = () => {
    setStreamType('income');
    navigateAndOpen('streams', () => setShowStreamModal(true));
  };

  const handleAddCategory = () => {
    navigateAndOpen('categories', () => setShowCategoryModal(true));
  };

  const handleAddRequest = () => openRecordModal('transfer');

  const openBudgetModal = () => navigateAndOpen('budget', () => setShowBudgetModal(true));
  const openSavingsModal = () => navigateAndOpen('savings', () => setShowSavingsModal(true));
  const openAccountModal = () => navigateAndOpen('accounts', () => setShowAccountModal(true));

  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    if (timeFilter !== 'custom') {
      lastStandardTimeFilterRef.current = timeFilter;
    }
    setTimeFilter('custom');
    setCurrentDate(startDate);
    
    // Store the custom range in sessionStorage or state as needed
    sessionStorage.setItem('customDateRange', JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }));
  };

  const NavButton = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
  const Icon = item.icon;
  
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    peach: 'text-orange-300 bg-orange-300/10',
    pink: 'text-pink-500 bg-pink-500/10',
    brown: 'text-amber-700 bg-amber-700/10',
    violet: 'text-violet-500 bg-violet-500/10',
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        isActive ? colors[item.color] || 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <motion.div 
          layoutId="nav-dot"
          className="absolute -bottom-1 w-1 h-1 bg-current rounded-full" 
        />
      )}
    </button>
  );
};

  return (
    <div
      className={
        lockViewportScroll
          ? 'flex h-dvh flex-col overflow-hidden bg-background'
          : 'min-h-dvh bg-background pb-bottom-nav'
      }
    >
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/90 pt-safe shadow-md backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-2 py-1.5 sm:gap-3">
            {/* Left: Minimal Brand + Page Title */}
            <div className="flex min-w-0 flex-1 items-center sm:max-w-md sm:flex-none">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex min-w-0 max-w-full items-center gap-2.5 rounded-lg p-1 outline-none focus-visible:outline-none"
                title="Menu"
              >
                <TheriaBrandLogo size="sm" />
                <div className="flex min-w-0 items-center gap-2">
                  <TheriaBrandWordmark />
                  <span className="shrink-0 text-muted-foreground" aria-hidden>
                    •
                  </span>
                  <h2 className="min-w-0 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                    {getPageTitle()}
                  </h2>
                </div>
              </button>
            </div>

            {/* Right: Theme, filters, notifications, profile */}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
              <div className="flex items-center gap-2">
                {filterableScreens.includes(currentScreen) && (
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground ${
                      filterOpen ? 'bg-primary/10' : ''
                    }`}
                    title="Toggle Filters"
                  >
                    <Filter size={18} />
                  </button>
                )}

                <button
                  onClick={() => setCurrentScreen('notifications')}
                  className={`p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground ${
                    currentScreen === 'notifications' ? 'bg-primary/10' : ''
                  }`}
                  title="Notifications"
                >
                  <Bell size={16} />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 hover:bg-muted rounded-lg p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="Profile menu"
                      aria-label="Profile menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                        <span className="text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="hidden sm:inline text-xs font-semibold text-foreground">{user?.username}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[10rem]">
                    <DropdownMenuItem onClick={() => setCurrentScreen('profile')}>
                      <User size={16} />
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentScreen('settings')}>
                      <Settings size={16} />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {timeFilterScreens.includes(currentScreen) && filterOpen && (
              <motion.div
                key="time-filter"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-2">
                  <TimeFilter
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                    currentDate={currentDate}
                    onNavigateDate={handleNavigateDate}
                    onLeaveCustom={leaveCustomMode}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={
          lockViewportScroll
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden w-full px-4 py-6 pb-bottom-nav sm:px-6 lg:px-8'
            : 'w-full px-4 sm:px-6 lg:px-8 py-6'
        }
      >
        <div
          className={
            lockViewportScroll
              ? 'mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col'
              : 'max-w-7xl mx-auto'
          }
        >
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={lockViewportScroll ? 'flex min-h-0 flex-1 flex-col' : undefined}
          >
            {renderScreen()}
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation */}
<div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-md shadow-[0_-14px_28px_-10px_rgba(148,163,184,0.55)] dark:shadow-[0_-14px_28px_-10px_rgba(0,0,0,0.45)]">
  <div
    aria-hidden
    className="pointer-events-none absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-slate-300/55 via-slate-200/25 to-transparent dark:from-black/35 dark:via-black/20 dark:to-transparent"
  />
  <div className="relative max-w-7xl mx-auto px-2 pb-safe pt-2 sm:px-4 lg:px-6">
    <div className="flex items-end justify-between">
      {/* Left Wing */}
      <div className="flex flex-1 items-center justify-around mb-2 max-w-md">
        {leftWingItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={currentScreen === item.id} onClick={() => setCurrentScreen(item.id)} />
        ))}
      </div>

      {/* Center Hexagonal Button */}
      <div className="relative flex flex-col items-center px-4 transition-all duration-300 ease-out flex-shrink-0 -translate-y-1" 
           style={{ transform: currentScreen === 'home' ? 'translateY(-1.80rem) scale(1.15)' : 'translateY(0)' }}>
        <button
          onClick={() => setCurrentScreen('home')}
          className={`group relative flex h-12 w-12 items-center justify-center hexagon transition-all duration-300 ${
            currentScreen === 'home' 
              ? 'active text-white scale-110' 
              : 'text-muted-foreground hover:scale-105'
          }`}
        >
          <Home size={20} strokeWidth={2} className="relative z-10" />
        </button>
        {/* Enhanced Glow for Active Home */}
        {currentScreen === 'home' && (
          <div className="absolute -bottom-2 h-4 w-12 bg-green-500/30 blur-lg rounded-full animate-pulse" />
        )}
      </div>

      {/* Right Wing */}
      <div className="flex flex-1 items-center justify-around mb-2 max-w-md">
        {rightWingItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={currentScreen === item.id} onClick={() => setCurrentScreen(item.id)} />
        ))}
      </div>
    </div>
  </div>
</div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
        currentScreen={currentScreen}
        homeTab={homeTab}
        showSecondaryFeatures={showSecondaryFeatures}
        onToggleSecondaryFeatures={() => setShowSecondaryFeatures((prev) => !prev)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddStream={handleAddStream}
        onAddRequest={handleAddRequest}
        onAddAccount={openAccountModal}
        onAddBudget={openBudgetModal}
        onAddSavings={openSavingsModal}
        onAddCategory={handleAddCategory}
        isOpen={fabOpen}
        onToggle={() => setFabOpen(!fabOpen)}
      />

      {/* Floating Custom Period Button */}
      <FloatingCustomPeriodButton
        isVisible={filterOpen && !fabOpen && timeFilterScreens.includes(currentScreen)}
        onClick={() => setShowCustomDateModal(true)}
      />

      {/* Floating Time Display */}
      <FloatingTimeDisplay
        isVisible={!filterOpen && !fabOpen && timeFilterScreens.includes(currentScreen)}
        timeFilter={timeFilter}
        currentDate={currentDate}
        onClick={openTimeFilter}
      />

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        isOpen={showCustomDateModal}
        onClose={() => setShowCustomDateModal(false)}
        onSelectRange={handleCustomDateRange}
      />

      {/* Modals */}
      <AddRecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        initialType={recordType}
      />
      <AddBudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
      />
      <AddSavingsModal
        isOpen={showSavingsModal}
        onClose={() => setShowSavingsModal(false)}
      />
      <AddAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
      <AddStreamModal
        isOpen={showStreamModal}
        onClose={() => setShowStreamModal(false)}
        initialType={streamType}
      />
      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Alert Container */}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <SimpleModeProvider>
          <AuthProvider>
            <DataProvider>
              <AlertProvider>
                <ModalStackProvider>
                  <AppContent />
                </ModalStackProvider>
              </AlertProvider>
            </DataProvider>
          </AuthProvider>
        </SimpleModeProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
