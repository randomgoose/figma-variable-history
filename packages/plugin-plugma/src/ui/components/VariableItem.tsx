import { Number } from '../icons/Number';
import { String } from '../icons/String';
import { Boolean } from '../icons/Boolean';
import { Root, Trigger, Portal, Content, Item } from '@radix-ui/react-context-menu';
import { VariableChangeType } from '../../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Color } from '../icons/Color';

const MotionTrigger = motion(Trigger);

export function VariableItem({
  variable,
  type,
  onClick,
  selected,
  custom,
  allowDiscard = true,
}: {
  variable: Variable;
  type: VariableChangeType;
  onClick?: (id: string) => void;
  selected?: boolean;
  custom: number;
  allowDiscard?: boolean;
}) {
  const { id, name, resolvedType } = variable;

  const icon = () => {
    switch (resolvedType) {
      case 'COLOR':
        return (
          <Color />
          // <div className="[&>*]:p-0 [&>div]:rounded-none">
          //   <ParsedValue
          //     variable={variable}
          //     modeId={Object.keys(variable.valuesByMode)[0]}
          //     option={{ showLabel: false, allowCopy: false }}
          //   />
          // </div>
        );
      case 'FLOAT':
        return <Number />;
      case 'BOOLEAN':
        return <Boolean />;
      case 'STRING':
        return <String />;
      default:
        return null;
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
      <MotionTrigger
        disabled={!allowDiscard}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        asChild
        // transition={{ duration: 0.4, delay: custom * 0.01, ease: ['linear'] }}
        custom={custom}
      >
        {/* <Link key={id} href={`/variable/${id}`} className={styles.variableItem}> */}
        <div
          className={clsx(
            'flex h-8 p-2 cursor-default text-[color:var(--figma-color-text)] gap-2 rounded-md transition-all max-w-full hover:bg-[color:var(--figma-color-bg-hover)] hover:scale-[1.005] active:scale-[0.995]',
            selected ? 'bg-[color:var(--figma-color-bg-brand-tertiary)]' : 'bg-none'
          )}
          onClick={() => onClick && onClick(id)}
        >
          <div style={{ flexShrink: 0 }}>{icon()}</div>
          <div className="max-w-full text-ellipsis whitespace-nowrap overflow-hidden">{name}</div>
          <div className="ml-auto">{renderType(type)}</div>
        </div>
        {/* </Link> */}
      </MotionTrigger>
      <Portal>
        <Content className={'dropdown-content'} style={{ width: 200 }}>
          <Item
            className={'dropdown-item'}
            onClick={() => {
              parent.postMessage(
                {
                  pluginMessage: { type: 'REVERT_VARIABLE_VALUE', payload: { variable, type } },
                  pluginId: '*',
                },
                '*'
              );
              // emit<RevertVariableHandler>('REVERT_VARIABLE_VALUE', variable, type);
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
