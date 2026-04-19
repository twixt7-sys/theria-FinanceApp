import React, { useState, useEffect } from 'react';
import { Home, FileText, Target, PiggyBank, Wallet, Filter, Bell, FolderOpen, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from '../core/state/ThemeContext';
import { AuthProvider, useAuth } from '../core/state/AuthContext';
import { DataProvider } from '../core/state/DataContext';
import { AlertProvider, useAlert } from '../core/state/AlertContext';
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
import { TimeFilter, type TimeFilterValue } from '../shared/components/TimeFilter';

type Screen = 'home' | 'records' | 'budget' | 'savings' | 'streams' | 'accounts' | 'categories' | 'analysis' | 'profile' | 'activity' | 'notifications' | 'settings' | 'streak';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { alerts, removeAlert } = useAlert();
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

  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
      default: return 'Dashboard';
    }
  };

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    // If currently in custom mode, switch to month and then navigate
    if (timeFilter === 'custom') {
      setTimeFilter('month');
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

  const renderScreen = () => {
    const sharedFilterProps = {
      timeFilter,
      onTimeFilterChange: setTimeFilter,
      currentDate,
      onNavigateDate: handleNavigateDate,
      showInlineFilter: false,
    };

    switch (currentScreen) {
      case 'home': return <HomeScreen 
            onNavigate={(screen) => setCurrentScreen(screen as Screen)} 
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            currentDate={currentDate}
            onNavigateDate={handleNavigateDate}
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
      default: return <HomeScreen />;
    }
  };

  const openRecordModal = (type: 'income' | 'expense' | 'transfer') => {
    setRecordType(type);
    setShowRecordModal(true);
  };

  const handleAddStream = () => {
    setStreamType('income');
    setShowStreamModal(true);
  };
  
  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleAddRequest = () => openRecordModal('transfer');

  const openBudgetModal = () => setShowBudgetModal(true);
  const openSavingsModal = () => setShowSavingsModal(true);
  const openAccountModal = () => setShowAccountModal(true);

  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    // Set time filter to custom and update current date to start date
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
    <div className="min-h-dvh bg-background pb-bottom-nav">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/90 pt-safe shadow-md backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-2 py-1.5 sm:gap-3">
            {/* Left: Minimal Brand + Page Title */}
            <div className="flex min-w-0 flex-1 items-center sm:max-w-md sm:flex-none">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex min-w-0 max-w-full items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted"
                title="Menu"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-extrabold text-white shadow-md">
                  TH
                </div>
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <h1 className="shrink-0 text-sm font-bold text-foreground">Theria</h1>
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

                <button
                  onClick={() => setCurrentScreen('profile')}
                  className="flex items-center gap-2 hover:bg-muted rounded-lg p-1 transition-colors"
                  title="Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    <span className="text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-foreground">{user?.username}</span>
                </button>
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
                    onChange={setTimeFilter}
                    currentDate={currentDate}
                    onNavigateDate={handleNavigateDate}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {renderScreen()}
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation */}
<div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-md">
  <div className="max-w-7xl mx-auto px-2 pb-safe pt-2 sm:px-4 lg:px-6">
    <div className="flex items-end justify-between">
      {/* Left Wing */}
      <div className="flex flex-1 items-center justify-around mb-2 max-w-md">
        {navItems.slice(0, 3).map((item) => (
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
        {navItems.slice(4).map((item) => (
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
        onNavigate={(screen) => setCurrentScreen(screen as Screen)}
        currentScreen={currentScreen}
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
        onClick={() => setFilterOpen(true)}
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
      <AuthProvider>
        <DataProvider>
          <AlertProvider>
            <AppContent />
          </AlertProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
