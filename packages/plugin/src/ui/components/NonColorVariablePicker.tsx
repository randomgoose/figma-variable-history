import { Popover } from 'radix-ui';
import { Variable } from '../icons/Variable';
import { VariablePicker } from './VariablePicker';
import { variableManager } from '../../utils/message';

export function NonColorVariablePicker({
  variable,
  modeId,
}: {
  variable: Variable;
  modeId: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="text-xs text-gray-500 group-hover:opacity-100 opacity-0">
          <Variable />
        </button>
      </Popover.Trigger>
      <Popover.Content className="panel">
        <VariablePicker
          type="STRING"
          onSelect={(v) => {
            variableManager.updateVariable(variable.id, {
              valuesByMode: { [modeId]: { type: 'VARIABLE_ALIAS', id: v.id } },
            });
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
