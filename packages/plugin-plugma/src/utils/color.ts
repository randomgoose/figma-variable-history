/**
 * Convert Figma RGB color to CSS RGB
 */
export function convertFigmaRGBtoString(data: RGB | RGBA) {
  const hasAlpha = 'a' in data;
  const alpha = hasAlpha ? data.a : 1;
  const array: Array<string | number> = [data.r, data.g, data.b].map((v) => Math.round(v * 255));
  if (hasAlpha) array.push(`${(alpha * 100).toFixed(0)}%`);
  return `rgb${hasAlpha ? 'a' : ''}(${array.join(', ')})`;
}

/**
 * Convert Figma alpha to percentage
 */

export function formatPercentage(num: number) {
  if (num < 0 || num > 1) {
    throw new Error('Input must be between 0 and 1');
  }

  let percentage = (num * 100).toFixed(2);

  // Remove unnecessary zeros
  if (percentage.endsWith('.00')) {
    percentage = percentage.slice(0, -3) + '%';
  } else {
    percentage = percentage + '%';
  }

  return percentage;
}
