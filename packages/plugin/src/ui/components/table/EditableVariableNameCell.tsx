import { MessageSquarePlus } from 'lucide-react';
import { VariableIcon } from '../VariableIcon';
import { useEffect, useRef } from 'react';

export function EditableVariableNameCell({
  value,
  resolvedType,
  onBlur,
  isEditing,
}: {
  value: string;
  resolvedType: Variable['resolvedType'];
  isEditing: boolean;
  onBlur: (value: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [isEditing]);

  return (
    <div className="flex items-center gap-2 px-4 pr-1 h-full group w-[200px] truncate">
      <VariableIcon resolvedType={resolvedType} />
      {isEditing ? (
        <input
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              ref.current?.blur();
            }
          }}
          ref={ref}
          autoFocus
          type="text"
          defaultValue={value}
          onBlur={(e) => onBlur(e.target.value)}
        />
      ) : (
        value
      )}
      <button className="btn-icon group-hover:opacity-100 opacity-0 ml-auto">
        <MessageSquarePlus size={12} />
      </button>
    </div>
  );
}
