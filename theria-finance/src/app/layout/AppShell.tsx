import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../core/state/AuthContext';
import { useAlert } from '../../core/state/AlertContext';
import { useSimpleMode } from '../../core/state/SimpleModeContext';
import { useTutorial } from '../../core/state/TutorialContext';
import {
  clearOnboardingPending,
  ensureFirstLaunchOnboarding,
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
import { TerryFloat } from '../../features/terry/TerryFloat';
import { OnboardingScreen } from '../../features/onboarding/screens/OnboardingScreen';
import { UiProvider, useUi, type ModalName } from '../state/UiContext';
import type { ModuleAccentKey } from '../../shared/theme/moduleAccents';
import {
  SCROLL_LOCK_SCREENS,
  TIME_FILTER_SCREENS,
  pathFor,
  screenFromPath,
  type Screen,
} from '../routes';
import { TopBar } from './TopBar';
import { BottomNav } from './bottom-nav/BottomNav';
import { GlobalModals } from './GlobalModals';

/**
 * On a feature screen the FAB collapses to that screen's single add action.
 * The accent comes from shared/theme/moduleAccents.ts — this map only says
 * *which* module owns the action, not what color it renders as.
 */
const FAB_DIRECT_ACTIONS: Partial<
  Record<Screen, { label: string; modal: Exclude<ModalName, 'customDate'>; accentKey: ModuleAccentKey }>
> = {
  records: { label: 'Add Record', modal: 'record', accentKey: 'records' },
  streams: { label: 'Add Stream', modal: 'stream', accentKey: 'streams' },
  accounts: { label: 'Add Account', modal: 'account', accentKey: 'accounts' },
  budget: { label: 'Add Budget', modal: 'budget', accentKey: 'budget' },
  savings: { label: 'Add Savings', modal: 'savings', accentKey: 'savings' },
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
    ? { label: direct.label, onClick: () => openAdd(direct.modal), accentKey: direct.accentKey }
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

      <BottomNav screen={screen} fabOpen={fabOpen} />

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
      />

      {/* The chat composer owns the bottom of the screen; a floating add
          button would sit on top of it and means nothing in a conversation. */}
      {screen !== 'chat' && (
      <FloatingActionButton
        onAddStream={() => openAdd('stream')}
        onAddRequest={() => openAdd('record', 'expense')}
        onAddAccount={() => openAdd('account')}
        onAddBudget={() => openAdd('budget')}
        onAddSavings={() => openAdd('savings')}
        isOpen={fabOpen}
        onToggle={() => setFabOpen(!fabOpen)}
        simpleModeGuide={simpleModeFabGuide}
        onGuideActionUsed={dismissCurrentFabGuide}
        onGuideDismiss={dismissCurrentFabGuide}
        directAction={fabDirectAction}
      />
      )}

      <FloatingCustomPeriodButton
        isVisible={filterOpen && !fabOpen && TIME_FILTER_SCREENS.includes(screen)}
        onClick={openCustomDate}
      />

      {/* Terry's floating bubble opens the chat, so it disappears once you're in it. */}
      {screen !== 'chat' && <TerryFloat />}

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
  const { isLoading } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingPending, setOnboardingPending] = useState(() => {
    // Theria is usable signed-out, so setup is armed on first launch of the
    // device rather than on registration.
    ensureFirstLaunchOnboarding();
    return isOnboardingPending();
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  // Developer settings can re-launch the guided setup on demand.
  useEffect(() => {
    const show = () => setOnboardingPending(true);
    window.addEventListener(ONBOARDING_REQUESTED_EVENT, show);
    return () => window.removeEventListener(ONBOARDING_REQUESTED_EVENT, show);
  }, []);

  if (showSplash || isLoading) return <SplashScreen />;

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
