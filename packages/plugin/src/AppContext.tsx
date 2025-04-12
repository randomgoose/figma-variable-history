import { createContext, useMemo, useState, ReactNode, useEffect, useCallback } from 'react';

import type { ICommit, PluginSetting } from './types';
import { getVariableChangesGroupedByCollection } from './utils/variable';
import { ClipboardItem } from './types/clipboard';
import { MESSAGE_TYPE, sendMessage } from './utils/message';
import { useHotkeys } from 'react-hotkeys-hook';

interface AppContext {
  setting: PluginSetting;
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;
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
  teamLibraries: {
    [key: string]: { variables: Variable[]; variableCollections: VariableCollection[] };
  };
  setTeamLibraries: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { variables: Variable[]; variableCollections: VariableCollection[] };
    }>
  >;
  currentCollectionId: string | null;
  setCurrentCollectionId: React.Dispatch<React.SetStateAction<string | null>>;
  modes: Record<string, string>;
  invalidateResolvedVariableValue: (variableId: string, modeId: string) => void;
}

export const AppContext = createContext<AppContext>({
  setting: { syncTasks: [], colorFormat: 'RGB' },
  variables: [],
  setVariables: () => null,
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
  teamLibraries: {},
  setTeamLibraries: () => null,
  currentCollectionId: null,
  setCurrentCollectionId: () => null,
  modes: {},
  invalidateResolvedVariableValue: () => null,
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
  const [teamLibraries, setTeamLibraries] = useState<AppContext['teamLibraries']>({});
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);

  const invalidateResolvedVariableValue = useCallback((variableId: string, modeId: string) => {
    setResolvedVariableValues((prev) => {
      const newValues = { ...prev };
      delete newValues[variableId]?.valuesByMode[modeId];
      return newValues;
    });

    sendMessage(MESSAGE_TYPE.RESOLVE_VARIABLE_VALUE, {
      id: variableId,
      modeId,
    });
  }, []);

  // The plugin gets initialized when the plugin:
  // 1. receives the message from the plugin
  // 2. check all changed variables
  const [initialized, setInitialized] = useState<boolean>(false);

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
    if (!initialized && Object.values(groupedChanges).length > 0) {
      setCheckedVariableIds(
        Object.values(groupedChanges)
          .flatMap(({ added, modified, removed }) => [...added, ...modified, ...removed])
          .map((v: Variable) => v.id)
      );
      setInitialized(true);
    }
  }, [groupedChanges, initialized]);

  const [cmdkOpen, setCMDKOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  useHotkeys('meta+z', () => {
    sendMessage(MESSAGE_TYPE.UNDO);
  });

  useEffect(() => {
    onmessage = async (e) => {
      const { type, payload } = e.data.pluginMessage;

      switch (type) {
        case 'IMPORT_VARIABLES':
          setVariables((prevVariables) => {
            // Create maps for faster lookup
            const prevVariableMap = new Map(prevVariables.map((v) => [v.id, v]));

            // Check for changes: modifications, additions, or removals
            const hasChanges =
              prevVariables.length !== payload.variables.length || // Different length means changes
              payload.variables.some((v: Variable) => {
                const prevVar = prevVariableMap.get(v.id);
                return !prevVar || JSON.stringify(prevVar) !== JSON.stringify(v);
              });

            return hasChanges ? payload.variables : prevVariables;
          });

          setCollections((prevCollections) => {
            // Create maps for faster lookup
            const prevCollectionMap = new Map(prevCollections.map((c) => [c.id, c]));

            // Check for changes: modifications, additions, or removals
            const hasChanges =
              prevCollections.length !== payload.collections.length || // Different length means changes
              payload.collections.some((c: VariableCollection) => {
                const prevCol = prevCollectionMap.get(c.id);
                return !prevCol || JSON.stringify(prevCol) !== JSON.stringify(c);
              });

            return hasChanges ? payload.collections : prevCollections;
          });
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
          setVariableAliases((prev) => ({ ...prev, ...payload }));
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
        case MESSAGE_TYPE.IMPORT_TEAM_LIBRARIES:
          setTeamLibraries(payload);
          break;
        case MESSAGE_TYPE.APPEND_VARIABLE_COLLECTION:
          setCollections((prevCollections) => [...prevCollections, payload]);
          setCurrentCollectionId(payload.id);
          break;
        case MESSAGE_TYPE.IMPORT_COLLECTIONS_AND_VARIABLES_IN_TEAM_LIBRARY:
          setTeamLibraries((prev) => ({
            ...prev,
            [payload.name]: {
              variables: payload.variables,
              variableCollections: payload.collections,
            },
          }));
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

  const modes = useMemo(() => {
    return Object.fromEntries(
      collections.flatMap((collection) => collection.modes.map((mode) => [mode.modeId, mode.name]))
    );
  }, [collections]);

  const context = useMemo<AppContext>(() => {
    return {
      setting,
      variables,
      setVariables,
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
      teamLibraries,
      setTeamLibraries,
      currentCollectionId,
      setCurrentCollectionId,
      modes,
      invalidateResolvedVariableValue,
    };
  }, [
    setting,
    variables,
    setVariables,
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
    teamLibraries,
    setTeamLibraries,
    currentCollectionId,
    setCurrentCollectionId,
    modes,
    invalidateResolvedVariableValue,
  ]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
