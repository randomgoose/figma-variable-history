import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import { Root, Trigger, Portal, Overlay, Content, Title } from '@radix-ui/react-dialog';
import { AnimatePresence } from 'framer-motion';
import { syncToGit } from '../../features/sync-to-git';
import { sendMessage } from '../../utils/message';
import { syncToSlackChannel } from '../../features/sync-to-slack-channel';
import { CustomHTTPSyncConfig, GitHubSyncConfig, SlackSyncConfig } from '../../types';
import { IconCircleCheckFilled, IconCircleXFilled } from '@tabler/icons-react';
import { sendCustomRequest } from '../../features/send-custom-request';
import { SyncTaskIcon } from './SyncTaskIcon';

const syncProgressMap: { [key: string]: ReactNode } = {
  pending: 'Pending',
  compile: 'Compiling...',
  fetch: 'Fetching...',
  fetch_repo_info: 'Fetching repository info...',
  create_branch: 'Creating branch...',
  update_file: 'Updating file...',
  create_pr: 'Creating pull request...',
  get_upload_url: 'Getting upload url...',
  upload_file: 'Uploading file...',
  finish_upload: 'Finishing upload...',
  success: <IconCircleCheckFilled size={14} style={{ color: 'var(--figma-color-text-success)' }} />,
  error: <IconCircleXFilled size={14} style={{ color: 'var(--figma-color-text-danger)' }} />,
};

