import { Modal, Textbox, TextboxMultiline, Button } from '@create-figma-plugin/ui';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import styles from '../styles.module.css';
import { useCallback, useContext, useState } from 'preact/hooks';
import { emit } from '@create-figma-plugin/utilities';
import { CommitHandler } from '../../types';
import { AppContext } from '../../AppContext';
import { useSync } from '../../hooks/use-sync';

interface CommitModalProps {
  open: boolean;
  onClose: () => void;
}

export function CommitModal(props: CommitModalProps) {
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

      emit<CommitHandler>('COMMIT', {
        id: `${timestamp}`,
        date: timestamp,
        summary,
        description,
        variables,
        collections,
        collaborators: [],
      });

      // Check should sync git
      if (setting?.git?.enabled) {
        await syncGit(timestamp + '', { ...setting.git });
      }

      // setModalOpen(false);
    }
  }, [variables, collections, summary, description]);

  const commitForm = (
    <div className={styles.commitForm}>
      <Textbox
        value={summary}
        onChange={(e) => setSummary(e.currentTarget.value)}
        variant="border"
        placeholder="Summary"
      />
      <TextboxMultiline
        onChange={(e) => setDescription(e.currentTarget.value)}
        value={description}
        variant="border"
        placeholder="Description (optional)"
        style={{ height: 180 }}
      />
      <Button disabled={summary.length <= 0} onClick={handleClick}>
        Confirm
      </Button>
    </div>
  );

  return (
    <Modal
      open={props.open}
      title="Commit variable changes"
      onCloseButtonClick={() => props.onClose()}
    >
      {!stage ? commitForm : null}
      {stage}
    </Modal>
  );
}
