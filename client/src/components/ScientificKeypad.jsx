import React, { useState } from 'react';
import { Delete } from 'lucide-react';

export default function ScientificKeypad({
  angleUnit,
  onToggleAngleUnit,
  onScientificFn,
  onConstant,
  onBackspace,
}) {
  const [isSecond, setIsSecond] = useState(false);

  return (
    <div className="scientific-grid" role="group" aria-label="Scientific Functions">
      {/* Row 1 */}
      <button
        id="btn-deg-rad"
        className="key-btn btn-fn"
        onClick={onToggleAngleUnit}
        title="Toggle Degrees / Radians"
      >
        {angleUnit.toUpperCase()}
      </button>

      <button
        id="btn-2nd"
        className={`key-btn btn-fn ${isSecond ? 'active-deg' : ''}`}
        onClick={() => setIsSecond(!isSecond)}
        title="Secondary Functions Toggle"
      >
        2<sup>nd</sup>
      </button>

      <button
        id="btn-pi"
        className="key-btn btn-fn"
        onClick={() => onConstant('π')}
        title="Pi (3.14159...)"
      >
        π
      </button>

      <button
        id="btn-e"
        className="key-btn btn-fn"
        onClick={() => onConstant('e')}
        title="Euler's Number (2.71828...)"
      >
        e
      </button>

      <button
        id="btn-backspace"
        className="key-btn btn-fn"
        onClick={onBackspace}
        title="Backspace (Backspace)"
      >
        <Delete size={18} />
      </button>

      {/* Row 2 */}
      <button
        id="btn-sin"
        className="key-btn btn-fn"
        onClick={() => onScientificFn(isSecond ? 'asin' : 'sin')}
        title={isSecond ? 'Inverse Sine (asin)' : 'Sine'}
      >
        {isSecond ? 'sin⁻¹' : 'sin'}
      </button>

      <button
        id="btn-cos"
        className="key-btn btn-fn"
        onClick={() => onScientificFn(isSecond ? 'acos' : 'cos')}
        title={isSecond ? 'Inverse Cosine (acos)' : 'Cosine'}
      >
        {isSecond ? 'cos⁻¹' : 'cos'}
      </button>

      <button
        id="btn-tan"
        className="key-btn btn-fn"
        onClick={() => onScientificFn(isSecond ? 'atan' : 'tan')}
        title={isSecond ? 'Inverse Tangent (atan)' : 'Tangent'}
      >
        {isSecond ? 'tan⁻¹' : 'tan'}
      </button>

      <button
        id="btn-ln"
        className="key-btn btn-fn"
        onClick={() => onScientificFn(isSecond ? 'exp' : 'ln')}
        title={isSecond ? 'e^x' : 'Natural Log (ln)'}
      >
        {isSecond ? (
          <span>
            e<sup>x</sup>
          </span>
        ) : (
          'ln'
        )}
      </button>

      <button
        id="btn-log"
        className="key-btn btn-fn"
        onClick={() => onScientificFn(isSecond ? 'pow10' : 'log')}
        title={isSecond ? '10^x' : 'Base-10 Log (log)'}
      >
        {isSecond ? (
          <span>
            10<sup>x</sup>
          </span>
        ) : (
          'log'
        )}
      </button>

      {/* Row 3 */}
      <button
        id="btn-square"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('square')}
        title="Square (x²)"
      >
        x<sup>2</sup>
      </button>

      <button
        id="btn-cube"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('cube')}
        title="Cube (x³)"
      >
        x<sup>3</sup>
      </button>

      <button
        id="btn-power"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('pow')}
        title="Power (xʸ)"
      >
        x<sup>y</sup>
      </button>

      <button
        id="btn-sqrt"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('sqrt')}
        title="Square Root (√x)"
      >
        √x
      </button>

      <button
        id="btn-cbrt"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('cbrt')}
        title="Cube Root (∛x)"
      >
        ∛x
      </button>

      {/* Row 4 */}
      <button
        id="btn-reciprocal"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('reciprocal')}
        title="Reciprocal (1/x)"
      >
        1/x
      </button>

      <button
        id="btn-abs"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('abs')}
        title="Absolute Value (|x|)"
      >
        |x|
      </button>

      <button
        id="btn-fact"
        className="key-btn btn-fn"
        onClick={() => onScientificFn('factorial')}
        title="Factorial (n!)"
      >
        n!
      </button>

      <button
        id="btn-phi"
        className="key-btn btn-fn"
        onClick={() => onConstant('φ')}
        title="Golden Ratio φ (1.618...)"
      >
        φ
      </button>

      <button
        id="btn-sinh"
        className="key-btn btn-fn"
        onClick={() => onScientificFn(isSecond ? 'asinh' : 'sinh')}
        title="Hyperbolic Sine (sinh)"
      >
        sinh
      </button>
    </div>
  );
}
