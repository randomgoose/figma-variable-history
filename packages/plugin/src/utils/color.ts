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
 * Convert Figma RGB color to CSS HSL
 */

export function convertFigmaRGBtoHSLString(data: RGB | RGBA) {
  // Convert Figma RGB values (0-1) to HSL
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = Math.round((h || 0) * 60);
    }
    l = Math.round(l * 100);
    s = Math.round(s * 100);
    return [h, s, l];
  };

  const [h, s, l] = rgbToHsl(data.r * 255, data.g * 255, data.b * 255);
  const hsl = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;

  // If alpha is present and not 1, use hsla
  if ('a' in data && data.a !== 1) {
    return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${data.a.toFixed(2)})`;
  }

  return hsl;
}

/**
 * Convert Figma RGB color to Hex
 */

export function convertFigmaRGBtoHexString(data: RGB | RGBA) {
  // Convert Figma RGB values (0-1) to hex (00-FF)
  const toHex = (value: number): string => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const r = toHex(data.r);
  const g = toHex(data.g);
  const b = toHex(data.b);

  // If alpha is present and not 1, include it in the hex string
  if ('a' in data && data.a !== 1) {
    const a = toHex(data.a);
    return `#${r}${g}${b}${a}`;
  }

  return `#${r}${g}${b}`;
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
