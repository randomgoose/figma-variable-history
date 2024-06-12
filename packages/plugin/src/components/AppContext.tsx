// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createContext, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import { ReactNode } from 'preact/compat';
import {
  ICommit,
  ImportLocalCommitsHandler,
  ImportVariablesHandler,
  SetResolvedVariableValueHandler,
  SetVariableAliasHandler,
} from '../types';
import { on } from '@create-figma-plugin/utilities';

interface AppContext {
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
  colorFormat: 'HEX',
  variables: [],
  collections: [],
  commits: [],
  variableAliases: {},
  resolvedVariableValues: {},
  setColorFormat: () => null,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
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

  on<SetResolvedVariableValueHandler>(
    'SET_RESOLVED_VARIABLE_VALUE',
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

  const context = useMemo<AppContext>(() => {
    return {
      colorFormat,
      variables,
      collections,
      commits,
      variableAliases,
      resolvedVariableValues,
      setColorFormat: (format) => (format === 'HEX' || format === 'RGB') && setColorFormat(format),
    };
  }, [colorFormat, variables, collections, commits, variableAliases, resolvedVariableValues]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
