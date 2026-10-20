import React, { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatWithCommas } from '../utils/calculator';

export default function Display({
  expression,
  result,
  preview,
  angleUnit,
  memoryValue,
  onCopySuccess,
  onBackspace,
}) {
  const [copied, setCopied] = useState(false);
  const touchStartXRef = useRef(null);

  const handleCopy = () => {
    const textToCopy = result || expression || '0';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (onCopySuccess) onCopySuccess('Result copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Mobile Swipe Gesture: Swipe left/right on display to backspace
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    // If horizontal swipe distance > 35px
    if (Math.abs(touchEndX - touchStartXRef.current) > 35) {
      if (onBackspace) onBackspace();
    }
    touchStartXRef.current = null;
  };

  // Determine dynamic font scaling based on result length
  const getResultClass = (text) => {
    const len = (text || '').length;
    if (len > 15) return 'very-long-text';
    if (len > 9) return 'long-text';
    return '';
  };

  return (
    <div
      className="calc-display"
      id="calculator-display"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title="Swipe across numbers on mobile to backspace"
    >
      {/* Top Indicators Bar */}
      <div className="display-top-bar">
        <div className="display-badges">
          <span className="display-badge active-deg">
            {angleUnit.toUpperCase()}
          </span>

          {memoryValue !== null && (
            <span
              className="display-badge has-memory"
              title={`Stored in Memory: ${memoryValue}`}
            >
              M: {memoryValue}
            </span>
          )}
        </div>

        <div className="display-actions">
          <button
            id="copy-result-btn"
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy Result"
          >
            {copied ? (
              <>
                <Check size={12} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expression Line */}
      <div className="expression-line" id="expression-display">
        {expression || <span style={{ opacity: 0.35 }}>0</span>}
      </div>

      {/* Main Result Line */}
      <div
        className={`result-line ${getResultClass(result)}`}
        id="result-display"
      >
        {formatWithCommas(result)}
      </div>

      {/* Live Preview Line */}
      <div className="live-preview" id="live-preview-display">
        {preview && preview !== result && (
          <>
            <span className="preview-equals">=</span>
            <span>{formatWithCommas(preview)}</span>
          </>
        )}
      </div>
    </div>
  );
}
