import { forwardRef } from 'react';
import transparent from '../assets/transparent.svg';

export const Swatch = forwardRef(
  (
    {
      color = { r: 0, g: 0, b: 0, a: 1 },
      className,
      children,
      onFocus,
      autoFocus,
      tabIndex,
    }: {
      color: RGBA | RGB;
      className?: string;
      children?: React.ReactNode;
      onFocus?: () => void;
      autoFocus?: boolean;
      tabIndex?: number;
    },
    ref
  ) => {
    return (
      <div
        tabIndex={tabIndex}
        autoFocus={autoFocus}
        onFocus={onFocus}
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`relative w-4 h-4 rounded-[20%] border border-black/10 shrink-0 flex items-center justify-end overflow-hidden ${className}`}
        style={{ background: `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255})` }}
      >
        {children}
        <div
          className="w-1/2 h-full z-0"
          style={{
            backgroundImage: `url(${transparent})`,
            backgroundSize: 'auto',
            opacity: 'a' in color ? 1 - color.a : 0,
          }}
        />
      </div>
    );
  }
);

Swatch.displayName = 'Swatch';
