import { Command } from 'cmdk';
import { Code, Search, Trash } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { useHotkeys } from 'react-hotkeys-hook';
import { MESSAGE_TYPE, sendMessage } from '../../utils/message';
import { TableContext } from './table/TableContext';
import { ParsedValue } from './ParsedValue';

const actions = [
  {
    name: 'Autocomplete code syntax',
    keywords: ['autocomplete', 'code', 'syntax'],
    icon: Code,
    onSelect: () => {
      sendMessage(MESSAGE_TYPE.AUTOCOMPLETE_CODE_SYNTAX);
    },
  },
  {
    name: 'Discard all changes',
    keywords: ['discard', 'all', 'changes'],
    icon: Trash,
    onSelect: () => {
      sendMessage(MESSAGE_TYPE.REVERT_ALL_VARIABLE_CHANGES);
    },
  },
];

function HighlightMatch({ text, searchQuery }: { text: string; searchQuery: string }) {
  if (!searchQuery) return <>{text}</>;

  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <span key={i} className="font-medium text-[var(--figma-color-text-brand)]">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function CMDK() {
  const {
    cmdkOpen,
    setCMDKOpen,
    search,
    setSearch,
    variables,
    collections,
    setCurrentCollectionId,
  } = useContext(AppContext);
  const { setRowSelection, table, setSelectedGroupPath } = useContext(TableContext);

  useHotkeys('meta+f', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCMDKOpen((prev) => !prev);
  });

  return (
    <Command.Dialog
      className="fixed h-96 flex flex-col top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 border bg-[var(--figma-color-bg)] w-[480px] rounded-[13px] overflow-hidden shadow-elevation-500"
      open={cmdkOpen}
      onOpenChange={setCMDKOpen}
    >
      <div className="flex items-center justify-between h-10 shrink-0 m-1">
        <Search className="absolute left-3.5" size={12} />
        <Command.Input
          className="w-full h-9 pl-8 pr-3 rounded-[9px] bg-[var(--figma-color-bg-secondary)] focus:outline-none"
          value={search}
          onValueChange={(search) => setSearch(search)}
          autoFocus
          placeholder="Search..."
        />
      </div>
      <Command.List className="overflow-auto px-2">
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Actions">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Command.Item
                className="px-1 gap-2"
                keywords={action.keywords}
                key={action.name}
                onSelect={action.onSelect}
                value={action.name}
              >
                <div className="flex shrink-0 items-center justify-center w-4 h-4 rounded-[20%]">
                  <Icon size={14} className="shrink-0" />
                </div>
                <HighlightMatch text={action.name} searchQuery={search} />
              </Command.Item>
            );
          })}
        </Command.Group>

        <Command.Group heading="Variables">
          {variables.map((variable) => {
            // const values = Object.values(variable.valuesByMode).map(value => value.value).join(' ')
            return (
              <Command.Item
                onSelect={() => {
                  const collection = collections.find(
                    (c) => c.id === variable.variableCollectionId
                  );

                  if (collection) {
                    // First set the collection ID
                    setCurrentCollectionId(collection.id);
                    setSelectedGroupPath(null);

                    setRowSelection({
                      [variable.id]: true,
                    });

                    // Wait for next render cycle when table data is updated

                    // Wait another tick for row selection to apply
                    setTimeout(() => {
                      const row = table
                        .getRowModel()
                        .rows.find((row) => row.original.id === variable.id);
                      if (row) {
                        const rowElement = document.querySelector(`[data-row-id="${row.id}"]`);

                        if (rowElement) {
                          rowElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }
                      }
                    }, 50);

                    setCMDKOpen(false);
                  }
                }}
                keywords={[variable.name]}
                key={variable.id}
                value={variable.name}
              >
                <ParsedValue
                  variable={variable}
                  modeId={Object.keys(variable.valuesByMode)[0]}
                  option={{ format: 'HEX', showLabel: false, allowCopy: false }}
                />
                <HighlightMatch text={variable.name} searchQuery={search} />
                <span className="ml-auto text-[var(--figma-color-text-secondary)]">Variable</span>
              </Command.Item>
            );
          })}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
