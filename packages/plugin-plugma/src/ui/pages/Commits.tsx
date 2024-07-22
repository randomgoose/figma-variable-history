import styles from '../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, HistoryIcon, Search, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';

// reduce bundle size
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('css', css);

import { ICommit } from '../../types';
import { parseDate } from '../../utils/date';
import { getVariableChangesGroupedByCollection } from '../../utils/variable';
import { GroupedChanges } from '../components/GroupedChanges';
import { VariableDetail } from '../components/VariableDetail';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { copyText } from '../../utils/text';

export function Commits({ commits }: { commits: ICommit[] }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [selected, setSelected] = useState('');
  const [selectedVariableId, setSelectedVariableId] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalContent, setExportModalContent] = useState('');
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

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

  const generateChangelog = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'GENERATE_CHANGE_LOG' }, pluginId: '*' }, '*');
  }, []);

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
    // setSelected('');
    const firstCollection = Object.values(groupedChanges)?.[0];

    if (firstCollection) {
      const firstChange = [
        ...firstCollection.added,
        ...firstCollection.modified,
        ...firstCollection.removed,
      ][0];

      if (firstChange) {
        setSelectedVariableId(firstChange.id);
      }
    }
  }, [groupedChanges, setSelectedVariableId]);

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
        className={clsx(
          'flex flex-col hover:w-60 transition-all duration-300 border-r border-[color:var(--figma-color-border)] shrink-0',
          searching ? 'w-60' : 'w-[38px]'
        )}
      >
        {searching ? (
          <div className="px-2 py-2 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center border-b">
              <input
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-7 pl-1 grow"
                placeholder="Search variables in commits"
              />
              <button
                className="btn-ghost w-6 h-6 rounded-full"
                onClick={() => {
                  setSearching(false);
                  setKeyword('');
                }}
              >
                <X size={12} />
              </button>
            </div>

            <div className="overflow-auto grow">
              <div className="grow">
                {keyword &&
                  commits.map((commit) => {
                    const index = commits.findIndex((c) => c.id === commit.id);
                    const groupedChanges =
                      index > -1
                        ? getVariableChangesGroupedByCollection({
                            current: commits[index]?.variables,
                            prev: commits[index + 1]?.variables || [],
                          })
                        : {};

                    const matchedVariables = Object.entries(groupedChanges).filter(
                      ([, changes]) =>
                        [...changes.added, ...changes.modified, ...changes.removed].filter((v) =>
                          v.name.includes(keyword)
                        ).length > 0
                    );

                    return (
                      matchedVariables.length > 0 && (
                        <div
                          onClick={() => {
                            setSelected(commit.id);
                            setSearching(false);
                            setKeyword('');
                          }}
                          className="p-3 border rounded-md mt-2"
                          key={commit.id}
                        >
                          <div className="font-semibold">{commit.summary}</div>
                          <div className="mt-1">
                            {matchedVariables.map(
                              ([collectionId, { added, modified, removed }]) => (
                                <div key={collectionId} className="flex flex-col">
                                  {added
                                    .filter((v) => v.name.includes(keyword))
                                    .map((v) => (
                                      <div
                                        style={{ color: 'var(--figma-color-text-success)' }}
                                        key={v.id}
                                      >
                                        {v.name}
                                      </div>
                                    ))}
                                  {modified
                                    .filter((v) => v.name.includes(keyword))
                                    .map((v) => (
                                      <div
                                        style={{ color: 'var(--figma-color-text-warning)' }}
                                        key={v.id}
                                      >
                                        {v.name}
                                      </div>
                                    ))}
                                  {removed
                                    .filter((v) => v.name.includes(keyword))
                                    .map((v) => (
                                      <div
                                        className="line-through"
                                        style={{ color: 'var(--figma-color-text-danger)' }}
                                        key={v.id}
                                      >
                                        {v.name}
                                      </div>
                                    ))}
                                </div>
                              )
                            )}
                          </div>
                          <div
                            className="mt-2"
                            style={{ color: 'var(--figma-color-text-secondary)' }}
                          >
                            {parseDate(commit.date)}
                          </div>
                        </div>
                      )
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={'flex items-center pr-2 justify-between overflow-hidden'}>
              <div className="flex grow items-center">
                <h3 className={'font-medium leading-4 px-3 py-4 flex gap-3 whitespace-nowrap'}>
                  <HistoryIcon
                    size={16}
                    className="text-[color:var(--figma-color-text-tertiary)] shrink-0"
                  />
                  History
                </h3>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      className="btn-ghost ml-auto w-7 h-7"
                      onClick={() => {
                        setSearching(true);
                      }}
                    >
                      <Search size={12} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content side="bottom" className="tooltip-content">
                      Search
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button className="btn-ghost w-7 h-7" onClick={generateChangelog}>
                      <ArrowDownToLine size={12} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content side="bottom" className="tooltip-content">
                      Generate changelog
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>
            <motion.div
              className="[&::-webkit-scrollbar]:w-0"
              style={{ height: '100%', overflow: 'auto' }}
            >
              <div>
                {commits.map((commit) => {
                  const collaborator = commit.collaborators[0];

                  return (
                    <div
                      key={commit.id}
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
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {selectedCommit ? (
        <div className="w-full h-full flex flex-col">
          <div className="border-b px-4 py-4 flex items-center">
            <div>
              <div className="font-semibold text-xs">
                {selectedCommit?.summary || 'Untitled commit'}
              </div>
              <div className="items-center mt-2">
                <div className={'flex items-center gap-1 whitespace-nowrap'}>
                  <img
                    className={styles.commitItem__avatar}
                    src={selectedCommit?.collaborators[0]?.photoUrl || ''}
                  />
                  {selectedCommit?.collaborators[0]?.name}
                </div>
                <div
                  className="pl-5 mt-1 line-clamp-2 max-w-96"
                  style={{ color: 'var(--figma-color-text-secondary)' }}
                >
                  {selectedCommit?.description || 'No description'}
                </div>
              </div>
            </div>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="btn-outline ml-auto">Restore</button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content h-fit">
                  <Dialog.Title className="dialog-title">
                    Restore to {selectedCommit.summary}
                  </Dialog.Title>
                  <div className="p-4">
                    <p>Are you sure you want to restore to this commit?</p>
                  </div>

                  <div className="flex gap-2 justify-end p-[10px]">
                    <Dialog.Close autoFocus asChild>
                      <button className="btn-outline">Cancel</button>
                    </Dialog.Close>
                    <button className="btn-primary" onClick={() => resetCommit(selectedCommit)}>
                      Confirm
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <button
              onClick={() => convertCommitVariablesToCss(selectedCommit)}
              className="btn-primary ml-2"
            >
              Export
            </button>
          </div>
          <div className="grow flex overflow-hidden">
            <div className="relative flex grow">
              <div
                className="overflow-auto p-2 w-60 shrink-0"
                style={{ background: 'var(--figma-color-bg-secondary)' }}
              >
                <GroupedChanges
                  selected={selectedVariableId}
                  groupedChanges={groupedChanges}
                  onClickVariableItem={(id) => {
                    setSelectedVariableId(id);
                  }}
                />
              </div>

              <div className="grow overflow-auto" style={{ background: 'var(--figma-color-bg)' }}>
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
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="dialog-title">Export Variables</Dialog.Title>
            <Dialog.Close asChild>
              <button className="w-8 h-8 absolute top-1 right-1 rounded-sm hover:bg-[color:var(--figma-color-bg-secondary)] text-[color:var(--figma-color-icon-secondary)] flex items-center justify-center">
                <X size={16} />
              </button>
            </Dialog.Close>
            <div
              className="p-3 flex flex-col gap-3 overflow-auto"
              style={{ height: 'calc(100% - 40px)' }}
            >
              <SyntaxHighlighter
                style={docco}
                customStyle={{ height: '100%', margin: 0, overflow: 'auto' }}
                language="CSS"
              >
                {decodedContent}
              </SyntaxHighlighter>
              {/* {decodeURIComponent(exportModalContent)} */}
              <div className="flex items-center gap-2 w-full">
                <button
                  className="btn-outline grow"
                  onClick={() => {
                    copyText(decodedContent);
                  }}
                >
                  Copy
                </button>
                <button className="btn-primary grow" onClick={onExport}>
                  Export
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
