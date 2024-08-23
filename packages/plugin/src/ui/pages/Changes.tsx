import { useContext, useEffect, useState } from 'react';
import { VariableDetail } from '../components/VariableDetail';
import { AppContext } from '../../AppContext';
import { GroupedChanges } from '../components/GroupedChanges';
import { CommitModal } from '../components/CommitModal';
import { Search } from '../components/Search';
import { AnimatePresence } from 'framer-motion';
import { EmptyState } from '../components';
import { Preview } from '../components/Preview';

export function Changes() {
  const [, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<string>('');

  const { groupedChanges, collections, variables, commits } = useContext(AppContext);

  useEffect(() => {
    setCollectionList(collections.map((c) => c.id));
  }, [collections]);

  const numOfChanges = Object.values(groupedChanges).reduce(
    (acc, { added, modified, removed }) => acc + added.length + modified.length + removed.length,
    0
  );

  useEffect(() => {
    setSelected('');
  }, [numOfChanges]);

  useEffect(() => {
    const firstCollection = Object.values(groupedChanges)?.[0];

    if (firstCollection) {
      const firstChange = [
        ...firstCollection.added,
        ...firstCollection.modified,
        ...firstCollection.removed,
      ][0];

      if (firstChange) {
        setSelected(firstChange.id);
      }
    }
  }, [groupedChanges]);

  const disabled = numOfChanges === 0;

  return (
    <div className="w-full flex" style={{ height: 'calc(100vh - 40px)' }}>
      <div
        className={'flex flex-col border-r shrink-0 w-60'}
        style={{ borderColor: 'var(--figma-color-border)' }}
      >
        <div style={{ height: 'calc(100% - 57px)', background: 'var(--figma-color-bg-secondary)' }}>
          <Search value={keyword} onChange={setKeyword} />
          <div
            className="[&::-webkit-scrollbar]:w-0"
            style={{ padding: 6, height: 'calc(100% - 40px)', overflow: 'auto' }}
          >
            <div className="flex flex-col overflow-auto h-full">
              {numOfChanges > 0 ? (
                <GroupedChanges
                  keyword={keyword}
                  selected={selected}
                  groupedChanges={groupedChanges}
                  onClickVariableItem={(id) => setSelected(id)}
                />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>

        <div
          style={{ borderColor: 'var(--figma-color-border)' }}
          className="flex items-center justify-between px-4 py-3 border-t"
        >
          <div className="text-[color:var(--figma-color-text-secondary)]">
            {numOfChanges} changes
          </div>

          <CommitModal disabled={disabled} />
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <VariableDetail
            current={variables.find((v) => v.id === selected)}
            currentCollection={collections.find(
              (c) => c.id === variables.find((v) => v.id === selected)?.variableCollectionId
            )}
            prev={commits?.[0]?.variables.find((v: Variable) => v.id === selected)}
            prevCollection={commits?.[0]?.collections.find(
              (c) => c.id === variables.find((v) => v.id === selected)?.variableCollectionId
            )}
          />
        ) : numOfChanges > 0 ? null : (
          <Preview />
        )}
      </AnimatePresence>
    </div>
  );
}
