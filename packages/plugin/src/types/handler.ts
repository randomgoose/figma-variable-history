import type { ICommit } from './commit';
import type { PluginSetting } from './setting';
import type { EventHandler } from '@create-figma-plugin/utilities';

export type VariableChangeType = 'added' | 'removed' | 'modified';

export interface InsertCodeHandler extends EventHandler {
  name: 'INSERT_CODE';
  handler: (code: string) => void;
}

export interface CommitHandler extends EventHandler {
  name: 'COMMIT';
  handler: (commit: Omit<ICommit, 'delta'>) => void;
}

export interface ImportVariablesHandler extends EventHandler {
  name: 'IMPORT_VARIABLES';
  handler: (data: { variables: Variable[]; collections: VariableCollection[] }) => void;
}

export interface ImportLocalCommitsHandler extends EventHandler {
  name: 'IMPORT_LOCAL_COMMITS';
  handler: (commits: ICommit[]) => void;
}

export interface RefreshHandler extends EventHandler {
  name: 'REFRESH';
  handler: () => void;
}

export interface GenerateChangeLogHandler extends EventHandler {
  name: 'GENERATE_CHANGE_LOG';
  handler: () => void;
}

export interface RevertVariableHandler extends EventHandler {
  name: 'REVERT_VARIABLE_VALUE';
  handler: (variable: Variable, type: VariableChangeType) => void;
}

export interface RevertCommitHandler extends EventHandler {
  name: 'REVERT_COMMIT';
  handler: (id: string) => void;
}

export interface ResetCommitHandler extends EventHandler {
  name: 'RESET_COMMIT';
  handler: (id: string) => void;
}

export interface ResolveVariableValueHandler extends EventHandler {
  name: 'RESOLVE_VARIABLE_VALUE';
  handler: (data: { variable: Variable; modeId: string }) => void;
}

export interface ResolveVariableValueDoneHandler extends EventHandler {
  name: 'RESOLVE_VARIABLE_VALUE_DONE';
  handler: (data: { id: string; modeId: string; value: any; resolvedType: string }) => void;
}

export interface GetVariableByIdHandler extends EventHandler {
  name: 'GET_VARIABLE_BY_ID';
  handler: (id: string) => void;
}

export interface SetVariableAliasHandler extends EventHandler {
  name: 'SET_VARIABLE_ALIAS';
  handler: (data: { id: string; name: string }) => void;
}

export interface NotifyHandler extends EventHandler {
  name: 'NOTIFY';
  handler: (message: string) => void;
}

export interface ConvertCommitVariablesToCssHandler extends EventHandler {
  name: 'CONVERT_VARIABLES_TO_CSS';
  handler: (commitId: string) => void;
}

export interface ConvertCommitVariablesToCssDoneHandler extends EventHandler {
  name: 'CONVERT_VARIABLES_TO_CSS_DONE';
  handler: (css: string) => void;
}

export interface PluginSettingHandler extends EventHandler {
  name: 'PLUGIN_SETTING';
  handler: (setting: PluginSetting) => void;
}

export interface SetPluginSettingHandler extends EventHandler {
  name: 'SET_PLUGIN_SETTING';
  handler: (setting: PluginSetting) => void;
}
