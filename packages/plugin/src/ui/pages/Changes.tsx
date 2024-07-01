// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { VariableDetail } from '../components/VariableDetail';
import { Button, SearchTextbox } from '@create-figma-plugin/ui';
import styles from '../styles.module.css';
import { AppContext } from '../../AppContext';
import { getVariableChangesGroupedByCollection } from '../../utils/variable';
import { GroupedChanges } from '../components/GroupedChanges';
import { CommitModal } from '../components/CommitModal';

export function Changes() {
  const [, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');

  const { variables, collections, commits } = useContext(AppContext);
  const lastCommit = commits[0];

  useEffect(() => {
    setCollectionList(collections.map((c) => c.id));
  }, [collections]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupedChanges = getVariableChangesGroupedByCollection({
    prev: lastCommit ? lastCommit.variables : [],
    current: variables,
  });

  // const toggleCollectionList = (id: string) => {
  //   if (collectionList.includes(id)) {
  //     setCollectionList(collectionList.filter((c) => c !== id));
  //   } else {
  //     setCollectionList([...collectionList, id]);
  //   }
  // };

  const numOfChanges = Object.values(groupedChanges).reduce(
    (acc, { added, modified, removed }) => acc + added.length + modified.length + removed.length,
    0
  );
  const disabled = numOfChanges === 0;

  return (
    <div className={styles.container}>
      <div
        style={{
          width: selected ? 240 : '100%',
          minWidth: 240,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--figma-color-border)',
        }}
      >
        <CommitModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <div style={{ height: 'calc(100% - 57px)', background: 'var(--figma-color-bg-secondary)' }}>
          <div
            style={{
              background: 'var(--figma-color-bg)',
              borderBottom: '1px solid var(--figma-color-border)',
            }}
          >
            <SearchTextbox value="" placeholder="Search variables" />
          </div>
          <div style={{ padding: 6, height: 'calc(100% - 41px)', overflow: 'auto' }}>
            <div className={styles.collectionList}>
              <GroupedChanges
                groupedChanges={groupedChanges}
                onClickVariableItem={(id) => setSelected(id)}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div>{numOfChanges} changes</div>
          <Button disabled={disabled} onClick={() => setModalOpen(true)}>
            Commit
          </Button>
        </div>
      </div>

      {selected ? <VariableDetail id={selected} /> : null}
    </div>
  );
}
