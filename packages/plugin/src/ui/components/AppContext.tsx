// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createContext, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ReactNode } from 'preact/compat';
import { on } from '@create-figma-plugin/utilities';

import type {
  ICommit,
  ImportLocalCommitsHandler,
  ImportVariablesHandler,
  PluginSetting,
  PluginSettingHandler,
  ResolveVariableValueDoneHandler,
  SetVariableAliasHandler,
} from '../../types';

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
  setColorFormat: (format: AppContext['colorFormat']) => void;
}

export const AppContext = createContext<AppContext>({
  setting: {},
  colorFormat: 'HEX',
  variables: [],
  collections: [],
  commits: [],
  variableAliases: {},
  resolvedVariableValues: {},
  setColorFormat: () => null,
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

  on<ImportVariablesHandler>('IMPORT_VARIABLES', ({ variables, collections }) => {
    setVariables(variables);
    setCollections(collections);
  });

  on<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', (commits) => {
    setCommits(commits);
  });

  on<ResolveVariableValueDoneHandler>(
    'RESOLVE_VARIABLE_VALUE_DONE',
    ({ id, modeId, value, resolvedType }) => {
      setResolvedVariableValues({
        ...resolvedVariableValues,
        [id]: {
          valuesByMode: {
            ...resolvedVariableValues[id]?.valuesByMode,
            [modeId]: { value, resolvedType },
          },
        },
      });
    }
  );

  on<SetVariableAliasHandler>('SET_VARIABLE_ALIAS', ({ id, name }) => {
    setVariableAliases({ ...variableAliases, [id]: name });
  });

  on<PluginSettingHandler>('PLUGIN_SETTING', (data) => setSetting(data));

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
    };
  }, [
    setting,
    colorFormat,
    variables,
    collections,
    commits,
    variableAliases,
    resolvedVariableValues,
  ]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
