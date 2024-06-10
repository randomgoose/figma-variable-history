import { emit } from '@create-figma-plugin/utilities';
import { CommitHandler, ICommit } from '../types';

export function commit(data: Omit<ICommit, 'id' | 'date'>) {
  const timestamp = new Date().getTime();
  const _commit = { id: timestamp.toString(), date: timestamp, ...data };

  emit<CommitHandler>('COMMIT', _commit);
  return _commit;
}
