import React from 'react';
import { Home } from '@/shared/icons';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useUi } from '../state/UiContext';
import { NAV_ITEMS, SECONDARY_NAV_IDS, pathFor, type NavItem, type Screen } from '../routes';

const ACTIVE_COLORS: Record<string, string> = {
  blue: 'text-blue-500 bg-blue-500/10',
  yellow: 'text-yellow-500 bg-yellow-500/10',
  peach: 'text-orange-300 bg-orange-300/10',
  pink: 'text-pink-500 bg-pink-500/10',
  brown: 'text-amber-700 bg-amber-700/10',
  violet: 'text-violet-500 bg-violet-500/10',
};

const NavButton: React.FC<{ item: NavItem; isActive: boolean; onClick: () => void }> = ({
  item,
  isActive,
  onClick,
}) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        isActive ? ACTIVE_COLORS[item.color] || 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-current rounded-full" />
      )}
    </button>
  );
};

export const BottomNav: React.FC<{ screen: Screen }> = ({ screen }) => {
  const navigate = useNavigate();
  const { showSecondaryFeatures } = useUi();

  const visible = showSecondaryFeatures
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => !SECONDARY_NAV_IDS.includes(item.id));
  const homeIndex = visible.findIndex((item) => item.id === 'home');
  const leftWing = visible.slice(0, homeIndex);
  const rightWing = visible.slice(homeIndex + 1);
  const atHome = screen === 'home';

  const go = (target: Screen) => () => navigate(pathFor(target));

  return (
    <div
      data-tour="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-md shadow-[0_-14px_28px_-10px_rgba(148,163,184,0.55)] dark:shadow-[0_-14px_28px_-10px_rgba(0,0,0,0.45)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-slate-300/55 via-slate-200/25 to-transparent dark:from-black/35 dark:via-black/20 dark:to-transparent"
      />
      <div className="relative max-w-7xl mx-auto px-2 pb-safe pt-2 sm:px-4 lg:px-6">
        <div className="flex items-end justify-between">
          <div className="flex flex-1 items-center justify-around mb-2 max-w-md">
            {leftWing.map((item) => (
              <NavButton key={item.id} item={item} isActive={screen === item.id} onClick={go(item.id)} />
            ))}
          </div>

          <div
            className="relative flex flex-col items-center px-4 transition-all duration-300 ease-out flex-shrink-0 -translate-y-1"
            style={{ transform: atHome ? 'translateY(-1.80rem) scale(1.15)' : 'translateY(0)' }}
          >
            <button
              onClick={go('home')}
              aria-label="Home"
              aria-current={atHome ? 'page' : undefined}
              className={`group relative flex h-12 w-12 items-center justify-center hexagon transition-all duration-300 ${
                atHome ? 'active text-white scale-110' : 'text-muted-foreground hover:scale-105'
              }`}
            >
              <Home size={20} strokeWidth={2} className="relative z-10" />
            </button>
            {atHome && (
              <div className="absolute -bottom-2 h-4 w-12 bg-green-500/30 blur-lg rounded-full animate-pulse" />
            )}
          </div>

          <div className="flex flex-1 items-center justify-around mb-2 max-w-md">
            {rightWing.map((item) => (
              <NavButton key={item.id} item={item} isActive={screen === item.id} onClick={go(item.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
