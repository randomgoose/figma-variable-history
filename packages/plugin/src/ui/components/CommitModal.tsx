import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import { Root, Trigger, Portal, Overlay, Content, Title, Close } from '@radix-ui/react-dialog';
import { AnimatePresence } from 'motion/react';
import { syncToGit } from '../../features/sync-to-git';
import { MESSAGE_TYPE, sendMessage } from '../../utils/message';
import { syncToSlackChannel } from '../../features/sync-to-slack-channel';
import { CustomHTTPSyncConfig, GitHubSyncConfig, SlackSyncConfig } from '../../types';
import { IconCircleCheckFilled, IconCircleXFilled, IconLoader } from '@tabler/icons-react';
import { sendCustomRequest } from '../../features/send-custom-request';
import { SyncTaskIcon } from './SyncTaskIcon';
import { useTranslation } from '../../hooks/useTranslation';
import { X } from 'lucide-react';
import { unionBy } from 'lodash-es';
import { useCommitBridge } from '../../hooks/useCommitBridge';

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

export function CommitModal({
  disabled,
  numOfChanges,
  numOfCheckedChanges,
}: {
  disabled: boolean;
  numOfChanges?: number;
  numOfCheckedChanges?: number;
}) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [shouldSync, setShouldSync] = useState(false);
  const [syncTaskStatus, setSyncTaskStatus] = useState<{ type: string; message: string }[]>([]);
  const [syncTaskResults, setSyncTaskResults] = useState<any[]>([]);
  const {
    variables,
    collections,
    setting,
    commits,
    compiledVariables,
    clearCompiledVariables,
    setTab,
    checkedVariableIds,
    fileUUID,
    currentUser,
  } = useContext(AppContext);
  const [view, setView] = useState<'commit' | 'sync'>('commit');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { commitMutation, isCommitPending } = useCommitBridge(fileUUID);

  useEffect(() => {
    clearCompiledVariables();
  }, []);

  useEffect(() => {
    const commit = commits[0];

    if (shouldSync && commit && compiledVariables.css) {
      console.log(compiledVariables.css)
      setShouldSync(false);
      Promise.all(
        setting?.syncTasks?.map(async ({ type, config }, index) => {
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
                onStageChange: (stage, message) => {
                  setSyncTaskStatus((prev) => {
                    const status = [...prev];
                    status[index] = { type: stage, message: message || '' };
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
                onStageChange: (stage, message) => {
                  setSyncTaskStatus((prev) => {
                    const status = [...prev];
                    status[index] = { type: stage, message: message || '' };
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
                    status[index] = { type: stage, message: '' };
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

      const ignoredVariableIds = unionBy(variables, commits?.[0]?.variables, 'id')
        .filter((variable) => !checkedVariableIds.includes(variable.id))
        .map((variable) => variable.id);

      commitMutation.mutate({
        id: `${timestamp}`,
        date: timestamp,
        summary,
        description,
        variables,
        collections,
        collaborators: currentUser ? [currentUser] : [],
        ignoredVariableIds,
      }, {
        onSuccess: () => {
          if (setting?.syncTasks?.length > 0) {
            setView('sync');
            sendMessage('CONVERT_VARIABLES_TO_CSS', commits[0]);
            setShouldSync(true);
            setSyncTaskStatus(setting?.syncTasks?.map(() => ({ type: 'pending', message: '' })));
            setSyncTaskResults(setting?.syncTasks?.map(() => null));
          } else {
            setOpen(false);
          }
        },
        onError: (error) => {
          console.error(error);
        }
      });
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
                  ? `${setting?.syncTasks.length} ${t('sync_tasks_in_queue')}`
                  : t('no_sync_tasks')}
              </div>

              <button
                onClick={() => setTab('settings')}
                className="ml-auto"
                style={{ color: 'var(--figma-color-text-brand)' }}
              >
                {isCommitPending ? <IconLoader size={14} /> : setting?.syncTasks?.length > 0 ? t('view_tasks') : t('set_up_tasks')}
              </button>
            </div>
          }

          <button
            className="btn-primary"
            disabled={summary.length <= 0 || isCommitPending}
            onClick={handleClick}
          >
            {setting?.syncTasks?.length > 0 ? t('commit_and_sync') : t('commit')}
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
                  {syncTaskStatus[index]?.message || ''}
                  {syncProgressMap[syncTaskStatus[index].type]}
                </div>
              </div>
            ))}
          </div>
          <button className="btn-outline" onClick={() => setOpen(false)}>
            {t('close')}
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
        <button className="btn-primary gap-1" disabled={disabled} onClick={() => setOpen(true)}>
          <span>{t('commit')}</span>
          {numOfCheckedChanges && numOfCheckedChanges > 0 && (
            <span className="text-xs text-[var(--figma-color-text-onbrand)]">
              {numOfCheckedChanges}
            </span>
          )}
          {numOfChanges !== numOfCheckedChanges && (
            <span className="text-xs text-[var(--figma-color-text-onbrand-tertiary)]">
              ({numOfChanges})
            </span>
          )}
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
          <Title className="dialog-title pr-2">
            {t('commit')}
            <Close asChild>
              <button className="btn-icon ml-auto" onClick={() => setOpen(false)}>
                <X strokeWidth={1.5} size={16} />
              </button>
            </Close>
          </Title>
          <div className={'w-80 flex flex-col gap-3 p-3'}>
            <AnimatePresence>
              {view === 'commit' ? (
                <div className="w-full flex flex-col gap-3">
                  <input
                    disabled={isCommitPending}
                    className="input"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder={t('summary')}
                  />
                  <textarea
                    className="input pt-1"
                    disabled={isCommitPending}
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    placeholder={t('description_placeholder')}
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
