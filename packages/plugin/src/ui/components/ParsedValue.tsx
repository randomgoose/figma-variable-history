import {
  convertFigmaRGBtoHSLString,
  convertFigmaRGBtoString,
  convertRgbColorToHexColor,
  formatPercentage,
} from '../../utils/color';
import { useContext, useEffect } from 'react';
import { AppContext } from '../../AppContext';
import { VariablePill } from './VariablePill';
import clsx from 'clsx';
import { parsedValue } from '../styles.module.css';
import { CopyTextWrapper } from './CopyWrapper';
import { sendMessage } from '../../utils/message';
import { Swatch } from './Swatch';

export function ParsedValue({
  variable,
  modeId,
  option = { format: 'HEX', showLabel: true, allowCopy: true },
}: {
  variable: Variable;
  modeId: string;
  option?: {
    format?: 'RGB' | 'HEX' | 'HSL';
    showLabel?: boolean;
    allowCopy?: boolean;
  };
}) {
  const value = variable.valuesByMode[modeId];
  const { resolvedVariableValues, variableAliases } = useContext(AppContext);

  // Resolve the value if it's an alias
  useEffect(() => {
    if (typeof value === 'object' && 'type' in value) {
      if (!resolvedVariableValues[value.id]) {
        sendMessage('RESOLVE_VARIABLE_VALUE', { id: value.id, modeId });
      }

      if (value.id && !variableAliases[value.id]) {
        sendMessage('GET_VARIABLE_BY_ID', value.id);
      }
    }
  }, [value, variable]);

  const eleVariableNotDefined = (
    <div className="px-1.5" style={{ color: 'var(--figma-color-text-secondary)' }}>
      Not defined
    </div>
  );

  const eleBooleanTrue = (
    <CopyTextWrapper text="True">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          className={
            'w-6 h-3 p-px rounded-full flex justify-start bg-[color:var(--figma-color-bg-brand)]'
          }
        >
          <div className={'w-2.5 h-2.5 rounded-full bg-white'} />
        </div>
        True
      </div>
    </CopyTextWrapper>
  );

  const eleBooleanFalse = (
    <CopyTextWrapper text="False">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          className={
            'w-6 h-3 p-px rounded-full flex justify-start bg-[color:var(--figma-color-bg-disabled-secondary)]'
          }
        >
          <div className={'w-2.5 h-2.5 rounded-full bg-white'} />
        </div>
        False
      </div>
    </CopyTextWrapper>
  );

  if (value === null || value === undefined) {
    return eleVariableNotDefined;
  }

  // If the value is an object, it means it's an alias.
  if (value && typeof value === 'object') {
    const isAlias = 'id' in value;
    const alias = isAlias ? variableAliases[value.id] : '';
    let resolvedValue;

    if (isAlias) {
      resolvedValue =
        resolvedVariableValues[value.id]?.valuesByMode[modeId]?.value ||
        resolvedVariableValues[value.id]?.valuesByMode?.[
          Object.keys(resolvedVariableValues?.[value.id]?.valuesByMode)?.[0]
        ]?.value;
    } else {
      resolvedValue = value;
    }

    switch (variable.resolvedType) {
      case 'BOOLEAN':
        return resolvedValue === true ? (
          <CopyTextWrapper text={isAlias ? alias : parsedValue}>
            <VariablePill type="TRUE" value={alias} />
          </CopyTextWrapper>
        ) : (
          <CopyTextWrapper text={isAlias ? alias : parsedValue}>
            <VariablePill type="FALSE" value={alias} />
          </CopyTextWrapper>
        );
      case 'STRING':
        return (
          <CopyTextWrapper text={isAlias ? alias : parsedValue}>
            <VariablePill type={'STRING'} value={alias} />
          </CopyTextWrapper>
        );
      case 'COLOR':
        if (typeof resolvedValue === 'object' && 'r' in resolvedValue) {
          let parsedValue = '';

          switch (option?.format) {
            case 'RGB':
              parsedValue = convertFigmaRGBtoString(resolvedValue);
              break;
            case 'HEX':
              parsedValue =
                'a' in resolvedValue
                  ? `${convertRgbColorToHexColor(resolvedValue)} ${
                      resolvedValue.a === 1
                        ? ''
                        : parseFloat(formatPercentage(resolvedValue.a)) + '%'
                    }`
                  : `${convertRgbColorToHexColor(resolvedValue)}`;
              break;
            case 'HSL':
              parsedValue = convertFigmaRGBtoHSLString(resolvedValue);
              break;
          }

          return (
            <CopyTextWrapper text={isAlias ? alias : parsedValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Swatch color={resolvedValue} />
                {option?.showLabel ? (
                  <div
                    className={clsx(
                      'max-w-full truncate',
                      isAlias
                        ? 'hover:max-w-fit px-[5px] py-0 rounded-[4px] bg-[color:var(--figma-color-bg-secondary)] border border-[color:var(--figma-color-border)] h-5 leading-4'
                        : undefined
                    )}
                  >
                    {alias || parsedValue}
                  </div>
                ) : null}
              </div>
            </CopyTextWrapper>
          );
        } else {
          return (
            <CopyTextWrapper text={isAlias ? alias : parsedValue}>
              <div
                className={clsx(
                  'max-w-full truncate',
                  isAlias
                    ? 'hover:max-w-fit px-[5px] py-0 rounded-[4px] bg-[color:var(--figma-color-bg-secondary)] border border-[color:var(--figma-color-border)] h-5 leading-4'
                    : undefined
                )}
              >
                {alias || parsedValue}
              </div>
            </CopyTextWrapper>
          );
        }
      case 'FLOAT':
        return (
          <CopyTextWrapper allowCopy={option.allowCopy} text={resolvedValue + ''}>
            <VariablePill value={alias} type="FLOAT" />
          </CopyTextWrapper>
        );
      default:
        return null;
    }
  } else {
    switch (variable.resolvedType) {
      case 'BOOLEAN':
        return value === true ? eleBooleanTrue : eleBooleanFalse;
      default:
        const valueStr = `${value}`;
        return <CopyTextWrapper text={valueStr}>{valueStr}</CopyTextWrapper>;
    }
  }
}
