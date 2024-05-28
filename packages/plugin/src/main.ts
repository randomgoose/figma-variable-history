import { cloneObject, emit, on, showUI } from '@create-figma-plugin/utilities'
import { CommitHandler, GenerateChangeLogHandler, GetVariableByIdHander, ImportLocalCommitsHandler, ImportVariablesHandler, RefreshHandler, ResolveVariableValueHandler, RestoreCommitHandler, SetResolvedVariableValueHandler, SetVariableAliasHandler } from './types';
import { generateChangeLog } from './features/generate-change-log';
import { saveCommitToRoot, getLocalCommits } from './features';
import { restore } from './features/restore';

async function emitData() {
  const variables = (await figma.variables.getLocalVariablesAsync()).map(v => cloneObject(v));
  const collections = (await figma.variables.getLocalVariableCollectionsAsync()).map(c => cloneObject(c))
  const commits = getLocalCommits();

  emit<ImportVariablesHandler>('IMPORT_VARIABLES', { variables, collections })
  emit<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', commits)
}

export default async function () {
  on<RestoreCommitHandler>("RESTORE_COMMIT", (id) => {
    const commit = getLocalCommits().find(c => c.id === id)
    restore(commit)
  })
  on<CommitHandler>('COMMIT', commit => { saveCommitToRoot(commit) });
  on<RefreshHandler>('REFRESH', emitData);
  on<GenerateChangeLogHandler>("GENERATE_CHANGE_LOG", generateChangeLog);
  on<ResolveVariableValueHandler>("RESOLVE_VARIABLE_VALUE", ({ variable, modeId }) => {
    const v = figma.variables.getLocalVariables().find(_v => _v.id === variable.id)
    const c = figma.variables.getLocalVariableCollections().find(_c => _c.id === v?.variableCollectionId)

    if (v && c) {
      const consumer = figma.createFrame()
      consumer.setExplicitVariableModeForCollection(c, modeId)
      const resolvedVariableValue = v.resolveForConsumer(consumer)
      consumer.remove()

      emit<SetResolvedVariableValueHandler>("SET_RESOLVED_VARIABLE_VALUE", { id: v.id, modeId, value: resolvedVariableValue.value, resolvedType: resolvedVariableValue.resolvedType })
    }
  })

  on<GetVariableByIdHander>('GET_VARIABLE_BY_ID', async (id) => {
    const variable = await figma.variables.getVariableByIdAsync(id)

    if (variable) {
      emit<SetVariableAliasHandler>("SET_VARIABLE_ALIAS", { id: variable.id, name: variable.name })
    }
  })

  showUI({ height: 480, width: 720 })
  await emitData()
}
