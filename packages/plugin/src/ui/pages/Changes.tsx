import { useContext, useEffect, useState } from 'react';
import { VariableDetail } from '../components/VariableDetail';
import { AppContext } from '../../AppContext';
import { GroupedChanges } from '../components/GroupedChanges';
import { CommitModal } from '../components/CommitModal';
import { Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { EmptyState } from '../components';

export function Changes() {
  const [, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const [selected, setSelected] = useState<string>('');

  const { groupedChanges, collections, keyword, setKeyword, variables, commits } =
    useContext(AppContext);

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
      <div className={'flex flex-col border-r shrink-0 w-60'}>
        <div style={{ height: 'calc(100% - 57px)', background: 'var(--figma-color-bg-secondary)' }}>
          <div className="relative">
            <Search
              className="absolute text-[color:var(--figma-color-icon-tertiary)] top-1/2 left-3 -translate-y-1/2"
              size={13}
            />
            <input
              placeholder="Search variables"
              className="h-10 w-full flex-shrink-0 rounded-none border-b outline-none px-4 pl-8"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div
            className="[&::-webkit-scrollbar]:w-0"
            style={{ padding: 6, height: 'calc(100% - 40px)', overflow: 'auto' }}
          >
            <div className="flex flex-col overflow-auto h-full">
              {numOfChanges > 0 ? (
                <GroupedChanges
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

        <div className="flex items-center justify-between px-4 py-3 border-t">
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
            prev={commits?.[0]?.variables.find((v: Variable) => v.id === selected)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
