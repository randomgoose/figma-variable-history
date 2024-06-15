import { emit, on, showUI } from '@create-figma-plugin/utilities';
import type {
  CommitHandler,
  ConvertCommitVariablesToCssDoneHandler,
  ConvertCommitVariablesToCssHandler,
  GenerateChangeLogHandler,
  GetVariableByIdHandler,
  RefreshHandler,
  ResetCommitHandler,
  ResolveVariableValueHandler,
  RevertCommitHandler,
  ResolveVariableValueDoneHandler,
  SetVariableAliasHandler,
  RevertVariableHandler,
  SetPluginSettingHandler,
  PluginSettingHandler,
} from './types';
import { generateChangeLog } from './features/generate-change-log';
import { convertVariablesToCss } from './features';
import { commitBridge } from './features/CommitBridge';
import { figmaHelper } from './utils/figma-helper';
import { PLUGIN_DATA_KEY_SETTING } from './config';

export default async function () {
  on<CommitHandler>('COMMIT', (commit) => commitBridge.commit(commit));

  on<RevertCommitHandler>('REVERT_COMMIT', (id) => commitBridge.revert(id));

  on<RevertVariableHandler>('REVERT_VARIABLE_VALUE', (variable, type) =>
    commitBridge.revertVariable(variable, type)
  );

  on<ResetCommitHandler>('RESET_COMMIT', (id) => commitBridge.reset(id));

  on<RefreshHandler>('REFRESH', () => commitBridge.emitData());

  on<GenerateChangeLogHandler>('GENERATE_CHANGE_LOG', generateChangeLog);

  on<ResolveVariableValueHandler>('RESOLVE_VARIABLE_VALUE', async ({ variable, modeId }) => {
    const resolvedVariableValue = await figmaHelper.resolveVariableAlias(variable, modeId);
    if (resolvedVariableValue) {
      emit<ResolveVariableValueDoneHandler>('RESOLVE_VARIABLE_VALUE_DONE', {
        id: variable.id,
        modeId,
        value: resolvedVariableValue.value,
        resolvedType: resolvedVariableValue.resolvedType,
      });
    }
  });

  on<GetVariableByIdHandler>('GET_VARIABLE_BY_ID', async (id) => {
    const variable = await figmaHelper.getVariableByIdAsync(id);
    if (variable) {
      emit<SetVariableAliasHandler>('SET_VARIABLE_ALIAS', { id: variable.id, name: variable.name });
    }
  });

  on<ConvertCommitVariablesToCssHandler>('CONVERT_VARIABLES_TO_CSS', async (commitId: string) => {
    const commit = commitBridge.getCommitById(commitId);
    if (commit) {
      const content = await convertVariablesToCss(commit);
      emit<ConvertCommitVariablesToCssDoneHandler>(
        'CONVERT_VARIABLES_TO_CSS_DONE',
        encodeURIComponent(content)
      );
    }
  });

  on<SetPluginSettingHandler>('SET_PLUGIN_SETTING', (setting) => {
    const prevSetting = figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING);
    figmaHelper.setPluginData(PLUGIN_DATA_KEY_SETTING, { ...prevSetting, ...setting });
  });

  showUI({ height: 480, width: 720 });

  emit<PluginSettingHandler>('PLUGIN_SETTING', figmaHelper.getPluginData(PLUGIN_DATA_KEY_SETTING));
  await commitBridge.emitData();
}
