import { useState } from 'react';
import { variableManager } from '../../../utils/message';
import { NonColorVariablePicker } from '../NonColorVariablePicker';

export function EditableStringCell({
  variable,
  modeId,
  rowId,
  columnId,
  onFocus,
  inputIndexRef,
}: {
  variable: Variable;
  modeId: string;
  rowId: string;
  columnId: string;
  onFocus: () => void;
  inputIndexRef: React.MutableRefObject<string | null>;
}) {
  const value = variable.valuesByMode[modeId];
  const [inputValue, setInputValue] = useState(typeof value === 'string' ? value : '');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus();
    e.target.select && e.target.select();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.value !== value) {
      variableManager.updateVariable(variable.id, { valuesByMode: { [modeId]: e.target.value } });
    } else {
      if (typeof value === 'string') {
        e.target.value = value;
      }
    }
  };

  return (
    <div className="flex items-center px-2 group">
      {typeof value === 'string' ? (
        <>
          <input
            tabIndex={0}
            className="w-full h-full font-medium text-[11px] bg-transparent px-2"
            defaultValue={value}
            autoFocus={inputIndexRef.current === `${rowId}-${columnId}-0`}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <NonColorVariablePicker variable={variable} modeId={modeId} />
        </>
      ) : (
        <div>hi</div>
      )}
    </div>
  );
}
