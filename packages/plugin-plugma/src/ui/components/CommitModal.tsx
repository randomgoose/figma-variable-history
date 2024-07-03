import { useCallback, useContext, useState } from 'react';
import { AppContext } from '../../AppContext';
import { useSync } from '../../hooks/use-sync';
import { Root, Trigger, Portal, Overlay, Content, Title, Close } from '@radix-ui/react-dialog';

export function CommitModal({ disabled }: { disabled: boolean }) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  // const [stage, setStage] = useState<'commit' | SyncToGitStage>('commit')

  const { variables, collections, setting } = useContext(AppContext);
  const { syncGit, stage } = useSync();

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

      // Check should sync git
      if (setting?.git?.enabled) {
        await syncGit(timestamp + '', { ...setting.git });
      }

      // setModalOpen(false);
    }
  }, [variables, collections, summary, description]);

  const commitForm = (
    <div className={'w-80 flex flex-col gap-3 p-4'}>
      <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
      <textarea
        onChange={(e) => setDescription(e.target.value)}
        value={description}
        placeholder="Description (optional)"
        style={{ height: 180 }}
      />
      <Close asChild>
        <button className="btn-primary" disabled={summary.length <= 0} onClick={handleClick}>
          Confirm
        </button>
      </Close>
    </div>
  );

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
          {!stage ? commitForm : null}
          {stage}
        </Content>
      </Portal>
    </Root>
  );
}
