import { Root, Item, Header, Trigger, Content } from '@radix-ui/react-accordion';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import { VariableItem } from './VariableItem';
import { ChevronRight } from 'lucide-react';
import { VariableChangeType } from '../../types';
// import { VariableChangeType } from '../../types';

export function GroupedChanges({
  groupedChanges,
  onClickVariableItem,
  selected,
  disableInteraction = false,
  keyword = '',
}: {
  groupedChanges: {
    [key: string]: { added: Variable[]; modified: Variable[]; removed: Variable[] };
  };
  onClickVariableItem: (id: string) => void;
  selected?: string;
  disableInteraction?: boolean;
  keyword?: string;
}) {
  const [collectionList, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const { collections, getCollectionName } = useContext(AppContext);

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

  // Find collection name from history commits

  return (
    <Root type="multiple" value={collectionList}>
      {Object.entries(groupedChanges).map(([collectionId, { added, modified, removed }]) => {
        const hasChanges = added.length + modified.length + removed.length > 0;

        return hasChanges ? (
          <Item
            style={{ background: 'var(--figma-color-bg)' }}
            value={collectionId}
            className={
              'rounded-[4px] [&:not(:last-of-type)]:rounded-md [&:not(:last-of-type)]:mb-1.5 shadow-sm'
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
                  {getCollectionName(collectionId) || collectionId}
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
                {/* <AnimatePresence> */}
                {/* TODO: Fix this */}
                {[
                  ...added.map((v) => ({ v, type: 'added' })),
                  ...modified.map((v) => ({ v, type: 'modified' })),
                  ...removed.map((v) => ({ v, type: 'removed' })),
                ]
                  .filter(({ v }) => v.name.includes(keyword))
                  .map(({ v, type }) => (
                    <VariableItem
                      key={v.id}
                      variable={v}
                      type={type as VariableChangeType}
                      selected={v.id === selected}
                      onClick={(id) => onClickVariableItem(id)}
                      allowDiscard={!disableInteraction}
                    />
                  ))}
                {/* </AnimatePresence> */}
              </div>
            </Content>
          </Item>
        ) : null;
      })}
    </Root>
  );
}
