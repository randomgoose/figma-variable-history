import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { MESSAGE_TYPE } from '../utils/message';
import { sendMessage } from '../utils/message';

export const useVariableManager = () => {
  const { invalidateResolvedVariableValue } = useContext(AppContext);

  return {
    createVariable: (collectionId: string, type: VariableResolvedDataType) => {
      sendMessage(MESSAGE_TYPE.CREATE_VARIABLE, {
        collectionId,
        type,
      });
    },

    updateVariable: (variableId: string, partialVariable: Partial<Variable>) => {
      sendMessage(MESSAGE_TYPE.SET_VARIABLE, {
        id: variableId,
        update: partialVariable,
      });

      if (partialVariable.valuesByMode) {
        Object.entries(partialVariable.valuesByMode).forEach(([modeId, value]) => {
          if (typeof value === 'object' && 'type' in value) {
            invalidateResolvedVariableValue(variableId, modeId);
          }
        });
      }
    },

    detachAlias: (variableId: string, modeId: string) => {
      sendMessage(MESSAGE_TYPE.DETACH_ALIAS, {
        id: variableId,
        modeId,
      });
    },

    createVariableCollection: () => {
      sendMessage(MESSAGE_TYPE.CREATE_VARIABLE_COLLECTION);
    },

    renameVariableCollection: (collectionId: string, name: string) => {
      sendMessage(MESSAGE_TYPE.RENAME_VARIABLE_COLLECTION, {
        id: collectionId,
        name,
      });
    },

    deleteVariableCollection: (collectionId: string) => {
      sendMessage(MESSAGE_TYPE.DELETE_VARIABLE_COLLECTION, {
        id: collectionId,
      });
    },

    addMode: (collectionId: string, name: string) => {
      sendMessage(MESSAGE_TYPE.ADD_MODE, {
        collectionId,
        name,
      });
    },

    duplicateVariables: (variableIds: string[]) => {
      sendMessage(MESSAGE_TYPE.DUPLICATE_VARIABLES, variableIds);
    },

    deleteVariables: (variableIds: string[]) => {
      sendMessage(MESSAGE_TYPE.DELETE_VARIABLES, variableIds);
    },

    renameMode: (collectionId: string, modeId: string, name: string) => {
      sendMessage(MESSAGE_TYPE.RENAME_MODE, {
        collectionId,
        modeId,
        name,
      });
    },
  };
};
