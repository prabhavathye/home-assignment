import { useCallback } from 'react';

/**
 * A tactile, ATM-style numeric keypad. Renders the entered digits as masked
 * dots above the keys. Calling onComplete once `length` digits are entered.
 */
const PinPad = ({ value, onChange, length = 4, disabled = false }) => {
  const press = useCallback(
    (digit) => {
      if (disabled) return;
      if (value.length < length) onChange(value + digit);
    },
    [value, onChange, length, disabled]
  );

  const backspace = () => !disabled && onChange(value.slice(0, -1));
  const clear = () => !disabled && onChange('');

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3" aria-live="polite" aria-label={`${value.length} of ${length} digits entered`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full border border-phosphor transition-colors ${
              i < value.length ? 'bg-phosphor shadow-glow' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-64">
        {keys.map((key) => {
          if (key === 'clear') {
            return (
              <button
                key={key}
                type="button"
                onClick={clear}
                disabled={disabled}
                className="btn-secondary text-xs tracking-widest"
              >
                CLEAR
              </button>
            );
          }
          if (key === 'back') {
            return (
              <button
                key={key}
                type="button"
                onClick={backspace}
                disabled={disabled}
                className="btn-secondary text-xs tracking-widest"
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              disabled={disabled}
              className="font-mono text-xl bg-panelLight rounded-lg py-3 transition
                         hover:bg-phosphor hover:text-ink active:scale-95
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-phosphor"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PinPad;
