import React, { useState, useEffect } from 'react';
import { Home, FileText, Target, PiggyBank, Wallet, Filter, Bell, FolderOpen, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AlertProvider, useAlert } from './contexts/AlertContext';
import { AlertContainer } from './components/Alert';
import { SplashScreen } from './screens/SplashScreen';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RecordsScreen } from './screens/RecordsScreen';
import { BudgetScreen } from './screens/BudgetScreen';
import { SavingsScreen } from './screens/SavingsScreen';
import { StreamsScreen } from './screens/StreamsScreen';
import { AccountsScreen } from './screens/AccountsScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RecentActivityScreen } from './screens/RecentActivityScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { Sidebar } from './components/Sidebar';
import { FloatingActionButton } from './components/FloatingActionButton';
import { AddRecordModal } from './components/AddRecordModal';
import { AddBudgetModal } from './components/AddBudgetModal';
import { AddSavingsModal } from './components/AddSavingsModal';
import { AddAccountModal } from './components/AddAccountModal';
import { AddStreamModal } from './components/AddStreamModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { SettingsScreen } from './screens/SettingsScreen';
import { StreakScreen } from './screens/StreakScreen';
import { TimeFilter, type TimeFilterValue } from './components/TimeFilter';

type Screen = 'home' | 'records' | 'budget' | 'savings' | 'streams' | 'accounts' | 'categories' | 'analysis' | 'profile' | 'activity' | 'notifications' | 'settings' | 'streak';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { alerts, removeAlert } = useAlert();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  
  // Modal states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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

    switch (timeFilter) {
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3 py-1.5">
            {/* Left: Minimal Brand + Page Title */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 hover:bg-muted rounded-lg p-1 transition-colors"
                title="Menu"
              >
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                  TH
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-foreground">Theria</h1>
                  <span className="text-muted-foreground">•</span>
                  <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground">
                    {getPageTitle()}
                  </h2>
                </div>
              </button>
            </div>

            {/* Right: Theme, filters, notifications, profile */}
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {renderScreen()}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between gap-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              const isHome = item.id === 'home';

              if (isHome) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all shadow-lg flex-none basis-14 ${
                      isActive
                        ? 'bg-primary text-white scale-110'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={item.label}
                  >
                    <Icon size={20} strokeWidth={2.5} />
                  </button>
                );
              }

              const getColorClass = (color?: string) => {
                if (!color || !isActive) return '';
                switch (color) {
                  case 'blue': return 'text-blue-500 bg-blue-500/10';
                  case 'yellow': return 'text-yellow-500 bg-yellow-500/10';
                  case 'peach': return 'text-orange-300 bg-orange-300/10';
                  case 'pink': return 'text-pink-500 bg-pink-500/10';
                  case 'brown': return 'text-amber-700 bg-amber-700/10';
                  case 'violet': return 'text-violet-500 bg-violet-500/10';
                  default: return 'text-primary bg-primary/10';
                }
              };

              const getDotColor = (color?: string) => {
                switch (color) {
                  case 'blue': return 'bg-blue-500';
                  case 'yellow': return 'bg-yellow-500';
                  case 'peach': return 'bg-orange-300';
                  case 'pink': return 'bg-pink-500';
                  case 'brown': return 'bg-amber-700';
                  case 'violet': return 'bg-violet-500';
                  default: return 'bg-primary';
                }
              };

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all flex-1 ${
                    isActive
                      ? getColorClass(item.color) || 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-sm ${getDotColor(item.color)}`} />
                  )}
                </button>
              );
            })}
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
