/**
 * =============================================================================
 * Simple Calculator – script.js
 * CodeOrbit Tech Web Development Internship · Task 3
 *
 * Architecture:
 *   All state is held in the `calc` object.
 *   The UI is updated through `updateDisplay()`.
 *   Arithmetic is evaluated by `safeCalculate()` – NO eval() is used.
 *   Keyboard events are mapped in `handleKeyboard()`.
 * =============================================================================
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────────
   1. DOM REFERENCES
───────────────────────────────────────────────────────────────────────────── */
const expressionEl = document.getElementById('expression'); // top line
const resultEl     = document.getElementById('result');     // main display

/* ─────────────────────────────────────────────────────────────────────────────
   2. CALCULATOR STATE
   All mutable state lives here so there are no scattered globals.
───────────────────────────────────────────────────────────────────────────── */
const calc = {
  expression:        '',    // full expression string shown on the top line
  currentInput:      '0',   // what the user is currently typing
  operator:          null,  // last operator pressed: '+' | '-' | '*' | '/'
  previousValue:     null,  // numeric value before the operator
  justCalculated:    false, // true right after "=" is pressed
  justPressedOp:     false, // true right after an operator is pressed
  hasDecimal:        false, // guards against two dots in one number
};

/* Symbols displayed vs. the internal operators used in computation */
const DISPLAY_TO_INTERNAL = { '÷': '/', '×': '*', '−': '-', '+': '+' };

/* ─────────────────────────────────────────────────────────────────────────────
   3. DISPLAY UPDATE
   Reflects the `calc` state onto the DOM.
───────────────────────────────────────────────────────────────────────────── */
/**
 * updateDisplay()
 * Writes `calc.expression` to the top line and `calc.currentInput` to the
 * main result line.  Also applies adaptive font-size classes when the
 * result string is long.
 */
