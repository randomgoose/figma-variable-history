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
