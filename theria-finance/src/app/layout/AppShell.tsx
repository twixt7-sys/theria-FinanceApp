import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../core/state/AuthContext';
import { useAlert } from '../../core/state/AlertContext';
import { useSimpleMode } from '../../core/state/SimpleModeContext';
import { useTutorial } from '../../core/state/TutorialContext';
import {
  clearOnboardingPending,
  isOnboardingPending,
  ONBOARDING_REQUESTED_EVENT,
} from '../../core/lib/onboardingStorage';
import {
  dismissFabGuide,
  isFabGuideDismissed,
} from '../../core/lib/simpleModeFabGuideStorage';
import {
  getFabGuideForScreen,
  SIMPLE_MODE_FAB_GUIDES,
  type SimpleModeFabRoute,
} from '../../shared/lib/simpleModeFabGuides';
import { TUTORIAL_TOUR_IDS } from '../../shared/lib/tutorialSteps';
import { AlertContainer } from '../../shared/components/Alert';
import { AppPageBackground } from '../../shared/components/AppPageBackground';
import { FloatingActionButton } from '../../shared/components/FloatingActionButton';
import { FloatingCustomPeriodButton } from '../../shared/components/FloatingCustomPeriodButton';
import { Sidebar } from '../../shared/components/Sidebar';
import { TutorialOverlay } from '../../shared/components/TutorialOverlay';
import { SplashScreen } from '../../features/authentication/screens/SplashScreen';
import { AuthScreen } from '../../features/authentication/screens/AuthScreen';
import { OnboardingScreen } from '../../features/onboarding/screens/OnboardingScreen';
import { UiProvider, useUi, type ModalName } from '../state/UiContext';
import {
  SCROLL_LOCK_SCREENS,
  TIME_FILTER_SCREENS,
  pathFor,
  screenFromPath,
  type Screen,
} from '../routes';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { GlobalModals } from './GlobalModals';

/** On a feature screen the FAB collapses to that screen's single add action. */
const FAB_DIRECT_ACTIONS: Partial<
  Record<Screen, { label: string; modal: Exclude<ModalName, 'customDate'>; buttonClass: string }>
