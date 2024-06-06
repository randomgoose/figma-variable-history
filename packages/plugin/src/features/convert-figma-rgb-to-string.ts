export function convertFigmaRgbtoString(data: RGB | RGBA) {
  const a = 'a' in data ? data.a : 1;
  return `rgba(${Math.round(data.r * 255)}, ${Math.round(data.g * 255)}, ${Math.round(
    data.b * 255
  )}, ${a})`;
}
