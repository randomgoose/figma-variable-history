import { EventHandler } from '@create-figma-plugin/utilities'

export type ICommit = {
  id: string;
  summary: string;
  description?: string;
  variables: Variable[];
  collections: VariableCollection[];
  date: number;
  collaborators: User[];
}

export interface InsertCodeHandler extends EventHandler {
  name: 'INSERT_CODE'
  handler: (code: string) => void
}

export interface CommitHandler extends EventHandler {
  name: 'COMMIT',
  handler: (commit: ICommit) => void
}

export interface ImportVariablesHandler extends EventHandler {
  name: 'IMPORT_VARIABLES',
  handler: (data: { variables: Variable[]; collections: VariableCollection[] }) => void
}

export interface ImportLocalCommitsHandler extends EventHandler {
  name: 'IMPORT_LOCAL_COMMITS',
  handler: (commits: ICommit[]) => void
}

export interface RefreshHandler extends EventHandler {
  name: "REFRESH",
  handler: () => void
}