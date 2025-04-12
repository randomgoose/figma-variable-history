import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo } from 'react';
import { Popover } from 'radix-ui';

type Person = {
  name: string;
};

const defaultData: Person[] = [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }];

const columnHelper = createColumnHelper<Person>();

const TestTable: FC = () => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: () => {
          return (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button>hi</button>
              </Popover.Trigger>
              <Popover.Content>hi</Popover.Content>
            </Popover.Root>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2">
      <table className="min-w-full border-collapse border">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestTable;
