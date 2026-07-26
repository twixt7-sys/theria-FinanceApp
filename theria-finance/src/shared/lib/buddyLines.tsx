import React from 'react';

/**
 * Lines may wrap dynamic values in **double asterisks** — those render as
 * light-green highlights so amounts and names pop out of Terry's speech.
 */
export const renderBuddyLine = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <span key={i} className="font-semibold text-emerald-600 dark:text-emerald-400">
        {part.slice(2, -2)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

export const plainBuddyLine = (line: string) => line.split('**').join('');
