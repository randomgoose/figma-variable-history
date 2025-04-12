import { DropdownMenu } from 'radix-ui';
import { Color } from '../icons/Color';
import { String } from '../icons/String';
import { Boolean } from '../icons/Boolean';
import { Number } from '../icons/Number';
import { useContext } from 'react';
import { TableContext } from './table/TableContext';
const VariableTypes: { type: VariableResolvedDataType; label: string; icon: React.ReactNode }[] = [
  { type: 'COLOR', label: 'Color', icon: <Color /> },
  { type: 'STRING', label: 'String', icon: <String /> },
  { type: 'BOOLEAN', label: 'Boolean', icon: <Boolean /> },
  { type: 'FLOAT', label: 'Number', icon: <Number /> },
];

export function VariableCreationMenu({ children }: { children: React.ReactNode }) {
  const { createVariable } = useContext(TableContext);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Content className="dropdown-content w-[150px] z-50">
        {VariableTypes.map(({ type, label, icon }) => (
          <DropdownMenu.Item
            className="dropdown-item pl-1"
            key={type}
            onClick={() => {
              createVariable(type);
            }}
          >
            <div className="flex items-center gap-2">
              {icon}
              {label}
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
