import React, { useEffect, useRef } from 'react';
import { useTerry } from '../../core/state/TerryContext';
import type { TerryContent } from './terryLines';

/**
 * Headless publisher: screens declare what Terry should say and the floating
 * bubble (TerryFloat, mounted by the shell) speaks it in small dialogs.
 * Renders nothing where it is placed.
 */
interface TerryPanelProps {
  content: TerryContent;
}

export const TerryPanel: React.FC<TerryPanelProps> = ({ content }) => {
  const { setSpeech } = useTerry();

  // Screens rebuild the content object every render; keying the effect on the
  // actual words (not the object) keeps the published speech stable.
  const contentRef = useRef(content);
  contentRef.current = content;
  const linesKey = content.lines.join('|');

  useEffect(() => {
    setSpeech(contentRef.current);
    return () => setSpeech(null);
  }, [linesKey, content.mood, setSpeech]);

  return null;
};
