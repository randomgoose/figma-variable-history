import { convertFigmaRGBtoHexString } from '../../../utils/color';
import { Swatch } from '../Swatch';

export function EditableCell({
  variable,
  modeId,
  onChange,
}: {
  variable: Variable;
  modeId: string;
  onChange: (value: string) => void;
}) {
  const value = variable.valuesByMode[modeId];

  switch (variable.resolvedType) {
    case 'COLOR':
      if (typeof value === 'object' && 'type' in value) {
        return <div>hi</div>;
      } else if (typeof value === 'object' && 'r' in value) {
        return (
          <div
            className="bg-[var(--figma-color-bg)] flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate"
            onClick={() => {
              // console.log('clicked');
            }}
          >
            <Swatch color={value} />
            <input
              className="w-full"
              type="text"
              value={convertFigmaRGBtoHexString({ r: value.r, g: value.g, b: value.b })}
              onChange={(e) => onChange(e.target.value)}
            />
            {'a' in value ? (
              <input
                className="ml-auto"
                type="number"
                value={Math.round(value.a * 100)}
                onChange={(e) => onChange(e.target.value)}
              />
            ) : (
              ''
            )}
          </div>
        );
      }
      break;
    case 'STRING':
      return (
        <div className="bg-[var(--figma-color-bg)] flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate">
          {variable.name}
        </div>
      );
    case 'BOOLEAN':
      return (
        <div className="bg-[var(--figma-color-bg)] flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate">
          {variable.name}
        </div>
      );
    case 'FLOAT':
      return (
        <div className="bg-[var(--figma-color-bg)] flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate">
          {variable.name}
        </div>
      );
    default:
      return (
        <div className="bg-[var(--figma-color-bg)] flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate">
          {variable.name}
        </div>
      );
  }
}
