import React from 'react';
import { Delete } from 'lucide-react';

export default function StandardKeypad({
  onDigit,
  onOperator,
  onClear,
  onBackspace,
  onParentheses,
  onNegate,
  onEquals,
  onPercent,
}) {
  return (
    <div className="standard-grid" role="group" aria-label="Standard Keypad">
      {/* Row 1 */}
      <button
        id="btn-clear"
        className="key-btn btn-danger"
        onClick={onClear}
        title="Clear All (Escape)"
      >
        AC
      </button>

      <button
        id="btn-parentheses"
        className="key-btn btn-fn"
        onClick={onParentheses}
        title="Parentheses ( )"
      >
        ( )
      </button>

      <button
        id="btn-percent"
        className="key-btn btn-fn"
        onClick={onPercent}
        title="Percentage (%)"
      >
        %
      </button>

      <button
        id="btn-op-divide"
        className="key-btn btn-op"
        onClick={() => onOperator('÷')}
        title="Divide (/)"
      >
        ÷
      </button>

      {/* Row 2 */}
      <button
        id="btn-num-7"
        className="key-btn btn-num"
        onClick={() => onDigit('7')}
      >
        7
      </button>
      <button
        id="btn-num-8"
        className="key-btn btn-num"
        onClick={() => onDigit('8')}
      >
        8
      </button>
      <button
        id="btn-num-9"
        className="key-btn btn-num"
        onClick={() => onDigit('9')}
      >
        9
      </button>
      <button
        id="btn-op-multiply"
        className="key-btn btn-op"
        onClick={() => onOperator('×')}
        title="Multiply (*)"
      >
        ×
      </button>

      {/* Row 3 */}
      <button
        id="btn-num-4"
        className="key-btn btn-num"
        onClick={() => onDigit('4')}
      >
        4
      </button>
      <button
        id="btn-num-5"
        className="key-btn btn-num"
        onClick={() => onDigit('5')}
      >
        5
      </button>
      <button
        id="btn-num-6"
        className="key-btn btn-num"
        onClick={() => onDigit('6')}
      >
        6
      </button>
      <button
        id="btn-op-subtract"
        className="key-btn btn-op"
        onClick={() => onOperator('−')}
        title="Subtract (-)"
      >
        −
      </button>

      {/* Row 4 */}
      <button
        id="btn-num-1"
        className="key-btn btn-num"
        onClick={() => onDigit('1')}
      >
        1
      </button>
      <button
        id="btn-num-2"
        className="key-btn btn-num"
        onClick={() => onDigit('2')}
      >
        2
      </button>
      <button
        id="btn-num-3"
        className="key-btn btn-num"
        onClick={() => onDigit('3')}
      >
        3
      </button>
      <button
        id="btn-op-add"
        className="key-btn btn-op"
        onClick={() => onOperator('+')}
        title="Add (+)"
      >
        +
      </button>

      {/* Row 5 */}
      <button
        id="btn-negate"
        className="key-btn btn-fn"
        onClick={onNegate}
        title="Negate (+/-)"
      >
        ±
      </button>
      <button
        id="btn-num-0"
        className="key-btn btn-num"
        onClick={() => onDigit('0')}
      >
        0
      </button>
      <button
        id="btn-decimal"
        className="key-btn btn-num"
        onClick={() => onDigit('.')}
        title="Decimal Point"
      >
        .
      </button>
      <button
        id="btn-equals"
        className="key-btn btn-equals"
        onClick={onEquals}
        title="Calculate (Enter)"
      >
        =
      </button>
    </div>
  );
}
