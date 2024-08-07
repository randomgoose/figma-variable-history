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
  setColorFormat: (format: AppContext['colorFormat']) => void;
  tab: 'changes' | 'commits' | 'settings';
  setTab: (tab: AppContext['tab']) => void;
}

export const AppContext = createContext<AppContext>({
  setting: {},
  colorFormat: 'HEX',
  variables: [],
  collections: [],
  commits: [],
  variableAliases: {},
  resolvedVariableValues: {},
  groupedChanges: {},
  setColorFormat: () => null,
  tab: 'changes',
  setTab: () => null,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<PluginSetting>({});
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
      }
    };
  }, []);

  const context = useMemo<AppContext>(() => {
    return {
      setting,
      colorFormat,
      variables,
      collections,
      commits,
      variableAliases,
      resolvedVariableValues,
      setColorFormat: (format) => (format === 'HEX' || format === 'RGB') && setColorFormat(format),
      groupedChanges,
      tab,
      setTab,
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
  ]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
