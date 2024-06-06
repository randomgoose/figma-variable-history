import { create } from 'zustand';
import { ICommit } from './types';

interface AppState {
  variables: Variable[];
  collections: VariableCollection[];
  commits: ICommit[];
  colorFormat: 'RGB' | 'HEX';
  resolvedVariableValues: {
    [key: string]: {
      valuesByMode: { [key: string]: { value: VariableValue; resolvedType: string } };
    };
  };
  variableAliases: { [key: string]: string };
  exportModalContent: string;
  exportModalOpen: boolean;
  setVariables: (variables: Variable[]) => void;
  setCollections: (collections: VariableCollection[]) => void;
  setCommits: (commits: ICommit[]) => void;
  setResolvedVariableValue: (data: {
    id: string;
    value: VariableValue;
    resolvedType: string;
    modeId: string;
  }) => void;
  setColorFormat: (colorFormat: 'RGB' | 'HEX') => void;
  setVariableAlias: (data: { id: string; name: string }) => void;
  setExportModalContent: (content: string) => void;
  setExportModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  variables: [],
  collections: [],
  commits: [],
  setVariables: (variables: Variable[]) => set(() => ({ variables: [...variables] })),
  setCollections: (collections: VariableCollection[]) =>
    set(() => ({ collections: [...collections] })),
  setCommits: (commits: ICommit[]) => set(() => ({ commits: [...commits] })),
  setColorFormat: (format: 'RGB' | 'HEX') => set(() => ({ colorFormat: format })),
  colorFormat: 'HEX',
  resolvedVariableValues: {},
  setResolvedVariableValue: ({ id, value, resolvedType, modeId }) =>
    set((prev) => ({
      resolvedVariableValues: {
        ...prev.resolvedVariableValues,
        [id]: {
          valuesByMode: {
            ...prev.resolvedVariableValues[id]?.valuesByMode,
            [modeId]: { value, resolvedType },
          },
        },
      },
    })),
  variableAliases: {},
  setVariableAlias: ({ id, name }) =>
    set((prev) => ({ ...prev, variableAliases: { ...prev.variableAliases, [id]: name } })),
  exportModalContent: '',
  exportModalOpen: false,
  setExportModalContent: (content: string) => set(() => ({ exportModalContent: content })),
  setExportModalOpen: (open: boolean) => set(() => ({ exportModalOpen: open })),
}));
