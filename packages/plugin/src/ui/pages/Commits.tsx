import styles from '../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { emit, on } from '@create-figma-plugin/utilities';
import { Button, IconButton, IconStarFilled16, Modal } from '@create-figma-plugin/ui';
import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-context-menu';

// reduce bundle size
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';

SyntaxHighlighter.registerLanguage('css', css);

import {
  ConvertCommitVariablesToCssDoneHandler,
  ConvertCommitVariablesToCssHandler,
  GenerateChangeLogHandler,
  ICommit,
  ResetCommitHandler,
  RevertCommitHandler,
} from '../../types';
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
    on<ConvertCommitVariablesToCssDoneHandler>('CONVERT_VARIABLES_TO_CSS_DONE', (content) => {
      setExportModalOpen(true);
      setExportModalContent(content);
    });
  }, []);

  useEffect(() => {
    setSelectedVariableId('');
  }, [selected]);

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
    <div className={styles.container} style={{ flexDirection: 'row' }}>
      {/* Download trigger */}
      <a id="download" style={{ visibility: 'hidden', pointerEvents: 'none' }} ref={ref} />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className={styles.commits__header}>
          <h3 className={styles.title}>Commit History</h3>
          <IconButton
            title="Generate Changelog"
            onClick={() => emit<GenerateChangeLogHandler>('GENERATE_CHANGE_LOG')}
          >
            <IconStarFilled16 />
          </IconButton>
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
                          <div class={styles.commitItem__user}>
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
                        onClick={() => emit<RevertCommitHandler>('REVERT_COMMIT', commit.id)}
                      >
                        Revert this commit
                      </Item>
                      <Item
                        className={styles.dropdown__item}
                        onClick={() => emit<ResetCommitHandler>('RESET_COMMIT', commit.id)}
                      >
                        Reset to this commit
                      </Item>
                      <Item
                        className={styles.dropdown__item}
                        onClick={async () =>
                          emit<ConvertCommitVariablesToCssHandler>(
                            'CONVERT_VARIABLES_TO_CSS',
                            commit.id
                          )
                        }
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
          style={{
            position: 'relative',
            borderLeft: '1px solid var(--figma-color-border)',
            width: 400,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              overflow: 'auto',
              background: 'var(--figma-color-bg-secondary)',
              padding: 8,
              height: '100%',
            }}
          >
            <GroupedChanges
              groupedChanges={groupedChanges}
              onClickVariableItem={(id) => {
                setSelectedVariableId(id);
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
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

      <Modal
        open={exportModalOpen}
        title="Export content"
        style={{
          height: '100%',
          maxHeight: 'calc(100vh - 80px)',
          maxWidth: 480,
          overflow: 'hidden',
        }}
        onCloseButtonClick={() => setExportModalOpen(false)}
      >
        <div
          style={{
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 41px)',
            gap: 12,
          }}
        >
          <SyntaxHighlighter customStyle={{ margin: 0, overflow: 'auto' }} language="CSS">
            {decodedContent}
          </SyntaxHighlighter>
          {/* {decodeURIComponent(exportModalContent)} */}
          <Button style={{ width: '100%' }} secondary onClick={onExport}>
            Export
          </Button>
        </div>
      </Modal>
    </div>
  );
}
