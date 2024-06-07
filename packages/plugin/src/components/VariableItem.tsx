import styles from '../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Color } from '../icons/Color';
import { Number } from '../icons/Number';
import { String } from '../icons/String';
import { Boolean } from '../icons/Boolean';
import { Root, Trigger, Portal, Content, Item } from '@radix-ui/react-context-menu';

export function VariableItem({
  variable,
  type,
  onClick,
}: {
  variable: Variable;
  type?: 'Added' | 'Removed' | 'Modified';
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

  return (
    <Root>
      <Trigger asChild>
        {/* <Link key={id} href={`/variable/${id}`} className={styles.variableItem}> */}
        <div className={styles.variableItem} onClick={() => onClick && onClick(id)}>
          {icon()}
          <div>{name}</div>
          <div style={{ marginLeft: 'auto' }}>{type}</div>
        </div>
        {/* </Link> */}
      </Trigger>
      <Portal>
        <Content className={styles.dropdown__content} style={{ width: 200 }}>
          <Item
            className={styles.dropdown__item}
            onClick={() => {
              // revertVariable(variable.id,)
            }}
          >
            Discard changes
          </Item>
        </Content>
      </Portal>
    </Root>
  );
}
