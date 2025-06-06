import { useContext, useEffect, useState } from 'react';
import { VariableDetail } from '../components/VariableDetail';
import { AppContext } from '../../AppContext';
import { GroupedChanges } from '../components/GroupedChanges';
import { CommitModal } from '../components/CommitModal';
import { Search } from '../components/Search';
import { AnimatePresence } from 'motion/react';
import { EmptyState } from '../components';
import { Preview } from '../components/Preview';
import { useTranslation } from '../../hooks/useTranslation';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { PLUGIN_DATA_KEY_PREFIX } from '../../config';
import { useCommitBridge } from '../../hooks/useCommitBridge';

function Changes() {
  const [, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<string>('');
  const { groupedChanges, collections, variables, commits: cloudCommits, legacyCommits, fileUUID, checkedVariableIds } =
    useContext(AppContext);
  const { isLoading } = useCommitBridge(fileUUID);

  const { t } = useTranslation();

  const commits = (fileUUID && cloudCommits.length > 0) ? cloudCommits : legacyCommits ? legacyCommits : [];
  const isLegacy = legacyCommits?.length > 0 && !fileUUID;

  useEffect(() => {
    setCollectionList(collections.map((c) => c.id));
  }, [collections]);

  const numOfChanges = Object.values(groupedChanges).reduce(
    (acc, { added, modified, removed }) => acc + added.length + modified.length + removed.length,
    0
  );

  const numOfCheckedChanges = Object.values(groupedChanges).reduce(
    (acc, { added, modified, removed }) =>
      acc +
      added.filter((v) => checkedVariableIds.includes(v.id)).length +
      modified.filter((v) => checkedVariableIds.includes(v.id)).length +
      removed.filter((v) => checkedVariableIds.includes(v.id)).length,
    0
  );

  useEffect(() => {
    setSelected('');
  }, [numOfChanges]);

  useEffect(() => {
    const firstCollection = Object.values(groupedChanges).find((collection) => collection.added.length > 0 || collection.modified.length > 0 || collection.removed.length > 0);

    if (firstCollection) {
      const firstChange = [
        ...firstCollection.added,
        ...firstCollection.modified,
        ...firstCollection.removed,
      ][0];

      if (firstChange) {
        if (!selected) {
          setSelected(firstChange.id);
        }
      }
    }
  }, [groupedChanges]);

  const disabled =
    numOfChanges === 0 ||
    Object.values(groupedChanges).every((collection) => {
      const { added, modified, removed } = collection;

      return (
        added.every((variable) => !checkedVariableIds.includes(variable.id)) &&
        modified.every((variable) => !checkedVariableIds.includes(variable.id)) &&
        removed.every((variable) => !checkedVariableIds.includes(variable.id))
      );
    });

  return (
    <PanelGroup
      style={{ height: 'calc(100vh - 40px)' }}
      direction="horizontal"
      autoSaveId={`${PLUGIN_DATA_KEY_PREFIX}-panel-group`}
    >
      <Panel defaultSize={25} minSize={20} maxSize={50}>
        <div
          className={'h-full flex flex-col border-r shrink-0'}
          style={{ borderColor: 'var(--figma-color-border)' }}
        >
          <div className="bg-[var(--figma-color-bg)] h-[calc(100%-48px)]">
            <Search value={keyword} onChange={setKeyword} />
            <div
              className="[&::-webkit-scrollbar]:w-0 flex bg-[var(--figma-color-bg-secondary)] p-1"
              style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}
            >
              <div className="flex flex-col h-full w-full">
                {(numOfChanges > 0 && (!fileUUID || fileUUID && !isLoading)) ? (
                  <GroupedChanges
                    keyword={keyword}
                    selected={selected}
                    groupedChanges={groupedChanges}
                    onClickVariableItem={(id) => setSelected(id)}
                    checkbox={true}
                  />
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </div>

          {!isLegacy ? (
            <div
              style={{ borderColor: 'var(--figma-color-border)' }}
              className="flex items-center justify-between px-4 py-3 border-t h-12 shrink-0"
            >
              <div className="text-[color:var(--figma-color-text-secondary)]">
                {numOfChanges} {t('num_of_changes')}
              </div>

              <CommitModal
                disabled={disabled || isLegacy}
                numOfChanges={numOfChanges}
                numOfCheckedChanges={numOfCheckedChanges}
              />
            </div>
          ) : <div
            className="text-[color:var(--figma-color-text-secondary)] flex items-center justify-center h-12 border-t"
            style={{ borderColor: 'var(--figma-color-border)' }}
          >
            {t('legacy_changes')}
          </div>}
        </div>
      </Panel>
      <PanelResizeHandle />
      <Panel>
        <AnimatePresence>
          {
            selected ? (
              <VariableDetail
                current={variables.find((v) => v.id === selected)}
                currentCollection={collections.find(
                  (c) => c.id === variables.find((v) => v.id === selected)?.variableCollectionId
                )}
                prev={commits?.[0]?.variables.find((v: Variable) => v.id === selected)}
                prevCollection={commits?.[0]?.collections.find(
                  (c) =>
                    c.id ===
                    commits?.[0]?.variables.find((v) => v.id === selected)?.variableCollectionId
                )}
              />
            ) : (
              <Preview />
            )}
        </AnimatePresence>
      </Panel>
    </PanelGroup>
  );
}

export default Changes;
