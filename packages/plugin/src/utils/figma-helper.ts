import { cloneObject } from '@create-figma-plugin/utilities';
import { DISABLE_VARIABLE_NAME_PREFIX, PLUGIN_DATA_KEY_PREFIX } from '../config';
import { isSameVariable } from './variable';
import { ICommit } from '../types';
import { commitBridge } from '../features/CommitBridge';

export const figmaHelper = {
  getPluginData(dataKey: string): any {
    const dataStr = figma.root.getSharedPluginData(PLUGIN_DATA_KEY_PREFIX, dataKey);
    try {
      return dataStr ? JSON.parse(dataStr) : null;
    } catch (err) {
      console.warn('Plugin data is unable to parse\n', dataStr, `\nError:\n`, err);
    }
    return null;
  },

  setPluginData(key: string, data: any) {
    try {
      figma.root.setSharedPluginData(PLUGIN_DATA_KEY_PREFIX, key, JSON.stringify(data));
    } catch (err) {
      console.warn(`Plugin data [${key}] is unable to set\n`, data, `\nError:\n`, err);
    }
  },

  async getLocalVariablesAsync(
    options: {
      type?: VariableResolvedDataType;
      clone?: boolean;
    } = {}
  ): Promise<Variable[]> {
    options.clone = typeof options.clone === 'boolean' ? options.clone : true;
    try {
      const variables = (await figma.variables.getLocalVariablesAsync(options.type)).filter(
        ({ name }) => !name.startsWith(DISABLE_VARIABLE_NAME_PREFIX)
      );
      return options.clone ? variables.map((v) => cloneObject(v)) : variables;
    } catch (err) {
      console.error(`Failed to get Figma local variables:\n`, err);
    }
    return [];
  },

  async getLocalVariableCollectionsAsync(
    options: {
      clone?: boolean;
    } = {}
  ): Promise<VariableCollection[]> {
    options.clone = typeof options.clone === 'boolean' ? options.clone : true;
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      return options.clone ? collections.map((c) => cloneObject(c)) : collections;
    } catch (err) {
      console.error(`Failed to get Figma local variable collections:\n`, err);
    }
    return [];
  },

  // avoid use figma.variables.getVariableById directly
  // it not works correctly before reload Figma file if variables is removed manually
  async getVariableByIdAsync(
    id: Variable['id'],
    options: {
      clone?: boolean;
      variableName?: Variable['name'];
      variableCollectionId?: Variable['variableCollectionId'];
    } = {}
  ): Promise<Variable | null> {
    options.clone = typeof options.clone === 'boolean' ? options.clone : true;

    try {
      const variable = (await figma.variables.getLocalVariablesAsync()).find((v) =>
        isSameVariable(v, {
          id,
          name: options.variableName,
          variableCollectionId: options.variableCollectionId,
        } as Variable)
      );
      return variable ? (options.clone ? cloneObject(variable) : variable) : null;
    } catch (err) {
      console.error(`Failed to get Figma variable with id ${id}\n`, err);
    }
    return null;
  },

  async getVariableCollection(id: string) {
    const collection = (await figma.variables.getLocalVariableCollectionsAsync()).find(
      (c) => c.id === id
    );

    if (collection) {
      return collection;
    } else {
      const commits = commitBridge.getCommits();
      const recentCommit = commits?.find((commit: ICommit) =>
        commit?.collections?.find((c) => c.id === id)
      );

      if (recentCommit) {
        const recentCollection = recentCommit?.collections.find(
          (c: VariableCollection) => c.id === id
        );

        if (recentCollection) {
          const sameNameCollection = (
            await figma.variables.getLocalVariableCollectionsAsync()
          ).find((c) => c.name === recentCollection.name);

          if (sameNameCollection) {
            return sameNameCollection;
          } else {
            // const newCollection = figma.variables.createVariableCollection(recentCollection.name);
            // return newCollection;
          }
        } else {
        }
      }
    }
  },

  async updateVariable({
    data,
    createIfNotExists = false,
    variableId,
    commitId,
  }: {
    data: Variable;
    createIfNotExists?: boolean;
    variableId: string;
    commitId: string;
  }) {
    let variable = (await this.getVariableByIdAsync(variableId, { clone: false })) as Variable;
    const commit = commitBridge.getCommitById(commitId);

    if (!variable && createIfNotExists) {
      const collection = await figmaHelper.getVariableCollection(data.variableCollectionId);
      // Calling createVariable with a collection id is deprecated, pass the collection node instead.
      variable = figma.variables.createVariable(data.name, collection as any, data.resolvedType);
    }

    if (variable) {
      const collection = await figma.variables.getVariableCollectionByIdAsync(
        variable.variableCollectionId
      );

      variable.name = data.name;
      variable.scopes = data.scopes;
      variable.description = data.description;
      variable.hiddenFromPublishing = data.hiddenFromPublishing;

      Object.entries(data.valuesByMode).forEach(([modeId, value]) => {
        if (collection?.modes.find(({ modeId: id }) => id === modeId)) {
          variable.setValueForMode(modeId, value);
        } else {
          const targetMode = commit?.collections
            .find((c) => c.id === variable.variableCollectionId)
            ?.modes.find((mode) => mode.modeId === modeId);
          const sameNameMode = collection?.modes.find(({ name }) => name === targetMode?.name);
          if (sameNameMode) {
            variable.setValueForMode(sameNameMode.modeId, value);
          }
        }
      });

      Object.entries(data.codeSyntax).forEach(([platform, syntax]) =>
        variable.setVariableCodeSyntax(platform as CodeSyntaxPlatform, syntax)
      );
    }

    return variable;
  },

  async disableVariable(data: Variable) {
    const variable = await this.getVariableByIdAsync(data.id, {
      clone: false,
      variableName: data.name,
      variableCollectionId: data.variableCollectionId,
    });

    if (variable) {
      if (!variable.name.startsWith(DISABLE_VARIABLE_NAME_PREFIX)) {
        variable.name = `${DISABLE_VARIABLE_NAME_PREFIX}${variable.name}`;
      }
    }
  },

  async resolveVariableAlias(variable: Variable, modeId: string) {
    const v = await this.getVariableByIdAsync(variable.id, { clone: false });
    const c = v
      ? (await figma.variables.getLocalVariableCollectionsAsync()).find(
          ({ id }) => id === v.variableCollectionId
        )
      : null;

    if (v && c) {
      if (c.modes.find((mode) => mode.modeId === modeId)) {
        try {
          const consumer = figma.createFrame();
          consumer.setExplicitVariableModeForCollection(c, modeId);
          const resolvedVariableValue = v.resolveForConsumer(consumer);
          consumer.name = modeId;
          consumer.remove();
          return resolvedVariableValue;
        } catch (err) {
          console.error(`Failed to resolve variable alias\n`, err);
        }
      }
    }

    return null;
  },
};
