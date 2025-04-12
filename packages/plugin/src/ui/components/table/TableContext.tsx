import {
  getGroupedRowModel,
  getCoreRowModel,
  getExpandedRowModel,
  RowSelectionState,
  useReactTable,
  createColumnHelper,
  GroupingState,
  Table,
} from '@tanstack/react-table';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { VariableIcon } from '../VariableIcon';
import { MESSAGE_TYPE, sendMessage, } from '../../../utils/message';
import { AppContext } from '../../../AppContext';
import { IconPlus } from '@tabler/icons-react';
import clsx from 'clsx';
import { Popover, Tabs } from 'radix-ui';
import { EditableColorCell } from './EditableColorCell';
import { EditableNumberCell } from './EditableNumberCell';
import { EditableStringCell } from './EditableStringCell';
import { VariableDetailPanel } from '../VariableDetailPanel';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { useVariableManager } from '../../../hooks/useVariableManager';
import { ModeNameCell } from './ModeNameCell';

interface TableContextType {
  selectedCells: { rowId: string; columnId: string }[];
  setSelectedCells: (cells: { rowId: string; columnId: string }[]) => void;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  table: Table<any>;
  currentCollection: VariableCollection | undefined;
  selectedGroupPath: string | null;
  setSelectedGroupPath: (path: string | null) => void;
  inputIndexRef: React.MutableRefObject<string | null> | null;
  filter: null | 'no_description' | 'no_code_syntax';
  setFilter: (filter: null | 'no_description' | 'no_code_syntax') => void;
  duplicateVariables: (ids: string[]) => Promise<string[]>;
  createVariable: (type: VariableResolvedDataType) => Promise<string>;
}

export const TableContext = createContext<TableContextType>({
  selectedCells: [] as { rowId: string; columnId: string }[],
  setSelectedCells: () => null,
  rowSelection: {} as RowSelectionState,
  setRowSelection: () => null,
  table: {} as Table<any>,
  currentCollection: undefined,
  selectedGroupPath: null,
  setSelectedGroupPath: () => null,
  inputIndexRef: null,
  filter: null,
  setFilter: () => null,
  duplicateVariables: () => Promise.resolve([]),
  createVariable: () => Promise.resolve(''),
});

