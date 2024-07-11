import { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../AppContext';
import { useSync } from '../../hooks/use-sync';
import { Root, Trigger, Portal, Overlay, Content, Title } from '@radix-ui/react-dialog';
import { GitHubLogo } from '../icons/GitHubLogo';
import { AnimatePresence } from 'framer-motion';

export function CommitModal({ disabled }: { disabled: boolean }) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [shouldSyncGit, setShouldSyncGit] = useState(false);

  const { variables, collections, setting, commits } = useContext(AppContext);
  const { syncGit, stage, setStage, result, cssContent } = useSync();

  const parseStage = useCallback(() => {
    if (!result) {
      switch (stage) {
        case 'compile':
          return 'Compiling...';
        case 'fetch_repo_info':
          return 'Fetching repository info...';
        case 'create_branch':
          return 'Creating branch...';
        case 'update_file':
          return 'Updating file...';
        case 'create_pr':
          return 'Creating pull request...';
      }
    } else {
      if (result.success) {
        return `Success. Pull request created. ${result.prURL}`;
      } else {
        return `Failed. ${result.message}`;
      }
    }
  }, [stage, result]);

  useEffect(() => {
    if (shouldSyncGit) {
      const timestamp = +new Date();

      if (setting?.git?.enabled && cssContent) {
        syncGit(timestamp + '', { ...setting.git }).then(() => {
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
            <div
              className="p-4 rounded-sm"
              style={{ background: 'var(--figma-color-bg-secondary)' }}
            >
              <GitHubLogo />
              {parseStage()}
            </div>
            {/* <Close asChild> */}
            <button className="btn-primary" disabled={summary.length <= 0} onClick={handleClick}>
              Confirm
            </button>
            {/* </Close> */}
          </div>
          {/* {
            !stage
              ? commitForm
              : stage === 'compile'
                ? 'Compiling...'
                : null
          } */}
        </Content>
      </Portal>
    </Root>
  );
}
