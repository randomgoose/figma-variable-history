import { generateChangeLog } from './features/generate-change-log';
import { convertVariablesToCss } from './features';
import { commitBridge } from './features/CommitBridge';
import { figmaHelper } from './utils/figma-helper';
import { PLUGIN_DATA_KEY_SETTING } from './config';

export default async function () {
  figma.showUI(__html__, { width: 720, height: 480, themeColors: true });

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
        break;
      case 'REVERT_COMMIT':
        commitBridge.revert(msg.payload);
        break;
      case 'RESET_COMMIT':
        commitBridge.reset(msg.payload);
        break;
      case 'REFRESH':
        await commitBridge.emitData();
        break;
      case 'REVERT_VARIABLE_VALUE':
        commitBridge.revertVariable(msg.payload.variable, msg.payload.type);
        await commitBridge.emitData();
        break;
      case 'CONVERT_VARIABLES_TO_CSS':
        const commit = commitBridge.getCommitById(msg.payload);
        if (commit) {
          const content = await convertVariablesToCss(commit);
          figma.ui.postMessage({
            type: 'CONVERT_VARIABLES_TO_CSS_DONE',
            payload: encodeURIComponent(content),
          });
        }
        break;
      case 'GENERATE_CHANGE_LOG':
        const container = await generateChangeLog();
        figma.viewport.center = { x: container.x, y: container.y };
        break;
      case 'RESOLVE_VARIABLE_VALUE':
        const resolvedVariableValue = await figmaHelper.resolveVariableAlias(
          msg.payload.variable,
          msg.payload.modeId
        );
        if (resolvedVariableValue) {
          figma.ui.postMessage({
            type: 'RESOLVE_VARIABLE_VALUE_DONE',
            payload: {
              id: msg.payload.variable.id,
              modeId: msg.payload.modeId,
              value: resolvedVariableValue.value,
              resolvedType: resolvedVariableValue.resolvedType,
            },
          });
        }
        break;
      case 'GET_VARIABLE_BY_ID':
        const variable = await figmaHelper.getVariableByIdAsync(msg.payload);
        if (variable) {
          figma.ui.postMessage({
            type: 'SET_VARIABLE_ALIAS',
            payload: {
              id: variable.id,
              name: variable.name,
            },
          });
          // emit<SetVariableAliasHandler>('SET_VARIABLE_ALIAS', { id: variable.id, name: variable.name });
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
    }
  };

  // setInterval(async () => { await commitBridge.emitData(); }, 100)

  // on<CommitHandler>('COMMIT', (commit) => commitBridge.commit(commit));

  // on<RevertCommitHandler>('REVERT_COMMIT', (id) => commitBridge.revert(id));

  // on<RevertVariableHandler>('REVERT_VARIABLE_VALUE', (variable, type) => {
  // 	commitBridge.revertVariable(variable, type);
  // });

  // on<ResetCommitHandler>('RESET_COMMIT', (id) => commitBridge.reset(id));

  // on<RefreshHandler>('REFRESH', () => {
  // 	commitBridge.emitData()
  // });

  // on<GenerateChangeLogHandler>('GENERATE_CHANGE_LOG', generateChangeLog);

  // on<ResolveVariableValueHandler>('RESOLVE_VARIABLE_VALUE', async ({ variable, modeId }) => {
  // 	const resolvedVariableValue = await figmaHelper.resolveVariableAlias(variable, modeId);
  // 	if (resolvedVariableValue) {
  // 		emit<ResolveVariableValueDoneHandler>('RESOLVE_VARIABLE_VALUE_DONE', {
  // 			id: variable.id,
  // 			modeId,
  // 			value: resolvedVariableValue.value,
  // 			resolvedType: resolvedVariableValue.resolvedType,
  // 		});
  // 	}
  // });

  // on<GetVariableByIdHandler>('GET_VARIABLE_BY_ID', async (id) => {
  // 	const variable = await figmaHelper.getVariableByIdAsync(id);
  // 	if (variable) {
  // 		emit<SetVariableAliasHandler>('SET_VARIABLE_ALIAS', { id: variable.id, name: variable.name });
  // 	}
  // });

  // on<ConvertCommitVariablesToCssHandler>('CONVERT_VARIABLES_TO_CSS', async (commitId: string) => {
  // 	console.log("ALOHA")
  // 	const commit = commitBridge.getCommitById(commitId);
  // 	if (commit) {
  // 		const content = await convertVariablesToCss(commit);
  // 		emit<ConvertCommitVariablesToCssDoneHandler>(
  // 			'CONVERT_VARIABLES_TO_CSS_DONE',
  // 			encodeURIComponent(content)
  // 		);
  // 	}
  // });

  // on<SetPluginSettingHandler>('SET_PLUGIN_SETTING', (setting) => {
  // 	const prevSetting = figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING);
  // 	figmaHelper.setPluginData(PLUGIN_DATA_KEY_SETTING, { ...prevSetting, ...setting });
  // 	emit<PluginSettingHandler>(
  // 		'PLUGIN_SETTING',
  // 		figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING)
  // 	);
  // });
}