export const TableContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [grouping, setGrouping] = useState<GroupingState>(['name']);
  const [selectedCells, setSelectedCells] = useState<{ rowId: string; columnId: string }[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { currentCollectionId, collections, variables } = useContext(AppContext);
  const [selectedGroupPath, setSelectedGroupPath] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<{
    alias: string;
    type: VariableResolvedDataType;
  } | null>(null);
  const [filter, setFilter] = useState<null | 'no_description' | 'no_code_syntax'>(null);
  const variableManager = useVariableManager();

  const copyVariableAlias = () => {
    const row = table.getRowModel().rows.find((r) => r.id === selectedCells[0].rowId);
    const variable = row?.original;
    const collection = collections.find((c) => c.id === currentCollectionId);

    const mode = collection?.modes.find((m) => m.name === selectedCells[0].columnId);
    const modeId = mode?.modeId;

    if (modeId) {
      const value = variable.valuesByMode[modeId];
      setClipboard({
        alias: value,
        type: variable.resolvedType,
      });
    }
  };

  const pasteVariableAlias = () => {
    if (clipboard) {
      const selectedCell = selectedCells[0];
      const row = table.getRowModel().rows.find((r) => r.id === selectedCell.rowId);
      const variable = row?.original;

      if (variable.resolvedType === clipboard.type) {
        const collection = collections.find((c) => c.id === currentCollectionId);
        const mode = collection?.modes.find((m) => m.name === selectedCell.columnId);
        const modeId = mode?.modeId;

        if (modeId) {
          variableManager.updateVariable(variable.id, {
            valuesByMode: {
              ...variable.valuesByMode,
              [modeId]: clipboard.alias,
            },
          });
        }
      } else {
        toast('Wrong type');
      }
    }
  };

  useHotkeys('meta+c', copyVariableAlias);
  useHotkeys('meta+v', pasteVariableAlias);

  const createVariable = async (type: VariableResolvedDataType): Promise<string> => {
    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        const { type: messageType, payload } = event.data.pluginMessage;
        if (messageType === MESSAGE_TYPE.SELECT_VARIABLE_ROWS) {
          setRowSelection(
            payload.reduce(
              (acc: Record<string, boolean>, id: string) => ({ ...acc, [id]: true }),
              {}
            )
          );
          inputIndexRef.current = `${payload[0]}-name`;

          window.removeEventListener('message', handler);
          resolve(payload.variableId);
        }
      };

      window.addEventListener('message', handler);

      sendMessage(MESSAGE_TYPE.CREATE_VARIABLE, {
        collectionId: currentCollection?.id || '',
        type,
      });
    });
  };

  const duplicateVariables = async (ids: string[]): Promise<string[]> => {
    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        const { type: messageType, payload } = event.data.pluginMessage;
        if (messageType === MESSAGE_TYPE.SELECT_VARIABLE_ROWS) {
          setRowSelection(
            payload.reduce(
              (acc: Record<string, boolean>, id: string) => ({ ...acc, [id]: true }),
              {}
            )
          );
          inputIndexRef.current = `${payload[0]}-name`;
          window.removeEventListener('message', handler);
          resolve(payload);
        }
      };

      window.addEventListener('message', handler);
      sendMessage(MESSAGE_TYPE.DUPLICATE_VARIABLES, ids);
    });
  };

  useHotkeys('shift+enter', () => {
    if (rowSelection) {
      const ids = Object.keys(rowSelection).map((id) => {
        const row = table.getRow(id);
        return row.original.id;
      });

      duplicateVariables(ids);
    }
  });

  const filteredVariables = useMemo(() => {
    const data = variables.filter((v) => v.variableCollectionId === currentCollectionId);

    const groupedData = selectedGroupPath
      ? data.filter((v) => v.name.startsWith(selectedGroupPath + '/'))
      : data;

    const filteredData = filter
      ? groupedData.filter((v) => {
        if (filter === 'no_description') return !v.description;
        if (filter === 'no_code_syntax') return Object.keys(v.codeSyntax).length === 0;
        return true;
      })
      : groupedData;

    // Sort variables so ungrouped ones (no '/' in name) come first
    return filteredData.sort((a, b) => {
      const aHasGroup = a.name.includes('/');
      const bHasGroup = b.name.includes('/');

      if (!aHasGroup && bHasGroup) return -1;
      if (aHasGroup && !bHasGroup) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [variables, currentCollectionId, selectedGroupPath, filter]);

  const currentCollection = useMemo(() => {
    return collections.find((c) => c.id === currentCollectionId);
  }, [currentCollectionId, collections]);

  const columnHelper = createColumnHelper<any>();
  const inputIndexRef = useRef<string | null>(null);

  const handleFocus = useCallback((rowId: string, columnId: string, inputIndex: number) => {
    inputIndexRef.current = `${rowId}-${columnId}-${inputIndex}`;
    setRowSelection({ [rowId]: true });
    setSelectedCells([{ rowId, columnId }]);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.group({
        header: () => (
          <div className="flex items-center gap-2 px-2 pr-1 h-full group truncate">Name</div>
        ),
        id: 'name',
        cell: ({ row }) => {
          const name = row.original.name;
          const lastSlashIndex = name.lastIndexOf('/');
          const value = lastSlashIndex !== -1 ? name.substring(lastSlashIndex + 1) : name;
          const inputRef = useRef<HTMLInputElement>(null);

          useEffect(() => {
            if (inputRef.current) {
              inputRef.current.value = row.original.name.substring(
                row.original.name.lastIndexOf('/') + 1
              );
            }
          }, [row.original.name]);

          return (
            <div className="flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate">
              <VariableIcon resolvedType={row.original.resolvedType} />
              {inputIndexRef.current !== `${row.id}-name` ? (
                <div>{value}</div>
              ) : (
                <input
                  ref={inputRef}
                  autoFocus={inputIndexRef.current === `${row.id}-name`}
                  tabIndex={0}
                  className="w-full h-full font-medium text-[11px] bg-transparent"
                  defaultValue={value}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                      inputIndexRef.current = null;
                    }
                  }}
                  onFocus={(e) => {
                    e.target.select();
                    setSelectedCells([{ rowId: row.id, columnId: 'name' }]);
                    setRowSelection({ [row.id]: true });
                    inputIndexRef.current = `${row.id}-name`;
                  }}
                  type="text"
                  onBlur={(e) => {
                    const prefix = name.substring(0, name.lastIndexOf('/'));
                    inputIndexRef.current = null;
                    variableManager.updateVariable(row.original.id, {
                      name: prefix + (prefix ? '/' : '') + e.target.value,
                    });
                  }}
                />
              )}
            </div>
          );
        },
        enableGrouping: true,
        getGroupingValue: (row) => {
          const name = row.name;
          const parts = name.split('/');
          if (row._groupingValue && parts.length > 1) {
            const currentGroupIndex = parts.indexOf(row._groupingValue);
            if (currentGroupIndex < parts.length - 2) {
              return parts.slice(0, currentGroupIndex + 2).join('/');
            }
          }
          return parts.slice(0, parts.length - 1).join('/');
        },
      }),
      ...(currentCollection?.modes?.map((m) =>
        columnHelper.accessor(m.name, {
          header: () => <ModeNameCell collection={currentCollection} mode={m} />,
          cell: ({ row }) => {
            const type = row.original.resolvedType;
            switch (type) {
              case 'COLOR':
                return (
                  <EditableColorCell
                    key={`${row.id}-${m.modeId}`}
                    variable={row.original}
                    modeId={m.modeId}
                    rowId={row.id}
                    columnId={m.name}
                    inputIndexRef={inputIndexRef}
                    onFocus={(inputIndex: number) => {
                      handleFocus(row.id, m.name, inputIndex);
                    }}
                  />
                );
              case 'FLOAT':
                return (
                  <EditableNumberCell
                    key={`${row.id}-${m.name}`}
                    variable={row.original}
                    modeId={m.modeId}
                    rowId={row.id}
                    columnId={m.name}
                    inputIndexRef={inputIndexRef}
                    onFocus={(inputIndex: number) => {
                      handleFocus(row.id, m.name, inputIndex);
                    }}
                  />
                );
              case 'STRING':
                return (
                  <EditableStringCell
                    key={`${row.id}-${m.name}`}
                    variable={row.original}
                    modeId={m.modeId}
                    rowId={row.id}
                    columnId={m.name}
                    inputIndexRef={inputIndexRef}
                    onFocus={() => {
                      handleFocus(row.id, m.name, 0);
                    }}

                  // onFocus={(inputIndex: number) => {
                  //   handleFocus(row.id, m.name, inputIndex);
                  // }}
                  />
                );
              default:
                return <div>{type}</div>;
            }
          },
        })
      ) ?? []),
      columnHelper.display({
        header: () => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentCollection) {
                variableManager.addMode(currentCollection.id, 'New Mode');
              }
            }}
            className="btn-icon"
          >
            <IconPlus size={16} strokeWidth={1.5} />
          </button>
        ),
        id: 'action',
        cell: ({ row }) => {
          const { modes } = useContext(AppContext);

          return (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  tabIndex={0}
                  className={clsx(
                    'btn-icon group-hover/row:opacity-100 rounded-[5px] focus:outline focus:outline-[var(--figma-color-border-selected-strong)] focus:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-[var(--figma-color-bg-brand-tertiary)] data-[state=open]:text-[var(--figma-color-text-selected)]',
                    row.getIsSelected() ? 'opacity-100' : 'opacity-0'
                  )}
                  autoFocus={selectedCells.some(
                    (sel) => sel.rowId === row.id && sel.columnId === 'action'
                  )}
                  onFocus={() => {
                    inputIndexRef.current = `${row.id}-action`;
                    setSelectedCells([{ rowId: row.id, columnId: 'action' }]);
                  }}
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M7 4.5a.5.5 0 0 1 1 0V12l-.002.05a2.5 2.5 0 0 1 0 4.9L8 17v2.5a.5.5 0 0 1-1 0V17l.002-.05a2.5 2.5 0 0 1 0-4.9L7 12zm2 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m7 5a.5.5 0 0 0 1 0V12l-.002-.05a2.5 2.5 0 0 0 0-4.9L17 7V4.5a.5.5 0 0 0-1 0V7l.002.05a2.5 2.5 0 0 0 0 4.9L16 12zm2-10a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="panel z-[100] w-[280px]" align="end">
                  <Tabs.Root defaultValue="details">
                    <Tabs.List className="tabs-list border-b border-[var(--figma-color-border)]">
                      <Tabs.Trigger className="tabs-trigger" value="details">
                        Details
                      </Tabs.Trigger>
                      <Tabs.Trigger className="tabs-trigger" value="scope">
                        Scope
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content className="tabs-content" value="details">
                      <VariableDetailPanel variable={row.original} />
                    </Tabs.Content>
                    <Tabs.Content className="tabs-content" value="scope">
                      <div>Scope</div>
                    </Tabs.Content>
                  </Tabs.Root>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          );
        },
      }),
    ],
    [currentCollection]
  );

  const table = useReactTable({
    data: filteredVariables,
    columns,
    state: {
      grouping,
      expanded: true,
      rowSelection,
    },
    enableRowSelection: true,
    onGroupingChange: setGrouping,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    groupedColumnMode: 'reorder',
    getRowId: (row) => row.id,
  });

  return (
    <TableContext.Provider
      value={{
        selectedCells,
        setSelectedCells,
        rowSelection,
        setRowSelection,
        table,
        currentCollection,
        selectedGroupPath,
        setSelectedGroupPath,
        inputIndexRef,
        filter,
        setFilter,
        duplicateVariables,
        createVariable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};
