import { Command } from 'cmdk';
import { Code, ListChecks, Plus, Search, Trash } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { useHotkeys } from 'react-hotkeys-hook';
import { ParsedValue } from './ParsedValue';
import { MESSAGE_TYPE, sendMessage } from '../../utils/message';
import * as Popover from '@radix-ui/react-popover';
import { Statistics } from './Statistics';

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
  {
    name: 'Batch set variable scopes',
    keywords: ['batch', 'set', 'variable', 'scopes'],
    icon: ListChecks,
    onSelect: () => {
      // sendMessage(MESSAGE_TYPE.REVERT_ALL_VARIABLES)
    },
  },
];

export function CMDK() {
  const { cmdkOpen, setCMDKOpen, search, setSearch, variables } = useContext(AppContext);
  useHotkeys('meta+i', () => setCMDKOpen((prev) => !prev));

  return (
    <Command.Dialog
      className="fixed h-96 max-h-96 flex flex-col top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 border bg-[var(--figma-color-bg)] w-[480px] rounded-[13px] overflow-hidden shadow-elevation-500 pb-10"
      open={cmdkOpen}
      onOpenChange={setCMDKOpen}
    >
      <div className="flex items-center justify-between h-10 shrink-0">
        <Search className="absolute left-2.5" size={12} />
        <Command.Input
          className="w-full h-10 pl-8 pr-3 border-b border-[var(--figma-color-border)] focus:outline-none"
          value={search}
          onValueChange={setSearch}
          autoFocus
          placeholder="Search..."
        />
      </div>
      <Command.List className="overflow-auto p-1">
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Actions">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Command.Item keywords={action.keywords} key={action.name} onSelect={action.onSelect}>
                <div className="flex items-center justify-center w-6 h-6 bg-[var(--figma-color-bg-secondary)]">
                  <Icon size={12} />
                </div>
                {action.name}
              </Command.Item>
            );
          })}
        </Command.Group>

        <Command.Group heading="Variables">
          {variables.map((variable) => {
            // const values = Object.values(variable.valuesByMode).map(value => value.value).join(' ')
            return (
              <Command.Item keywords={[variable.name]} key={variable.id}>
                <ParsedValue
                  variable={variable}
                  modeId={Object.keys(variable.valuesByMode)[0]}
                  option={{ format: 'HEX', showLabel: false, allowCopy: false }}
                />
                {variable.name}
                <span className="ml-auto text-[var(--figma-color-text-secondary)]">Variable</span>
              </Command.Item>
            );
          })}
        </Command.Group>
      </Command.List>

      <div className="border-t border-[var(--figma-color-border)] h-10 absolute bottom-0 left-0 right-0 flex items-center px-1">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="btn-ghost">
              <Plus size={14} />
              Statistics
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="popover-content z-50 bg-[var(--figma-color-bg)] rounded-[13px] flex flex-col shadow-elevation-500">
              <Statistics />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </Command.Dialog>
  );
}
