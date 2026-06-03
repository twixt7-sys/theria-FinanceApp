import React from 'react';
import { SplashDecorativeLayers } from '../components/splash/SplashDecorativeLayers';
import { SplashTitleBlock } from '../components/splash/SplashTitleBlock';
import { SplashLoadingDots } from '../components/splash/SplashLoadingDots';

const safeAreaFrameStyle: React.CSSProperties = {
  paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
  paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
  paddingLeft: 'max(1.25rem, env(safe-area-inset-left, 0px))',
  paddingRight: 'max(1.25rem, env(safe-area-inset-right, 0px))',
};

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-background text-foreground">
      <SplashDecorativeLayers />

      <div
        className="relative z-10 grid min-h-0 flex-1 place-items-center px-6 sm:px-10"
        style={safeAreaFrameStyle}
      >
        <div className="flex flex-col items-center justify-center">
          <SplashTitleBlock />
          <SplashLoadingDots />
        </div>
      </div>
    </div>
  );
};
