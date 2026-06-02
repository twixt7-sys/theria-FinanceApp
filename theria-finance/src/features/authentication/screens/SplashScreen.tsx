import React from 'react';
import { SPLASH_BRAND_LOGO } from '../constants/splashBrand';
import { SplashDecorativeLayers } from '../components/splash/SplashDecorativeLayers';
import { SplashBrandMark } from '../components/splash/SplashBrandMark';
import { SplashTitleBlock } from '../components/splash/SplashTitleBlock';
import { SplashLoadingDots } from '../components/splash/SplashLoadingDots';

export { SPLASH_BRAND_LOGO };

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
        <div className="w-full max-w-sm min-h-[24rem] rounded-2xl border border-border bg-card px-6 py-8 shadow-xl sm:max-w-md sm:min-h-[25rem] sm:px-7 sm:py-9 flex flex-col items-center justify-center">
          <SplashBrandMark logo={SPLASH_BRAND_LOGO} />
          <SplashTitleBlock />
          <SplashLoadingDots />
        </div>
      </div>
    </div>
  );
};
