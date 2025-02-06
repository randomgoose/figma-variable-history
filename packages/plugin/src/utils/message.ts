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
  updateVariable: (variableId: string, partialVariable: Partial<Variable>) => {
    sendMessage(MESSAGE_TYPE.SET_VARIABLE, {
      id: variableId,
      update: partialVariable,
    });
  },
};
