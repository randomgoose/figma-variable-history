import styles from '../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-context-menu';
import { HistoryIcon, X } from 'lucide-react';
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
import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Commits({ commits }: { commits: ICommit[] }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [selected, setSelected] = useState('');
  const [selectedVariableId, setSelectedVariableId] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalContent, setExportModalContent] = useState('');

  const selectedCommit = useMemo(() => {
    return commits.find((c) => c.id === selected);
  }, [selected]);

  useEffect(() => {
    addEventListener('message', (e) => {
      if (e.data.pluginMessage.type === 'CONVERT_VARIABLES_TO_CSS_DONE') {
        setExportModalOpen(true);
        setExportModalContent(e.data.pluginMessage.payload);
      }
    });
  }, []);

  // const generateChangelog = useCallback(() => {
  //   parent.postMessage({ pluginMessage: { type: 'GENERATE_CHANGE_LOG' }, pluginId: '*' }, '*');
  // }, []);

  const resetCommit = useCallback((commit: ICommit) => {
    parent.postMessage(
      {
        pluginMessage: { type: 'RESET_COMMIT', payload: commit.id },
        pluginId: '*',
      },
      '*'
    );
  }, []);

  const convertCommitVariablesToCss = useCallback((commit: ICommit) => {
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
  }, []);

  const revertCommit = useCallback((commit: ICommit) => {
    parent.postMessage(
      {
        pluginMessage: { type: 'REVERT_COMMIT', payload: commit.id },
        pluginId: '*',
      },
      '*'
    );
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

  useEffect(() => {
    setSelectedVariableId('');
  }, [selected]);

  useEffect(() => {
    if (commits) {
      setSelected(commits[0]?.id);
    }
  }, []);

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

      <motion.div
        className={
          'flex flex-col w-[38px] hover:w-60 transition-all duration-300 border-r border-[color:var(--figma-color-border)]'
        }
      >
        <div className={'flex items-center pr-4 justify-between'}>
          <h3 className={'font-semibold leading-4 px-3 py-4'}>
            <HistoryIcon size={16} className="text-[color:var(--figma-color-text-tertiary)]" />
            {/* <FileInput size={14} /> */}
          </h3>
        </div>
        <motion.div
          className="[&::-webkit-scrollbar]:w-0"
          style={{ height: '100%', overflow: 'auto' }}
        >
          <div>
            {commits.map((commit) => {
              const collaborator = commit.collaborators[0];

              return (
                <Root key={commit.id}>
                  <Trigger asChild>
                    <div
                      className={clsx(styles.commitItem, 'shrink-0')}
                      onClick={() => setSelected(commit.id)}
                      style={{
                        background: commit.id === selected ? 'var(--figma-color-bg-selected)' : '',
                      }}
                    >
                      <div className={clsx(styles.commitItem__icon, 'shrink-0')} />

                      <div className={clsx(styles.commitItem__content, 'w-fit')}>
                        <div className="whitespace-nowrap" style={{ fontWeight: 500 }}>
                          {commit.summary || 'Untitled commit'}
                        </div>
                        {collaborator ? (
                          <div className={clsx(styles.commitItem__user, 'whitespace-nowrap')}>
                            <img
                              className={styles.commitItem__avatar}
                              src={commit.collaborators[0]?.photoUrl || ''}
                            />
                            {commit.collaborators[0]?.name}
                          </div>
                        ) : null}
                        <div
                          className="mt-2 w-fit whitespace-nowrap"
                          style={{ color: 'var(--figma-color-text-secondary)' }}
                        >
                          {parseDate(commit.date)}
                        </div>
                      </div>
                    </div>
                  </Trigger>

                  <Portal>
                    <Content className={styles.dropdown__content}>
                      <Item className={styles.dropdown__item} onClick={() => revertCommit(commit)}>
                        Revert this commit
                      </Item>
                      <Item className={styles.dropdown__item} onClick={() => resetCommit(commit)}>
                        Reset to this commit
                      </Item>
                      <Item
                        className={styles.dropdown__item}
                        onClick={() => convertCommitVariablesToCss(commit)}
                      >
                        Export variables
                      </Item>
                    </Content>
                  </Portal>
                </Root>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {selectedCommit ? (
        <div className="w-full h-full flex flex-col">
          <div className="border-b px-4 py-4 flex">
            <div>
              <div className="font-semibold">{selectedCommit?.summary || 'Untitled commit'}</div>
              <div style={{ color: 'var(--figma-color-text-secondary)' }}>
                {selectedCommit?.description || 'No description'}
              </div>
            </div>

            <button
              style={{ color: 'var(--figma-color-text-brand)' }}
              className="ml-auto font-medium"
            >
              Export
            </button>
          </div>
          <div className="w-full h-full flex">
            <div className="relative w-full flex flex-grow">
              <div
                className="overflow-auto p-2 h-full w-60 shrink-0"
                style={{ background: 'var(--figma-color-bg-secondary)' }}
              >
                <GroupedChanges
                  groupedChanges={groupedChanges}
                  onClickVariableItem={(id) => {
                    setSelectedVariableId(id);
                  }}
                />
              </div>

              <div className="w-full h-full" style={{ background: 'var(--figma-color-bg)' }}>
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
              style={{ height: 'calc(100% - 40px)' }}
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
