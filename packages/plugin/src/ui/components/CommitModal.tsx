import { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import { useSync } from '../../hooks/use-sync';
import { Root, Trigger, Portal, Overlay, Content, Title, Close } from '@radix-ui/react-dialog';
import { GitHubLogo } from '../icons/GitHubLogo';
import { AnimatePresence } from 'framer-motion';
import { SyncProgress } from './SyncProgress';
import { SyncToGitStage } from '../../features/sync-to-git';
import clsx from 'clsx';
import * as Switch from '@radix-ui/react-switch';
import { sendMessage } from '../../utils/message';
import { Feedback } from './Feedback';

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

  const { variables, collections, setting, commits, setTab } = useContext(AppContext);
  const { syncGit, stage, setStage, cssContent, result } = useSync();

  const hasMissingFields =
    setting.git?.filePath === '' ||
    setting.git?.repository === '' ||
    setting.git?.token === '' ||
    setting.git?.owner === '';

  useEffect(() => {
    if (shouldSyncGit) {
      const timestamp = +new Date();

      if (setting?.git?.enabled && cssContent && !hasMissingFields) {
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

      if (setting?.git?.enabled) {
        setStage('compile');
        setShouldSyncGit(true);
      } else {
        setStage('commit_success');
      }

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

  const renderStage = (stage: SyncToGitStage | 'commit_success' | '' | 'compile') => {
    if (stage === '') {
      return (
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
              {setting.git?.enabled ? (
                hasMissingFields ? (
                  <div
                    className="underline cursor-pointer"
                    style={{ color: 'var(--figma-color-text-danger)' }}
                    onClick={() => {
                      setTab('settings');
                    }}
                  >
                    Missing fields
                  </div>
                ) : (
                  <div
                    className="truncate font-normal"
                    style={{ color: 'var(--figma-color-text-secondary)' }}
                  >
                    {setting?.git?.repository}
                  </div>
                )
              ) : null}
            </div>
            <Switch.Root
              className={clsx('switch-root ml-auto')}
              checked={setting?.git?.enabled}
              onCheckedChange={(checked) =>
                sendMessage('SET_PLUGIN_SETTING', { git: { ...setting?.git, enabled: checked } })
              }
            >
              <Switch.Thumb className="switch-thumb" />
            </Switch.Root>
          </div>

          <button
            className="btn-primary"
            disabled={summary.length <= 0 || (setting?.git?.enabled && hasMissingFields)}
            onClick={handleClick}
          >
            {setting?.git?.enabled ? 'Commit and sync' : 'Commit'}
          </button>
        </>
      );
    } else if (stage === 'success') {
      return (
        <div className="flex flex-col items-center">
          <Feedback
            title={"You're all set!"}
            description={'The changes are commited and synced with the repository.'}
          />

          <a href={result?.prURL} target="_blank" className="btn-primary mt-4 w-full">
            View the PR
          </a>

          <Close asChild>
            <button className="btn-outline mt-2 w-full">Close</button>
          </Close>
        </div>
      );
    } else if (stage === 'commit_success') {
      return (
        <div>
          <Feedback title={"You're all set!"} description={'The changes are commited.'} />

          <button className="btn-primary mt-4 w-full" onClick={() => setTab('commits')}>
            View commits
          </button>
          <Close asChild>
            <button className="btn-outline mt-2 w-full">Close</button>
          </Close>
        </div>
      );
    } else {
      return <SyncProgress items={gitSyncProgessItems} activeKey={stage} />;
    }
  };

  return (
    <Root
      onOpenChange={(open) => {
        if (!open) {
          setStage('');
        }
      }}
    >
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
                <div className="w-full flex flex-col gap-3">
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
                </div>
              ) : null}
            </AnimatePresence>
            {renderStage(stage)}
            {/* <Close asChild> */}
          </div>
        </Content>
      </Portal>
    </Root>
  );
}
