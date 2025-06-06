import { Root, Portal, Content, Item, Trigger } from '@radix-ui/react-context-menu';
import { VariableChangeType } from '../../types';
import clsx from 'clsx';
import { MESSAGE_TYPE, sendMessage } from '../../utils/message';
import { CSSProperties, ReactNode, useContext, useEffect } from 'react';
import { ParsedValue } from './ParsedValue';
import { VariableIcon } from './VariableIcon';
import * as Checkbox from '@radix-ui/react-checkbox';
import { IconCheck } from '@tabler/icons-react';
import { useCommitBridge } from '../../hooks/useCommitBridge';
import { AppContext } from '../../AppContext';

export function VariableItem({
  variable,
  type,
  onClick,
  selected,
  allowDiscard = true,
  slot,
  checkbox,
  checked,
  onCheck,
  style,
}: {
  variable: Variable;
  type?: VariableChangeType;
  onClick?: (id: string) => void;
  selected?: boolean;
  allowDiscard?: boolean;
  slot?: ReactNode;
  checkbox?: boolean;
  checked?: boolean;
  onCheck?: (checked: boolean) => void;
  style?: CSSProperties;
}) {
  const { id, name, resolvedType, valuesByMode } = variable;
  const { fileUUID, resolvedVariableValues } = useContext(AppContext);
  const { commits } = useCommitBridge(fileUUID);

  useEffect(() => {
    const defaultMode = Object.keys(valuesByMode)[0];
    const value = valuesByMode[defaultMode];

    if (typeof value === 'object' && 'type' in value) {
      if (!resolvedVariableValues[variable.id]) {
        sendMessage('RESOLVE_VARIABLE_VALUE', { id: variable.id, modeId: defaultMode });
      }
    }
  }, []);

  const icon = () => {
    switch (resolvedType) {
      case 'COLOR':
        return (
          <div className="[&>*]:p-0 [&>div]:rounded-none">
            <ParsedValue
              variable={variable}
              modeId={Object.keys(variable.valuesByMode)[0]}
              option={{ showLabel: false, allowCopy: false }}
            />
          </div>
        );
      default:
        return <VariableIcon resolvedType={resolvedType} />;
    }
  };

  const renderType = (type: VariableChangeType) => {
    switch (type) {
      case 'added':
        return (
          <div
            className={
              'w-4 h-4 flex items-center justify-center rounded-sm text-[color:var(--figma-color-text-success)] bg-[--bg-added]'
            }
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7.5 3.5H4.5V0.5H3.5V3.5H0.5V4.5H3.5V7.5H4.5V4.5H7.5V3.5Z" />
            </svg>
          </div>
        );
      case 'modified':
        return (
          <div
            className={'w-4 h-4 flex items-center justify-center rounded-sm bg-[--bg-modified]'}
            style={{
              color: 'var(--figma-color-text-warning)',
              fontSize: 10,
              fontWeight: 500,
            }}
          >
            M
          </div>
        );
      case 'removed':
        return (
          <div
            className={'w-4 h-4 flex items-center justify-center rounded-sm bg-[--bg-removed]'}
            style={{ color: 'var(--figma-color-text-danger)' }}
          >
            <svg
              width="8"
              height="2"
              viewBox="0 0 8 2"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0.5 0.5H7.5V1.5H0.5V0.5Z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Root>
      <Trigger
        disabled={!allowDiscard}
        asChild
        // transition={{ duration: 0.4, delay: custom * 0.01, ease: ['linear'] }}
      >
        {/* <Link key={id} href={`/variable/${id}`} className={styles.variableItem}> */}
        <div
          style={style}
          id={id}
          className={clsx(
            'w-full flex items-center h-7 p-2 cursor-default text-[color:var(--figma-color-text)] rounded-md transition-all max-w-full hover:bg-[color:var(--figma-color-bg-hover)]',
            selected ? 'bg-[color:var(--figma-color-bg-brand-tertiary)]' : 'bg-none',
            resolvedType === 'COLOR' ? 'gap-2' : checkbox ? 'gap-1' : 'gap-1',
            checkbox ? 'pl-1' : resolvedType === 'COLOR' ? 'pl-2' : 'pl-1'
          )}
          onClick={() => onClick && onClick(id)}
        >
          {checkbox ? (
            <Checkbox.Root className="checkbox-root" checked={checked} onCheckedChange={onCheck}>
              <Checkbox.Indicator className="checkbox-indicator">
                <IconCheck size={12} />
              </Checkbox.Indicator>
            </Checkbox.Root>
          ) : null}
          <div style={{ flexShrink: 0 }}>{icon()}</div>
          <div
            className={clsx('max-w-full text-ellipsis whitespace-nowrap overflow-hidden', {
              'line-through': type === 'removed',
            })}
          >
            {name}
          </div>
          {type ? <div className="ml-auto">{renderType(type)}</div> : null}
          {slot ? slot : null}
        </div>
        {/* </Link> */}
      </Trigger>
      <Portal>
        <Content className={'dropdown-content'} style={{ width: 200 }}>
          <Item
            className={'dropdown-item'}
            onClick={() => {
              sendMessage(MESSAGE_TYPE.REVERT_VARIABLE_VALUE, {
                variable,
                type,
                commit: commits[0],
              });
            }}
          >
            Discard changes
          </Item>
        </Content>
      </Portal>

      {/* <Modal onEscapeKeyDown={handleEscapeKeyDown} open={revertConfirmModalOpen}>
        <div>foo</div>
      </Modal> */}
    </Root>
  );
}
