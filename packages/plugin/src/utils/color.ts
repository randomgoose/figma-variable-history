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

export function convertFigmaRGBtoHexString(
  data: RGB | RGBA,
  options?: { hashtag?: boolean; alpha?: boolean }
) {
  // Convert Figma RGB values (0-1) to hex (00-FF)
  const toHex = (value: number): string => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const r = toHex(data.r);
  const g = toHex(data.g);
  const b = toHex(data.b);

  // If alpha is present and not 1, include it in the hex string
  if (options?.alpha && 'a' in data && data.a !== 1) {
    const a = toHex(data.a);
    return `#${r}${g}${b}${a}`;
  }

  return options?.hashtag ? `#${r}${g}${b}` : `${r}${g}${b}`;
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

export function convertHexColorToFigmaRGBA(hex: string) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values based on string length
  let r,
    g,
    b,
    a = 1;

  if (hex.length === 8) {
    // #RRGGBBAA
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
    a = parseInt(hex.slice(6, 8), 16) / 255;
  } else if (hex.length === 6) {
    // #RRGGBB
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
  } else if (hex.length === 4) {
    // #RGBA
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
    a = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 3) {
    // #RGB
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else {
    throw new Error('Invalid hex color format');
  }

  return { r, g, b, a };
}

export function convertRgbColorToHexColor(rgbColor: RGB): null | string {
  // Helper function to convert a single RGB value to hex
  const toHex = (value: number): string => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Convert each RGB component to hex
  const r = toHex(rgbColor.r);
  const g = toHex(rgbColor.g);
  const b = toHex(rgbColor.b);

  return `#${r}${g}${b}`;
}
