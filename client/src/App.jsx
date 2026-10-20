import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Display from './components/Display';
import MemoryBar from './components/MemoryBar';
import StandardKeypad from './components/StandardKeypad';
import ScientificKeypad from './components/ScientificKeypad';
import UnitConverter from './components/UnitConverter';
import ProgrammerKeypad from './components/ProgrammerKeypad';
import HistoryDrawer from './components/HistoryDrawer';
import StatusModal from './components/StatusModal';
import { evaluateExpression, previewExpression } from './utils/calculator';
import { playSound } from './utils/sound';
import { api } from './utils/api';

export default function App() {
  // Theme state: 'obsidian' | 'aurora' | 'nordic'
  const [theme, setTheme] = useState(() => localStorage.getItem('omni_theme') || 'obsidian');

  // Calculator Mode: 'standard' | 'scientific' | 'converter' | 'programmer'
  const [activeMode, setActiveMode] = useState('standard');

  // Calculator Core State
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [preview, setPreview] = useState('');
  const [angleUnit, setAngleUnit] = useState('deg'); // 'deg' | 'rad'
  const [memoryValue, setMemoryValue] = useState(() => {
    const saved = localStorage.getItem('omni_memory');
    return saved !== null ? Number(saved) : null;
  });
  const [justCalculated, setJustCalculated] = useState(false);

  // MERN History & DB Status
  const [history, setHistory] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Sound Feedback & Notifications
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('omni_muted') === 'true');
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Apply Theme Attribute to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('omni_theme', theme);
  }, [theme]);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(msg);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  // Fetch initial history & backend status
  const loadHistory = useCallback(async () => {
    try {
      const res = await api.getCalculations({ limit: 60 });
      if (res.data) setHistory(res.data);
    } catch (err) {
      console.warn('Could not load history:', err.message);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.getStatus();
      setDbStatus({
        ...res,
        isConnected: res.database ? res.database.connected : false,
        usingFallback: res.database ? res.database.usingFallback : true,
        dbName: res.database?.dbName || 'calculator',
      });
    } catch (err) {
      console.warn('Could not fetch server status:', err.message);
      setDbStatus({ isConnected: false, usingFallback: true, error: err.message });
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadHistory();
  }, [loadStatus, loadHistory]);

  // Live Expression Evaluation Preview
  useEffect(() => {
    if (expression && !justCalculated) {
      const prev = previewExpression(expression, angleUnit);
      setPreview(prev);
    } else {
      setPreview('');
    }
  }, [expression, angleUnit, justCalculated]);

  // Cycle Theme
  const handleCycleTheme = () => {
    playSound('toggle', isMuted);
    const themes = ['obsidian', 'aurora', 'nordic'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  // Toggle Sound
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('omni_muted', String(nextMuted));
    if (!nextMuted) playSound('click', false);
    showToast(nextMuted ? 'Audio muted' : 'Audio feedback enabled');
  };

  // Keypad Actions
  const handleDigit = (digit) => {
    playSound('click', isMuted);
    if (justCalculated) {
      // If user starts typing digits immediately after a result, start fresh
      setExpression(digit === '.' ? '0.' : digit);
      setResult(digit === '.' ? '0.' : digit);
      setJustCalculated(false);
      return;
    }

    if (digit === '.') {
      // Prevent consecutive or double dots in the current token
      const tokens = expression.split(/[\+\−\×\÷\*\/\(\)\^\%]/);
      const lastToken = tokens[tokens.length - 1];
      if (lastToken.includes('.')) return;
      if (!lastToken || lastToken === '') {
        setExpression((prev) => prev + '0.');
        setResult((prev) => (prev === '0' ? '0.' : prev + '.'));
        return;
      }
    }

    const isNewOperand = /[\+\−\×\÷\*\/\^]\s*$/.test(expression);
    setExpression((prev) => (prev === '0' && digit !== '.' ? digit : prev + digit));
    setResult((prev) => (isNewOperand || prev === '0' ? (digit === '.' ? '0.' : digit) : prev + digit));
  };

  const handleOperator = (op) => {
    playSound('operator', isMuted);
    setJustCalculated(false);

    // If starting with an operator, use current result
    if (!expression || expression === '') {
      setExpression(`${result} ${op} `);
      return;
    }

    // Replace trailing operator if consecutive
    if (/[\+\−\×\÷\*\/\^]\s*$/.test(expression)) {
      setExpression((prev) => prev.replace(/[\+\−\×\÷\*\/\^]\s*$/, `${op} `));
      return;
    }

    setExpression((prev) => `${prev} ${op} `);
  };

  const handleClear = () => {
    playSound('clear', isMuted);
    setExpression('');
    setResult('0');
    setPreview('');
    setJustCalculated(false);
  };

  const handleBackspace = () => {
    playSound('click', isMuted);
    if (justCalculated) {
      handleClear();
      return;
    }
    if (!expression || expression.length <= 1) {
      setExpression('');
      setResult('0');
      return;
    }

    // If trailing whitespace + operator, remove whole token
    let updated = expression;
    if (/\s[\+\−\×\÷]\s$/.test(updated)) {
      updated = updated.slice(0, -3);
    } else {
      updated = updated.slice(0, -1);
    }

    setExpression(updated);
    setResult(updated || '0');
  };

  const handleParentheses = () => {
    playSound('click', isMuted);
    setJustCalculated(false);

    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;
    const lastChar = expression.trim().slice(-1);

    // Auto-decide between '(' or ')'
    if (openCount > closeCount && /[0-9\π\e\φ\)]/.test(lastChar)) {
      setExpression((prev) => prev + ')');
    } else if (/[0-9\π\e\φ\)]/.test(lastChar)) {
      setExpression((prev) => prev + ' × (');
    } else {
      setExpression((prev) => prev + '(');
    }
  };

  const handleNegate = () => {
    playSound('click', isMuted);
    if (!expression || expression === '0') return;

    // Toggle negation on current result/expression
    if (justCalculated) {
      const negated = String(-1 * Number(result));
      setExpression(negated);
      setResult(negated);
      return;
    }

    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else {
      setExpression(`-(${expression})`);
    }
  };

  const handlePercent = () => {
    playSound('operator', isMuted);
    setJustCalculated(false);
    setExpression((prev) => prev + '%');
  };

  const handleConstant = (sym) => {
    playSound('click', isMuted);
    setJustCalculated(false);
    const lastChar = expression.trim().slice(-1);
    if (/[0-9\π\e\φ]/.test(lastChar)) {
      setExpression((prev) => `${prev} × ${sym}`);
    } else {
      setExpression((prev) => `${prev}${sym}`);
    }
  };

  const handleScientificFn = (fn) => {
    playSound('operator', isMuted);
    setJustCalculated(false);

    if (fn === 'square') {
      setExpression((prev) => (prev ? `(${prev})^2` : '0^2'));
    } else if (fn === 'cube') {
      setExpression((prev) => (prev ? `(${prev})^3` : '0^3'));
    } else if (fn === 'pow') {
      setExpression((prev) => `${prev}^`);
    } else if (fn === 'sqrt') {
      setExpression((prev) => `${prev}sqrt(`);
    } else if (fn === 'cbrt') {
      setExpression((prev) => `${prev}cbrt(`);
    } else if (fn === 'reciprocal') {
      setExpression((prev) => (prev ? `1/(${prev})` : '1/'));
    } else if (fn === 'abs') {
      setExpression((prev) => `${prev}abs(`);
    } else if (fn === 'factorial') {
      setExpression((prev) => `${prev}!`);
    } else if (fn === 'exp') {
      setExpression((prev) => `${prev}e^(`);
    } else if (fn === 'pow10') {
      setExpression((prev) => `${prev}10^(`);
    } else {
      // Trig & log functions: sin(, cos(, tan(, etc.
      setExpression((prev) => `${prev}${fn}(`);
    }
  };

  // Main Evaluation & MongoDB Persist
  const handleEquals = async () => {
    if (!expression || expression.trim() === '') return;

    const evaluated = evaluateExpression(expression, angleUnit);

    if (evaluated.error) {
      playSound('error', isMuted);
      setResult('Error');
      showToast(`Calculation error: ${evaluated.error}`);
      return;
    }

    playSound('equals', isMuted);
    setResult(evaluated.result);
    setJustCalculated(true);

    // Save to MERN backend (MongoDB)
    try {
      const calcData = {
        expression: expression.trim(),
        result: evaluated.result,
        type: activeMode === 'scientific' ? 'scientific' : 'standard',
      };

      const res = await api.createCalculation(calcData);
      if (res && res.data) {
        setHistory((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.warn('Could not save calculation to server:', err.message);
    }
  };

  // Memory Bar Handlers
  const handleMemoryClear = () => {
    playSound('clear', isMuted);
    setMemoryValue(null);
    localStorage.removeItem('omni_memory');
    showToast('Memory Cleared (MC)');
  };

  const handleMemoryRecall = () => {
    if (memoryValue === null) return;
    playSound('click', isMuted);
    setExpression((prev) => (justCalculated ? String(memoryValue) : prev + String(memoryValue)));
    setResult(String(memoryValue));
    setJustCalculated(false);
  };

  const handleMemoryAdd = () => {
    playSound('operator', isMuted);
    const curr = parseFloat(result) || 0;
    const nextVal = (memoryValue || 0) + curr;
    setMemoryValue(nextVal);
    localStorage.setItem('omni_memory', String(nextVal));
    showToast(`Added to Memory: ${nextVal}`);
  };

  const handleMemorySubtract = () => {
    playSound('operator', isMuted);
    const curr = parseFloat(result) || 0;
    const nextVal = (memoryValue || 0) - curr;
    setMemoryValue(nextVal);
    localStorage.setItem('omni_memory', String(nextVal));
    showToast(`Subtracted from Memory: ${nextVal}`);
  };

  const handleMemoryStore = () => {
    playSound('click', isMuted);
    const curr = parseFloat(result) || 0;
    setMemoryValue(curr);
    localStorage.setItem('omni_memory', String(curr));
    showToast(`Stored in Memory: ${curr}`);
  };

  // History Operations
  const handleSelectHistory = (item) => {
    playSound('click', isMuted);
    setExpression(item.expression);
    setResult(item.result);
    setJustCalculated(true);
    setIsHistoryOpen(false);
    showToast('Calculation loaded from history');
  };

  const handleToggleFavorite = async (id) => {
    try {
      const res = await api.toggleFavorite(id);
      if (res.data) {
        setHistory((prev) =>
          prev.map((item) => ((item._id || item.id) === id ? res.data : item))
        );
        showToast(res.data.isFavorite ? 'Added to favorites ★' : 'Removed from favorites');
      }
    } catch (err) {
      showToast('Failed to update favorite');
    }
  };

  const handleDeleteCalculation = async (id) => {
    try {
      await api.deleteCalculation(id);
      setHistory((prev) => prev.filter((item) => (item._id || item.id) !== id));
      showToast('Calculation deleted');
    } catch (err) {
      showToast('Failed to delete calculation');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all calculation history?')) return;
    try {
      await api.clearAll();
      setHistory([]);
      showToast('All history cleared');
    } catch (err) {
      showToast('Failed to clear history');
    }
  };

  // Save Unit Converter item to MongoDB
  const handleSaveConversion = async (calcData) => {
    playSound('equals', isMuted);
    try {
      const res = await api.createCalculation(calcData);
      if (res && res.data) {
        setHistory((prev) => [res.data, ...prev]);
        showToast('Conversion saved to MongoDB!');
      }
    } catch (err) {
      showToast('Saved locally');
    }
  };

  // Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing inside an input (like search or converter input)
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        handleDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        handleDigit('.');
      } else if (key === '+' || key === '-') {
        e.preventDefault();
        handleOperator(key === '-' ? '−' : '+');
      } else if (key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === '%' || key === '^') {
        e.preventDefault();
        handleOperator(key);
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleParentheses();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, result, justCalculated, angleUnit, isMuted]);

  // Determine card mode styling
  const getCardModeClass = () => {
    if (activeMode === 'scientific') return 'mode-scientific-wide';
    if (activeMode === 'converter') return 'mode-converter-wide';
    return '';
  };

  return (
    <div className="app-container">
      {/* Ambient background glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Main Glassmorphic Calculator Container */}
      <main className={`calculator-card ${getCardModeClass()}`}>
        {/* Header */}
        <Header
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          dbStatus={dbStatus}
          onOpenStatusModal={() => setIsStatusModalOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          theme={theme}
          onCycleTheme={handleCycleTheme}
        />

        {/* Display for Standard & Scientific & Programmer modes */}
        {activeMode !== 'converter' && (
          <>
            <Display
              expression={expression}
              result={result}
              preview={preview}
              angleUnit={angleUnit}
              memoryValue={memoryValue}
              onCopySuccess={showToast}
              onBackspace={handleBackspace}
            />

            <MemoryBar
              memoryValue={memoryValue}
              onMemoryClear={handleMemoryClear}
              onMemoryRecall={handleMemoryRecall}
              onMemoryAdd={handleMemoryAdd}
              onMemorySubtract={handleMemorySubtract}
              onMemoryStore={handleMemoryStore}
            />
          </>
        )}

        {/* Keypad views based on mode */}
        {activeMode === 'standard' && (
          <StandardKeypad
            onDigit={handleDigit}
            onOperator={handleOperator}
            onClear={handleClear}
            onBackspace={handleBackspace}
            onParentheses={handleParentheses}
            onNegate={handleNegate}
            onEquals={handleEquals}
            onPercent={handlePercent}
          />
        )}

        {activeMode === 'scientific' && (
          <div className="keypad-layout">
            <ScientificKeypad
              angleUnit={angleUnit}
              onToggleAngleUnit={() => setAngleUnit((u) => (u === 'deg' ? 'rad' : 'deg'))}
              onScientificFn={handleScientificFn}
              onConstant={handleConstant}
              onBackspace={handleBackspace}
            />
            <StandardKeypad
              onDigit={handleDigit}
              onOperator={handleOperator}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onParentheses={handleParentheses}
              onNegate={handleNegate}
              onEquals={handleEquals}
              onPercent={handlePercent}
            />
          </div>
        )}

        {activeMode === 'programmer' && (
          <>
            <ProgrammerKeypad
              currentValue={result}
              onApplyValue={(val) => {
                setResult(val);
                setExpression(val);
                setJustCalculated(true);
              }}
              onBitwiseOp={(op) => {
                setExpression((prev) => `${prev || result} ${op} `);
                setJustCalculated(false);
              }}
              onCopySuccess={showToast}
            />
            <StandardKeypad
              onDigit={handleDigit}
              onOperator={handleOperator}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onParentheses={handleParentheses}
              onNegate={handleNegate}
              onEquals={handleEquals}
              onPercent={handlePercent}
            />
          </>
        )}

        {activeMode === 'converter' && (
          <UnitConverter
            onSaveConversion={handleSaveConversion}
            onCopySuccess={showToast}
          />
        )}
      </main>

      {/* Keyboard Shortcuts Hint Bar */}
      <footer className="keyboard-hint">
        <span>Keyboard:</span>
        <kbd>0-9</kbd>
        <kbd>+</kbd>
        <kbd>−</kbd>
        <kbd>×</kbd>
        <kbd>÷</kbd>
        <kbd>Enter =</kbd>
        <kbd>Esc AC</kbd>
        <kbd>Backspace ⌫</kbd>
      </footer>

      {/* Slide-over History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectCalculation={handleSelectHistory}
        onToggleFavorite={handleToggleFavorite}
        onDeleteCalculation={handleDeleteCalculation}
        onClearHistory={handleClearHistory}
        dbStatus={dbStatus}
      />

      {/* MERN Stack Status Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        dbStatus={dbStatus}
        onRefreshStatus={loadStatus}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-msg" role="status">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
