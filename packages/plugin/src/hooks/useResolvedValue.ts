import { useContext, useMemo } from 'react';
import { AppContext } from '../AppContext';

export function useResolvedValue({ variable, modeId }: { variable: Variable; modeId?: string }) {
  const { resolvedVariableValues, collections } = useContext(AppContext);

  const mode = useMemo(() => {
    if (modeId) {
      return modeId;
    } else {
      const collection = collections.find(
        (collection) => collection.id === variable.variableCollectionId
      );
      return collection?.defaultModeId || Object.keys(variable.valuesByMode)[0];
    }
  }, [variable, modeId]);

  const value = variable.valuesByMode[mode];

  switch (variable.resolvedType) {
    case 'COLOR':
      if (typeof value === 'object') {
        if ('r' in value) {
          if ('a' in value) {
            return value;
          } else {
            return value;
          }
        } else {
          if (variable.name === 'Color 1') {
            // console.log(variable.name, resolvedVariableValues[variable.id]?.valuesByMode[mode]);
          }

          return resolvedVariableValues[variable.id]?.valuesByMode[mode]?.value;
        }
      } else {
        return variable.valuesByMode[mode];
      }
    case 'STRING':
      if (typeof variable.valuesByMode[mode] === 'string') {
        return variable.valuesByMode[mode];
      } else {
        return resolvedVariableValues[variable.id];
      }
    case 'BOOLEAN':
      if (typeof variable.valuesByMode[mode] === 'boolean') {
        return variable.valuesByMode[mode];
      } else {
        return resolvedVariableValues[variable.id];
      }
    case 'FLOAT':
      if (typeof variable.valuesByMode[mode] === 'number') {
        return variable.valuesByMode[mode];
      } else {
        return resolvedVariableValues[variable.id];
      }
    default:
      return null;
  }
}
