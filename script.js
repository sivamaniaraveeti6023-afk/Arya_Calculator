const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

const state = {
  expression: '',
  lastResult: '0',
  justEvaluated: false,
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const rounded = Number(value.toFixed(10));
  return String(rounded);
}

function tokenize(expression) {
  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\d/.test(char) || char === '.') {
      let number = '';
      let sawDecimal = false;

      while (index < expression.length && /[\d.]/.test(expression[index])) {
        if (expression[index] === '.') {
          if (sawDecimal) {
            throw new Error('Invalid number');
          }
          sawDecimal = true;
        }
        number += expression[index];
        index += 1;
      }

      if (number === '.' || number === '') {
        throw new Error('Invalid number');
      }

      tokens.push(Number(number));
      continue;
    }

    if ('+-*/'.includes(char)) {
      const lastToken = tokens[tokens.length - 1];
      const previousChar = expression[index - 1];
      const isUnaryMinus =
        char === '-' &&
        (tokens.length === 0 || typeof lastToken === 'string' || previousChar === undefined || /[+\-*/]/.test(previousChar));

      if (isUnaryMinus) {
        tokens.push('u-');
        index += 1;
        continue;
      }

      if (tokens.length === 0 || typeof lastToken === 'string') {
        throw new Error('Invalid expression');
      }

      tokens.push(char);
      index += 1;
      continue;
    }

    throw new Error('Invalid input');
  }

  if (tokens.length === 0) {
    throw new Error('Empty expression');
  }

  if (typeof tokens[tokens.length - 1] === 'string') {
    throw new Error('Expression ends with operator');
  }

  return tokens;
}

function precedence(operator) {
  if (operator === 'u-') return 3;
  if (operator === '*' || operator === '/') return 2;
  if (operator === '+' || operator === '-') return 1;
  return 0;
}

function isRightAssociative(operator) {
  return operator === 'u-';
}

function toPostfix(tokens) {
  const output = [];
  const operators = [];

  tokens.forEach((token) => {
    if (typeof token === 'number') {
      output.push(token);
      return;
    }

    while (
      operators.length &&
      typeof operators[operators.length - 1] === 'string' &&
      (precedence(operators[operators.length - 1]) > precedence(token) ||
        (precedence(operators[operators.length - 1]) === precedence(token) &&
          !isRightAssociative(token)))
    ) {
      output.push(operators.pop());
    }

    operators.push(token);
  });

  while (operators.length) {
    output.push(operators.pop());
  }

  return output;
}

function calculateExpression(expression) {
  const tokens = tokenize(expression);
  const postfix = toPostfix(tokens);
  const stack = [];

  postfix.forEach((token) => {
    if (typeof token === 'number') {
      stack.push(token);
      return;
    }

    if (token === 'u-') {
      const operand = stack.pop();
      if (operand === undefined) {
        throw new Error('Invalid expression');
      }
      stack.push(-operand);
      return;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (left === undefined || right === undefined) {
      throw new Error('Invalid expression');
    }

    switch (token) {
      case '+':
        stack.push(left + right);
        break;
      case '-':
        stack.push(left - right);
        break;
      case '*':
        stack.push(left * right);
        break;
      case '/':
        if (right === 0) {
          throw new Error('Division by zero');
        }
        stack.push(left / right);
        break;
      default:
        throw new Error('Unsupported operator');
    }
  });

  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }

  const result = stack[0];

  if (!Number.isFinite(result)) {
    throw new Error('Invalid result');
  }

  return result;
}

function updateDisplay() {
  expressionDisplay.textContent = state.expression || '0';

  if (!state.expression) {
    resultDisplay.textContent = '0';
    return;
  }

  const hasTrailingOperator = /[+\-*/]$/.test(state.expression);

  if (hasTrailingOperator) {
    resultDisplay.textContent = state.lastResult || '0';
    return;
  }

  try {
    const value = calculateExpression(state.expression);
    state.lastResult = formatNumber(value);
    resultDisplay.textContent = state.lastResult;
  } catch (error) {
    resultDisplay.textContent = 'Error';
  }
}

function handleDigit(value) {
  if (state.justEvaluated && /\d/.test(value)) {
    state.expression = '';
    state.justEvaluated = false;
  }

  if (state.justEvaluated && value === '.') {
    state.expression = '0';
    state.justEvaluated = false;
  }

  if (value === '0' && state.expression === '0') {
    return;
  }

  if (value === '.') {
    const currentChunk = state.expression.split(/[+\-*/]/).pop();
    if (currentChunk && currentChunk.includes('.')) {
      return;
    }

    if (!state.expression || /[+\-*/]$/.test(state.expression)) {
      state.expression += '0.';
      updateDisplay();
      return;
    }
  }

  state.expression += value;
  updateDisplay();
}

function handleOperator(value) {
  if (state.justEvaluated) {
    state.expression = state.lastResult;
    state.justEvaluated = false;
  }

  if (!state.expression && value !== '-') {
    return;
  }

  const lastChar = state.expression.slice(-1);

  if (/[+\-*/]/.test(lastChar)) {
    if (value === '-' && lastChar !== '-') {
      state.expression += '-';
      updateDisplay();
      return;
    }

    state.expression = state.expression.slice(0, -1) + value;
    updateDisplay();
    return;
  }

  state.expression += value;
  updateDisplay();
}

function clearCalculator() {
  state.expression = '';
  state.lastResult = '0';
  state.justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  if (!state.expression) {
    return;
  }

  state.expression = state.expression.slice(0, -1);
  state.justEvaluated = false;
  updateDisplay();
}

function evaluateExpression() {
  if (!state.expression) {
    resultDisplay.textContent = '0';
    return;
  }

  try {
    const finalValue = calculateExpression(state.expression);
    const formatted = formatNumber(finalValue);
    state.lastResult = formatted;
    state.justEvaluated = true;
    resultDisplay.textContent = formatted;
  } catch (error) {
    state.justEvaluated = false;
    resultDisplay.textContent = 'Error';
  }
}

function handleButtonPress(button) {
  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action === 'clear') {
    clearCalculator();
    return;
  }

  if (action === 'delete') {
    deleteLast();
    return;
  }

  if (action === 'equals') {
    evaluateExpression();
    return;
  }

  if (value === '.') {
    handleDigit(value);
    return;
  }

  if (/\d/.test(value)) {
    handleDigit(value);
    return;
  }

  if ('+-*/'.includes(value)) {
    handleOperator(value);
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 120);
    handleButtonPress(button);
  });
});

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/\d/.test(key)) {
    event.preventDefault();
    handleDigit(key);
    return;
  }

  if (key === '.') {
    event.preventDefault();
    handleDigit('.');
    return;
  }

  if ('+-*/'.includes(key)) {
    event.preventDefault();
    handleOperator(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateExpression();
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    deleteLast();
    return;
  }

  if (key === 'Escape') {
    event.preventDefault();
    clearCalculator();
  }
});

updateDisplay();
