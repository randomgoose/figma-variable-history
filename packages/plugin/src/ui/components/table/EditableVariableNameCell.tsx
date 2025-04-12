import { MessageSquarePlus } from 'lucide-react';
import { VariableIcon } from '../VariableIcon';
import { useEffect, useRef } from 'react';
import { variableManager } from '../../../utils/message';

export function EditableVariableNameCell({
  value,
  resolvedType,
  onFocus,
  variable,
}: {
  value: string;
  resolvedType: Variable['resolvedType'];
  variable: Variable;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    variableManager.updateVariable(variable.id, { name: e.target.value });
  };

  return (
    <div className="flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate">
      <VariableIcon resolvedType={resolvedType} />
      <input
        tabIndex={0}
        className="w-full h-full font-medium text-[11px] bg-transparent"
        defaultValue={value}
        onFocus={onFocus}
        type="text"
        onBlur={handleBlur}
      />
      <button className="btn-icon group-hover:opacity-100 opacity-0 ml-auto">
        <MessageSquarePlus size={12} />
      </button>
    </div>
  );
}
