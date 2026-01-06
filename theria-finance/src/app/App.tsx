import React, { useState, useEffect } from 'react';
import { Home, FileText, Target, PiggyBank, Zap, Wallet, FolderOpen, BarChart3, Menu, User, Filter, Moon, Sun, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
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
import { Sidebar } from './components/Sidebar';
import { FloatingActionButton } from './components/FloatingActionButton';
import { AddRecordModal } from './components/AddRecordModal';
import { AddBudgetModal } from './components/AddBudgetModal';
import { AddSavingsModal } from './components/AddSavingsModal';
import { AddAccountModal } from './components/AddAccountModal';
import { TimeFilter, type TimeFilterValue } from './components/TimeFilter';

type Screen = 'home' | 'records' | 'budget' | 'savings' | 'streams' | 'accounts' | 'categories' | 'analysis' | 'profile' | 'activity';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  
  // Modal states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [recordType, setRecordType] = useState<'income' | 'expense' | 'transfer'>('expense');

  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const { theme, toggleTheme } = useTheme();

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const navItems = [
    { id: 'records' as Screen, icon: FileText, label: 'Records' },
    { id: 'streams' as Screen, icon: Zap, label: 'Streams' },
    { id: 'budget' as Screen, icon: Target, label: 'Budget' },
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'savings' as Screen, icon: PiggyBank, label: 'Savings' },
    { id: 'accounts' as Screen, icon: Wallet, label: 'Accounts' },
    { id: 'analysis' as Screen, icon: BarChart3, label: 'Analysis' },
  ];
  const filterableScreens: Screen[] = ['home', 'budget', 'savings', 'analysis', 'records', 'activity'];

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
      case 'home': return <HomeScreen />;
      case 'records': return <RecordsScreen {...sharedFilterProps} />;
      case 'budget': return <BudgetScreen {...sharedFilterProps} />;
      case 'savings': return <SavingsScreen {...sharedFilterProps} />;
      case 'streams': return <StreamsScreen />;
      case 'accounts': return <AccountsScreen />;
      case 'categories': return <CategoriesScreen />;
      case 'analysis': return <AnalysisScreen {...sharedFilterProps} />;
      case 'profile': return <ProfileScreen />;
      case 'activity': return <RecentActivityScreen {...sharedFilterProps} />;
      default: return <HomeScreen />;
    }
  };

  const openRecordModal = (type: 'income' | 'expense' | 'transfer') => {
    setRecordType(type);
    setShowRecordModal(true);
  };

  const handleAddIncome = () => openRecordModal('income');
  const handleAddExpense = () => openRecordModal('expense');
  const handleAddRequest = () => openRecordModal('transfer');

  const openBudgetModal = () => setShowBudgetModal(true);
  const openSavingsModal = () => setShowSavingsModal(true);
  const openAccountModal = () => setShowAccountModal(true);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3 py-2">
            {/* Left: Sidebar Toggle + Minimal Brand + Page Title */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                title="Menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                  TH
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-foreground">Theria</h1>
                  <span className="text-muted-foreground">•</span>
                  <h2 className="text-sm sm:text-base font-semibold text-muted-foreground">
                    {getPageTitle()}
                  </h2>
                </div>
              </div>
            </div>

            {/* Right: Theme, filters, notifications, profile */}
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                  title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {filterableScreens.includes(currentScreen) && (
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                    title="Toggle Filters"
                  >
                    <Filter size={20} />
                  </button>
                )}

                <button
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                  title="Notifications"
                >
                  <Bell size={18} />
                </button>

                <button
                  onClick={() => setCurrentScreen('profile')}
                  className="flex items-center gap-2 hover:bg-muted rounded-lg p-1.5 transition-colors"
                  title="Profile"
                >
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    <span className="text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-foreground">{user?.username}</span>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {filterableScreens.includes(currentScreen) && filterOpen && (
              <motion.div
                key="time-filter"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pb-3">
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
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between gap-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              const isHome = item.id === 'home';

              if (isHome) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all shadow-lg flex-1 ${
                      isActive
                        ? 'bg-primary text-white scale-110'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={item.label}
                  >
                    <Icon size={24} strokeWidth={2.5} />
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-sm" />
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
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
        onAddRequest={handleAddRequest}
        onAddAccount={openAccountModal}
        onAddBudget={openBudgetModal}
        onAddSavings={openSavingsModal}
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
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
