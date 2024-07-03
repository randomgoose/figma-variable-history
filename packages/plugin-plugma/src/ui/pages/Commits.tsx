import styles from '../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-context-menu';
import { FileInput, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

// reduce bundle size
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';

SyntaxHighlighter.registerLanguage('css', css);

import { ICommit } from '../../types';
import { parseDate } from '../../utils/date';
import { getVariableChangesGroupedByCollection } from '../../utils/variable';
import { GroupedChanges } from '../components/GroupedChanges';
import { VariableDetail } from '../components/VariableDetail';

export function Commits({ commits }: { commits: ICommit[] }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [selected, setSelected] = useState('');
  const [selectedVariableId, setSelectedVariableId] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalContent, setExportModalContent] = useState('');

  useEffect(() => {
    addEventListener('message', (e) => {
      if (e.data.pluginMessage.type === 'CONVERT_VARIABLES_TO_CSS_DONE') {
        setExportModalOpen(true);
        setExportModalContent(e.data.pluginMessage.payload);
      }
    });
    // on<ConvertCommitVariablesToCssDoneHandler>('CONVERT_VARIABLES_TO_CSS_DONE', (content) => {
    //   setExportModalOpen(true);
    //   setExportModalContent(content);
    // });
  }, []);

  useEffect(() => {
    setSelectedVariableId('');
  }, [selected]);

  const generateChangelog = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'GENERATE_CHANGE_LOG' }, pluginId: '*' }, '*');
  }, []);

  const decodedContent = decodeURIComponent(exportModalContent);

  const groupedChanges = useMemo(() => {
    const index = commits.findIndex((c) => c.id === selected);
    return index > -1
      ? getVariableChangesGroupedByCollection({
          current: commits[index]?.variables,
          prev: commits[index + 1]?.variables || [],
        })
      : {};
  }, [commits, selected]);

  const onExport = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(decodedContent);

    const dl = ref.current;
    if (dl) {
      dl.setAttribute('href', dataStr);
      dl.setAttribute('download', 'variables.css');
      dl.click();
    }
  }, [exportModalContent]);

  return (
    <div className={'flex w-full'} style={{ height: 'calc(100vh - 40px)' }}>
      {/* Download trigger */}
      <a id="download" className="pointer-events-none hidden" ref={ref} />

      <div className="w-full flex flex-col">
        <div className={'flex items-center pr-4 justify-between'}>
          <h3 className={'font-semibold leading-4 px-3 py-4'}>Commit History</h3>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-[4px] hover:bg-[color:var(--figma-color-bg-secondary)]"
            title="Generate Changelog"
            onClick={generateChangelog}
          >
            <FileInput size={14} />
          </button>
        </div>
        <div style={{ height: '100%', overflow: 'auto' }}>
          <div>
            {commits.map((commit) => {
              const collaborator = commit.collaborators[0];

              return (
                <Root key={commit.id}>
                  <Trigger asChild>
                    <div
                      className={styles.commitItem}
                      onClick={() => setSelected(commit.id)}
                      style={{
                        background: commit.id === selected ? 'var(--figma-color-bg-selected)' : '',
                      }}
                    >
                      <div className={styles.commitItem__icon} />

                      <div className={styles.commitItem__content}>
                        <div style={{ fontWeight: 500 }}>{commit.summary || 'Untitled commit'}</div>
                        {commit.description ? (
                          <div style={{ fontWeight: 500 }}>{commit.description}</div>
                        ) : null}
                        {collaborator ? (
                          <div className={styles.commitItem__user}>
                            <img
                              className={styles.commitItem__avatar}
                              src={commit.collaborators[0]?.photoUrl || ''}
                            />
                            {commit.collaborators[0]?.name}
                          </div>
                        ) : null}
                        <div style={{ color: 'var(--figma-color-text-secondary)' }}>
                          {parseDate(commit.date)}
                        </div>
                      </div>
                    </div>
                  </Trigger>

                  <Portal>
                    <Content className={styles.dropdown__content}>
                      <Item
                        className={styles.dropdown__item}
                        onClick={() => {
                          parent.postMessage(
                            {
                              pluginMessage: { type: 'REVERT_COMMIT', payload: commit.id },
                              pluginId: '*',
                            },
                            '*'
                          );
                        }}
                      >
                        Revert this commit
                      </Item>
                      <Item
                        className={styles.dropdown__item}
                        onClick={() => {
                          parent.postMessage(
                            {
                              pluginMessage: { type: 'RESET_COMMIT', payload: commit.id },
                              pluginId: '*',
                            },
                            '*'
                          );
                        }}
                      >
                        Reset to this commit
                      </Item>
                      <Item
                        className={styles.dropdown__item}
                        onClick={async () => {
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'CONVERT_VARIABLES_TO_CSS',
                                payload: commit.id,
                              },
                              pluginId: '*',
                            },
                            '*'
                          );
                        }}
                      >
                        Export variables
                      </Item>
                    </Content>
                  </Portal>
                </Root>
              );
            })}
          </div>
        </div>
      </div>

      {selected ? (
        <div
          className="relative w-[400px] shrink-0"
          style={{ borderLeft: '1px solid var(--figma-color-border)' }}
        >
          <div
            className="overflow-auto p-2 h-full"
            style={{ background: 'var(--figma-color-bg-secondary)' }}
          >
            <GroupedChanges
              groupedChanges={groupedChanges}
              onClickVariableItem={(id) => {
                setSelectedVariableId(id);
              }}
            />
          </div>

          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              background: 'var(--figma-color-bg)',
              borderTop: '1px solid var(--figma-color-border)',
            }}
          >
            {selectedVariableId ? (
              <VariableDetail
                id={selectedVariableId}
                current={commits
                  .find((c) => c.id === selected)
                  ?.variables.find((v) => v.id === selectedVariableId)}
                prev={commits[commits.findIndex((c) => c.id === selected) + 1]?.variables.find(
                  (v) => v.id === selectedVariableId
                )}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <Dialog.Root open={exportModalOpen} onOpenChange={(open) => setExportModalOpen(open)}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            <Dialog.Title className="h-10 pl-3 flex items-center font-semibold border-b">
              Export Variables
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="w-8 h-8 absolute top-1 right-1 rounded-sm hover:bg-[color:var(--figma-color-bg-secondary)] text-[color:var(--figma-color-icon-secondary)] flex items-center justify-center">
                <X size={16} />
              </button>
            </Dialog.Close>
            <div
              className="p-3 flex flex-col gap-3 overflow-auto"
              style={{ height: 'calc(100% - 41px)' }}
            >
              <SyntaxHighlighter customStyle={{ margin: 0, overflow: 'auto' }} language="CSS">
                {decodedContent}
              </SyntaxHighlighter>
              {/* {decodeURIComponent(exportModalContent)} */}
              <button className="btn-outline w-full" onClick={onExport}>
                Export
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