function updateDisplay() {
  expressionEl.textContent = calc.expression || '0';

  const val = calc.currentInput;
  resultEl.textContent = val;

  // Reset state classes
  resultEl.classList.remove('shrink', 'shrink2', 'error');

  // Adaptive font-size based on character count
  if (val.length > 14) {
    resultEl.classList.add('shrink2');
  } else if (val.length > 9) {
    resultEl.classList.add('shrink');
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. NUMBER INPUT HANDLER
   Called whenever the user presses a digit (0-9) or "00".
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleNumber(value)
 * @param {string} value – the digit or "00" pressed.
 *
 * Rules:
 *  - If a result was just calculated, start a fresh input.
 *  - If an operator was just pressed, begin building the next operand.
 *  - Prevent a number starting with more than one "0" (but allow "0.5").
 *  - Append "00" only when it won't create a meaningless leading-zero string.
 */
function handleNumber(value) {
  // After "=", start fresh with the new digit
  if (calc.justCalculated) {
    calc.currentInput   = (value === '00') ? '0' : value;
    calc.expression     = '';
    calc.justCalculated = false;
    calc.hasDecimal     = false;
    updateDisplay();
    return;
  }

  // After an operator, begin the second operand
  if (calc.justPressedOp) {
    calc.currentInput   = (value === '00') ? '0' : value;
    calc.justPressedOp  = false;
    calc.hasDecimal     = false;
    updateDisplay();
    return;
  }

  // Prevent multiple leading zeros ("00" on a bare "0" keeps it "0")
  if (calc.currentInput === '0' && value !== '00') {
    calc.currentInput = value;
    updateDisplay();
    return;
  }
  if (calc.currentInput === '0' && value === '00') {
    // "0" stays "0"
    updateDisplay();
    return;
  }

  // Guard: cap at 15 digits to avoid floating-point display issues
  if (calc.currentInput.replace(/[^0-9]/g, '').length >= 15) return;

  calc.currentInput += value;
  updateDisplay();
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. OPERATOR INPUT HANDLER
   Called when +, −, ×, ÷ is pressed.
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleOperator(displaySymbol)
 * @param {string} displaySymbol – one of '+' | '−' | '×' | '÷'
 *
 * Rules:
 *  - If an operator was already set and no new number has been entered,
 *    just replace the operator (avoid chaining e.g. "3 + ÷").
 *  - If a result just came from "=", continue chaining with that result.
 *  - Otherwise perform an intermediate calculation if two operands exist.
 */
function handleOperator(displaySymbol) {
  const internalOp = DISPLAY_TO_INTERNAL[displaySymbol];

  // If a result was shown after "=", chain on from it
  if (calc.justCalculated) {
    calc.justCalculated = false;
    calc.previousValue  = parseFloat(calc.currentInput);
    calc.operator       = internalOp;
    calc.expression     = `${formatForExpression(calc.currentInput)} ${displaySymbol}`;
    calc.justPressedOp  = true;
    updateDisplay();
    return;
  }

  // If we pressed an operator right after another operator, just swap it
  if (calc.justPressedOp) {
    calc.operator   = internalOp;
    // Replace trailing operator symbol in the expression string
    calc.expression = calc.expression.replace(/[+\-×÷−]\s*$/, '') + ` ${displaySymbol}`;
    updateDisplay();
    return;
  }

  // If we have a pending operation, compute an intermediate result first
  if (calc.previousValue !== null && calc.operator && !calc.justPressedOp) {
    const result = compute(calc.previousValue, parseFloat(calc.currentInput), calc.operator);

    if (result.error) {
      showError(result.error);
      return;
    }

    calc.currentInput  = formatResult(result.value);
    calc.previousValue = result.value;
  } else {
    // First operator pressed
    calc.previousValue = parseFloat(calc.currentInput);
  }

  calc.operator      = internalOp;
  calc.expression    = `${formatForExpression(calc.currentInput)} ${displaySymbol}`;
  calc.justPressedOp = true;
  calc.hasDecimal    = false;
  updateDisplay();
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. CLEAR (AC) HANDLER
   Resets every piece of state back to the initial values.
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleClear()
 * Resets the calculator completely – equivalent to powering it off and on.
 */
function handleClear() {
  calc.expression     = '';
  calc.currentInput   = '0';
  calc.operator       = null;
  calc.previousValue  = null;
  calc.justCalculated = false;
  calc.justPressedOp  = false;
  calc.hasDecimal     = false;

  resultEl.classList.remove('error', 'shrink', 'shrink2');
  updateDisplay();
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. DELETE (DEL / BACKSPACE) HANDLER
   Removes the last typed character from the current input.
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleDelete()
 * Removes the rightmost character of `currentInput`.
 * If the input becomes empty, falls back to "0".
 * Also clears the `hasDecimal` flag if the decimal point was deleted.
 */
function handleDelete() {
  // Nothing to delete after a calculation or error
  if (calc.justCalculated) {
    handleClear();
    return;
  }

  if (calc.currentInput.length <= 1 || calc.currentInput === '0') {
    calc.currentInput = '0';
    calc.hasDecimal   = false;
  } else {
    const removed      = calc.currentInput.slice(-1);
    calc.currentInput  = calc.currentInput.slice(0, -1);
    if (removed === '.') calc.hasDecimal = false;
  }
  updateDisplay();
}

/* ─────────────────────────────────────────────────────────────────────────────
   8. DECIMAL POINT HANDLER
   Prevents more than one decimal point per number.
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleDecimal()
 * Appends "." to `currentInput` only if there isn't already one.
 * After an operator or result, starts a new number "0.".
 */
function handleDecimal() {
  if (calc.justCalculated || calc.justPressedOp) {
    calc.currentInput   = '0.';
    calc.hasDecimal     = true;
    calc.justCalculated = false;
    calc.justPressedOp  = false;
    updateDisplay();
    return;
  }

  if (!calc.hasDecimal) {
    calc.currentInput += '.';
    calc.hasDecimal    = true;
    updateDisplay();
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   9. PERCENTAGE HANDLER
   Converts the current input to a percentage of the previous operand
   (or simply divides by 100 when used standalone).
───────────────────────────────────────────────────────────────────────────── */
/**
 * handlePercent()
 * When used as "50 + 10 %", converts 10 to 10% of 50 (= 5) so the
 * expression evaluates to 55 – matching physical calculator behaviour.
 * When used standalone (no pending operation), divides by 100.
 */
function handlePercent() {
  if (calc.justPressedOp) return; // nothing to convert yet

  const current = parseFloat(calc.currentInput);
  if (isNaN(current)) return;

  let percentValue;
  if (calc.previousValue !== null && calc.operator) {
    // Relative percentage: 10% of previousValue
    percentValue = (current / 100) * calc.previousValue;
  } else {
    // Absolute percentage: divide by 100
    percentValue = current / 100;
  }

  calc.currentInput = formatResult(percentValue);
  calc.hasDecimal   = calc.currentInput.includes('.');
  updateDisplay();
}

/* ─────────────────────────────────────────────────────────────────────────────
   10. CALCULATE (=) HANDLER
   Performs the final computation and displays the result.
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleCalculate()
 * Triggers computation of `previousValue OPERATOR currentInput`.
 * Builds a human-readable expression string for the top display.
 * Handles errors (division by zero, invalid inputs) gracefully.
 */
function handleCalculate() {
  // Nothing to calculate if no operator has been pressed
  if (calc.operator === null || calc.previousValue === null) return;
  if (calc.justPressedOp) return; // incomplete expression

  const secondOperand = parseFloat(calc.currentInput);

  // Find the display symbol that matches the internal operator
  const displayOp = Object.keys(DISPLAY_TO_INTERNAL).find(
    k => DISPLAY_TO_INTERNAL[k] === calc.operator
  );

  // Build the full expression for the top line
  calc.expression = `${formatForExpression(calc.previousValue)} ${displayOp} ${formatForExpression(calc.currentInput)} =`;

  const result = compute(calc.previousValue, secondOperand, calc.operator);

  if (result.error) {
    showError(result.error);
    return;
  }

  calc.currentInput   = formatResult(result.value);
  calc.previousValue  = null;
  calc.operator       = null;
  calc.justCalculated = true;
  calc.justPressedOp  = false;
  calc.hasDecimal     = calc.currentInput.includes('.');

  updateDisplay();
}

/* ─────────────────────────────────────────────────────────────────────────────
   11. CORE ARITHMETIC ENGINE (no eval)
───────────────────────────────────────────────────────────────────────────── */
/**
 * compute(a, b, op)
 * @param {number} a  – left operand
 * @param {number} b  – right operand
 * @param {string} op – internal operator: '+' | '-' | '*' | '/'
 * @returns {{ value: number, error: null } | { value: null, error: string }}
 *
 * Returns an object so callers can check for errors without try/catch.
 */
function compute(a, b, op) {
  // Guard against non-numeric inputs
  if (isNaN(a) || isNaN(b)) {
    return { value: null, error: 'Invalid input' };
  }

  switch (op) {
    case '+': return { value: a + b,  error: null };
    case '-': return { value: a - b,  error: null };
    case '*': return { value: a * b,  error: null };
    case '/':
      if (b === 0) return { value: null, error: 'Cannot divide by zero' };
      return { value: a / b, error: null };
    default:
      return { value: null, error: 'Unknown operator' };
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   12. HELPER – FORMAT RESULT
   Converts a raw float to a clean string for display.
───────────────────────────────────────────────────────────────────────────── */
/**
 * formatResult(num)
 * @param {number} num
 * @returns {string}
 *
 * - Rounds to 10 significant decimal places to avoid floating-point noise
 *   (e.g. 0.1 + 0.2 → "0.3" not "0.30000000000000004").
 * - Converts very large/small numbers to exponential notation.
 */
function formatResult(num) {
  if (!isFinite(num)) return 'Error';

  // Round to suppress floating-point artefacts
  const rounded = parseFloat(num.toPrecision(10));

  // Use exponential notation for extreme values
  if (Math.abs(rounded) > 1e15 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
    return rounded.toExponential(4);
  }

  // Strip trailing zeros after the decimal
  return String(rounded);
}

/**
 * formatForExpression(val)
 * @param {number|string} val
 * @returns {string}
 * Converts a numeric value to a concise string for the expression line.
 */
function formatForExpression(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return String(val);
  if (Math.abs(n) > 1e12) return n.toExponential(2);
  return String(parseFloat(n.toPrecision(10)));
}

/* ─────────────────────────────────────────────────────────────────────────────
   13. HELPER – SHOW ERROR
   Displays an error message on the result line.
───────────────────────────────────────────────────────────────────────────── */
/**
 * showError(message)
 * @param {string} message – human-readable error text.
 * Puts the calculator in a recoverable error state; pressing AC resets it.
 */
function showError(message) {
  resultEl.textContent = message;
  resultEl.classList.add('error');
  expressionEl.textContent = calc.expression || '0';

  // Reset computation state but keep expression visible
  calc.previousValue  = null;
  calc.operator       = null;
  calc.currentInput   = '0';
  calc.justCalculated = true; // pressing a digit next will start fresh
  calc.justPressedOp  = false;
  calc.hasDecimal     = false;
}

/* ─────────────────────────────────────────────────────────────────────────────
   14. BUTTON CLICK EVENT DELEGATION
   A single listener on the button grid handles all button clicks.
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleButtonClick(event)
 * Uses event delegation: listens on the `.buttons` container and reads
 * `data-action` / `data-value` attributes from whichever button was clicked.
 */
document.querySelector('.buttons').addEventListener('click', function (event) {
  const btn = event.target.closest('.btn');
  if (!btn) return; // click landed outside any button

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  // Visual "pressed" feedback (removed after 150 ms)
  btn.classList.add('btn--pressed');
  setTimeout(() => btn.classList.remove('btn--pressed'), 150);

  switch (action) {
    case 'number':    handleNumber(value);        break;
    case 'operator':  handleOperator(value);      break;
    case 'clear':     handleClear();              break;
    case 'delete':    handleDelete();             break;
    case 'decimal':   handleDecimal();            break;
    case 'percent':   handlePercent();            break;
    case 'calculate': handleCalculate();          break;
    default:
      console.warn(`Unknown action: "${action}"`);
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   15. KEYBOARD EVENT HANDLER
   Maps physical keys to calculator actions.
───────────────────────────────────────────────────────────────────────────── */
/**
 * handleKeyboard(event)
 * @param {KeyboardEvent} event
 *
 * Supported keys:
 *  0-9        → digit input
 *  + - * /    → operator
 *  Enter / =  → calculate
 *  Backspace  → delete last character
 *  Escape     → clear all
 *  .   ,      → decimal point
 *  %          → percentage
 */
document.addEventListener('keydown', function handleKeyboard(event) {
  const key = event.key;

  // Prevent default for keys the calculator handles (avoids form submission etc.)
  const handled = [
    '0','1','2','3','4','5','6','7','8','9',
    '+','-','*','/','.', ',',
    'Enter','=','Backspace','Escape','%'
  ];
  if (handled.includes(key)) event.preventDefault();

  // Highlight the corresponding on-screen button
  highlightKey(key);

  // Route the key to the appropriate handler
  if (/^[0-9]$/.test(key)) {
    handleNumber(key);
  } else if (key === '+') {
    handleOperator('+');
  } else if (key === '-') {
    handleOperator('−');
  } else if (key === '*') {
    handleOperator('×');
  } else if (key === '/') {
    handleOperator('÷');
  } else if (key === 'Enter' || key === '=') {
    handleCalculate();
  } else if (key === 'Backspace') {
    handleDelete();
  } else if (key === 'Escape') {
    handleClear();
  } else if (key === '.' || key === ',') {
    handleDecimal();
  } else if (key === '%') {
    handlePercent();
  }
});

/**
 * highlightKey(key)
 * @param {string} key – the pressed keyboard key.
 * Briefly adds the `btn--pressed` class to the matching on-screen button
 * so the user can see which button is being activated by the keyboard.
 */
function highlightKey(key) {
  // Map keyboard key → selector for the on-screen button
  const keyMap = {
    '0': '[data-value="0"]',
    '1': '[data-value="1"]', '2': '[data-value="2"]',
    '3': '[data-value="3"]', '4': '[data-value="4"]',
    '5': '[data-value="5"]', '6': '[data-value="6"]',
    '7': '[data-value="7"]', '8': '[data-value="8"]',
    '9': '[data-value="9"]',
    '+': '[data-value="+"]',
    '-': '[data-value="−"]',
    '*': '[data-value="×"]',
    '/': '[data-value="÷"]',
    '.': '[data-action="decimal"]',
    ',': '[data-action="decimal"]',
    '%': '[data-action="percent"]',
    'Enter': '[data-action="calculate"]',
    '=':     '[data-action="calculate"]',
    'Backspace': '[data-action="delete"]',
    'Escape':    '[data-action="clear"]',
  };

  const selector = keyMap[key];
  if (!selector) return;

  const btn = document.querySelector(selector);
  if (!btn) return;

  btn.classList.add('btn--pressed');
  setTimeout(() => btn.classList.remove('btn--pressed'), 150);
}

/* ─────────────────────────────────────────────────────────────────────────────
   16. INITIALISATION
───────────────────────────────────────────────────────────────────────────── */
/**
 * init()
 * Runs once on page load.  Sets the display to its default state.
 */
function init() {
  updateDisplay();
  console.info('✅ Simple Calculator ready – CodeOrbit Tech Internship Task 3');
}

// Kick everything off
init();
