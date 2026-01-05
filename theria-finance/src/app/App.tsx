import React, { useState, useEffect } from 'react';
import { Home, FileText, Target, PiggyBank, Zap, Wallet, FolderOpen, BarChart3, Menu, User, Sliders } from 'lucide-react';
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
    { id: 'records' as Screen, icon: FileText, label: 'Records' },
    { id: 'budget' as Screen, icon: Target, label: 'Budget' },
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'savings' as Screen, icon: PiggyBank, label: 'Savings' },
    { id: 'analysis' as Screen, icon: BarChart3, label: 'Analysis' },
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
      default: return 'Dashboard';
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen />;
      case 'records': return <RecordsScreen />;
      case 'budget': return <BudgetScreen />;
      case 'savings': return <SavingsScreen />;
      case 'streams': return <StreamsScreen />;
      case 'accounts': return <AccountsScreen />;
      case 'categories': return <CategoriesScreen />;
      case 'analysis': return <AnalysisScreen />;
      case 'profile': return <ProfileScreen />;
      case 'activity': return <RecentActivityScreen />;
      default: return <HomeScreen />;
    }
  };

  const handleFABAddRecord = () => {
    setShowRecordModal(true);
  };

  const handleFABAddBudget = () => {
    setShowBudgetModal(true);
  };

  const handleFABAddSavings = () => {
    setShowSavingsModal(true);
  };

  const handleFABAddAccount = () => {
    setShowAccountModal(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Sidebar Toggle + Logo + Page Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                title="Menu"
              >
                <Menu size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-primary">
                    Theria
                  </h1>
                </div>
              </div>

              {/* Page Title */}
              <div className="hidden md:block h-8 w-px bg-border mx-2"></div>
              <h2 className="hidden md:block font-bold text-foreground">{getPageTitle()}</h2>
            </div>

            {/* Right: Filter + Profile Picture */}
            <div className="flex items-center gap-2">
              {['records', 'budget', 'home', 'analysis', 'savings'].includes(currentScreen) && (
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                  title="Toggle Filters"
                >
                  <Sliders size={20} />
                </button>
              )}
              <button
                onClick={() => setCurrentScreen('profile')}
                className="flex items-center gap-2 hover:bg-muted rounded-lg p-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-foreground">{user?.username}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center gap-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              const isHome = item.id === 'home';

              if (isHome) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all shadow-lg ${
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
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
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
        onShowRecordModal={handleFABAddRecord}
        onShowBudgetModal={handleFABAddBudget}
        onShowSavingsModal={handleFABAddSavings}
        onShowAccountModal={handleFABAddAccount}
      />

      {/* Modals */}
      <AddRecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
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
