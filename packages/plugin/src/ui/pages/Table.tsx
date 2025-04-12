import { useContext } from 'react';
import { flexRender, RowSelectionState } from '@tanstack/react-table';
import clsx from 'clsx';
import { UsabilitySuggestions } from '../components/table/UsabilitySuggestions';
import { TableContext } from '../components/table/TableContext';
import { ContextMenu } from 'radix-ui';
import { VariableCreationMenu } from '../components/VariableCreationMenu';
import { Plus } from 'lucide-react';
import { variableManager } from '../../utils/message';
export function Table() {
  const {
    selectedCells,
    table,
    setRowSelection,
    rowSelection,
    inputIndexRef,
    setSelectedCells,
    duplicateVariables,
  } = useContext(TableContext);

  return (
    <div className="flex flex-col w-[calc(100%-200px)]">
      <div className="flex-1 overflow-auto">
        <table className="border-collapse">
          <thead className="sticky top-0 bg-[var(--figma-color-background)] h-10 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[var(--figma-color-bg)]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={clsx(
                      'bg-[var(--figma-color-bg)] text-left p-2 font-semibold table-border',
                      header.column.id === 'name' &&
                        'sticky left-0 bg-[var(--figma-color-bg)] z-10',
                      header.column.id === 'action' &&
                        'sticky right-0 w-10 p-0 table-border after:border-l',
                      header.column.id !== 'action' && header.column.id !== 'name' && 'px-2'
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const tr =
                row.groupingValue === '' ? null : (
                  <tr
                    data-row-id={row.id}
                    className={clsx(
                      'border-[var(--figma-color-border)] group/row select-none',
                      !row.getIsGrouped() ? '' : 'border-b'
                    )}
                    onContextMenu={() => {
                      if (!rowSelection[row.id]) {
                        setRowSelection({ [row.id]: true });
                      }
                    }}
                    onClick={(e) => {
                      if (!row.getIsGrouped()) {
                        if (e.shiftKey) {
                          // Find the last selected row
                          const selectedRowIds = Object.entries(rowSelection)
                            .filter(([, selected]) => selected)
                            .map(([id]) => id);

                          if (selectedRowIds.length === 0) {
                            setRowSelection({ [row.id]: true });
                            return;
                          }

                          const lastSelectedId = selectedRowIds[selectedRowIds.length - 1];

                          // Get all non-grouped rows
                          const nonGroupedRows = table
                            .getRowModel()
                            .rows.filter((row) => !row.getIsGrouped());
                          const rowIndexMap = new Map(
                            nonGroupedRows.map((row, index) => [row.id, index])
                          );

                          const startIdx = rowIndexMap.get(lastSelectedId)!;
                          const endIdx = rowIndexMap.get(row.id)!;

                          const newSelection: RowSelectionState = {};
                          // Keep existing selection
                          Object.entries(rowSelection).forEach(([id, selected]) => {
                            if (selected) newSelection[id] = true;
                          });

                          // Add new selection range
                          const [minIdx, maxIdx] = [
                            Math.min(startIdx, endIdx),
                            Math.max(startIdx, endIdx),
                          ];
                          for (let i = minIdx; i <= maxIdx; i++) {
                            newSelection[nonGroupedRows[i].id] = true;
                          }

                          setRowSelection(newSelection);
                        } else {
                          setRowSelection({ [row.id]: true });
                        }
                      }
                    }}
                  >
                    {row.getIsGrouped() ? (
                      <td
                        colSpan={row.getVisibleCells().length}
                        className="sticky group left-0 inline-block w-full bg-[var(--figma-color-background)] font-medium p-2 pl-4 text-xs pt-8 h-14 focus:cell-focus"
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
                      row.getVisibleCells().map((cell, index) => {
                        return (
                          <td
                            tabIndex={-1}
                            key={cell.id}
                            onClick={() => {
                              setSelectedCells([{ rowId: row.id, columnId: cell.column.id }]);
                            }}
                            onDoubleClick={() => {
                              if (cell.column.id === 'name') {
                                setSelectedCells([{ rowId: row.id, columnId: cell.column.id }]);
                                setRowSelection({ [row.id]: true });
                                inputIndexRef && (inputIndexRef.current = `${row.id}-name`);
                              }
                            }}
                            className={clsx(
                              'p-0 h-10 text-xs table-border min-w-[200px]',
                              selectedCells.some(
                                (sel) => sel.rowId === row.id && sel.columnId === cell.column.id
                              ) && 'cell-focus',
                              row.getIsSelected() && 'bg-[var(--figma-color-bg-selected)]',
                              cell.column.id === 'name' &&
                                'sticky left-0 z-10 bg-[var(--figma-color-bg)] min-w-0',
                              cell.column.id === 'action' &&
                                'sticky right-0 w-10 table-border after:border-l bg-[var(--figma-color-bg)]',
                              cell.row.id === selectedCells[0]?.rowId &&
                                cell.column.id === selectedCells[0]?.columnId &&
                                'cell-focus',
                              cell.column.id === 'action' &&
                                'flex items-center justify-center min-w-[40px]',
                              index === row.getVisibleCells().length - 2 && 'w-full'
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })
                    )}
                  </tr>
                );

              return (
                <ContextMenu.Root key={row.id}>
                  <ContextMenu.Trigger asChild>{tr}</ContextMenu.Trigger>
                  <ContextMenu.Content className="dropdown-content w-[200px] z-[100]">
                    <ContextMenu.Item className="dropdown-item">Create alias</ContextMenu.Item>
                    <ContextMenu.Item className="dropdown-item">Copy</ContextMenu.Item>
                    <ContextMenu.Item className="dropdown-item">Paste</ContextMenu.Item>
                    <ContextMenu.Separator className="dropdown-separator" />
                    <ContextMenu.Item
                      onClick={() => {
                        duplicateVariables([row.original.id]);
                      }}
                      className="dropdown-item"
                    >
                      Duplicate variable
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      onClick={() => {
                        variableManager.deleteVariables([row.original.id]);
                      }}
                      className="dropdown-item"
                    >
                      Delete variable
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Root>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="h-10 border-t flex items-center justify-between p-3 pr-2">
        <VariableCreationMenu>
          <button className="flex items-center gap-1">
            <Plus size={16} strokeWidth={1.5} />
            Create Variable
          </button>
        </VariableCreationMenu>

        <UsabilitySuggestions />
      </div>
    </div>
  );
}
