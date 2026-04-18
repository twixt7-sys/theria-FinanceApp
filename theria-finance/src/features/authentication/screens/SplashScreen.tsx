import React from 'react';
import { TrendingUp } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center space-y-6 animate-pulse">
        <div className="flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl">
            <TrendingUp size={80} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white">Theria</h1>
        <p className="text-xl text-white/80">Finance Core</p>
      </div>
    </div>
  );
};
