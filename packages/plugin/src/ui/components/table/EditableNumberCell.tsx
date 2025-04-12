import { useEffect, useState } from 'react';
import { evaluateNumberOrFormula } from '../../../utils/number';
import { variableManager } from '../../../utils/message';
import Decimal from 'decimal.js';
import { Alias } from '../Alias';
import { Detach } from '../../icons/Detach';
import { NonColorVariablePicker } from '../NonColorVariablePicker';

interface EditableNumberCellProps {
  variable: Variable & { resolvedType: 'FLOAT' };
  modeId: string;
  rowId: string;
  columnId: string;
  inputIndexRef: React.MutableRefObject<string | null>;
  onFocus: (inputIndex: number) => void;
}

export function EditableNumberCell({
  variable,
  modeId,
  onFocus,
}: EditableNumberCellProps) {
  const value = variable.valuesByMode[modeId];
  const [inputValue, setInputValue] = useState(typeof value === 'number' ? value : '0');

  useEffect(() => {
    setInputValue(typeof value === 'number' ? Number(value).toString() : '0');
  }, [value]);

  if (typeof value === 'number') {
    return (
      <div className="flex items-center px-2 group">
        <input
          className="bg-transparent pl-4"
          value={inputValue}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (e.shiftKey) {
                setInputValue(new Decimal(inputValue).minus(10).toString());
              } else {
                setInputValue(new Decimal(inputValue).minus(1).toString());
              }
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (e.shiftKey) {
                setInputValue(new Decimal(inputValue).plus(10).toString());
              } else {
                setInputValue(new Decimal(inputValue).plus(1).toString());
              }
            }
          }}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onBlur={(e) => {
            const v = evaluateNumberOrFormula(e.target.value);

            if (v !== false) {
              setInputValue(Number(Number(v).toFixed(2)).toString());
              variableManager.updateVariable(variable.id, { valuesByMode: { [modeId]: v } });
            } else {
              setInputValue(Number(Number(value).toFixed(2)).toString());
            }
          }}
          onFocus={(e) => {
            e.target.select();
            onFocus(0);
          }}
        />

        <NonColorVariablePicker variable={variable} modeId={modeId} />
      </div>
    );
  } else {
    return (
      <div className="pl-4 flex items-center">
        <Alias variable={variable} modeId={modeId} />

        <button className="btn-icon ml-auto">
          <Detach />
        </button>
      </div>
    );
  }
}
