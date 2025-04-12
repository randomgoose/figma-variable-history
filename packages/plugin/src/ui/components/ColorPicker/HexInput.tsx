import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react';
import { convertFigmaRGBtoHexString, convertHexColorToFigmaRGBA } from '../../../utils/color';

interface HexInputRefs {
  hexInput: HTMLInputElement | null;
  alphaInput: HTMLInputElement | null;
}

export const HexInput = forwardRef(
  (
    { color, onChange }: { color: RGB | RGBA; onChange: (color: RGB | RGBA) => void },
    ref: ForwardedRef<HexInputRefs>
  ) => {
    const hexInputRef = useRef<HTMLInputElement>(null);
    const alphaInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      hexInput: hexInputRef.current,
      alphaInput: alphaInputRef.current,
    }));

    const hex = convertFigmaRGBtoHexString(color, { uppercase: true });
    const alpha = 'a' in color ? Math.round(color.a * 100) : 100;

    return (
      <div className="flex relative min-w-0 h-6 rounded-[5px] border border-transparent bg-[var(--figma-color-bg-secondary)] hover:border-[var(--figma-color-border)]">
        <input
          ref={hexInputRef}
          autoFocus
          type="text"
          className="focus:outline-none bg-transparent cursor-default border-r rounded-r-none min-w-0 flex-1 px-2 text-[11px]"
          defaultValue={hex}
          onBlur={(e) => {
            const { r, g, b } = convertHexColorToFigmaRGBA(e.target.value);
            const a = alphaInputRef.current?.value ? parseInt(alphaInputRef.current.value) : 100;
            onChange({ r, g, b, a: a / 100 });
          }}
          onFocus={(e) => e.target.select()}
        />
        <input
          ref={alphaInputRef}
          type="text"
          className="focus:outline-none bg-transparent cursor-default w-[54px] text-[11px] px-2"
          onBlur={(e) => {
            const { r, g, b } = hexInputRef.current?.value
              ? convertHexColorToFigmaRGBA(hexInputRef.current?.value)
              : { r: 0, g: 0, b: 0 };
            const a = parseInt(e.target.value);
            onChange({ r, g, b, a: a / 100 });
          }}
          defaultValue={alpha}
        />
        <span className="text-[11px] text-[var(--figma-color-text-secondary)] absolute right-1 top-0 bottom-0 flex items-center">
          %
        </span>
      </div>
    );
  }
);

HexInput.displayName = 'HexInput';
