// import { generateChangeLog } from './features/generate-change-log';
import { convertVariablesToCss } from './features';
import { commitBridge } from './features/CommitBridge';
import { figmaHelper } from './utils/figma-helper';
import { PLUGIN_DATA_KEY_SETTING } from './config';
import { MESSAGE_TYPE } from './utils/message';

export default async function () {
  figma.notify('Resolving variable aliases...');
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

  figma.showUI(__html__, { width: 720, height: 480, themeColors: true });
  // // figma.showUI(__html__, { width: 1440, height: 960, themeColors: true });

  figma.ui.postMessage({
    type: MESSAGE_TYPE.VARIABLE_ALIAS_RESOLVED,
    payload: results,
  });

  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case 'INIT':
        await commitBridge.emitData();
        figma.ui.postMessage({
          type: 'PLUGIN_SETTING',
          payload: figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING),
        });
        break;
      case 'COMMIT':
        await commitBridge.commit(msg.payload);
        await commitBridge.emitData();
        break;
      case 'RESET_COMMIT':
        await commitBridge.reset(msg.payload);
        await commitBridge.emitData();
        break;
      case 'REFRESH':
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.REVERT_VARIABLE_VALUE:
        await commitBridge.revertVariable(msg.payload.variable, msg.payload.type);
        await commitBridge.emitData();
        break;
      case 'CONVERT_VARIABLES_TO_CSS':
        const commit = msg.paylod
          ? commitBridge.getCommitById(msg.payload)
          : commitBridge.getCommits()?.[0];

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
      case 'RESOLVE_VARIABLE_VALUE':
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
              payload: { id: variable.id, name: variable.name },
            });
          }
        } else {
          const variable =
            (await figmaHelper.getVariableByIdAsync(msg.payload)) ||
            commitBridge.findOneMatchedVariable(msg.payload);
          if (variable) {
            figma.ui.postMessage({
              type: 'SET_VARIABLE_ALIAS',
              payload: { id: variable.id, name: variable.name },
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
      case MESSAGE_TYPE.UPDATE_VARIABLE:
        await figmaHelper.setVariable(msg.payload.id, msg.payload);
        await commitBridge.emitData();
        break;
      case MESSAGE_TYPE.UPDATE_VARIABLE_GROUP:
        await figmaHelper.updateVariableGroup(msg.payload);
        await commitBridge.emitData();
        break;
      // case MESSAGE_TYPE.REVERT_ALL_VARIABLE_CHANGES:
      //   break;
      // TODO: Drop all changes
    }
  };
}
