/**
 * Evaluates a number or mathematical formula
 * @param value - Number or string formula to evaluate
 * @returns The number or calculated result if valid, false otherwise
 */
export function evaluateNumberOrFormula(value: number | string): number | false {
  // If it's already a number, just check if it's finite
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : false;
  }

  // If it's a string, try to evaluate the formula
  try {
    // Remove all whitespace
    const formula = value.replace(/\s/g, '');

    // Check for invalid characters
    if (!/^[0-9+\-*/().]+$/.test(formula)) {
      return false;
    }

    // Evaluate the formula
    const result = Function(`return ${formula}`)();

    // Check if the result is a valid number
    if (!Number.isFinite(result)) {
      return false;
    }

    // Check for division by zero
    if (formula.includes('/')) {
      const parts = formula.split('/');
      for (let i = 1; i < parts.length; i++) {
        const divisor = Function(`return ${parts[i]}`)();
        if (divisor === 0) {
          return false;
        }
      }
    }

    return result;
  } catch (error) {
    return false;
  }
}
