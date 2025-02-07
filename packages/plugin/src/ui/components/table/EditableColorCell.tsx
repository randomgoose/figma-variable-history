import { convertFigmaRGBtoHexString, convertHexColorToFigmaRGBA } from '../../../utils/color';
import { Swatch } from '../Swatch';
import { ColorPicker } from '../panels/ColorPicker';
import { variableManager } from '../../../utils/message';
import { useState, MouseEvent, useRef } from 'react';
import chroma from 'chroma-js';

export function EditableColorCell({
  variable,
  modeId,
  onInputFocus,
  onInputBlur,
}: {
  variable: Variable;
  modeId: string;
  onInputFocus: () => void;
  onInputBlur: () => void;
}) {
  const value = variable.valuesByMode[modeId];
  const colorInputRef = useRef<HTMLInputElement>(null);
  const alphaInputRef = useRef<HTMLInputElement>(null);

  const handleColorInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const v = e.target.value;

    if (typeof value === 'object' && 'a' in value) {
      if (chroma.valid(v)) {
        const { r, g, b } = convertHexColorToFigmaRGBA(chroma(v).hex());
        const a = value.a ? value.a : 1;

        variableManager.updateVariable(variable.id, { valuesByMode: { [modeId]: { r, g, b, a } } });
      } else {
      }
    }

    // console.log()
    onInputBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      colorInputRef.current?.blur();
    }
  };

  const [rgb] = useState(
    typeof value === 'object' && 'r' in value
      ? { r: value.r, g: value.g, b: value.b, a: 'a' in value ? value.a : 1 }
      : { r: 0, g: 0, b: 0, a: 1 }
  );
  const [alpha, setAlpha] = useState(
    typeof value === 'object' && 'a' in value ? Math.round(value.a * 100) : 100
  );

  if (typeof value === 'object' && 'type' in value) {
    return <div>Alias</div>;
  } else if (typeof value === 'object' && 'r' in value) {
    return (
      <div
        className="flex items-center gap-2 pl-4 pr-2 h-full group w-[200px] truncate"
        onKeyDown={(e) => e.stopPropagation()}
        onClick={() => {
          // console.log('clicked');
        }}
      >
        <ColorPicker>
          <Swatch color={rgb} />
        </ColorPicker>
        <input
          ref={colorInputRef}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            colorInputRef.current?.select();
            onInputFocus();
          }}
          className="w-full h-full font-medium text-[11px] bg-transparent uppercase"
          onBlur={handleColorInputBlur}
          defaultValue={convertFigmaRGBtoHexString(rgb, { hashtag: false, alpha: false })}
        />
        {'a' in value ? (
          <div className="flex items-center cursor-ew-resize active:cursor-ew">
            <input
              className="w-[38px] h-6 bg-transparent ml-auto border-l px-2"
              type="number"
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              onFocus={() => {
                alphaInputRef.current?.select();
                onInputFocus();
              }}
            />

            <div
              className="text-[11px] text-[var(--figma-color-text-secondary)]"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();

                const startX = e.clientX;
                let dx = 0;
                let _alpha = alpha;

                const handleMouseMove = (e: MouseEvent) => {
                  dx = e.clientX - startX;
                  const tempAlpha = alpha + Math.round((dx / 100) * 100);
                  _alpha = tempAlpha;
                  setAlpha(tempAlpha > 100 ? 100 : tempAlpha < 0 ? 0 : tempAlpha);
                };

                const handleMouseUp = () => {
                  const newAlpha = _alpha / 100;
                  variableManager.updateVariable(variable.id, {
                    valuesByMode: {
                      [modeId]: { ...value, a: newAlpha > 1 ? 1 : newAlpha < 0 ? 0 : newAlpha },
                    },
                  });

                  document.removeEventListener('mousemove', handleMouseMove as any);
                  document.removeEventListener('mouseup', handleMouseUp as any);
                  // console.log(newAlpha)
                  // onChange(newAlpha)
                };

                document.addEventListener('mousemove', handleMouseMove as any);
                document.addEventListener('mouseup', handleMouseUp as any);
              }}
            >
              %
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
