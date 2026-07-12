import React, { useCallback, useState } from 'react';
import { Calculator as CalculatorIcon, Delete } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './ui/utils';

interface CalculatorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** Main-currency symbol shown next to the amount (record variant). */
  currencySymbol?: string;
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

/** Display-only formatting: thousands separators on every number, pretty operators. */
const formatCalcDisplay = (raw: string) =>
  raw
    .replace(/\d+(\.\d*)?/g, (num) => {
      const [int, dec] = num.split('.');
      const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return dec !== undefined ? `${withCommas}.${dec}` : withCommas;
    })
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−');

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
    handleBackspace,
    handleClear,
    handleEquals,
    handleDecimal,
  } = useCalculatorHandlers(value, onChange);

  const keyBase =
    'flex h-11 select-none items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95';
  const numClass = cn(
    keyBase,
    'border border-border/60 bg-card text-foreground shadow-sm hover:border-primary/25 hover:bg-muted',
  );
  const opClass = cn(keyBase, 'bg-primary/10 text-base text-primary hover:bg-primary/20');

  const numKey = (num: string, extra?: string) => (
    <button type="button" onClick={() => handleNumberClick(num)} className={cn(numClass, extra)}>
      {num}
    </button>
  );

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {numKey('7')}
      {numKey('8')}
      {numKey('9')}
      <button type="button" onClick={() => handleOperator('/')} className={opClass} aria-label="Divide">
        ÷
      </button>

      {numKey('4')}
      {numKey('5')}
      {numKey('6')}
      <button type="button" onClick={() => handleOperator('*')} className={opClass} aria-label="Multiply">
        ×
      </button>

      {numKey('1')}
      {numKey('2')}
      {numKey('3')}
      <button type="button" onClick={() => handleOperator('-')} className={opClass} aria-label="Subtract">
        −
      </button>

      <button type="button" onClick={handleDecimal} className={numClass} aria-label="Decimal point">
        .
      </button>
      {numKey('0')}
      <button
        type="button"
        onClick={handleBackspace}
        className={cn(keyBase, 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground')}
        title="Backspace"
        aria-label="Backspace"
      >
        <Delete size={16} strokeWidth={2.25} />
      </button>
      <button type="button" onClick={() => handleOperator('+')} className={opClass} aria-label="Add">
        +
      </button>

      <button
        type="button"
        onClick={handleClear}
        className={cn(
          keyBase,
          'col-span-2 bg-destructive/10 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/20',
        )}
      >
        Clear
      </button>
      <button
        type="button"
        onClick={handleEquals}
        className={cn(
          keyBase,
          'col-span-2 bg-primary text-base text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90',
        )}
        aria-label="Equals"
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
  currencySymbol,
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

  // The whole display toggles the keypad; backspace is a floating sibling
  // (buttons must not nest).
  const renderRecordDisplay = () => (
    <div className="relative w-full">
      <motion.button
        type="button"
        whileTap={{ scale: 0.99 }}
        onClick={() => setKeyboardOpen(!keyboardOpen)}
        aria-expanded={keyboardOpen}
        aria-label={keyboardOpen ? 'Hide keypad' : 'Show keypad'}
        title={keyboardOpen ? 'Hide keypad' : 'Tap to type'}
        className={cn(
          'w-full rounded-xl border px-4 py-3 text-left shadow-sm transition-all',
          displayTintClass(displayColor),
          keyboardOpen && 'ring-2 ring-primary/30',
        )}
      >
        <span className="flex items-center justify-between">
          <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <CalculatorIcon
            size={13}
            strokeWidth={2.25}
            className={cn(
              'transition-colors',
              keyboardOpen ? 'text-primary' : 'text-muted-foreground/50',
            )}
            aria-hidden
          />
        </span>
        <span
          className={cn(
            'mt-1 block truncate text-right text-3xl font-bold tabular-nums tracking-tight',
            value ? '' : 'text-muted-foreground/50',
          )}
        >
          {currencySymbol && (
            <span className="mr-1.5 align-baseline text-lg font-semibold text-muted-foreground">
              {currencySymbol}
            </span>
          )}
          {value ? formatCalcDisplay(value) : '0'}
        </span>
      </motion.button>
      {value && (
        <button
          type="button"
          onClick={handleBackspace}
          className="absolute bottom-2 left-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Backspace"
          aria-label="Backspace"
        >
          <Delete size={15} strokeWidth={2.25} />
        </button>
      )}
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
        {value ? formatCalcDisplay(value) : '0'}
      </p>
      {value && (
        <button
          type="button"
          onClick={handleBackspace}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Backspace"
          aria-label="Backspace"
        >
          <Delete size={14} strokeWidth={2.25} />
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
          value={formatCalcDisplay(value)}
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
          aria-label="Backspace"
        >
          <Delete size={14} className="text-muted-foreground" />
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
