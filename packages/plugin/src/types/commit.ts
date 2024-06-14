export type ICommit = {
  id: string;
  summary: string;
  description?: string;
  variables: Variable[];
  collections: VariableCollection[];
  date: number;
  collaborators: User[];
};
