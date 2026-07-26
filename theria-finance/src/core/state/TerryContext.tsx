import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  readTerrySide,
  readTerryVisible,
  writeTerrySide,
  writeTerryVisible,
  type TerrySide,
} from '../lib/terryVisibilityStorage';

/**
 * What Terry says on the current screen. Structurally matches TerryContent
 * from the terry feature — declared here so core state doesn't depend on it.
 */
export interface TerrySpeech {
  lines: string[];
  mood: 'happy' | 'neutral' | 'concerned';
}

interface TerryContextType {
  /** Whether Terry (the finance buddy) is shown across the app. */
  terryVisible: boolean;
  setTerryVisible: (visible: boolean) => void;
  toggleTerry: () => void;
  /** Which edge his floating bubble docks to. */
  terrySide: TerrySide;
  setTerrySide: (side: TerrySide) => void;
  /** The current screen's lines, published by TerryPanel for the float to speak. */
  speech: TerrySpeech | null;
  setSpeech: (speech: TerrySpeech | null) => void;
}

const TerryContext = createContext<TerryContextType | undefined>(undefined);

export const TerryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [terryVisible, setState] = useState(() => readTerryVisible());
  const [terrySide, setSideState] = useState<TerrySide>(() => readTerrySide());
  const [speech, setSpeech] = useState<TerrySpeech | null>(null);

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

  const setTerrySide = useCallback((side: TerrySide) => {
    setSideState((prev) => {
      if (side === prev) return prev;
      writeTerrySide(side);
      return side;
    });
  }, []);

  const value = useMemo(
    () => ({
      terryVisible,
      setTerryVisible,
      toggleTerry,
      terrySide,
      setTerrySide,
      speech,
      setSpeech,
    }),
    [terryVisible, setTerryVisible, toggleTerry, terrySide, setTerrySide, speech],
  );

  return <TerryContext.Provider value={value}>{children}</TerryContext.Provider>;
};

export const useTerry = () => {
  const context = useContext(TerryContext);
  if (!context) {
    throw new Error('useTerry must be used within TerryProvider');
  }
  return context;
};
