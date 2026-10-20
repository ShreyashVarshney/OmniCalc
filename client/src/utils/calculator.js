// Advanced Math & Calculator Evaluation Engine

// Factorial calculation
export const factorial = (n) => {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // JS Number overflow
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

// Normalize floating point inaccuracies (e.g., 0.1 + 0.2 => 0.3)
export const formatPrecision = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // If scientific notation is needed for extremely large or tiny numbers
  if (Math.abs(num) > 1e14 || (Math.abs(num) < 1e-7 && num !== 0)) {
    return Number(num.toPrecision(10)).toExponential();
  }

  // Round to 11 decimal places to eliminate IEEE-754 precision artifacts
  const rounded = Math.round(num * 1e11) / 1e11;
  return String(rounded);
};

// Format a number string with thousand separators for human-friendly display
export const formatWithCommas = (str) => {
  if (!str) return '0';
  if (str === 'Error' || str === 'Infinity' || str === '-Infinity') return str;
  if (str.includes('e') || str.includes('E')) return str;

  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

/**
 * Prepares and evaluates mathematical expressions
 * @param {string} rawExpr - The input string (e.g., "sin(30) + 5 * 2^3")
 * @param {string} angleUnit - 'deg' or 'rad'
 * @returns {{ result: string, numeric: number, error: string | null }}
 */
export const evaluateExpression = (rawExpr, angleUnit = 'deg') => {
  if (!rawExpr || rawExpr.trim() === '') {
    return { result: '0', numeric: 0, error: null };
  }

  let expr = rawExpr;

  // Replace visual symbols with valid math operators
  expr = expr.replace(/×/g, '*');
  expr = expr.replace(/÷/g, '/');
  expr = expr.replace(/−/g, '-');
  expr = expr.replace(/π/g, `(${Math.PI})`);
  expr = expr.replace(/φ/g, '(1.618033988749895)');
  expr = expr.replace(/\be\b/g, `(${Math.E})`);

  // Handle factorial: replace "number!" with "factorial(number)"
  expr = expr.replace(/(\d+(\.\d+)?|\([^\(\)]+\))!/g, 'factorial($1)');

  // Handle angles for trig functions
  const isDeg = angleUnit === 'deg';
  const degToRad = (val) => (val * Math.PI) / 180;
  const radToDeg = (val) => (val * 180) / Math.PI;

  const mathContext = {
    sin: (x) => Math.sin(isDeg ? degToRad(x) : x),
    cos: (x) => {
      // Fix cos(90 deg) = 0 instead of 6.12e-17
      if (isDeg && Math.abs(x % 180) === 90) return 0;
      return Math.cos(isDeg ? degToRad(x) : x);
    },
    tan: (x) => {
      if (isDeg && Math.abs(x % 180) === 90) return Infinity;
      return Math.tan(isDeg ? degToRad(x) : x);
    },
    asin: (x) => {
      const res = Math.asin(x);
      return isDeg ? radToDeg(res) : res;
    },
    acos: (x) => {
      const res = Math.acos(x);
      return isDeg ? radToDeg(res) : res;
    },
    atan: (x) => {
      const res = Math.atan(x);
      return isDeg ? radToDeg(res) : res;
    },
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    ln: Math.log,
    log: Math.log10,
    log10: Math.log10,
    log2: Math.log2,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    abs: Math.abs,
    fact: factorial,
    factorial: factorial,
    pow: Math.pow,
  };

  // Convert ^ to **
  expr = expr.replace(/\^/g, '**');

  // Convert percentages on parenthesized groups: e.g. "(10 + 20)%" -> "((10 + 20)/100)"
  expr = expr.replace(/\(([^\(\)]+)\)%/g, '(($1)/100)');
  // Convert percentages on numbers: e.g. "50%" -> "(50/100)"
  expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

  // Reject stray percentage operators without an operand
  if (/%/.test(expr)) {
    return { result: 'Error', numeric: NaN, error: 'Operator cannot be used without an operand' };
  }

  // Reject invalid leading binary operators (*, /, ^)
  if (/^\s*[\*\/^]/.test(expr)) {
    return { result: 'Error', numeric: NaN, error: 'Operator cannot be used without an operand' };
  }

  // Reject invalid consecutive binary operators (e.g., "* *", "/ /", "+ *")
  const opCheck = expr.replace(/\*\*/g, '^').replace(/\s+/g, '');
  if (/[\+\*\/^]{2,}/.test(opCheck)) {
    return { result: 'Error', numeric: NaN, error: 'Consecutive operators are not allowed' };
  }

  // Validate allowed characters for safety (whitelist characters)
  const safeRegex = /[0-9+\-*/().,%^ \t\r\n]|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|ln|log|log10|log2|sqrt|cbrt|abs|factorial|fact|pow|Infinity|NaN/g;
  const sanitized = expr.replace(safeRegex, '');
  if (sanitized.length > 0) {
    return { result: 'Error', numeric: NaN, error: 'Invalid expression character' };
  }

  try {
    // Execute within our scoped context
    const fnKeys = Object.keys(mathContext);
    const fnVals = Object.values(mathContext);
    const evaluator = new Function(...fnKeys, `"use strict"; return (${expr});`);
    const val = evaluator(...fnVals);

    if (val === undefined || isNaN(val)) {
      return { result: 'Error', numeric: NaN, error: 'Undefined result' };
    }

    if (!isFinite(val)) {
      return {
        result: val > 0 ? 'Infinity' : '-Infinity',
        numeric: val,
        error: val === Infinity || val === -Infinity ? 'Division by zero' : 'Overflow',
      };
    }

    const formatted = formatPrecision(val);
    return { result: formatted, numeric: val, error: null };
  } catch (err) {
    return { result: 'Error', numeric: NaN, error: err.message };
  }
};

/**
 * Live preview calculation: silently attempts to evaluate incomplete expressions
 */
export const previewExpression = (expr, angleUnit = 'deg') => {
  if (!expr || expr.trim() === '') return '';

  let testExpr = expr.trim();
  // Remove trailing operators and whitespace
  testExpr = testExpr.replace(/[\+\−\×\÷\*\/\^\s]+$/, '');
  if (!testExpr) return '';

  // Close unmatched open parentheses for preview
  let openCount = (testExpr.match(/\(/g) || []).length;
  let closeCount = (testExpr.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    testExpr += ')'.repeat(openCount - closeCount);
  }

  const res = evaluateExpression(testExpr, angleUnit);
  if (res.error || res.result === 'Error') return '';
  return res.result;
};
