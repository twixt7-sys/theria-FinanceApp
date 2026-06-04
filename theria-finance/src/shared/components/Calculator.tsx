import React, { useCallback, useState } from 'react';
import { ArrowLeft, Calculator as CalculatorIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './ui/utils';

interface CalculatorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  displayColor?: 'green' | 'red' | 'blue';
  /** Screen-style display with calculator toggle on the left */
  variant?: 'default' | 'screen' | 'record';
  /** When variant is screen, keyboard can collapse */
  defaultKeyboardOpen?: boolean;
  /** Record variant: controlled keypad visibility */
  keyboardOpen?: boolean;
  onKeyboardOpenChange?: (open: boolean) => void;
}

function useCalculatorHandlers(value: string, onChange: (value: string) => void) {
  const handleNumberClick = useCallback(
    (num: string) => {
      onChange(value + num);
    },
    [value, onChange],
  );

  const handleOperator = useCallback(
    (op: string) => {
      if (
        value &&
        !value.endsWith(op) &&
        !value.endsWith('+') &&
        !value.endsWith('-') &&
        !value.endsWith('*') &&
        !value.endsWith('/')
      ) {
        onChange(value + op);
      }
    },
    [value, onChange],
  );

  const handleBackspace = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleEquals = useCallback(() => {
    try {
      const result = eval(value);
      onChange(String(result));
    } catch {
      // Invalid expression
    }
  }, [value, onChange]);

  const handleDecimal = useCallback(() => {
    const lastNumber = value.split(/[\+\-\*\/]/).pop() || '';
    if (!lastNumber.includes('.')) {
      onChange(value + '.');
    }
  }, [value, onChange]);

  return {
    handleNumberClick,
    handleOperator,
    handleBackspace,
    handleClear,
    handleEquals,
    handleDecimal,
  };
}

const displayTintClass = (displayColor: 'green' | 'red' | 'blue') =>
  displayColor === 'red'
    ? 'border-red-500/35 bg-card text-red-600 dark:text-red-400'
    : displayColor === 'blue'
      ? 'border-blue-500/35 bg-card text-blue-600 dark:text-blue-400'
      : 'border-emerald-500/30 bg-card text-emerald-600 dark:text-emerald-400';

export const CalculatorKeypad: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const {
    handleNumberClick,
    handleOperator,
    handleClear,
    handleEquals,
    handleDecimal,
  } = useCalculatorHandlers(value, onChange);

  const keyClass =
    'rounded-lg border border-border bg-input-background px-2.5 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted active:scale-[0.98]';
  const opClass =
    'rounded-lg border border-border bg-muted px-2.5 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted-foreground/30 active:scale-[0.98]';

  return (
    <div className={cn('grid grid-cols-4 gap-1.5', className)}>
      <button type="button" onClick={() => handleNumberClick('7')} className={keyClass}>
        7
      </button>
      <button type="button" onClick={() => handleNumberClick('8')} className={keyClass}>
        8
      </button>
      <button type="button" onClick={() => handleNumberClick('9')} className={keyClass}>
        9
      </button>
      <button type="button" onClick={() => handleOperator('/')} className={opClass}>
        ÷
      </button>

      <button type="button" onClick={() => handleNumberClick('4')} className={keyClass}>
        4
      </button>
      <button type="button" onClick={() => handleNumberClick('5')} className={keyClass}>
        5
      </button>
      <button type="button" onClick={() => handleNumberClick('6')} className={keyClass}>
        6
      </button>
      <button type="button" onClick={() => handleOperator('*')} className={opClass}>
        ×
      </button>

      <button type="button" onClick={() => handleNumberClick('1')} className={keyClass}>
        1
      </button>
      <button type="button" onClick={() => handleNumberClick('2')} className={keyClass}>
        2
      </button>
      <button type="button" onClick={() => handleNumberClick('3')} className={keyClass}>
        3
      </button>
      <button type="button" onClick={() => handleOperator('-')} className={opClass}>
        −
      </button>

      <button
        type="button"
        onClick={() => handleNumberClick('0')}
        className={cn(keyClass, 'col-span-2')}
      >
        0
      </button>
      <button type="button" onClick={handleDecimal} className={keyClass}>
        .
      </button>
      <button type="button" onClick={() => handleOperator('+')} className={opClass}>
        +
      </button>

      <button
        type="button"
        onClick={handleClear}
        className="col-span-2 rounded-lg border border-border bg-destructive/10 px-2.5 py-2 text-xs font-semibold text-destructive shadow-sm transition-colors hover:bg-destructive/20 active:scale-[0.98]"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={handleEquals}
        className="col-span-2 rounded-lg border border-border bg-primary/15 px-2.5 py-2 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-primary/25 active:scale-[0.98]"
      >
        =
      </button>
    </div>
  );
};

