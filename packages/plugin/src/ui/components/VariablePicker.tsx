import { ChevronDown, Search } from 'lucide-react';
import { ScrollArea, Select } from 'radix-ui';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../AppContext';
import { MESSAGE_TYPE } from '../../utils/message';
import { sendMessage } from '../../utils/message';
import { Swatch } from './Swatch';
import { useResolvedValue } from '../../hooks/useResolvedValue';
import { calculateContrastRatio } from '../../utils/color';
import clsx from 'clsx';
import { VariableIcon } from './VariableIcon';
import { List } from '../icons/List';
import { Grid } from '../icons/Grid';

const ALL_LIBS_KEY = '__VARIABLE_HISTORY__ALL';
const LOCAL_VARIABLE_KEY = '__VARIABLE_HISTORY__LOCAL';

interface VariablePickerProps {
  type: Variable['resolvedType'];
  onSelect: (variable: Variable) => void;
}

export function VariablePicker({ type = 'COLOR', onSelect }: VariablePickerProps) {
  const [search, setSearch] = useState<string>('');
  const { teamLibraries, variables } = useContext(AppContext);
  const [lib, setLib] = useState<string>(ALL_LIBS_KEY);
  const [view, setView] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    if (lib !== ALL_LIBS_KEY && lib !== LOCAL_VARIABLE_KEY) {
      sendMessage(MESSAGE_TYPE.IMPORT_TEAM_LIBRARY_BY_NAME, lib);
    }
  }, [lib]);

  const filteredVariables = useMemo(() => {
    if (lib === ALL_LIBS_KEY) {
      return [...variables].filter((variable) => variable.resolvedType === type);
    } else if (lib === LOCAL_VARIABLE_KEY) {
      return variables.filter((variable) => variable.resolvedType === type);
    } else {
      return teamLibraries[lib].variables.filter((variable) => variable.resolvedType === type);
    }
  }, [lib, variables, teamLibraries]);

  const groupedVariables = useMemo(() => {
    const groups: { [key: string]: Variable[] } = {};

    filteredVariables.forEach((variable) => {
      const parts = variable.name.split('/');
      const groupPath = parts.slice(0, -1).join('/');

      if (!groups[groupPath]) {
        groups[groupPath] = [];
      }
      groups[groupPath].push(variable);
    });

    return Object.entries(groups);
  }, [filteredVariables]);

  return (
    <div className="flex flex-col">
      <div className="h-10 relative border-b border-[var(--figma-color-border)] flex items-center">
        <div className="w-8 h-8 ml-2 flex items-center justify-center">
          <Search size={12} className="text-[var(--figma-color-text-secondary)]" />
        </div>
        <input
          placeholder="Search"
          className="text-[11px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2 h-10 items-center px-2 border-b">
        <Select.Root value={lib} onValueChange={setLib}>
          <Select.Trigger className="select-trigger w-full">
            <Select.Value placeholder="Select a variable" />
            <Select.Icon>
              <ChevronDown size={12} strokeWidth={1} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="dropdown-content w-[200px] z-[100]">
              <Select.Viewport>
                <Select.Item value={ALL_LIBS_KEY} className="dropdown-item">
                  <Select.ItemText>All Variables</Select.ItemText>
                </Select.Item>
                <Select.Separator className="dropdown-separator" />
                <Select.Item value={LOCAL_VARIABLE_KEY} className="dropdown-item">
                  <Select.ItemText>Created in this file</Select.ItemText>
                </Select.Item>
                {Object.keys(teamLibraries).length > 0 && (
                  <Select.Separator className="dropdown-separator" />
                )}

                {Object.keys(teamLibraries).map((library) => (
                  <Select.Item value={library} className="dropdown-item">
                    <Select.ItemText>{library}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {type === 'COLOR' && (
          <button className="btn-icon" onClick={() => setView(view === 'list' ? 'grid' : 'list')}>
            {view === 'list' ? <List /> : <Grid />}
          </button>
        )}
      </div>

      <ScrollArea.Root className="w-full h-[288px] overflow-hidden">
        <ScrollArea.Viewport className="size-full py-2">
          {groupedVariables.map(([groupPath, variables]) => {
            const filteredVariables = variables.filter((variable) =>
              variable.name.toLowerCase().includes(search.toLowerCase())
            );
            return (
              <div key={groupPath} className={view === 'list' ? '' : 'px-4'}>
                {groupPath && filteredVariables.length > 0 && (
                  <div className="pt-4 first-of-type:pt-2 pb-2 text-xs px-4">
                    {groupPath.split('/').map((part, index, parts) => (
                      <span
                        key={part}
                        className={
                          index === parts.length - 1
                            ? 'text-[var(--figma-color-text)] font-semibold'
                            : 'text-[var(--figma-color-text-secondary)]'
                        }
                      >
                        {part} {index === parts.length - 1 ? '' : '/ '}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  className={clsx(
                    'w-full',
                    view === 'list' ? 'flex flex-col' : 'grid grid-cols-6 gap-1'
                  )}
                >
                  {filteredVariables.map((variable) => {
                    switch (variable.resolvedType) {
                      case 'COLOR':
                        return (
                          <ColorItem
                            key={variable.id}
                            variable={variable}
                            view={view}
                            onSelect={onSelect}
                          />
                        );
                      default:
                        return <Item key={variable.id} variable={variable} onSelect={onSelect} />;
                    }
                  })}
                </div>
              </div>
            );
          })}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

function Item({
  variable,
  onSelect,
}: {
  variable: Variable;
  onSelect: (variable: Variable) => void;
}) {
  return (
    <div
      key={variable.id}
      className="flex items-center h-8 hover:bg-[var(--figma-color-bg-hover)] pl-4 gap-2"
      onClick={() => {
        onSelect(variable);
      }}
    >
      <VariableIcon resolvedType={variable.resolvedType} />
      {variable.name}
    </div>
  );
}

function ColorItem({
  variable,
  view,
  onSelect,
}: {
  variable: Variable;
  view: 'list' | 'grid';
  onSelect: (variable: Variable) => void;
}) {
  const value = useResolvedValue({ variable }) as RGB;
  const name = variable.name.split('/').pop() || '';
  const contrastRatio = value
    ? calculateContrastRatio(
        { r: value.r * 255, g: value.g * 255, b: value.b * 255 },
        { r: 255, g: 255, b: 255 }
      )
    : 0;

  return (
    <div
      key={variable.id}
      className={clsx(
        view === 'list'
          ? 'flex items-center h-8 hover:bg-[var(--figma-color-bg-hover)] pl-4'
          : 'w-full'
      )}
      onClick={() => {
        onSelect(variable);
      }}
    >
      <div className="flex items-center gap-2">
        <Swatch
          color={value as RGB}
          className={clsx(
            'relative rounded-[5px] border border-[var(--figma-color-border)]',
            view === 'grid' ? 'w-[28px] h-[28px]' : 'w-4 h-4'
          )}
        >
          {view === 'grid' && (
            <span
              className={clsx(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold text-[var(--figma-color-text)]',
                contrastRatio < 4.5 ? 'text-black/50' : 'text-white/50'
              )}
            >
              {name.slice(0, 4)}
            </span>
          )}
        </Swatch>
        {view === 'list' && <span className="text-xs">{name}</span>}
      </div>
    </div>
  );
}