> = {
  records: { label: 'Add Record', modal: 'record', buttonClass: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' },
  streams: { label: 'Add Stream', modal: 'stream', buttonClass: 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800' },
  categories: { label: 'Add Category', modal: 'category', buttonClass: 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800' },
  accounts: { label: 'Add Account', modal: 'account', buttonClass: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800' },
  budget: { label: 'Add Budget', modal: 'budget', buttonClass: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700' },
  savings: { label: 'Add Savings', modal: 'savings', buttonClass: 'bg-pink-500 hover:bg-pink-600 active:bg-pink-700' },
};

const ShellChrome: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const screen = screenFromPath(pathname);

  const { alerts, removeAlert } = useAlert();
  const { simpleMode } = useSimpleMode();
  const { requestTour } = useTutorial();
  const {
    filterOpen,
    sidebarOpen,
    setSidebarOpen,
    fabOpen,
    setFabOpen,
    homeTab,
    setHomeTab,
    showSecondaryFeatures,
    toggleSecondaryFeatures,
    openAdd,
    openCustomDate,
  } = useUi();

  const [fabGuideDismissTick, setFabGuideDismissTick] = useState(0);
  const simpleModeInitialized = useRef(false);

  // Close the quick-actions menu when navigating, so it is not left open
  // behind a screen where the FAB is a single direct action.
  useEffect(() => {
    setFabOpen(false);
  }, [pathname, setFabOpen]);

  // Switching simple mode changes which screens exist, so return home.
  useEffect(() => {
    if (!simpleModeInitialized.current) {
      simpleModeInitialized.current = true;
      return;
    }
    setSidebarOpen(false);
    setHomeTab('dashboard');
    navigate(pathFor('home'));
  }, [simpleMode, navigate, setSidebarOpen, setHomeTab]);

  // Each main screen teaches itself the first time it is opened; the delay
  // lets the screen mount so the spotlight has anchors to point at.
  useEffect(() => {
    if (!(TUTORIAL_TOUR_IDS as readonly string[]).includes(screen)) return;
    const timer = window.setTimeout(() => {
      requestTour(screen as (typeof TUTORIAL_TOUR_IDS)[number]);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [screen, requestTour]);

  const simpleModeFabGuide = useMemo(() => {
    if (!simpleMode) return null;
    const config = getFabGuideForScreen(screen);
    if (!config) return null;
    const route = screen as SimpleModeFabRoute;
    if (!(route in SIMPLE_MODE_FAB_GUIDES) || isFabGuideDismissed(route)) return null;
    return { message: config.message, emphasisAction: config.action };
    // fabGuideDismissTick re-runs this after a dismissal is persisted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simpleMode, screen, fabGuideDismissTick]);

  const dismissCurrentFabGuide = () => {
    const route = screen as SimpleModeFabRoute;
    if (route in SIMPLE_MODE_FAB_GUIDES) {
      dismissFabGuide(route);
      setFabGuideDismissTick((n) => n + 1);
    }
  };

  const direct = FAB_DIRECT_ACTIONS[screen];
  const fabDirectAction = direct
    ? { label: direct.label, onClick: () => openAdd(direct.modal), buttonClass: direct.buttonClass }
    : null;

  const lockViewportScroll = SCROLL_LOCK_SCREENS.includes(screen);

  return (
    <div
      className={
        lockViewportScroll
          ? 'relative flex h-dvh flex-col overflow-hidden'
          : 'relative min-h-dvh pb-bottom-nav'
      }
    >
      <AppPageBackground />
      <TopBar screen={screen} />

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
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={lockViewportScroll ? 'flex min-h-0 flex-1 flex-col' : undefined}
          >
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </motion.div>
        </div>
      </main>

      <BottomNav screen={screen} />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(target) => {
          if (target === 'newsfeed') {
            setHomeTab('newsfeed');
            navigate(pathFor('home'));
            return;
          }
          if (target === 'home') setHomeTab('dashboard');
          navigate(pathFor(target as Screen));
        }}
        currentScreen={screen}
        homeTab={homeTab}
        showSecondaryFeatures={showSecondaryFeatures}
        onToggleSecondaryFeatures={toggleSecondaryFeatures}
      />

      <FloatingActionButton
        onAddStream={() => openAdd('stream')}
        onAddRequest={() => openAdd('record', 'expense')}
        onAddAccount={() => openAdd('account')}
        onAddBudget={() => openAdd('budget')}
        onAddSavings={() => openAdd('savings')}
        onAddCategory={() => openAdd('category')}
        isOpen={fabOpen}
        onToggle={() => setFabOpen(!fabOpen)}
        simpleModeGuide={simpleModeFabGuide}
        onGuideActionUsed={dismissCurrentFabGuide}
        onGuideDismiss={dismissCurrentFabGuide}
        directAction={fabDirectAction}
      />

      <FloatingCustomPeriodButton
        isVisible={filterOpen && !fabOpen && TIME_FILTER_SCREENS.includes(screen)}
        onClick={openCustomDate}
      />

      <GlobalModals />
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
      <TutorialOverlay />
    </div>
  );
};

/**
 * Layout route. Splash, auth and onboarding are stateful flows rather than
 * locations, so they stay as gates in front of the routed screens.
 */
export const AppShell: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingPending, setOnboardingPending] = useState(() => isOnboardingPending());

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  // Registration sets the pending flag while this is already mounted.
  useEffect(() => {
    setOnboardingPending(user ? isOnboardingPending() : false);
  }, [user]);

  // Developer settings can re-launch the guided setup on demand.
  useEffect(() => {
    const show = () => setOnboardingPending(true);
    window.addEventListener(ONBOARDING_REQUESTED_EVENT, show);
    return () => window.removeEventListener(ONBOARDING_REQUESTED_EVENT, show);
  }, []);

  if (showSplash || isLoading) return <SplashScreen />;
  if (!user) return <AuthScreen />;

  if (onboardingPending) {
    return (
      <OnboardingScreen
        onComplete={() => {
          clearOnboardingPending();
          setOnboardingPending(false);
          // Land on the dashboard whether setup ran after registration or was
          // re-launched from developer settings.
          navigate(pathFor('home'));
        }}
      />
    );
  }

  return (
    <UiProvider>
      <ShellChrome />
    </UiProvider>
  );
};
