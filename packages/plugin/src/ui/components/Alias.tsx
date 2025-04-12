import { Popover } from 'radix-ui';
import { VariablePicker } from './VariablePicker';
import { useVariableAlias } from '../../hooks/useVariableAlias';
import { variableManager } from '../../utils/message';
import { VariableIcon } from './VariableIcon';

export function Alias({ variable, modeId }: { variable: Variable; modeId: string }) {
  const alias = useVariableAlias((variable.valuesByMode[modeId] as VariableAlias).id);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="alias pl-0.5">
          <VariableIcon resolvedType={variable.resolvedType} />
          {alias}
        </div>
      </Popover.Trigger>
      <Popover.Content className="panel">
        <VariablePicker
          type={variable.resolvedType}
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
