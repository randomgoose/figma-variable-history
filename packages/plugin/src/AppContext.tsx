import { createContext, useMemo, useState, ReactNode, useEffect } from 'react';

import type { ICommit, PluginSetting } from './types';
import { getVariableChangesGroupedByCollection } from './utils/variable';

interface AppContext {
  setting: PluginSetting;
  colorFormat: 'RGB' | 'HEX';
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
  tab: 'changes' | 'commits' | 'settings';
  compiledVariables: { css: string };
  selectedCommitId: string;
  setColorFormat: (format: AppContext['colorFormat']) => void;
  setTab: (tab: AppContext['tab']) => void;
  getCollectionName: (collectionId: string) => string;
  setSelectedCommitId: (id: string) => void;
  clearCompiledVariables: () => void;
}

export const AppContext = createContext<AppContext>({
  setting: { syncTasks: [] },
  colorFormat: 'HEX',
  variables: [],
  collections: [],
  commits: [],
  variableAliases: {},
  resolvedVariableValues: {},
  groupedChanges: {},
  tab: 'changes',
  compiledVariables: { css: '' },
  selectedCommitId: '',
  getCollectionName: () => '',
  setSelectedCommitId: () => null,
  setTab: () => null,
  setColorFormat: () => null,
  clearCompiledVariables: () => null,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<PluginSetting>({ syncTasks: [] });
  const [colorFormat, setColorFormat] = useState<AppContext['colorFormat']>('HEX');
  const [variables, setVariables] = useState<AppContext['variables']>([]);
  const [collections, setCollections] = useState<AppContext['collections']>([]);
  const [commits, setCommits] = useState<AppContext['commits']>([]);
  const [variableAliases, setVariableAliases] = useState<AppContext['variableAliases']>({});
  const [resolvedVariableValues, setResolvedVariableValues] = useState<
    AppContext['resolvedVariableValues']
  >({});
  const [enableGitHubSync, setEnableGitHubSync] = useState<boolean>(false);
  const [tab, setTab] = useState<AppContext['tab']>('changes');
  const [compiledVariables, setCompiledVariables] = useState<{ css: string }>({ css: '' });
  const [selectedCommitId, setSelectedCommitId] = useState<string>('');

  const groupedChanges = useMemo(() => {
    return getVariableChangesGroupedByCollection({
      prev: {
        variables: commits[0] ? commits[0].variables : [],
        collections: commits[0] ? commits[0].collections : [],
      },
      current: { variables, collections },
    });
  }, [commits, variables]);

  useEffect(() => {
    onmessage = async (e) => {
      const { type, payload } = e.data.pluginMessage;

      switch (type) {
        case 'IMPORT_VARIABLES':
          setVariables(payload.variables);
          setCollections(payload.collections);
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
      colorFormat,
      variables,
      collections,
      commits,
      variableAliases,
      resolvedVariableValues,
      groupedChanges,
      tab,
      setTab,
      setColorFormat: (format) => (format === 'HEX' || format === 'RGB') && setColorFormat(format),
      getCollectionName,
      compiledVariables,
      selectedCommitId,
      setSelectedCommitId,
      clearCompiledVariables: () => setCompiledVariables({ css: '' }),
    };
  }, [
    setting,
    colorFormat,
    variables,
    collections,
    commits,
    variableAliases,
    resolvedVariableValues,
    enableGitHubSync,
    setEnableGitHubSync,
    setColorFormat,
    groupedChanges,
    tab,
    setTab,
    getCollectionName,
    compiledVariables,
    selectedCommitId,
    setSelectedCommitId,
    clearCompiledVariables,
  ]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
