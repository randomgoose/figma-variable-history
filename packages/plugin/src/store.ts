import { create } from 'zustand'
import { ICommit } from './types';

interface AppState {
    variables: Variable[];
    collections: VariableCollection[];
    commits: ICommit[];
    setVariables: (variables: Variable[]) => void;
    setCollections: (collections: VariableCollection[]) => void;
    setCommits: (commits: ICommit[]) => void;
}

export const useAppStore = create<AppState>(
    (set) => ({
        variables: [],
        collections: [],
        commits: [],
        setVariables: (variables: Variable[]) => set(() => ({ variables: [...variables] })),
        setCollections: (collections: VariableCollection[]) => set(() => ({ collections: [...collections] })),
        setCommits: (commits: ICommit[]) => set(() => ({ commits: [...commits] })),
    }),
)
