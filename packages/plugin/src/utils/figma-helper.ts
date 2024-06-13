import { cloneObject } from '@create-figma-plugin/utilities';
import { DISABLE_VARIABLE_NAME_PREFIX } from '../config';

export const figmaHelper = {
  async getLocalVariablesAsync(type?: VariableResolvedDataType): Promise<Variable[]> {
    try {
      const variables = await figma.variables.getLocalVariablesAsync(type);
      return variables
        .filter(({ name }) => !name.startsWith(DISABLE_VARIABLE_NAME_PREFIX))
        .map((v) => cloneObject(v));
    } catch (err) {
      console.error(`Failed to get Figma local variables:\n`, err);
    }
    return [];
  },

  async getLocalVariableCollectionsAsync(): Promise<VariableCollection[]> {
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      return collections.map((c) => cloneObject(c));
    } catch (err) {
      console.error(`Failed to get Figma local variable collections:\n`, err);
    }
    return [];
  },

  async getVariableByIdAsync(id: Variable['id']): Promise<Variable | null> {
    try {
      const variable = await figma.variables.getVariableByIdAsync(id);
      return cloneObject(variable);
    } catch (err) {
      console.error(`Failed to get Figma variable with id ${id}\n`, err);
    }
    return null;
  },

  async updateVariable({
    data,
    createIfNotExists = false,
  }: {
    data: Variable;
    createIfNotExists?: boolean;
  }) {
    let variable = (await figma.variables.getLocalVariablesAsync()).find(
      ({ id }) => id === data.id
    ) as Variable;

    if (!variable && createIfNotExists) {
      const collection = await figma.variables.getVariableCollectionByIdAsync(
        data.variableCollectionId
      );
      // Calling createVariable with a collection id is deprecated, pass the collection node instead.
      variable = figma.variables.createVariable(data.name, collection as any, data.resolvedType);
    }

    if (variable) {
      variable.name = data.name;
      variable.scopes = data.scopes;
      variable.description = data.description;
      variable.hiddenFromPublishing = data.hiddenFromPublishing;
      Object.entries(data.valuesByMode).forEach(([modeId, value]) => {
        variable.setValueForMode(modeId, value);
      });
      Object.entries(data.codeSyntax).forEach(([platform, syntax]) =>
        variable.setVariableCodeSyntax(platform as CodeSyntaxPlatform, syntax)
      );
    }
  },

  disableVariable(id: Variable['id']) {
    const variable = figma.variables.getVariableById(id);
    if (variable) {
      if (!variable.name.startsWith(DISABLE_VARIABLE_NAME_PREFIX)) {
        variable.name = `${DISABLE_VARIABLE_NAME_PREFIX}${variable.name}`;
      }
    }
  },

  async resolveVariableAlias(variable: Variable, modeId: string) {
    const v = (await figma.variables.getLocalVariablesAsync()).find(({ id }) => id === variable.id);
    const c = v
      ? (await figma.variables.getLocalVariableCollectionsAsync()).find(
          ({ id }) => id === v.variableCollectionId
        )
      : null;

    if (v && c) {
      const consumer = figma.createFrame();
      consumer.setExplicitVariableModeForCollection(c, modeId);
      const resolvedVariableValue = v.resolveForConsumer(consumer);
      consumer.remove();
      return resolvedVariableValue;
    }

    return null;
  },
};
