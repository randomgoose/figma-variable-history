import { EventHandler } from '@create-figma-plugin/utilities';

export type ICommit = {
  id: string;
  summary: string;
  description?: string;
  variables: Variable[];
  collections: VariableCollection[];
  date: number;
  collaborators: User[];
};

export interface InsertCodeHandler extends EventHandler {
  name: 'INSERT_CODE';
  handler: (code: string) => void;
}

export interface CommitHandler extends EventHandler {
  name: 'COMMIT';
  handler: (commit: ICommit) => void;
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

export interface RestoreCommitHandler extends EventHandler {
  name: 'RESTORE_COMMIT';
  handler: (id: string) => void;
}

export interface ResolveVariableValueHandler extends EventHandler {
  name: 'RESOLVE_VARIABLE_VALUE';
  handler: (data: { variable: Variable; modeId: string }) => void;
}

export interface SetResolvedVariableValueHandler extends EventHandler {
  name: 'SET_RESOLVED_VARIABLE_VALUE';
  handler: (data: { id: string; modeId: string; value: any; resolvedType: string }) => void;
}

export interface GetVariableByIdHander extends EventHandler {
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

export interface SetExportModalContentHandler extends EventHandler {
  name: 'SET_EXPORT_MODAL_CONTENT';
  handler: (content: string) => void;
}
