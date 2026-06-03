import React, { createContext, useCallback, useContext, useState } from 'react';
import { clearAllDismissedHints } from '../lib/simpleModeHintStorage';
import { readSimpleMode, writeSimpleMode } from '../lib/simpleModeStorage';
import {
  SimpleModeIndicator,
  type SimpleModeIndicatorPayload,
} from '../../shared/components/SimpleModeIndicator';

interface SimpleModeContextType {
  simpleMode: boolean;
  hintsResetKey: number;
  setSimpleMode: (enabled: boolean) => void;
  toggleSimpleMode: () => void;
}

const SimpleModeContext = createContext<SimpleModeContextType | undefined>(undefined);

function onSimpleModeEnabled() {
  clearAllDismissedHints();
}

export const SimpleModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simpleMode, setSimpleModeState] = useState(() => readSimpleMode());
  const [hintsResetKey, setHintsResetKey] = useState(0);
  const [indicator, setIndicator] = useState<SimpleModeIndicatorPayload | null>(null);

  const showIndicator = useCallback((enabled: boolean) => {
    setIndicator({ enabled, key: Date.now() });
  }, []);

  const dismissIndicator = useCallback(() => {
    setIndicator(null);
  }, []);

  const setSimpleMode = useCallback(
    (enabled: boolean) => {
      setSimpleModeState((prev) => {
        if (enabled === prev) return prev;
        if (enabled) onSimpleModeEnabled();
        if (enabled) setHintsResetKey((k) => k + 1);
        showIndicator(enabled);
        writeSimpleMode(enabled);
        return enabled;
      });
    },
    [showIndicator],
  );

  const toggleSimpleMode = useCallback(() => {
    setSimpleModeState((prev) => {
      const next = !prev;
      if (next) onSimpleModeEnabled();
      if (next) setHintsResetKey((k) => k + 1);
      showIndicator(next);
      writeSimpleMode(next);
      return next;
    });
  }, [showIndicator]);

  return (
    <SimpleModeContext.Provider
      value={{ simpleMode, hintsResetKey, setSimpleMode, toggleSimpleMode }}
    >
      {children}
      <SimpleModeIndicator indicator={indicator} onDismiss={dismissIndicator} />
    </SimpleModeContext.Provider>
  );
};

export const useSimpleMode = () => {
  const context = useContext(SimpleModeContext);
  if (!context) {
    throw new Error('useSimpleMode must be used within SimpleModeProvider');
  }
  return context;
};
