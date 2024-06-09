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

  const eleVariableNotDefined = (
    <div style={{ color: 'var(--figma-color-text-secondary)' }}>Not defined</div>
  );

  if (value === null || value === undefined) {
    return eleVariableNotDefined;
  }

  if (value && typeof value === 'object') {
    const isAlias = 'type' in value;
    const alias = isAlias ? variableAliases[value.id] : '';
    const resolvedValue = isAlias
      ? resolvedVariableValues[variable.id]?.valuesByMode[modeId].value
      : value;

    if (typeof resolvedValue === 'object' && 'r' in resolvedValue) {
      const parsedValue =
        format === 'RGB'
          ? convertFigmaRGBtoString(resolvedValue)
          : `#${convertRgbColorToHexColor(resolvedValue)}`;

      return (
        <div
          className={styles.parsedValue}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => copyText(parsedValue)}
        >
          <div className={styles.swatch} style={{ background: parsedValue }} />
          <span className={isAlias ? styles.variable__pill : undefined}>
            {alias || parsedValue}
          </span>
        </div>
      );
    } else {
      return eleVariableNotDefined;
    }
  } else {
    const valueStr = `${value}`;
    return <div onClick={() => copyText(valueStr)}>{valueStr}</div>;
  }
}
