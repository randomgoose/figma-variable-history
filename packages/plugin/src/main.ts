import { cloneObject, emit, on, showUI } from '@create-figma-plugin/utilities';
import type {
  CommitHandler,
  ConvertCommitVariablesToCssDoneHandler,
  ConvertCommitVariablesToCssHandler,
  GenerateChangeLogHandler,
  GetVariableByIdHandler,
  ImportLocalCommitsHandler,
  ImportVariablesHandler,
  RefreshHandler,
  ResolveVariableValueHandler,
  RestoreCommitHandler,
  SetResolvedVariableValueHandler,
  SetVariableAliasHandler,
} from './types';
import { generateChangeLog } from './features/generate-change-log';
import { CommitBridge, convertVariablesToCss } from './features';

const commitBridge = CommitBridge.create();

async function emitData() {
  const variables = (await figma.variables.getLocalVariablesAsync()).map((v) => cloneObject(v));
  const collections = (await figma.variables.getLocalVariableCollectionsAsync()).map((c) =>
    cloneObject(c)
  );
  const commits = commitBridge.getCommits();

  emit<ImportVariablesHandler>('IMPORT_VARIABLES', { variables, collections });
  emit<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', commits);
}

export default async function () {
  on<RestoreCommitHandler>('RESTORE_COMMIT', () => {
    // TODO
  });

  on<CommitHandler>('COMMIT', (commit) => {
    commitBridge.commit(commit);
  });

  on<RefreshHandler>('REFRESH', emitData);

  on<GenerateChangeLogHandler>('GENERATE_CHANGE_LOG', generateChangeLog);

  on<ResolveVariableValueHandler>('RESOLVE_VARIABLE_VALUE', ({ variable, modeId }) => {
    const v = figma.variables.getLocalVariables().find((_v) => _v.id === variable.id);
    const c = figma.variables
      .getLocalVariableCollections()
      .find((_c) => _c.id === v?.variableCollectionId);

    if (v && c) {
      const consumer = figma.createFrame();
      consumer.setExplicitVariableModeForCollection(c, modeId);
      const resolvedVariableValue = v.resolveForConsumer(consumer);
      consumer.remove();

      emit<SetResolvedVariableValueHandler>('SET_RESOLVED_VARIABLE_VALUE', {
        id: v.id,
        modeId,
        value: resolvedVariableValue.value,
        resolvedType: resolvedVariableValue.resolvedType,
      });
    }
  });

  on<GetVariableByIdHandler>('GET_VARIABLE_BY_ID', async (id) => {
    const variable = await figma.variables.getVariableByIdAsync(id);

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
