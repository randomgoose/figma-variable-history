import { VariableIcon } from './VariableIcon';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';

const types: VariableResolvedDataType[] = ['COLOR', 'FLOAT', 'STRING', 'BOOLEAN'];

export function Statistics() {
  const { variables } = useContext(AppContext);
  return (
    <div className="p-3">
      <div className="text-[var(--figma-color-text-secondary)]">{variables.length} variables</div>

      <div className="text-[var(--figma-color-text-secondary)]">
        <div className="grid grid-cols-2 gap-1">
          {types.map((type) => {
            return (
              <div className="flex items-center gap-2 border rounded-[5px] border-[var(--figma-color-border)] rounded-md py-1 px-2">
                <VariableIcon resolvedType={type} />
                <div className="flex flex-col">
                  <div className="text-[var(--figma-color-text-tertiary)] text-[11px] capitalize">
                    {type.toLowerCase()}
                  </div>
                  <div className="text-[var(--figma-color-text)] text-xs">
                    {variables.filter((v) => v.resolvedType === type).length}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>{variables.filter((v) => !v.description).length} variables without description</div>

      <div>
        {variables.filter((v) => v.hiddenFromPublishing).length} variables hidden from publishing
      </div>
    </div>
  );
}
