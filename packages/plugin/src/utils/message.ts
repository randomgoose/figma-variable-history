export enum MESSAGE_TYPE {
  COMMIT = 'COMMIT',
  REVERT_VARIABLE_VALUE = 'REVERT_VARIABLE_VALUE', // aka. Discard changes. Revert variable value to the original value
  REVERT_ALL_VARIABLE_CHANGES = 'REVERT_ALL_VARIABLE_CHANGES',
  UPDATE_VARIABLE_VALUE = 'UPDATE_VARIABLE_VALUE',
  SET_VARIABLE = 'SET_VARIABLE',
  AUTOCOMPLETE_CODE_SYNTAX = 'AUTOCOMPLETE_CODE_SYNTAX',
  VARIABLE_ALIAS_RESOLVED = 'VARIABLE_ALIAS_RESOLVED',
  UPDATE_VARIABLE_GROUP = 'UPDATE_VARIABLE_GROUP', // Update variable group name, used when renaming a variable group from the sidebar
  CONVERT_VARIABLES_TO_CSS_DONE = 'CONVERT_VARIABLES_TO_CSS_DONE',
  RESIZE = 'RESIZE',
  IMPORT_TEAM_LIBRARIES = 'IMPORT_TEAM_LIBRARIES',
  IMPORT_TEAM_LIBRARY_BY_NAME = 'IMPORT_TEAM_LIBRARY_BY_NAME',
  IMPORT_COLLECTIONS_AND_VARIABLES_IN_TEAM_LIBRARY = 'IMPORT_COLLECTIONS_AND_VARIABLES_IN_TEAM_LIBRARY',
  CREATE_VARIABLE = 'CREATE_VARIABLE',
  DETACH_ALIAS = 'DETACH_ALIAS',
  CREATE_VARIABLE_COLLECTION = 'CREATE_VARIABLE_COLLECTION',
  RENAME_VARIABLE_COLLECTION = 'RENAME_VARIABLE_COLLECTION',
  DELETE_VARIABLE_COLLECTION = 'DELETE_VARIABLE_COLLECTION',
  APPEND_VARIABLE_COLLECTION = 'APPEND_VARIABLE_COLLECTION',
  RESOLVE_VARIABLE_VALUE = 'RESOLVE_VARIABLE_VALUE',
  ADD_MODE = 'ADD_MODE',
  UNDO = 'UNDO',
  DUPLICATE_VARIABLES = 'DUPLICATE_VARIABLES',
  DELETE_VARIABLES = 'DELETE_VARIABLES',
  SELECT_VARIABLE_ROWS = 'SELECT_VARIABLE_ROWS',
  RENAME_MODE = 'RENAME_MODE',
  // MIGRATION
  CREATE_FILE_MIGRATION = 'CREATE_FILE_MIGRATION',
  SET_FILE_UUID = 'SET_FILE_UUID',
  DELETE_STORAGE = 'DELETE_STORAGE',
}

export function sendMessage(type: string, payload?: any) {
  parent.postMessage(
    {
      pluginMessage: {
        type,
        payload,
      },
      pluginId: '*',
    },
    '*'
  );
}

export const variableManager = {
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