export const Calculator: React.FC<CalculatorProps> = ({
  value,
  onChange,
  label = 'Amount',
  displayColor = 'green',
  variant = 'default',
  defaultKeyboardOpen = false,
  keyboardOpen: keyboardOpenProp,
  onKeyboardOpenChange,
}) => {
  const [keyboardOpenInternal, setKeyboardOpenInternal] = useState(
    variant === 'screen' ? defaultKeyboardOpen : variant === 'default',
  );
  const keyboardOpen = keyboardOpenProp ?? keyboardOpenInternal;
  const setKeyboardOpen = onKeyboardOpenChange ?? setKeyboardOpenInternal;

  const { handleBackspace } = useCalculatorHandlers(value, onChange);

  const legacyDisplayClass =
    displayColor === 'red'
      ? 'border-red-500/35 bg-card'
      : displayColor === 'blue'
        ? 'border-blue-500/35 bg-card'
        : 'border-border bg-muted';

  const renderRecordDisplay = () => (
    <div className="flex w-full items-stretch gap-2">
      <div
        className={cn(
          'relative min-w-0 flex-1 rounded-xl border px-4 py-3',
          displayTintClass(displayColor),
        )}
      >
        <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            'mt-1 truncate text-right text-3xl font-bold tabular-nums tracking-tight',
            value ? '' : 'text-muted-foreground/50',
          )}
        >
          {value || '0'}
        </p>
        {value && (
          <button
            type="button"
            onClick={handleBackspace}
            className="absolute bottom-2 left-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Backspace"
          >
            <ArrowLeft size={14} strokeWidth={2.25} />
          </button>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setKeyboardOpen(!keyboardOpen)}
        aria-expanded={keyboardOpen}
        aria-label={keyboardOpen ? 'Hide calculator' : 'Show calculator'}
        title={keyboardOpen ? 'Hide keypad' : 'Calculator'}
        className={cn(
          'flex w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border transition-all shadow-sm',
          keyboardOpen
            ? 'border-primary/40 bg-primary/12 text-primary'
            : 'border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/60 hover:text-foreground',
        )}
      >
        <CalculatorIcon size={20} strokeWidth={2.25} />
      </motion.button>
    </div>
  );

  const renderScreenDisplay = () => (
    <div
      className={cn(
        'relative min-w-0 flex-1 rounded-xl border px-3 py-2.5',
        displayTintClass(displayColor),
      )}
    >
      <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 truncate text-right text-2xl font-bold tabular-nums tracking-tight',
          value ? '' : 'text-muted-foreground/50',
        )}
      >
        {value || '0'}
      </p>
      {value && (
        <button
          type="button"
          onClick={handleBackspace}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Backspace"
        >
          <ArrowLeft size={14} strokeWidth={2.25} />
        </button>
      )}
    </div>
  );

  const renderDefaultDisplay = () => (
    <div className="relative w-full">
      <div
        className={cn(
          'grid w-full grid-cols-12 gap-1.5 rounded-lg border px-3 py-2 text-right text-base font-semibold text-foreground',
          legacyDisplayClass,
        )}
      >
        <span
          className={cn(
            'col-span-3 self-center text-left text-xs',
            displayColor === 'red'
              ? 'text-red-600 dark:text-red-400'
              : displayColor === 'blue'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
        <input
          type="text"
          value={value}
          readOnly
          className={cn(
            'col-span-8 text-right',
            displayColor === 'red'
              ? 'text-red-600 dark:text-red-400'
              : displayColor === 'blue'
                ? 'text-blue-600 dark:text-blue-400'
                : '',
          )}
          placeholder="0"
        />
        <span className="col-span-1" />
      </div>
      {value && (
        <button
          type="button"
          onClick={handleBackspace}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-muted-foreground/20"
          title="Backspace"
        >
          <ArrowLeft size={14} className="text-muted-foreground" />
        </button>
      )}
    </div>
  );

  if (variant === 'record') {
    return renderRecordDisplay();
  }

  const showKeypad = variant === 'default' || keyboardOpen;

  return (
    <div className="space-y-2">
      <div className={cn('flex gap-2', variant === 'default' && 'flex-col')}>
        {variant === 'screen' && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setKeyboardOpen(!keyboardOpen)}
            aria-expanded={keyboardOpen}
            aria-label={keyboardOpen ? 'Hide calculator keypad' : 'Show calculator keypad'}
            title={keyboardOpen ? 'Hide keypad' : 'Show keypad'}
            className={cn(
              'flex h-[4.25rem] w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition-all shadow-sm',
              keyboardOpen
                ? 'border-primary/35 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/25 hover:bg-muted hover:text-foreground',
            )}
          >
            <CalculatorIcon size={18} strokeWidth={2.25} />
            <span className="text-[8px] font-semibold uppercase tracking-wide">
              {keyboardOpen ? 'Hide' : 'Calc'}
            </span>
          </motion.button>
        )}
        {variant === 'screen' ? renderScreenDisplay() : renderDefaultDisplay()}
      </div>

      <AnimatePresence initial={false}>
        {showKeypad && variant !== 'record' && (
          <motion.div
            key="calculator-keypad"
            initial={variant === 'screen' ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={variant === 'screen' ? { opacity: 0, height: 0 } : undefined}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <CalculatorKeypad value={value} onChange={onChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
