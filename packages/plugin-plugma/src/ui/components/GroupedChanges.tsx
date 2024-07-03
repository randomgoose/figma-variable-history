import { Root, Item, Header, Trigger, Content } from '@radix-ui/react-accordion';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import { VariableItem } from './VariableItem';
import { ChevronRight } from 'lucide-react';

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
          <Item
            style={{ background: 'var(--figma-color-bg)' }}
            value={collectionId}
            className={
              'rounded-[4px] [&:not(:last-of-type)]:rounded-md [&:not(:last-of-type)]:mb-1.5'
            }
            key={collectionId}
          >
            <Header>
              <Trigger
                className={'w-full p-2 pr-3 flex items-center font-semibold gap-2 group'}
                onClick={() => toggleCollectionList(collectionId)}
              >
                <div className="shrink-0 group-data-[state=open]:rotate-90 transition-all">
                  <ChevronRight size={11} />
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {collections.find((c) => c.id === collectionId)?.name || collectionId}
                </div>

                <div
                  className="ml-auto px-1 rounded-sm"
                  style={{
                    color: 'var(--figma-color-text-secondary)',
                    background: 'var(--figma-color-bg-secondary)',
                  }}
                >
                  {added.length + modified.length + removed.length}
                </div>
              </Trigger>
            </Header>
            <Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
              <div className="p-1">
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
              </div>
            </Content>
          </Item>
        ) : null;
      })}
    </Root>
  );
}