export function CommitModal({ disabled }: { disabled: boolean }) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [shouldSync, setShouldSync] = useState(false);
  const [syncTaskStatus, setSyncTaskStatus] = useState<string[]>([]);
  const [syncTaskResults, setSyncTaskResults] = useState<any[]>([]);
  const {
    variables,
    collections,
    setting,
    commits,
    setTab,
    compiledVariables,
    clearCompiledVariables,
  } = useContext(AppContext);
  const [view, setView] = useState<'commit' | 'sync'>('commit');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    clearCompiledVariables();
  }, []);

  useEffect(() => {
    const commit = commits[0];

    if (shouldSync && commit && compiledVariables.css) {
      setShouldSync(false);
      Promise.all(
        setting?.syncTasks.map(async ({ type, config }, index) => {
          switch (type) {
            case 'github':
              const {
                filePath,
                owner,
                repository,
                token: githubToken,
              } = config as GitHubSyncConfig;
              await syncToGit({
                content: compiledVariables.css,
                path: filePath,
                repository: { owner, name: repository, token: githubToken },
                branch: `figma-variable-${commit?.id}`,
                commitMessage: `style: auto update css variables via Figma plugin accord to commit:${commit?.id}`,
                pullRequest: {
                  title: `[Figma Variable History] ${commit?.summary}`,
                  body: `${commit?.description || 'No description'}
                \n\nThis PR is created by Variable History plugin
                `,
                },
                onStageChange: (stage) => {
                  setSyncTaskStatus((prev) => {
                    const status = [...prev];
                    status[index] = stage;
                    return status;
                  });
                },
                onSuccess: (url) => {
                  setSyncTaskResults((prev) => {
                    const results = [...prev];
                    results[index] = url;
                    return results;
                  });
                },
              });
              break;
            case 'slack':
              const { filename, channelId, token } = config as SlackSyncConfig;
              await syncToSlackChannel({
                filename: filename,
                channelId: channelId,
                token: token,
                content: compiledVariables.css,
                commit,
                onStageChange: (stage) => {
                  setSyncTaskStatus((prev) => {
                    const status = [...prev];
                    status[index] = stage;
                    return status;
                  });
                },
              });
              break;
            case 'custom':
              const { address } = config as CustomHTTPSyncConfig;
              sendCustomRequest({
                url: address,
                commit: commits[0],
                content: compiledVariables.css,
                onStageChange: (stage) => {
                  setSyncTaskStatus((prev) => {
                    const status = [...prev];
                    status[index] = stage;
                    return status;
                  });
                },
              });
              break;
          }
        })
      ).then(() => {
        // console.log('Completed');
      });
    }
  }, [shouldSync, compiledVariables.css, setting?.syncTasks, setSyncTaskStatus, commits]);

  const handleClick = useCallback(async () => {
    if (!summary) {
      alert('Please provide a summary');
    } else {
      const timestamp = +new Date();

      sendMessage('COMMIT', {
        id: `${timestamp}`,
        date: timestamp,
        summary,
        description,
        variables,
        collections,
        collaborators: [],
      });
      sendMessage('CONVERT_VARIABLES_TO_CSS');
      setShouldSync(true);

      if (setting?.syncTasks.length > 0) {
        setView('sync');
      } else {
        setOpen(false);
      }

      setSyncTaskStatus(setting?.syncTasks.map(() => 'pending'));
      setSyncTaskResults(setting?.syncTasks.map(() => null));
    }
  }, [variables, collections, summary, description]);

  const renderStage = () => {
    if (view === 'commit') {
      return (
        <>
          {
            <div
              className="flex items-center gap-2 rounded-md p-2 font-medium"
              style={{ background: 'var(--figma-color-bg-secondary)' }}
            >
              {/* <IconRefresh size={14} /> */}
              {setting?.syncTasks?.slice(0, 3).map((task, index) => (
                <div
                  key={index}
                  className="-ml-5 first:ml-0 p-1 rounded-full border"
                  style={{
                    background: 'var(--figma-color-bg)',
                    borderColor: 'var(--figma-color-border)',
                  }}
                >
                  <SyncTaskIcon type={task.type} />
                </div>
              ))}
              <div style={{ color: 'var(--figma-color-text-secondary)' }}>
                {setting?.syncTasks?.length > 0
                  ? `${setting?.syncTasks.length} Sync tasks in queue`
                  : 'No sync tasks'}
              </div>

              <button
                onClick={() => setTab('settings')}
                className="ml-auto"
                style={{ color: 'var(--figma-color-text-brand)' }}
              >
                {setting?.syncTasks?.length > 0 ? 'View tasks' : 'Set up tasks'}
              </button>
            </div>
          }

          <button className="btn-primary" disabled={summary.length <= 0} onClick={handleClick}>
            {setting?.syncTasks?.length > 0 ? 'Commit and sync' : 'Commit'}
          </button>
        </>
      );
    } else {
      return (
        <>
          <div
            className="p-3 py-1 max-w-full max-h-40 overflow-auto"
            style={{
              background: 'var(--figma-color-bg-secondary)',
              color: 'var(--figma-color-text)',
            }}
          >
            {setting?.syncTasks?.map((task, index) => (
              <div key={index} className="flex items-center gap-2 h-8">
                <SyncTaskIcon type={task.type} />
                <div className="truncate max-w-full">
                  {task.type === 'github'
                    ? (task.config as GitHubSyncConfig).repository
                    : task.type === 'slack'
                    ? (task.config as SlackSyncConfig).channelId
                    : task.type === 'custom'
                    ? (task.config as CustomHTTPSyncConfig).address
                    : null}
                </div>
                <div className="ml-auto flex items-center gap-1 underline w-fit whitespace-nowrap">
                  {syncTaskResults[index] ? (
                    <a href={syncTaskResults[index]} target="_blank">
                      {task.type === 'github' ? 'View PR' : 'View'}
                    </a>
                  ) : null}
                  {syncProgressMap[syncTaskStatus[index]]}
                </div>
              </div>
            ))}
          </div>
          <button className="btn-outline" onClick={() => setOpen(false)}>
            Close
          </button>
        </>
      );
    }
  };

  return (
    <Root
      open={open}
      onOpenChange={() => {
        setSummary('');
        setDescription('');
        setView('commit');
      }}
    >
      <Trigger asChild>
        <button className="btn-primary" disabled={disabled} onClick={() => setOpen(true)}>
          Commit
        </button>
      </Trigger>
      <Portal>
        <Overlay
          className="dialog-overlay"
          onClick={() => {
            setOpen(false);
          }}
        />
        <Content className="dialog-content h-fit">
          <Title className="dialog-title">Commit</Title>
          <div className={'w-80 flex flex-col gap-3 p-3'}>
            <AnimatePresence>
              {view === 'commit' ? (
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
            {renderStage()}
          </div>
        </Content>
      </Portal>
    </Root>
  );
}
