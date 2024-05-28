import { create } from 'zustand'
import { ICommit } from './types';

interface AppState {
    variables: Variable[];
    collections: VariableCollection[];
    commits: ICommit[];
    setVariables: (variables: Variable[]) => void;
    setCollections: (collections: VariableCollection[]) => void;
    setCommits: (commits: ICommit[]) => void;
    setColorFormat: (colorFormat: 'RGB' | 'HEX') => void;
    colorFormat: 'RGB' | 'HEX';
    resolvedVariableValues: { [key: string]: { valuesByMode: { [key: string]: { value: VariableValue; resolvedType: string } } } };
    setResolvedVariableValue: (data: { id: string, value: VariableValue; resolvedType: string; modeId: string }) => void;
    variableAliases: { [key: string]: string };
    setVariableAlias: (data: { id: string; name: string }) => void;
}

export const useAppStore = create<AppState>(
    (set) => ({
        variables: [],
        collections: [],
        commits: [],
        setVariables: (variables: Variable[]) => set(() => ({ variables: [...variables] })),
        setCollections: (collections: VariableCollection[]) => set(() => ({ collections: [...collections] })),
        setCommits: (commits: ICommit[]) => set(() => ({ commits: [...commits] })),
        setColorFormat: (format: 'RGB' | 'HEX') => set(() => ({ colorFormat: format })),
        colorFormat: 'HEX',
        resolvedVariableValues: {},
        setResolvedVariableValue: ({ id, value, resolvedType, modeId }) => set((prev) => ({
            resolvedVariableValues: {
                ...prev.resolvedVariableValues,
                [id]: {
                    valuesByMode: {
                        ...prev.resolvedVariableValues[id]?.valuesByMode,
                        [modeId]: { value, resolvedType }
                    }
                }
            }
        })),
        variableAliases: {},
        setVariableAlias: ({ id, name }) => set((prev) => ({ ...prev, variableAliases: { ...prev.variableAliases, [id]: name } }))
    }),
)
