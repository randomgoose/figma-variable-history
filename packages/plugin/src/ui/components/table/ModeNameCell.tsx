import { useState } from 'react';
import { useVariableManager } from '../../../hooks/useVariableManager';

export function ModeNameCell({
  collection,
  mode,
}: {
  collection: VariableCollection;
  mode: { modeId: string; name: string };
}) {
  const [inputValue, setInputValue] = useState(mode.name);
  const [isEditing, setIsEditing] = useState(false);
  const { renameMode } = useVariableManager();

  return (
    <div className="flex items-center gap-2 px-2 pr-1 h-full group w-[200px] truncate">
      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => renameMode(collection.id, mode.modeId, inputValue)}
        />
      ) : (
        <div
          className="flex items-center gap-2 px-2 pr-1 h-full group w-[200px] truncate"
          onDoubleClick={() => setIsEditing(true)}
        >
          {mode.name}
        </div>
      )}
    </div>
  );
}
