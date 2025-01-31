import { createContext, useMemo, useState, ReactNode, useEffect } from 'react';

import type { ICommit, PluginSetting } from './types';
import { getVariableChangesGroupedByCollection } from './utils/variable';
import { ClipboardItem } from './types/clipboard';

interface AppContext {
  setting: PluginSetting;
  variables: Variable[];
  collections: VariableCollection[];
  commits: ICommit[];
  variableAliases: Record<string, string>;
  resolvedVariableValues: Record<
    string,
    {
      valuesByMode: Record<string, { value: VariableValue; resolvedType: string }>;
    }
  >;
  groupedChanges: {
    [k: string]: {
      added: Variable[];
      modified: Variable[];
      removed: Variable[];
    };
  };
  tab: 'changes' | 'commits' | 'settings' | 'editor';
  compiledVariables: { css: string };
  selectedCommitId: string;
  setTab: (tab: AppContext['tab']) => void;
  getCollectionName: (collectionId: string) => string;
  setSelectedCommitId: (id: string) => void;
  clearCompiledVariables: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  // Selected variables in Editor
  selection: string[];
  setSelection: (selection: string[]) => void;
  clipboard: ClipboardItem[];
  setClipboard: (clipboard: ClipboardItem[]) => void;
  cmdkOpen: boolean;
  setCMDKOpen: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  // Selected variables in Changes
  checkedVariableIds: string[];
  setCheckedVariableIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AppContext = createContext<AppContext>({
  setting: { syncTasks: [], colorFormat: 'RGB' },
  variables: [],
  collections: [],
  commits: [],
  variableAliases: {},
  resolvedVariableValues: {},
  groupedChanges: {},
  tab: 'editor',
  compiledVariables: { css: '' },
  selectedCommitId: '',
  getCollectionName: () => '',
  setSelectedCommitId: () => null,
  setTab: () => null,
  clearCompiledVariables: () => null,
  zoom: 1,
  setZoom: () => null,
  selection: [],
  setSelection: () => null,
  clipboard: [],
  setClipboard: () => null,
  cmdkOpen: false,
  setCMDKOpen: () => null,
  search: '',
  setSearch: () => null,
  checkedVariableIds: [],
  setCheckedVariableIds: () => null,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<PluginSetting>({ syncTasks: [] });
  const [variables, setVariables] = useState<AppContext['variables']>([]);
  const [collections, setCollections] = useState<AppContext['collections']>([]);
  const [commits, setCommits] = useState<AppContext['commits']>([]);
  const [variableAliases, setVariableAliases] = useState<AppContext['variableAliases']>({});
  const [resolvedVariableValues, setResolvedVariableValues] = useState<
    AppContext['resolvedVariableValues']
  >({});
  const [enableGitHubSync, setEnableGitHubSync] = useState<boolean>(false);
  const [tab, setTab] = useState<AppContext['tab']>('editor');
  const [compiledVariables, setCompiledVariables] = useState<{ css: string }>({ css: '' });
  const [selectedCommitId, setSelectedCommitId] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [selection, setSelection] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([]);
  const [checkedVariableIds, setCheckedVariableIds] = useState<string[]>([]);
  const groupedChanges = useMemo(() => {
    return getVariableChangesGroupedByCollection({
      prev: {
        variables: commits[0] ? commits[0].variables : [],
        collections: commits[0] ? commits[0].collections : [],
      },
      current: { variables, collections },
    });
  }, [commits, variables]);
  const [cmdkOpen, setCMDKOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    onmessage = async (e) => {
      const { type, payload } = e.data.pluginMessage;

      switch (type) {
        case 'IMPORT_VARIABLES':
          setVariables(payload.variables);
          setCollections(payload.collections);
          setCheckedVariableIds(payload.variables.map((v: Variable) => v.id));
          break;
        case 'IMPORT_LOCAL_COMMITS':
          setCommits(payload);
          break;
        case 'RESOLVE_VARIABLE_VALUE_DONE':
          setResolvedVariableValues((prev) => ({
            ...prev,
            [payload.id]: {
              valuesByMode: {
                ...prev[payload.id]?.valuesByMode,
                [payload.modeId]: { value: payload.value, resolvedType: payload.resolvedType },
              },
            },
          }));
          break;
        case 'SET_VARIABLE_ALIAS':
          setVariableAliases((prev) => ({ ...prev, [payload.id]: payload.name }));
          break;
        case 'PLUGIN_SETTING':
          setSetting(payload);
          break;
        case 'CONVERT_VARIABLES_TO_CSS_DONE':
          setCompiledVariables((prev) => ({ ...prev, css: decodeURIComponent(payload) }));
          break;
        case 'VARIABLE_ALIAS_RESOLVED':
          setResolvedVariableValues((prev) => {
            const values = { ...prev };
            payload.forEach((v: any) => {
              values[v.id] = {
                valuesByMode: {
                  ...values[v.id]?.valuesByMode,
                  [v.modeId]: { value: v.value, resolvedType: v.resolvedType },
                },
              };
            });
            return values;
          });
          break;
      }
    };
  }, []);

  const getCollectionName = (collectionId: string) => {
    const existingCollection = collections.find((c) => c.id === collectionId);

    if (existingCollection) {
      return existingCollection.name;
    } else {
      const commit = commits.find(
        (commit) =>
          commit.collections.findIndex((collection) => collection.id === collectionId) >= 0
      );

      return (
        commit?.collections.find((collection) => collection.id === collectionId)?.name ||
        collectionId
      );
    }
  };

  const clearCompiledVariables = () => setCompiledVariables({ css: '' });

  const context = useMemo<AppContext>(() => {
    return {
      setting,
      variables,
      collections,
      commits,
      variableAliases,
      resolvedVariableValues,
      groupedChanges,
      selection,
      tab,
      setTab,
      getCollectionName,
      compiledVariables,
      selectedCommitId,
      zoom,
      setZoom,
      setSelectedCommitId,
      setSelection,
      clipboard,
      setClipboard,
      clearCompiledVariables: () => setCompiledVariables({ css: '' }),
      cmdkOpen,
      setCMDKOpen,
      search,
      setSearch,
      checkedVariableIds,
      setCheckedVariableIds,
    };
  }, [
    setting,
    variables,
    collections,
    commits,
    variableAliases,
    resolvedVariableValues,
    enableGitHubSync,
    setEnableGitHubSync,
    groupedChanges,
    tab,
    setTab,
    getCollectionName,
    compiledVariables,
    selectedCommitId,
    setSelectedCommitId,
    clearCompiledVariables,
    selection,
    setSelection,
    clipboard,
    setClipboard,
    cmdkOpen,
    setCMDKOpen,
    search,
    setSearch,
    checkedVariableIds,
    setCheckedVariableIds,
  ]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
