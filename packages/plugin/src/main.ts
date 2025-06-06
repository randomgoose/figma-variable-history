// import { generateChangeLog } from './features/generate-change-log';
import { convertVariablesToCss } from './features';
import { commitBridge } from './features/CommitBridge';
import { figmaHelper } from './utils/figma-helper';
import { PLUGIN_DATA_KEY_COMMITS, PLUGIN_DATA_KEY_FILE_UUID, PLUGIN_DATA_KEY_HEAD, PLUGIN_DATA_KEY_SETTING } from './config';
import { MESSAGE_TYPE } from './utils/message';
import { cloneObject } from './utils/object';
import { getNextVariableNames } from './utils/variable';
import { initDevModeApp } from './features/init-dev-mode-app';

export default async function () {
  const libraries = await figmaHelper.getTeamVariableLibraries();
  const ALIAS_NAME_MAP: Record<string, string> = {};

  if (figma.mode === 'default') {
    const variables = await figma.variables.getLocalVariablesAsync();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const consumer = figma.createFrame();

    const results = await Promise.all(
      variables.map(async (variable) => {
        const collection = collections.find((c) => c.id === variable.variableCollectionId);
        const modeId = collection?.defaultModeId || Object.keys(variable.valuesByMode)[0];
        // const resolvedVariable = await figmaHelper.resolveVariableAlias(v.id, modeId, consumer);
        let resolvedVariableValue;

        const v = await figma.variables.getVariableByIdAsync(variable.id);
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
              resolvedVariableValue = v.resolveForConsumer(consumer);
              consumer.name = _modeId;
            } catch (err) {
              console.error(`Failed to resolve variable alias\n`, err);
            }
          }
        }

        return {
          id: variable.id,
          modeId,
          value: resolvedVariableValue?.value,
          resolvedType: resolvedVariableValue?.resolvedType,
        };
      })
    );

    consumer.remove();

    await Promise.all(
      variables.map(async (variable) => {
        const promises = Object.values(variable.valuesByMode).map(async (value) => {
          if (typeof value === 'object' && 'type' in value) {
            if (ALIAS_NAME_MAP[value.id]) {
              return;
            }
            const v = await figmaHelper.getVariableByIdAsync(value.id);
            if (v) {
              ALIAS_NAME_MAP[v.id] = v.name;
            }
          }
        });

        await Promise.all(promises);
      })
    );

    await figmaHelper.loadUI('default');

    figma.ui.postMessage({
      type: MESSAGE_TYPE.VARIABLE_ALIAS_RESOLVED,
      payload: results,
    });
  } else if (figma.mode === 'inspect') {
    await initDevModeApp();
  }

  figma.ui.postMessage({
    type: 'SET_VARIABLE_ALIAS',
    payload: ALIAS_NAME_MAP,
  });

  figma.ui.postMessage({ type: MESSAGE_TYPE.IMPORT_TEAM_LIBRARIES, payload: libraries });

  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case 'INIT':
        await commitBridge.emitData();
        figma.ui.postMessage({
          type: 'PLUGIN_SETTING',
          payload: figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING),
        });
        figma.ui.postMessage({
          type: MESSAGE_TYPE.SET_FILE_UUID,
          payload: figmaHelper.getFileUUID(),
        });
        figma.ui.postMessage({
          type: MESSAGE_TYPE.SET_CURRENT_USER,
          payload: figma.currentUser,
        });
        break;
      // case MESSAGE_TYPE.COMMIT:
      //   await commitBridge.commit(msg.payload);
      //   await commitBridge.emitData();
      //   break;
      case 'RESET_COMMIT':
        await commitBridge.reset(msg.payload);
        await commitBridge.emitData();
        break;
      case 'REFRESH':
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.REVERT_VARIABLE_VALUE:
        await commitBridge.revertVariable(msg.payload.variable, msg.payload.type, msg.payload.commit);
        await commitBridge.emitData();
        break;
      case 'CONVERT_VARIABLES_TO_CSS':
        const commit = msg.payload

        if (commit) {
          const content = await convertVariablesToCss(
            commit,
            figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING)?.colorFormat || 'RGB'
          );
          figma.ui.postMessage({
            type: 'CONVERT_VARIABLES_TO_CSS_DONE',
            payload: encodeURIComponent(content),
          });
        }
        break;
      // case 'GENERATE_CHANGE_LOG':
      //   const container = await generateChangeLog();
      //   figma.viewport.center = { x: container.x, y: container.y };
      //   break;
      case MESSAGE_TYPE.RESOLVE_VARIABLE_VALUE:
        if (figma.mode === 'inspect') return;

        const consumer = figma.createFrame();
        const resolvedVariableValue = await figmaHelper.resolveVariableAlias(
          msg.payload.id,
          msg.payload.modeId,
          consumer
        );

        if (resolvedVariableValue) {
          figma.ui.postMessage({
            type: 'RESOLVE_VARIABLE_VALUE_DONE',
            payload: {
              id: msg.payload.id,
              modeId: msg.payload.modeId,
              value: resolvedVariableValue.value,
              resolvedType: resolvedVariableValue.resolvedType,
            },
          });

          consumer.remove();
        }
        break;
      case 'GET_VARIABLE_BY_ID':
        // If the variable id includes a slash, it is considered a remote variable
        // Import remote variables using importVariableByKeyAsync
        if (msg.payload?.includes('/')) {
          const key = msg.payload.split('/')[0].split(':')[1];
          const variable = await figma.variables.importVariableByKeyAsync(key);
          if (variable) {
            figma.ui.postMessage({
              type: 'SET_VARIABLE_ALIAS',
              payload: { [msg.payload]: variable.name }, // Updated to use the original id, because the imported variable has a different id
            });
          }
        } else {
          const variable =
            (await figmaHelper.getVariableByIdAsync(msg.payload)) ||
            commitBridge.findOneMatchedVariable(msg.payload);
          if (variable) {
            figma.ui.postMessage({
              type: 'SET_VARIABLE_ALIAS',
              payload: { [msg.payload]: variable.name },
            });
          }
        }
        break;
      case 'SET_PLUGIN_SETTING':
        const prevSetting = figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING);
        figmaHelper.setPluginData(PLUGIN_DATA_KEY_SETTING, { ...prevSetting, ...msg.payload });
        figma.ui.postMessage({
          type: 'PLUGIN_SETTING',
          payload: figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING),
        });
        break;
      case 'PLUGIN_SETTING':
        figma.ui.postMessage({
          type: 'PLUGIN_SETTING',
          payload: figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING),
        });
        // emit<PluginSettingHandler>('PLUGIN_SETTING', figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING));
        break;
      case 'CLEAR_PLUGIN_DATA':
        figmaHelper.clearPluginData();
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.AUTOCOMPLETE_CODE_SYNTAX:
        await figmaHelper.autoCompleteCodeSyntax();
        await commitBridge.emitData();
        break;
      // case MESSAGE_TYPE.UPDATE_VARIABLE_VALUE:
      //   const { id, modeId, value } = msg.payload;
      //   await updateVariableValue(id, modeId, value);
      //   figma.commitUndo();
      //   await commitBridge.emitData();
      //   break;
      case MESSAGE_TYPE.SET_VARIABLE:
        await figmaHelper.setVariable(msg.payload.id, msg.payload.update);
        // Added Feb 16, 2025
        // Resolve the variable value
        // await figmaHelper.resolveVariableAlias(msg.payload.id, msg.payload.modeId, consumer);
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.UPDATE_VARIABLE_GROUP:
        await figmaHelper.updateVariableGroup(msg.payload);
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.RESIZE:
        figma.ui.resize(msg.payload.width, msg.payload.height);
        try {
          figma.clientStorage.setAsync(`${PLUGIN_DATA_KEY_SETTING}_windowSize`, { ...msg.payload });
        } catch (err) {
          console.error('Failed to set plugin data', err);
        }
        break;
      case MESSAGE_TYPE.DETACH_ALIAS:
        await figmaHelper.detachAlias(msg.payload.id, msg.payload.modeId);
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.CREATE_VARIABLE_COLLECTION:
        const collection = await figmaHelper.createVariableCollection();
        figma.ui.postMessage({
          type: MESSAGE_TYPE.APPEND_VARIABLE_COLLECTION,
          payload: cloneObject(collection),
        });

        break;
      case MESSAGE_TYPE.CREATE_VARIABLE:
        let variableId = '';
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        const variables = await figma.variables.getLocalVariablesAsync();

        // Map variable types to proper capitalized names
        const typeNameMap: Record<string, string> = {
          COLOR: 'Color',
          STRING: 'String',
          FLOAT: 'Number',
          BOOLEAN: 'Boolean',
        };

        const baseName = typeNameMap[msg.payload.type] || msg.payload.type;
        const newNames = getNextVariableNames([baseName], variables);
        const newName = newNames[0];

        if (collections.length <= 0) {
          const collection = await figmaHelper.createVariableCollection();
          const variable = await figmaHelper.createVariable(newName, collection, msg.payload.type);
          variableId = variable?.id || '';
        } else {
          const collection = collections.find((c) => c.id === msg.payload.collectionId);
          if (collection) {
            const variable = await figmaHelper.createVariable(
              newName,
              collection,
              msg.payload.type
            );
            variableId = variable?.id || '';
          }
        }
        figma.commitUndo();
        await commitBridge.emitData();

        // Select the newly created variable row
        figma.ui.postMessage({
          type: MESSAGE_TYPE.SELECT_VARIABLE_ROWS,
          payload: [variableId],
        });
        break;
      case MESSAGE_TYPE.DELETE_VARIABLES:
        await Promise.all(
          msg.payload.map(async (id: string) => {
            const variable = await figma.variables.getVariableByIdAsync(id);
            if (variable) variable.remove();
          })
        );
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.DUPLICATE_VARIABLES:
        const duplicatedVariables = await figmaHelper.duplicateVariables(msg.payload);
        await commitBridge.emitData();
        figma.ui.postMessage({
          type: MESSAGE_TYPE.SELECT_VARIABLE_ROWS,
          payload: duplicatedVariables?.map((v) => v?.id) || [],
        });
        break;
      case MESSAGE_TYPE.IMPORT_TEAM_LIBRARY_BY_NAME:
        const result = await figmaHelper.getTeamLibraryByName(msg.payload);
        figma.ui.postMessage({
          type: MESSAGE_TYPE.IMPORT_COLLECTIONS_AND_VARIABLES_IN_TEAM_LIBRARY,
          payload: {
            name: msg.payload,
            collections: result.collections,
            variables: result.variables,
          },
        });
        break;
      case MESSAGE_TYPE.UNDO:
        figma.triggerUndo();
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.RENAME_MODE:
        await figmaHelper.renameMode(
          msg.payload.collectionId,
          msg.payload.modeId,
          msg.payload.name
        );
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.CREATE_FILE_MIGRATION:
        const head = figmaHelper.getPluginData(PLUGIN_DATA_KEY_HEAD);
        const commits = figmaHelper.getPluginData(PLUGIN_DATA_KEY_COMMITS);

        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-file`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ commits, head }),
            }
          );
          const data = await response.json();
          if (data.id && typeof data.id === 'string' && data.id !== '') {
            figmaHelper.setFileUUID(data.id);

            figma.ui.postMessage({
              type: MESSAGE_TYPE.SET_FILE_UUID,
              payload: data.id,
            });
          }
        } catch (error) {
          console.error(error);
        }
        break;
      case MESSAGE_TYPE.SET_PLUGIN_DATA:
        Object.entries(msg.payload).forEach(([key, value]) => {
          figmaHelper.setPluginData(key, value);

          if (key === PLUGIN_DATA_KEY_FILE_UUID) {
            figma.ui.postMessage({
              type: MESSAGE_TYPE.SET_FILE_UUID,
              payload: value,
            });
          }
        });

        break;
      case MESSAGE_TYPE.EXPORT_CODE:
        const colorFormat = figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING)?.colorFormat || 'RGB';
        const webCode = await convertVariablesToCss(msg.payload.commit, colorFormat);
        const code = {
          WEB: {
            'variables.css': webCode,
          },
        }
        figma.ui.postMessage({
          type: MESSAGE_TYPE.EXPORT_CODE_DONE,
          payload: {
            commitId: msg.payload.commit?.id,
            code,
          },
        });
        break;

      // case MESSAGE_TYPE.DELETE_VARIABLE_COLLECTION:
      //   await figmaHelper.deleteVariableCollection(msg.payload.id);
      //   await commitBridge.emitData();
      //   break;
      // case MESSAGE_TYPE.RENAME_VARIABLE_COLLECTION:
      //   await figmaHelper.renameVariableCollection(msg.payload.id, msg.payload.name);
      //   await commitBridge.emitData();
      //   break;
      // case MESSAGE_TYPE.ADD_MODE:
      //   await figmaHelper.addMode(msg.payload.collectionId, msg.payload.name);
      //   await commitBridge.emitData();
      //   break;
    }
  };
}
