import { emit, on, showUI } from '@create-figma-plugin/utilities';
import type {
  CommitHandler,
  ConvertCommitVariablesToCssDoneHandler,
  ConvertCommitVariablesToCssHandler,
  GenerateChangeLogHandler,
  GetVariableByIdHandler,
  ImportLocalCommitsHandler,
  ImportVariablesHandler,
  RefreshHandler,
  ResetCommitHandler,
  ResolveVariableValueHandler,
  RevertCommitHandler,
  SetResolvedVariableValueHandler,
  SetVariableAliasHandler,
} from './types';
import { generateChangeLog } from './features/generate-change-log';
import { convertVariablesToCss } from './features';
import { commitBridge } from './features/CommitBridge';
import { figmaHelper } from './utils/figma-helper';

async function emitData() {
  const variables = await figmaHelper.getLocalVariablesAsync();
  const collections = await figmaHelper.getLocalVariableCollectionsAsync();
  const commits = commitBridge.getCommits();

  emit<ImportVariablesHandler>('IMPORT_VARIABLES', { variables, collections });
  emit<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', commits);
}

export default async function () {
  on<CommitHandler>('COMMIT', (commit) => commitBridge.commit(commit));

  on<RevertCommitHandler>('REVERT_COMMIT', () => commitBridge.revert());

  on<ResetCommitHandler>('RESET_COMMIT', (id) => commitBridge.reset(id).then(() => emitData()));

  on<RefreshHandler>('REFRESH', emitData);

  on<GenerateChangeLogHandler>('GENERATE_CHANGE_LOG', generateChangeLog);

  on<ResolveVariableValueHandler>('RESOLVE_VARIABLE_VALUE', async ({ variable, modeId }) => {
    const resolvedVariableValue = await figmaHelper.resolveVariableAlias(variable, modeId);
    if (resolvedVariableValue) {
      emit<SetResolvedVariableValueHandler>('SET_RESOLVED_VARIABLE_VALUE', {
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

  showUI({ height: 480, width: 720 });

  await emitData();
}
