import styles from '../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { convertRgbColorToHexColor, emit } from '@create-figma-plugin/utilities';
import { convertFigmaRGBtoString, copyText } from '../features';
import { useEffect } from 'preact/hooks';
import { GetVariableByIdHander, ResolveVariableValueHandler } from '../types';
import { useAppStore } from '../store';

export function ParsedValue({
  variable,
  modeId,
  format,
}: {
  variable: Variable;
  modeId: string;
  variables: Variable[];
  format?: 'RGB' | 'HEX';
}) {
  const value = variable.valuesByMode[modeId];
  const { resolvedVariableValues, variableAliases } = useAppStore();

  useEffect(() => {
    if (typeof value === 'object' && 'type' in value) {
      emit<ResolveVariableValueHandler>('RESOLVE_VARIABLE_VALUE', { variable, modeId });
      emit<GetVariableByIdHander>('GET_VARIABLE_BY_ID', value.id);
    }
  }, [value, variable]);

  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
      const valueStr = `${value}`;
      return <div onClick={() => copyText(valueStr)}>{valueStr}</div>;

    case 'undefined':
      return <div style={{ color: 'var(--figma-color-text-secondary)' }}>Not defined</div>;

    case 'object':
      if ('type' in value) {
        const alias = variableAliases[value.id];
        const resolvedValue = resolvedVariableValues[variable.id]?.valuesByMode[modeId].value;

        if (alias) {
          switch (typeof resolvedValue) {
            case 'object':
              if ('r' in resolvedValue) {
                const { r, g, b } = resolvedValue;

                let a = 1;

                if ('a' in resolvedValue) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  a = resolvedValue.a;
                }
                return (
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    className={styles.parsedValue}
                  >
                    <div
                      className={styles.swatch}
                      style={{ background: convertFigmaRGBtoString({ r, g, b }) }}
                    />
                    <div className={styles.variable__pill}>{alias}</div>
                  </div>
                );
              } else {
                return null;
              }
          }
        } else {
          return <div>undefined</div>;
        }
      } else {
        const parsedValue =
          format === 'RGB'
            ? convertFigmaRGBtoString(value)
            : convertRgbColorToHexColor(value) || '';

        return (
          <div
            className={styles.parsedValue}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => copyText(parsedValue)}
          >
            <div className={styles.swatch} style={{ background: parsedValue }} />
            {parsedValue}
          </div>
        );
      }
      break;

    default:
      return <div>{String(value)}</div>;
  }
}
