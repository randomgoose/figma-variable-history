import { Root, Portal, Content, Item, Trigger } from '@radix-ui/react-context-menu';
import { VariableChangeType } from '../../types';
import clsx from 'clsx';
import { sendMessage } from '../../utils/message';
import { ReactNode, useEffect } from 'react';
import { ParsedValue } from './ParsedValue';
import { VariableIcon } from './VariableIcon';

export function VariableItem({
  variable,
  type,
  onClick,
  selected,
  allowDiscard = true,
  slot,
}: {
  variable: Variable;
  type?: VariableChangeType;
  onClick?: (id: string) => void;
  selected?: boolean;
  allowDiscard?: boolean;
  slot?: ReactNode;
}) {
  const { id, name, resolvedType, valuesByMode } = variable;

  useEffect(() => {
    const defaultMode = Object.keys(valuesByMode)[0];
    const value = valuesByMode[defaultMode];

    if (typeof value === 'object' && 'type' in value) {
      sendMessage('RESOLVE_VARIABLE_VALUE', { id: variable.id, modeId: defaultMode });
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
              'w-4 h-4 flex items-center justify-center rounded-sm text-[color:var(--figma-color-text-success)] bg-[#F0FDF4]'
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
            className={'w-4 h-4 flex items-center justify-center rounded-sm bg-[#FEFCE8]'}
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
            className={'w-4 h-4 flex items-center justify-center rounded-sm bg-[#FEF2F2]'}
            style={{
              color: 'var(--figma-color-text-danger)',
            }}
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
          id={id}
          className={clsx(
            'flex h-8 p-2 cursor-default text-[color:var(--figma-color-text)] gap-2 rounded-md transition-all max-w-full hover:bg-[color:var(--figma-color-bg-hover)] hover:scale-[1.005] active:scale-[0.995]',
            selected ? 'bg-[color:var(--figma-color-bg-brand-tertiary)]' : 'bg-none'
          )}
          onClick={() => onClick && onClick(id)}
        >
          <div style={{ flexShrink: 0 }}>{icon()}</div>
          <div className="max-w-full text-ellipsis whitespace-nowrap overflow-hidden">{name}</div>
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
              sendMessage('REVERT_VARIABLE_VALUE', { variable, type });
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
