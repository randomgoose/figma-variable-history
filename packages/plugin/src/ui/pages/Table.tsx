import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../AppContext';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, MessageSquarePlus } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  GroupingState,
  flexRender,
  createColumnHelper,
  getExpandedRowModel,
  RowSelectionState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { VariableIcon } from '../components';
import { MESSAGE_TYPE } from '../../utils/message';
import { sendMessage } from '../../utils/message';
import { IconAlertTriangleFilled, IconPlus } from '@tabler/icons-react';

type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
};

export function Table() {
  const { variables, collections, setTab } = useContext(AppContext);
  const [collectionId, setCollectionId] = useState<string | undefined>(collections?.[0]?.id);
  const currentCollection = collections.find((c) => c.id === collectionId);

  const columnHelper = createColumnHelper<any>();

  // Initialize collectionId if there are collections
  useEffect(() => {
    if (collections.length > 0 && !collectionId) {
      setCollectionId(collections[0]?.id);
    }
  }, [collections]);

  const columns = useMemo(
    () => [
      columnHelper.group({
        header: 'Name',
        id: 'name',
        cell: ({ row }) => {
          const name = row.original.name;
          const lastSlashIndex = name.lastIndexOf('/');
          return (
            <div className="flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate hover:bg-red-500">
              <VariableIcon resolvedType="COLOR" />
              {lastSlashIndex !== -1 ? name.substring(lastSlashIndex + 1) : name}
              <button className="btn-icon group-hover:opacity-100 opacity-0 ml-auto">
                <MessageSquarePlus size={12} />
              </button>
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
          header: m.name,
          cell: ({ cell }) => {
            return cell.getValue();
          },
        })
      ) ?? []),
      columnHelper.display({
        header: () => (
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="btn-icon"
          >
            <IconPlus size={16} strokeWidth={1.5} />
          </button>
        ),
        id: 'action',
        // cell: () => <button className='btn-icon'><IconPlus /></button>
      }),
    ],
    [currentCollection]
  );

  const [grouping, setGrouping] = useState<GroupingState>(['name']);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [selectedGroupPath, setSelectedGroupPath] = useState<string | null>(null);

  const data = useMemo(() => {
    const filteredData = variables.filter((v) => v.variableCollectionId === collectionId);
    if (selectedGroupPath) {
      return filteredData.filter((v) => v.name.startsWith(selectedGroupPath + '/'));
    }
    return filteredData;
  }, [variables, collectionId, selectedGroupPath]);

  const table = useReactTable({
    data,
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
  });

  const handleRowClick = (row: any, event: React.MouseEvent) => {
    if (!row.getIsGrouped()) {
      const rowIndex = row.index;

      if (event.shiftKey && lastSelectedIndex !== null) {
        // Shift key: select range
        const start = Math.min(lastSelectedIndex, rowIndex);
        const end = Math.max(lastSelectedIndex, rowIndex);

        const newSelection: RowSelectionState = {};
        for (let i = start; i <= end; i++) {
          newSelection[table.getRowModel().rows[i].id] = true;
        }
        setRowSelection(newSelection);
      } else {
        // Normal click: select single row
        const newSelection: RowSelectionState = {
          [row.id]: true,
        };
        setRowSelection(newSelection);
        setLastSelectedIndex(rowIndex);
      }
    }
  };

  const buildGroupTree = useMemo(() => {
    const tree: TreeNode[] = [];

    // Get all unique group paths from all variables in this collection
    const allPaths = variables
      .filter((v) => v.variableCollectionId === collectionId)
      .map((v) => {
        const parts = v.name.split('/');
        return parts.slice(0, -1).join('/'); // Exclude the variable name itself
      })
      .filter((path): path is string => path.length > 0) // Remove empty paths
      .filter((path, index, self) => self.indexOf(path) === index); // Get unique paths

    // Build tree structure
    allPaths.forEach((path) => {
      let currentLevel = tree;
      const parts = path.split('/');

      let currentPath = '';
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        let existingNode = currentLevel.find((n) => n.name === part);

        if (!existingNode) {
          existingNode = {
            name: part,
            path: currentPath,
            children: [],
          };
          currentLevel.push(existingNode);
        }
        currentLevel = existingNode.children;
      });
    });

    return tree;
  }, [variables, collectionId]);

  const TreeItem = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(node.name);

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
    };

    const handleBlur = () => {
      setIsEditing(false);
      setEditValue(node.name); // Reset to original value
      sendMessage(MESSAGE_TYPE.UPDATE_VARIABLE_GROUP, {
        collectionId,
        source: node.name,
        target: editValue,
        slice: depth,
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        setIsEditing(false);
        // TODO: Add logic to update the node name
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setEditValue(node.name);
      }
    };

    return (
      <div>
        <button
          className={clsx(
            'w-full text-left h-8 flex items-center px-2 py-1 text-[11px] hover:bg-[var(--figma-color-bg-hover)] cursor-default',
            'flex items-center gap-1',
            selectedGroupPath === node.path && 'bg-[var(--figma-color-bg-secondary)] font-semibold'
          )}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          onClick={() => {
            setSelectedGroupPath(node.path);
          }}
          onDoubleClick={handleDoubleClick}
        >
          {isEditing ? (
            <input
              className="rounded px-1 w-full focus:outline-none"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-[var(--figma-color-text)]">{node.name}</span>
          )}
        </button>
        {node.children.map((child) => (
          <TreeItem key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex" style={{ height: 'calc(100vh - 40px)' }}>
      <aside className="w-[200px] shrink-0 border-r border-[var(--figma-color-border)] flex flex-col">
        <div className="p-2">
          <Select.Root
            value={collectionId}
            onValueChange={(value) => {
              setCollectionId(value);
              setTab('editor');
            }}
          >
            <Select.Trigger className="w-full h-6 pl-2 pr-1 border border-[var(--figma-color-border)] rounded-[5px] flex items-center justify-between">
              <Select.Value placeholder="Select Collection" />
              <Select.Icon>
                <ChevronDown size={12} strokeWidth={1} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="dropdown-content w-44">
                <Select.Viewport>
                  {collections?.map((c) => (
                    <Select.Item className="dropdown-item" key={c.id} value={c.id}>
                      <Select.ItemText>{c.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <button
          className={clsx(
            'w-full mb-1 text-left h-10 flex items-center px-4 py-1 text-xs hover:bg-[var(--figma-color-bg-hover)] border-y border-[var(--figma-color-border)]',
            selectedGroupPath === null && 'bg-[var(--figma-color-bg-secondary)] font-semibold'
          )}
          onClick={() => setSelectedGroupPath(null)}
        >
          All variables{' '}
          <span className="text-[var(--figma-color-text-secondary)] ml-auto font-normal">
            {variables.filter((v) => v.variableCollectionId === collectionId)?.length}
          </span>
        </button>

        <div className="flex-1 overflow-auto">
          {buildGroupTree.map((node) => (
            <TreeItem key={node.path} node={node} />
          ))}
        </div>
      </aside>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="border-collapse">
            <thead className="sticky top-0 bg-[var(--figma-color-background)] h-10 z-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-[var(--figma-color-bg)]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={clsx(
                        'text-left p-2 font-semibold text-[11px] px-4 table-border',
                        header.column.id === 'name' &&
                          'sticky z-10 left-0 bg-[var(--figma-color-bg)]'
                      )}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={clsx(
                    'border-[var(--figma-color-border)]',
                    row.getIsSelected() && 'bg-[var(--figma-color-bg-selected)]',
                    !row.getIsGrouped() ? '' : 'border-b'
                  )}
                  onClick={(e) => handleRowClick(row, e)}
                >
                  {row.getIsGrouped() ? (
                    <td
                      colSpan={row.getVisibleCells().length}
                      className="sticky inline-block w-full left-0 bg-[var(--figma-color-background)] font-medium p-2 pl-4 text-xs pt-8 h-14"
                    >
                      {(row.groupingValue as string).split('/').map((part, index) => {
                        const isLast =
                          index === (row.groupingValue as string).split('/').length - 1;
                        return (
                          <span
                            key={part}
                            className={clsx(
                              isLast
                                ? 'text-[var(--figma-color-text)] font-semibold'
                                : 'text-[var(--figma-color-text-secondary)]'
                            )}
                          >
                            {part} {isLast ? '' : '/ '}
                          </span>
                        );
                      })}
                    </td>
                  ) : (
                    row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={clsx(
                          'p-0 h-10 text-xs table-border',
                          cell.column.id === 'name' && 'sticky z-10 left-0'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-10 border-t flex items-center justify-between p-3 pr-2">
          <button>Create Variable</button>

          <button className="btn-outline flex gap-1">
            <IconAlertTriangleFilled className="text-yellow-500" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
