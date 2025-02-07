import {
  DISABLE_VARIABLE_NAME_PREFIX,
  PLUGIN_DATA_KEY_COMMITS,
  PLUGIN_DATA_KEY_HEAD,
  PLUGIN_DATA_KEY_PREFIX,
} from '../config';
import { isSameVariable } from './variable';
import { ICommit } from '../types';
import { commitBridge } from '../features/CommitBridge';
import { cloneObject } from './object';

export const figmaHelper = {
  clearPluginData() {
    figma.root.setSharedPluginData(PLUGIN_DATA_KEY_PREFIX, PLUGIN_DATA_KEY_HEAD, '');
    figma.root.setSharedPluginData(PLUGIN_DATA_KEY_PREFIX, PLUGIN_DATA_KEY_COMMITS, '');
  },

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
    const codeSyntaxPlatforms: CodeSyntaxPlatform[] = ['WEB', 'ANDROID', 'iOS'];

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

      codeSyntaxPlatforms.forEach((platform) => {
        if (data.codeSyntax[platform]) {
          variable.setVariableCodeSyntax(platform, data.codeSyntax[platform]);
        } else {
          if (variable.codeSyntax[platform]) {
            variable.removeVariableCodeSyntax(platform);
          }
        }
      });
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

  async resolveVariableAlias(id: Variable['id'], modeId: string, consumer: FrameNode) {
    if (id.includes('/')) {
      const key = id.split('/')?.[0].split(':')?.[1];
      const v = await figma.variables.importVariableByKeyAsync(key);
      const c = v && (await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId));

      if (v && c) {
        const _modeId = c.modes.find((mode) => mode.modeId === modeId)?.modeId || c.defaultModeId;
        if (_modeId) {
          try {
            consumer.setExplicitVariableModeForCollection(c, _modeId);
            const resolvedVariableValue = v.resolveForConsumer(consumer);
            consumer.name = _modeId;
            return resolvedVariableValue;
          } catch (err) {
            console.error(`Failed to resolve variable alias\n`, err);
          }
        }
      }
    } else {
      const v = await this.getVariableByIdAsync(id, { clone: false });
      const c = v
        ? (await figma.variables.getLocalVariableCollectionsAsync()).find(
            ({ id }) => id === v.variableCollectionId
          )
        : null;

      if (v && c) {
        const _modeId = c.modes.find((mode) => mode.modeId === modeId)?.modeId || c.defaultModeId;
        if (_modeId) {
          try {
            consumer.setExplicitVariableModeForCollection(c, _modeId);
            const resolvedVariableValue = v.resolveForConsumer(consumer);
            consumer.name = _modeId;
            return resolvedVariableValue;
          } catch (err) {
            console.error(`Failed to resolve variable alias\n`, err);
          }
        }
      }
    }

    return null;
  },

  // Added Jan 19, 2025
  // This function is used to update the variable value in Figma,
  // Different from `updateVariable`, this function simply update the current variable,
  // and will not trigger the commit bridge to update the plugin data
  async setVariable(variableId: string, data: Partial<Variable>) {
    const variable = await figma.variables.getVariableByIdAsync(variableId);

    if (!variable) return;

    if (data.name) variable.name = data.name;
    if (data.description) variable.description = data.description;
    if (data.hiddenFromPublishing) variable.hiddenFromPublishing = data.hiddenFromPublishing;
    if (data.scopes) variable.scopes = data.scopes;
    if (data.codeSyntax) {
      Object.entries(data.codeSyntax).forEach(([platform, syntax]) =>
        variable.setVariableCodeSyntax(platform as CodeSyntaxPlatform, syntax)
      );
    }

    if (data.valuesByMode) {
      Object.entries(data.valuesByMode).forEach(([modeId, value]) =>
        variable.setValueForMode(modeId, value)
      );
    }

    figma.commitUndo();
  },

  async autoCompleteCodeSyntax() {
    const variables = await figma.variables.getLocalVariablesAsync();
    variables.forEach((variable) => {
      // TODO: Finish iOS and Android syntax completion
      const WEB_CODE_SYNTAX = `var(--${variable.name
        .replace(/[/_\\]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')});`;
      variable.setVariableCodeSyntax('WEB', WEB_CODE_SYNTAX);
    });
  },

  async updateVariableGroup({
    collectionId,
    source,
    target,
    slice,
  }: {
    collectionId: string;
    source: string;
    target: string;
    slice: number;
  }) {
    try {
      const variables = (await figma.variables.getLocalVariablesAsync()).filter(
        (v) => v.variableCollectionId === collectionId
      );

      variables.forEach((v) => {
        if (v.name.split('/')[slice] === source) {
          const newName = v.name.replace(source, target);
          v.name = newName;
        }
      });
    } catch (err) {
      console.error(`Failed to update variable group\n`, err);
    }
  },

  /* 
    TODO: Get Team Variable Libraries
  */

  async getTeamVariableLibraries() {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    // const libraries = groupBy(collections, 'libraryName');

    return collections;
  },
};
