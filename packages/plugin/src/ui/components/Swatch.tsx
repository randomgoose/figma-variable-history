export function Swatch({ color }: { color: RGBA | RGB }) {
  return (
    <div
      className="w-4 h-4 rounded-[20%] border border-black/10 shrink-0 flex items-center"
      style={{
        background: `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${
          'a' in color ? color.a : 1
        })`,
      }}
    />
  );
}
