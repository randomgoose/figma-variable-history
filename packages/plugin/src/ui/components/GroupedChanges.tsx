// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Root, Item, Header, Trigger, Content } from '@radix-ui/react-accordion';
import { IconCaretRight16 } from '@create-figma-plugin/ui';
import { useContext, useEffect, useState } from 'preact/hooks';
import { AppContext } from '../../AppContext';
import styles from '../styles.module.css';
import { VariableItem } from './VariableItem';

export function GroupedChanges({
  groupedChanges,
  onClickVariableItem,
}: {
  groupedChanges: {
    [key: string]: { added: Variable[]; modified: Variable[]; removed: Variable[] };
  };
  // onClickCollectionItem: (id: string) => void;
  onClickVariableItem: (id: string) => void;
}) {
  const [collectionList, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const { collections } = useContext(AppContext);

  const toggleCollectionList = (id: string) => {
    if (collectionList.includes(id)) {
      setCollectionList(collectionList.filter((c) => c !== id));
    } else {
      setCollectionList([...collectionList, id]);
    }
  };

  useEffect(() => {
    setCollectionList(collections.map((c) => c.id));
  }, [collections]);

  return (
    <Root type="multiple" value={collectionList}>
      {Object.entries(groupedChanges).map(([collectionId, { added, modified, removed }]) => {
        const hasChanges = added.length + modified.length + removed.length > 0;

        return hasChanges ? (
          <Item value={collectionId} className={styles.collectionItem}>
            <Header>
              <Trigger
                className={styles.collectionItem__trigger}
                onClick={() => toggleCollectionList(collectionId)}
              >
                <div style={{ flexShrink: 0 }}>
                  <IconCaretRight16 />
                </div>
                <div
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {collections.find((c) => c.id === collectionId)?.name || collectionId}
                </div>

                <div
                  style={{
                    marginLeft: 'auto',
                    color: 'var(--figma-color-text-secondary)',
                    padding: '0px 4px',
                    background: 'var(--figma-color-bg-secondary)',
                    borderRadius: 2,
                  }}
                >
                  {added.length + modified.length + removed.length}
                </div>
              </Trigger>
            </Header>
            <Content style={{ padding: 4 }}>
              {added.map((v) => (
                <VariableItem
                  key={v.id}
                  variable={v}
                  type={'added'}
                  onClick={(id) => onClickVariableItem(id)}
                />
              ))}
              {modified.map((v) => (
                <VariableItem
                  key={v.id}
                  variable={v}
                  type={'modified'}
                  onClick={(id) => onClickVariableItem(id)}
                />
              ))}
              {removed.map((v: Variable) => (
                <VariableItem
                  key={v.id}
                  variable={v}
                  type={'removed'}
                  onClick={(id) => onClickVariableItem(id)}
                />
              ))}
            </Content>
          </Item>
        ) : null;
      })}
    </Root>
  );
}
