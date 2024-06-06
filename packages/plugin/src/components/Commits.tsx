import { h } from "preact";
import {
  ConvertCommitVariablesToCssHandler,
  GenerateChangeLogHandler,
  ICommit,
  RestoreCommitHandler,
} from '../types';
import { parseDate } from '../features';
import styles from '../styles.css';
import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-context-menu';
import { useCallback, useRef, useState } from 'preact/hooks';
import { Button, IconButton, IconStarFilled16, Modal } from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { getVariableChanges } from '../features';
import { VariableItem } from './VariableItem';
import { useAppStore } from '../store';
import SyntaxHighlighter from 'react-syntax-highlighter';

export function Commits(props: { commits: ICommit[] }) {
  const [selected, setSelected] = useState('');
  const { exportModalOpen, exportModalContent, setExportModalOpen } = useAppStore();
  const ref = useRef<HTMLAnchorElement>(null);

  const decodedContent = decodeURIComponent(exportModalContent);

  const { commits } = props;

  const index = commits.findIndex((c) => c.id === selected);

  const { added, modified } = getVariableChanges({
    current: commits[index]?.variables,
    prev: commits[index + 1]?.variables,
  });

  const onExport = useCallback(() => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(`export interface ${name} {\n\t${decodedContent}\n}`);

    const dl = ref.current;
    if (dl) {
      dl.setAttribute('href', dataStr);
      dl.setAttribute('download', 'variables.css');
      dl.click();
    }
  }, [exportModalContent]);

  // const str = (entries as any[]).map(([propertyName, value]) => {
  //     return `${propertyName.split("#")[0].toLowerCase()}: ${value}; ${descriptions[propertyName] ? `\n\t/**\n\t * ${descriptions[propertyName]}\n\t */` : ""}`
  // }).join("\n\t")

  // const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(`export interface ${name} {\n\t${str}\n}`)
  // const dl = document.querySelector("#download")

  // if (dl) {
  //     dl?.setAttribute("href", dataStr)
  //     dl?.setAttribute("download", "types.ts");

  //     (dl as HTMLAnchorElement)?.click()
  // }

  return (
    <div className={styles.container} style={{ flexDirection: 'row' }}>
      {/* Download trigger */}
      <a id={'download'} style={{ visibility: 'hidden' }} ref={ref} />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className={styles.commits__header}>
          <h3 className={styles.title}>Commit History</h3>
          <IconButton onClick={() => emit<GenerateChangeLogHandler>('GENERATE_CHANGE_LOG')}>
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
                        <div style={{ color: 'var(--figma-color-text-secondary)' }} className={''}>
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
                          emit<RestoreCommitHandler>('RESTORE_COMMIT', commit.id);
                        }}
                      >
                        Restore this commit
                      </Item>
                      <Item
                        className={styles.dropdown__item}
                        onClick={async () => {
                          emit<ConvertCommitVariablesToCssHandler>(
                            'CONVERT_VARIABLES_TO_CSS',
                            commit.id
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
          style={{
            borderLeft: '1px solid var(--figma-color-border)',
            width: 400,
            flexShrink: 0,
            overflow: 'auto',
          }}
        >
          {added.map((v) => (
            <VariableItem variable={v} key={v.id} type="Added" />
          ))}
          {modified.map((v) => (
            <VariableItem variable={v} key={v.id} type="Modified" />
          ))}
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
