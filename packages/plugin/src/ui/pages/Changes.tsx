// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Root, Item, Header, Trigger, Content } from '@radix-ui/react-accordion';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';
import { VariableItem } from '../components/VariableItem';
import { VariableDetail } from '../components/VariableDetail';
import {
  Button,
  TextboxMultiline,
  Textbox,
  Modal,
  SearchTextbox,
  IconCaretRight16,
} from '@create-figma-plugin/ui';
import styles from '../styles.module.css';
import { emit } from '@create-figma-plugin/utilities';
import { CommitHandler } from '../../types';
import { AppContext } from '../../AppContext';
import { getVariableChangesGroupedByCollection } from '../../utils/variable';

export function Changes() {
  const [collectionList, setCollectionList] = useState<VariableCollection['id'][]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
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

  const toggleCollectionList = (id: string) => {
    if (collectionList.includes(id)) {
      setCollectionList(collectionList.filter((c) => c !== id));
    } else {
      setCollectionList([...collectionList, id]);
    }
  };

  const numOfChanges = Object.values(groupedChanges).reduce(
    (acc, { added, modified, removed }) => acc + added.length + modified.length + removed.length,
    0
  );
  const disabled = numOfChanges === 0;

  const handleClick = useCallback(() => {
    if (!summary) {
      alert('Please provide a summary');
    } else {
      const timestamp = +new Date();
      emit<CommitHandler>('COMMIT', {
        id: `${timestamp}`,
        date: timestamp,
        summary,
        description,
        variables,
        collections,
        collaborators: [],
      });
      setModalOpen(false);
    }
  }, [variables, collections, summary, description]);

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
        <Modal
          open={modalOpen}
          title="Commit variable changes"
          onCloseButtonClick={() => setModalOpen(false)}
        >
          <div className={styles.commitForm}>
            <Textbox
              width={240}
              value={summary}
              onChange={(e) => setSummary(e.currentTarget.value)}
              variant="border"
              placeholder="Summary"
            />
            <TextboxMultiline
              onChange={(e) => setDescription(e.currentTarget.value)}
              value={description}
              variant="border"
              placeholder="Description (optional)"
            />
            <Button onClick={handleClick}>Confirm</Button>
          </div>
        </Modal>

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
              <Root type="multiple" value={collectionList}>
                {Object.entries(groupedChanges).map(
                  ([collectionId, { added, modified, removed }]) => {
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
                              onClick={(id) => setSelected(id)}
                            />
                          ))}
                          {modified.map((v) => (
                            <VariableItem
                              key={v.id}
                              variable={v}
                              type={'modified'}
                              onClick={(id) => setSelected(id)}
                            />
                          ))}
                          {removed.map((v) => (
                            <VariableItem
                              key={v.id}
                              variable={v}
                              type={'removed'}
                              onClick={(id) => setSelected(id)}
                            />
                          ))}
                        </Content>
                      </Item>
                    ) : null;
                  }
                )}
              </Root>
              {/* {numOfChanges > 0 ? (
            <Fragment>
              {Object.entries({ Added: added, Removed: removed, Modified: modified })
                .map(([type, array]) => {
                  return array.map((v) => (
                    <VariableItem
                      key={v.id}
                      variable={v}
                      type={type as any}
                      onClick={(id) => setSelected(id)}
                    />
                  ));
                })
                .flat()}
            </Fragment>
          ) : (
            <EmptyState />
          )} */}
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
