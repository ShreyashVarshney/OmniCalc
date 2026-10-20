import React, { useState } from 'react';
import { Copy, Check, Hash, Cpu } from 'lucide-react';

export default function ProgrammerKeypad({
  currentValue,
  onApplyValue,
  onBitwiseOp,
  onCopySuccess,
}) {
  const [copiedBase, setCopiedBase] = useState(null);

  // Parse current numeric value (integer)
  const num = parseInt(currentValue, 10) || 0;

  // Representations
  const hexVal = num.toString(16).toUpperCase();
  const decVal = num.toString(10);
  const octVal = num.toString(8);
  // Format binary into 4-bit chunks
  const rawBin = (num >>> 0).toString(2);
  const paddedBin = rawBin.padStart(Math.ceil(rawBin.length / 4) * 4 || 8, '0');
  const binVal = paddedBin.match(/.{1,4}/g)?.join(' ') || '0000 0000';

  const bases = [
    { label: 'HEX', val: `0x${hexVal}`, raw: hexVal },
    { label: 'DEC', val: decVal, raw: decVal },
    { label: 'OCT', val: `0o${octVal}`, raw: octVal },
    { label: 'BIN', val: binVal, raw: rawBin },
  ];

  const handleCopyBase = (label, text) => {
    navigator.clipboard.writeText(text);
    setCopiedBase(label);
    if (onCopySuccess) onCopySuccess(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedBase(null), 1500);
  };

  return (
    <div className="programmer-panel" role="region" aria-label="Programmer Base Conversions">
      {/* Base representations list */}
      <div className="base-cards-grid">
        {bases.map((b) => (
          <div
            key={b.label}
            id={`base-card-${b.label.toLowerCase()}`}
            className="base-card"
            onClick={() => handleCopyBase(b.label, b.raw)}
            title={`Click to copy ${b.label}`}
          >
            <div className="base-label">
              <Hash size={14} />
              <span>{b.label}</span>
            </div>
            <div className="base-val">
              {b.val}
              {copiedBase === b.label && (
                <span style={{ marginLeft: '8px', color: '#34d399', fontSize: '0.75rem' }}>
                  ✓ Copied
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bitwise operations buttons */}
      <div className="standard-grid" style={{ marginTop: '0.5rem' }}>
        <button
          id="btn-bit-and"
          className="key-btn btn-fn"
          onClick={() => onBitwiseOp('&')}
          title="Bitwise AND (&)"
        >
          AND
        </button>
        <button
          id="btn-bit-or"
          className="key-btn btn-fn"
          onClick={() => onBitwiseOp('|')}
          title="Bitwise OR (|)"
        >
          OR
        </button>
        <button
          id="btn-bit-xor"
          className="key-btn btn-fn"
          onClick={() => onBitwiseOp('^')}
          title="Bitwise XOR (^)"
        >
          XOR
        </button>
        <button
          id="btn-bit-not"
          className="key-btn btn-fn"
          onClick={() => onBitwiseOp('~')}
          title="Bitwise NOT (~)"
        >
          NOT
        </button>

        <button
          id="btn-bit-lshift"
          className="key-btn btn-fn"
          onClick={() => onBitwiseOp('<<')}
          title="Left Shift (<<)"
        >
          LSH &lt;&lt;
        </button>
        <button
          id="btn-bit-rshift"
          className="key-btn btn-fn"
          onClick={() => onBitwiseOp('>>')}
          title="Right Shift (>>)"
        >
          RSH &gt;&gt;
        </button>
        <button
          id="btn-bit-rol"
          className="key-btn btn-fn col-span-2"
          onClick={() => onApplyValue(String(~num))}
          title="Invert 1's Complement"
        >
          1's Compl
        </button>
      </div>
    </div>
  );
}
