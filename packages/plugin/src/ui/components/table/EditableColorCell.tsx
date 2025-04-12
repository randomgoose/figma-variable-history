import { convertFigmaRGBtoHexString, convertHexColorToFigmaRGBA } from '../../../utils/color';
import { Swatch } from '../Swatch';
import { ColorPicker } from '../ColorPicker';
import { variableManager } from '../../../utils/message';
import { useState, MouseEvent, useRef, useEffect, useContext } from 'react';
import chroma from 'chroma-js';
import { AppContext } from '../../../AppContext';
import { useResolvedValue } from '../../../hooks/useResolvedValue';
import { useVariableAlias } from '../../../hooks/useVariableAlias';
import { Popover } from 'radix-ui';
import { Detach } from '../../icons/Detach';
import { ColorInput } from './ColorInput';

interface EditableColorCellProps {
  rowId: string;
  columnId: string;
  variable: Variable;
  modeId: string;
  onFocus: (id: number) => void;
  inputIndexRef: React.MutableRefObject<string | null>;
}

export function EditableColorCell({
  rowId,
  columnId,
  variable,
  modeId,
  onFocus,
  inputIndexRef,
}: EditableColorCellProps) {
  const value = variable.valuesByMode[modeId];
  const alias = useVariableAlias(typeof value === 'object' && 'id' in value ? value.id : '');

  const color = useResolvedValue({ variable, modeId });

  useEffect(() => {
    if (color) {
      setInputValue(convertFigmaRGBtoHexString(color, { uppercase: true }));
      setAlpha(typeof value === 'object' && 'a' in value ? Math.round(value.a * 100) : 100);
    }
  }, [color]);

  const [inputValue, setInputValue] = useState(
    typeof color === 'object' && 'r' in color ? convertFigmaRGBtoHexString(color) : ''
  );
  const [alpha, setAlpha] = useState(
    typeof value === 'object' && 'a' in value ? Math.round(value.a * 100) : 100
  );
  const alphaInputRef = useRef<HTMLInputElement>(null);
  const { variables } = useContext(AppContext);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, inputIndex: number) => {
    onFocus(inputIndex);
    e.target.select && e.target.select();
  };

  const handleColorInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    inputIndexRef.current = null;
    const v = e.target.value;

    // If the value is an alias, update the variable
    if (/^\{.*\}$/.test(v)) {
      const alias = variables.find((_v) => v.replaceAll('{', '').replaceAll('}', '') === _v.name);

      if (alias) {
        variableManager.updateVariable(variable.id, {
          valuesByMode: { [modeId]: { type: 'VARIABLE_ALIAS', id: alias.id } },
        });
      }
    }
    // If the value is a valid color, update the variable
    else if (chroma.valid(v)) {
      const { r, g, b } = convertHexColorToFigmaRGBA(chroma(v).hex());
      if (typeof value === 'object' && 'a' in value) {
        const a = value.a ? value.a : 1;

        variableManager.updateVariable(variable.id, { valuesByMode: { [modeId]: { r, g, b, a } } });
      }
    } else {
      // If the value is not a valid color, reset the input value
      if (color) setInputValue(convertFigmaRGBtoHexString(color));
    }
  };

  const handleAlphaInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();

    const v = e.target.value;

    if (typeof value === 'object') {
      if ('a' in value) {
        const a = Number(v) / 100;

        variableManager.updateVariable(variable.id, {
          valuesByMode: { [modeId]: { ...value, a: a > 1 ? 1 : a < 0 ? 0 : a } },
        });
      } else if (typeof value === 'string') {
        variableManager.updateVariable(variable.id, { valuesByMode: { [modeId]: v } });
      }
    }
    // onFocus();
  };

  if (typeof value === 'object' && 'type' in value) {
    return (
      <div className="pl-4 pr-1 flex gap-2 items-center group">
        <Popover.Root>
          <Popover.Trigger asChild>
            <Swatch color={color} />
          </Popover.Trigger>
          <Popover.Content>
            <p>Hello</p>
          </Popover.Content>
        </Popover.Root>
        <button
          tabIndex={0}
          className="alias"
          onFocus={(e) => {
            e.stopPropagation();
            onFocus(0);
          }}
          autoFocus={inputIndexRef.current === `${rowId}-${columnId}-0`}
        >
          {alias}
        </button>
        <button
          className="btn-icon ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100"
          onPointerDown={() => {
            variableManager.detachAlias(variable.id, modeId);
          }}
        >
          <Detach />
        </button>
      </div>
    );
  } else if (typeof value === 'object' && 'r' in value) {
    return (
      <div className="flex items-center gap-2 pl-4 pr-2 h-full group min-w-[200px] truncate">
        <ColorPicker
          defaultColor={color}
          onChange={(color) => {
            if (typeof color === 'object' && 'type' in color) {
              variableManager.updateVariable(variable.id, { valuesByMode: { [modeId]: color } });
            } else {
              setInputValue(convertFigmaRGBtoHexString(color));
              variableManager.updateVariable(variable.id, { valuesByMode: { [modeId]: color } });
            }
          }}
          onFocus={(e) => handleFocus(e, 0)}
          autoFocus={inputIndexRef.current === `${rowId}-${columnId}-0`}
        >
          <Swatch color={color} />
        </ColorPicker>
        <ColorInput
          autoFocus={inputIndexRef.current === `${rowId}-${columnId}-1`}
          id={`${rowId}-${columnId}-1`}
          value={inputValue}
          onChange={setInputValue}
          onFocus={(e) => handleFocus(e, 1)}
          onBlur={handleColorInputBlur}
        />
        <div className="flex items-center cursor-ew-resize active:cursor-ew">
          <input
            tabIndex={0}
            ref={alphaInputRef}
            className="w-[38px] h-6 bg-transparent ml-auto border-l px-2"
            type="number"
            value={alpha}
            onFocus={(e) => handleFocus(e, 2)}
            onChange={(e) => setAlpha(Number(e.target.value))}
            autoFocus={inputIndexRef.current === `${rowId}-${columnId}-2`}
            onBlur={handleAlphaInputBlur}
          />

          <div
            className="text-[11px] text-[var(--figma-color-text-secondary)]"
            onMouseDown={(e) => {
              e.preventDefault();

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
              };

              document.addEventListener('mousemove', handleMouseMove as any);
              document.addEventListener('mouseup', handleMouseUp as any);
            }}
          >
            %
          </div>
        </div>
      </div>
    );
  }
}
