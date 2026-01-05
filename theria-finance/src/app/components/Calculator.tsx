import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface CalculatorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ value, onChange }) => {
  const handleNumberClick = (num: string) => {
    onChange(value + num);
  };

  const handleOperator = (op: string) => {
    if (value && !value.endsWith(op) && !value.endsWith('+') && !value.endsWith('-') && !value.endsWith('*') && !value.endsWith('/')) {
      onChange(value + op);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleEquals = () => {
    try {
      const result = eval(value);
      onChange(String(result));
    } catch {
      // Invalid expression, do nothing
    }
  };

  const handleDecimal = () => {
    const lastNumber = value.split(/[\+\-\*\/]/).pop() || '';
    if (!lastNumber.includes('.')) {
      onChange(value + '.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="relative">
        <input
          type="text"
          value={value}
          readOnly
          className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-right text-lg font-semibold text-foreground"
          placeholder="0"
        />
        {value && (
          <button
            type="button"
            onClick={handleBackspace}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-muted-foreground/20 transition-colors"
            title="Backspace"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button
          type="button"
          onClick={() => handleNumberClick('7')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick('8')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick('9')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleOperator('/')}
          className="px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted-foreground/30 text-foreground font-semibold text-sm transition-colors"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => handleNumberClick('4')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick('5')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick('6')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleOperator('*')}
          className="px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted-foreground/30 text-foreground font-semibold text-sm transition-colors"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => handleNumberClick('1')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick('2')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick('3')}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleOperator('-')}
          className="px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted-foreground/30 text-foreground font-semibold text-sm transition-colors"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => handleNumberClick('0')}
          className="col-span-2 px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDecimal}
          className="px-3 py-2 rounded-lg border border-border bg-input-background hover:bg-muted text-foreground font-semibold text-sm transition-colors"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleOperator('+')}
          className="px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted-foreground/30 text-foreground font-semibold text-sm transition-colors"
        >
          +
        </button>

        {/* Row 5 - Action Buttons */}
        <button
          type="button"
          onClick={handleClear}
          className="col-span-2 px-3 py-2 rounded-lg border border-border bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold text-sm transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="col-span-2 px-3 py-2 rounded-lg border border-border bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-colors"
        >
          =
        </button>
      </div>
    </div>
  );
};
