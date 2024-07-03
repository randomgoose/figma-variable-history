import { convertRgbColorToHexColor } from '@create-figma-plugin/utilities';
import { convertFigmaRGBtoString, formatPercentage } from '../../utils/color';
import { copyText } from '../../utils/text';
import { useContext, useEffect, ReactNode } from 'react';
import { AppContext } from '../../AppContext';
import { VariablePill } from './VariablePill';
import { toast } from 'sonner';

function CopyTextWrapper({ children, text }: { children: ReactNode; text: string }) {
  return (
    <div
      className={'py-1 px-1.5 rounded-[4px] transition-all duration-200'}
      onClick={() => {
        copyText(text);
        toast(`Copied ${text}!`, { duration: 1000 });
      }}
    >
      {children}
    </div>
  );
}

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
  const { resolvedVariableValues, variableAliases } = useContext(AppContext);

  // Resolve the value if it's an alias
  useEffect(() => {
    if (typeof value === 'object' && 'type' in value) {
      parent.postMessage(
        {
          pluginMessage: { type: 'RESOLVE_VARIABLE_VALUE', payload: { variable, modeId } },
          pluginId: '*',
        },
        '*'
      );
      parent.postMessage(
        { pluginMessage: { type: 'GET_VARIABLE_BY_ID', payload: value.id }, pluginId: '*' },
        '*'
      );
      // emit<ResolveVariableValueHandler>('RESOLVE_VARIABLE_VALUE', { variable, modeId });
      // emit<GetVariableByIdHandler>('GET_VARIABLE_BY_ID', value.id);
    }
  }, [value, variable]);

  const eleVariableNotDefined = (
    <div style={{ color: 'var(--figma-color-text-secondary)' }}>Not defined</div>
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
    const resolvedValue = isAlias
      ? resolvedVariableValues[variable.id]?.valuesByMode[modeId]?.value
      : value;

    switch (variable.resolvedType) {
      case 'BOOLEAN':
        return resolvedValue === true ? (
          <VariablePill type="TRUE" value={variableAliases[(value as VariableAlias).id]} />
        ) : (
          <VariablePill type="FALSE" value={variableAliases[(value as VariableAlias).id]} />
        );
      case 'STRING':
        return (
          <VariablePill type={'STRING'} value={variableAliases[(value as VariableAlias).id]} />
        );
      case 'COLOR':
        if (typeof resolvedValue === 'object' && 'r' in resolvedValue) {
          const parsedValue =
            format === 'RGB'
              ? convertFigmaRGBtoString(resolvedValue)
              : 'a' in resolvedValue
              ? `#${convertRgbColorToHexColor(resolvedValue)} ${
                  resolvedValue.a === 1 ? '' : parseFloat(formatPercentage(resolvedValue.a)) + '%'
                }`
              : `#${convertRgbColorToHexColor(resolvedValue)}`;

          return (
            <CopyTextWrapper text={parsedValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  className={'w-4 h-4 rounded-[1px] border border-black/10 shrink-0'}
                  style={{ background: convertFigmaRGBtoString(resolvedValue) }}
                />
                <div
                  className={
                    isAlias
                      ? 'block px-[5px] py-0 rounded-[4px] bg-[color:var(--figma-color-bg-secondary) h-5 leading-4]'
                      : undefined
                  }
                  style={{ textWrap: 'nowrap' }}
                >
                  {alias || parsedValue}
                </div>
              </div>
            </CopyTextWrapper>
          );
        } else {
          return eleVariableNotDefined;
        }
      case 'FLOAT':
        return (
          <CopyTextWrapper text={resolvedValue + ''}>
            <VariablePill value={resolvedValue as any} type="FLOAT" />
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
