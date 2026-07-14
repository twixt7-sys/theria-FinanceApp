import React, { createContext, useCallback, useContext, useState } from 'react';
import { readTerryVisible, writeTerryVisible } from '../lib/terryVisibilityStorage';

interface TerryContextType {
  /** Whether Terry (the finance buddy) is shown across the app. */
  terryVisible: boolean;
  setTerryVisible: (visible: boolean) => void;
  toggleTerry: () => void;
}

const TerryContext = createContext<TerryContextType | undefined>(undefined);

export const TerryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [terryVisible, setState] = useState(() => readTerryVisible());

  const setTerryVisible = useCallback((visible: boolean) => {
    setState((prev) => {
      if (visible === prev) return prev;
      writeTerryVisible(visible);
      return visible;
    });
  }, []);

  const toggleTerry = useCallback(() => {
    setState((prev) => {
      const next = !prev;
      writeTerryVisible(next);
      return next;
    });
  }, []);

  return (
    <TerryContext.Provider value={{ terryVisible, setTerryVisible, toggleTerry }}>
      {children}
    </TerryContext.Provider>
  );
};

export const useTerry = () => {
  const context = useContext(TerryContext);
  if (!context) {
    throw new Error('useTerry must be used within TerryProvider');
  }
  return context;
};
