import React from 'react';

export default function MemoryBar({
  memoryValue,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryStore,
}) {
  const hasMemory = memoryValue !== null;

  return (
    <div className="memory-bar" role="toolbar" aria-label="Memory Controls">
      <button
        id="btn-mc"
        className={`mem-btn ${hasMemory ? 'active-mem' : ''}`}
        disabled={!hasMemory}
        onClick={onMemoryClear}
        title="Clear Memory (MC)"
      >
        MC
      </button>

      <button
        id="btn-mr"
        className={`mem-btn ${hasMemory ? 'active-mem' : ''}`}
        disabled={!hasMemory}
        onClick={onMemoryRecall}
        title={`Recall Memory: ${memoryValue || 0} (MR)`}
      >
        MR
      </button>

      <button
        id="btn-m-plus"
        className="mem-btn"
        onClick={onMemoryAdd}
        title="Add Current Result to Memory (M+)"
      >
        M+
      </button>

      <button
        id="btn-m-minus"
        className="mem-btn"
        onClick={onMemorySubtract}
        title="Subtract Current Result from Memory (M-)"
      >
        M-
      </button>

      <button
        id="btn-ms"
        className="mem-btn"
        onClick={onMemoryStore}
        title="Store Current Result to Memory (MS)"
      >
        MS
      </button>
    </div>
  );
}
