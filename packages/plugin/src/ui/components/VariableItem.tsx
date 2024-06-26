import styles from '../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Color } from '../icons/Color';
import { Number } from '../icons/Number';
import { String } from '../icons/String';
import { Boolean } from '../icons/Boolean';
import { Root, Trigger, Portal, Content, Item } from '@radix-ui/react-context-menu';
import { emit } from '@create-figma-plugin/utilities';
import { RevertVariableHandler, VariableChangeType } from '../../types';

export function VariableItem({
  variable,
  type,
  onClick,
}: {
  variable: Variable;
  type: VariableChangeType;
  onClick?: (id: string) => void;
}) {
  const { id, name, resolvedType } = variable;

  const icon = () => {
    switch (resolvedType) {
      case 'COLOR':
        return <Color />;
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
            className={styles.variable__type}
            style={{
              background: 'var(--figma-color-bg-success-tertiary)',
              color: 'var(--figma-color-text-success)',
            }}
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
            className={styles.variable__type}
            style={{
              background: 'var(--figma-color-bg-warning-tertiary)',
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
            className={styles.variable__type}
            style={{
              background: 'var(--figma-color-bg-danger-tertiary)',
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
      <Trigger asChild>
        {/* <Link key={id} href={`/variable/${id}`} className={styles.variableItem}> */}
        <div className={styles.variableItem} onClick={() => onClick && onClick(id)}>
          <div style={{ flexShrink: 0 }}>{icon()}</div>
          <div
            style={{
              maxWidth: '100%',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {name}
          </div>
          <div style={{ marginLeft: 'auto' }}>{renderType(type)}</div>
        </div>
        {/* </Link> */}
      </Trigger>
      <Portal>
        <Content className={styles.dropdown__content} style={{ width: 200 }}>
          <Item
            className={styles.dropdown__item}
            onClick={() => {
              emit<RevertVariableHandler>('REVERT_VARIABLE_VALUE', variable, type);
            }}
          >
            Discard changes
          </Item>
        </Content>
      </Portal>
    </Root>
  );
}
