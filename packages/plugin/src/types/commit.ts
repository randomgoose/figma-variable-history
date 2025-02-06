/*
  UPDATE 2025 Feb 06
  - Add ignoredVariableIds to commit so that the users can select variables to commit.
*/
export type ICommit = {
  id: string;
  summary: string;
  description?: string;
  variables: Variable[];
  collections: VariableCollection[];
  date: number;
  collaborators: User[];
  ignoredVariableIds?: string[];
};
