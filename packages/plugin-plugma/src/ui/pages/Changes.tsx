import { useContext, useEffect, useState } from 'react';
import { VariableDetail } from '../components/VariableDetail';
import { AppContext } from '../../AppContext';
import { getVariableChangesGroupedByCollection } from '../../utils/variable';
import { GroupedChanges } from '../components/GroupedChanges';
import { CommitModal } from '../components/CommitModal';

export function Changes() {
  const [, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const [selected, setSelected] = useState<string>('');

  const { variables, collections, commits } = useContext(AppContext);
  const lastCommit = commits[0];

  useEffect(() => {
    setCollectionList(collections.map((c) => c.id));
  }, [collections]);

  const groupedChanges = getVariableChangesGroupedByCollection({
    prev: lastCommit ? lastCommit.variables : [],
    current: variables,
  });

  const numOfChanges = Object.values(groupedChanges).reduce(
    (acc, { added, modified, removed }) => acc + added.length + modified.length + removed.length,
    0
  );
  const disabled = numOfChanges === 0;

  return (
    <div className="w-full flex" style={{ height: 'calc(100vh - 41px)' }}>
      <div className={'flex flex-col border-r shrink-0'} style={{ width: selected ? 240 : '100%' }}>
        <div style={{ height: 'calc(100% - 57px)', background: 'var(--figma-color-bg-secondary)' }}>
          <input
            placeholder="Search variables"
            className="h-[41px] w-full flex-shrink-0 rounded-none border-b outline-none px-4"
          />
          <div
            className="[&::-webkit-scrollbar]:w-0"
            style={{ padding: 6, height: 'calc(100% - 41px)', overflow: 'auto' }}
          >
            <div className="flex flex-col overflow-auto">
              <GroupedChanges
                groupedChanges={groupedChanges}
                onClickVariableItem={(id) => setSelected(id)}
              />
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

      {selected ? <VariableDetail id={selected} /> : null}
    </div>
  );
}
