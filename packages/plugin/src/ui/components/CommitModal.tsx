import { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import { useSync } from '../../hooks/use-sync';
import { Root, Trigger, Portal, Overlay, Content, Title, Close } from '@radix-ui/react-dialog';
import { GitHubLogo } from '../icons/GitHubLogo';
import { AnimatePresence } from 'framer-motion';
import { SyncProgress } from './SyncProgress';
import { SyncToGitStage } from '../../features/sync-to-git';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import * as Switch from '@radix-ui/react-switch';
import { sendMessage } from '../../utils/message';

const gitSyncProgessItems: { key: SyncToGitStage | 'compile'; label: string }[] = [
  { key: 'compile', label: 'Compiling...' },
  { key: 'fetch_repo_info', label: 'Fetching repository info...' },
  { key: 'create_branch', label: 'Creating branch...' },
  { key: 'update_file', label: 'Updating file...' },
  { key: 'create_pr', label: 'Creating pull request...' },
];

export function CommitModal({ disabled }: { disabled: boolean }) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [shouldSyncGit, setShouldSyncGit] = useState(false);

  const { variables, collections, setting, commits } = useContext(AppContext);
  const { syncGit, stage, setStage, cssContent, result } = useSync();

  useEffect(() => {
    if (shouldSyncGit) {
      const timestamp = +new Date();

      if (setting?.git?.enabled && cssContent) {
        syncGit(timestamp + '', { ...setting?.git }).then(() => {
          setShouldSyncGit(false);
        });
      }
    }
  }, [shouldSyncGit, cssContent]);

  const handleClick = useCallback(async () => {
    if (!summary) {
      alert('Please provide a summary');
    } else {
      setStage('compile');
      const timestamp = +new Date();

      parent.postMessage(
        {
          pluginMessage: {
            type: 'COMMIT',
            payload: {
              id: `${timestamp}`,
              date: timestamp,
              summary,
              description,
              variables,
              collections,
              collaborators: [],
            },
          },
          pluginId: '*',
        },
        '*'
      );

      setStage('compile');
      setShouldSyncGit(true);

      parent.postMessage(
        {
          pluginMessage: { type: 'CONVERT_VARIABLES_TO_CSS', payload: commits?.[0]?.id },
          pluginId: '*',
        },
        '*'
      );

      // Sync to GitHub
      // if (setting?.git?.enabled) {
      //   await syncGit(timestamp + '', { ...setting.git });
      // }

      // setModalOpen(false);
    }
  }, [variables, collections, summary, description]);

  return (
    <Root>
      <Trigger asChild>
        <button className="btn-primary" disabled={disabled}>
          Commit
        </button>
      </Trigger>
      <Portal>
        <Overlay className="dialog-overlay" />
        <Content className="dialog-content h-fit">
          <Title className="h-10 pl-3 flex items-center font-semibold border-b">Commit</Title>
          <div className={'w-80 flex flex-col gap-3 p-3'}>
            <AnimatePresence>
              {!stage ? (
                <motion.div
                  className="w-full flex flex-col gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, position: 'absolute' }}
                >
                  <input
                    className="input"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Summary"
                  />
                  <textarea
                    className="input"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    placeholder="Description (optional)"
                    style={{ height: 96 }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {stage !== '' ? (
              stage === 'success' ? (
                <div className="flex flex-col items-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      fill="#CFF7D3"
                    />
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="#14AE5C"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <div className="text-sm font-semibold mt-3">You're all set!</div>
                  <div className="mt-1 text-center">
                    The changes are commited and synced <br /> with the repository.
                  </div>

                  <a href={result?.prURL} target="_blank" className="btn-primary mt-4 w-full">
                    View the PR
                  </a>

                  <Close asChild>
                    <button className="btn-outline mt-2 w-full">Close</button>
                  </Close>
                </div>
              ) : (
                <SyncProgress items={gitSyncProgessItems} activeKey={stage} />
              )
            ) : (
              <>
                <div
                  className={clsx(
                    'relative text-center',
                    'before:content-[""] before:inline-block before:w-[calc(50%-24px)] before:h-px before:bg-[color:var(--figma-color-border)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                    'after:content-[""] after:inline-block after:w-[calc(50%-24px)] after:h-px after:bg-[color:var(--figma-color-border)] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2'
                  )}
                  style={{ color: 'var(--figma-color-text-tertiary)' }}
                >
                  Sync
                </div>
                <div
                  className="p-3 rounded-sm flex items-center gap-2 font-medium w-full"
                  style={{ background: 'var(--figma-color-bg-secondary)' }}
                >
                  <div className="shrink-0">
                    <GitHubLogo />
                  </div>
                  <div className="flex flex-col grow overflow-hidden">
                    <div>Sync to GitHub</div>
                    <div
                      className="truncate font-normal"
                      style={{ color: 'var(--figma-color-text-secondary)' }}
                    >
                      {setting?.git?.repository}
                    </div>
                  </div>
                  <Switch.Root
                    className="switch-root ml-auto"
                    checked={setting?.git?.enabled}
                    onCheckedChange={(checked) =>
                      sendMessage('SET_PLUGIN_SETTING', {
                        git: { ...setting?.git, enabled: checked },
                      })
                    }
                  >
                    <Switch.Thumb className="switch-thumb" />
                  </Switch.Root>
                </div>

                <button
                  className="btn-primary"
                  disabled={summary.length <= 0}
                  onClick={handleClick}
                >
                  {setting?.git?.enabled ? 'Commit and sync' : 'Commit'}
                </button>
              </>
            )}
            {/* <Close asChild> */}
          </div>
        </Content>
      </Portal>
    </Root>
  );
}
