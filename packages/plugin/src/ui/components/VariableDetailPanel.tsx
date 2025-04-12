import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslation } from '../../hooks/useTranslation';
import { variableManager } from '../../utils/message';
import { HexInput } from './ColorPicker/HexInput';
import { IconCheck, IconMinus, IconPlus } from '@tabler/icons-react';
import { AppContext } from '../../AppContext';
import { useContext } from 'react';
import clsx from 'clsx';
import { Checkbox, Popover } from 'radix-ui';
import { getCodeSyntax } from '../../utils/code';
import { useVariableAlias } from '../../hooks/useVariableAlias';
import { Detach } from '../icons/Detach';
import { Switch } from 'radix-ui';
import { Variable } from '../icons/Variable';
import { VariablePicker } from './VariablePicker';

const platforms: { key: CodeSyntaxPlatform; label: string }[] = [
  { key: 'WEB', label: 'Web' },
  { key: 'ANDROID', label: 'Android' },
  { key: 'iOS', label: 'iOS' },
];

export function VariableDetailPanel({ variable }: { variable: Variable }) {
  const { modes } = useContext(AppContext);

  return (
    <>
      <div className="p-4 border-b border-[var(--figma-color-border)]">
        <div className="grid gap-2 items-center mb-2" style={{ gridTemplateColumns: '3fr 7fr' }}>
          <label htmlFor="name" className="text-[var(--figma-color-text-secondary)]">
            Name
          </label>
          <input
            onBlur={(e) => {
              variableManager.updateVariable(variable.id, { name: e.target.value });
            }}
            defaultValue={variable.name}
            id="name"
            type="text"
            className="input"
            placeholder="Used in design properties"
          />
        </div>
        <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '3fr 7fr' }}>
          <label htmlFor="description" className="text-[var(--figma-color-text-secondary)]">
            Description
          </label>
          <input
            onBlur={(e) => {
              variableManager.updateVariable(variable.id, { description: e.target.value });
            }}
            defaultValue={variable.description}
            id="description"
            type="text"
            className="input-filled"
            placeholder="How to use this variable"
          />
        </div>
      </div>
      <div className="p-4 border-b border-[var(--figma-color-border)]">
        <div className="font-medium mb-2">Values</div>
        {Object.entries(variable.valuesByMode).map(([modeId, value]) => {
          const renderValue = () => {
            if (typeof value === 'object') {
              if ('type' in value) {
                const alias = useVariableAlias(value.id);
                return (
                  <>
                    <div className="alias ml-auto">{alias}</div>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        variableManager.detachAlias(variable.id, modeId);
                      }}
                    >
                      <Detach />
                    </button>
                  </>
                );
              } else {
                return (
                  <HexInput
                    color={value as RGB}
                    onChange={(v) => {
                      variableManager.updateVariable(variable.id, {
                        valuesByMode: { [modeId]: v },
                      });
                    }}
                  />
                );
              }
            } else if (typeof value === 'string') {
              return (
                <input
                  className="alias ml-auto"
                  defaultValue={value}
                  onBlur={(e) => {
                    variableManager.updateVariable(variable.id, {
                      valuesByMode: { [modeId]: e.target.value },
                    });
                  }}
                />
              );
            } else if (typeof value === 'number') {
              return (
                <input
                  className="alias ml-auto"
                  defaultValue={value}
                  onBlur={(e) => {
                    variableManager.updateVariable(variable.id, {
                      valuesByMode: { [modeId]: e.target.value },
                    });
                  }}
                />
              );
            } else if (typeof value === 'boolean') {
              return (
                <>
                  <Switch.Root
                    checked={value}
                    className="switch-root ml-auto"
                    onCheckedChange={(checked) => {
                      variableManager.updateVariable(variable.id, {
                        valuesByMode: { [modeId]: checked },
                      });
                    }}
                  >
                    <Switch.Thumb className="switch-thumb" />
                  </Switch.Root>

                  {value ? 'True' : 'False'}

                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button className="btn-icon">
                        <Variable />
                      </button>
                    </Popover.Trigger>
                    <Popover.Content className="popover">
                      <VariablePicker
                        type="BOOLEAN"
                        onSelect={(v) => {
                          variableManager.updateVariable(variable.id, {
                            valuesByMode: { [modeId]: { type: 'VARIABLE_ALIAS', id: v.id } },
                          });
                        }}
                      />
                    </Popover.Content>
                  </Popover.Root>
                </>
              );
            } else {
              return value;
            }
          };

          return (
            <div
              key={modeId}
              className={clsx(
                'h-8 gap-2 items-center',
                (typeof value === 'object' && 'type' in value) || typeof value !== 'object'
                  ? 'flex'
                  : 'grid'
              )}
              style={{ gridTemplateColumns: '3fr 7fr' }}
            >
              <label className="text-[var(--figma-color-text-secondary)] shrink-0">
                {modes[modeId]}
              </label>
              {renderValue()}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-b border-[var(--figma-color-border)]">
        <div
          className={clsx(
            'flex items-center',
            Object.keys(variable.codeSyntax).length > 0
              ? 'text-[var(--figma-color-text)] font-medium'
              : 'text-[var(--figma-color-text-secondary)]'
          )}
        >
          Code Syntax
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="btn-icon ml-auto">
                <IconPlus size={16} strokeWidth={1.5} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="dropdown-content">
              {platforms.map((platform) => {
                return (
                  <DropdownMenu.Item
                    onClick={() => {
                      variableManager.updateVariable(variable.id, {
                        codeSyntax: {
                          ...variable.codeSyntax,
                          [platform.key]: getCodeSyntax(variable.name)[platform.key],
                        },
                      });
                    }}
                    className="dropdown-item"
                    key={platform.key}
                  >
                    {platform.label}
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        {Object.entries(variable.codeSyntax).map(([platform, syntax]) => {
          return (
            <div
              key={platform}
              className="grid gap-2 items-center h-8 mb-2"
              style={{ gridTemplateColumns: '3fr 7fr 24px' }}
            >
              <label className="text-[var(--figma-color-text-secondary)] shrink-0">
                {platform}
              </label>

              <input
                type="text"
                className="input"
                defaultValue={syntax as string}
                onBlur={(e) => {
                  variableManager.updateVariable(variable.id, {
                    codeSyntax: { ...variable.codeSyntax, [platform]: e.target.value },
                  });
                }}
              />

              <button
                className="btn-icon ml-auto"
                onClick={() => {
                  variableManager.updateVariable(variable.id, {
                    codeSyntax: { ...variable.codeSyntax, [platform]: undefined },
                  });
                }}
              >
                <IconMinus size={16} strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-4 flex items-center gap-2">
        <Checkbox.Root
          id="hiddenFromPublishing"
          checked={variable.hiddenFromPublishing}
          onCheckedChange={(checked) => {
            variableManager.updateVariable(variable.id, {
              hiddenFromPublishing: checked === true ? true : false,
            });
          }}
          className="size-4 border border-[var(--figma-color-border)] data-[state=checked]:border-[var(--figma-color-border-selected-strong)] rounded-[5px] data-[state=checked]:bg-[var(--figma-color-bg-brand)]"
        >
          <Checkbox.Indicator className="flex items-center justify-center text-[var(--figma-color-text-onbrand)]">
            <IconCheck size={12} strokeWidth={2} />
          </Checkbox.Indicator>
        </Checkbox.Root>

        <label htmlFor="hiddenFromPublishing" className="text-[var(--figma-color-text)]">
          Hide from publishing
        </label>
      </div>
    </>
  );
}
