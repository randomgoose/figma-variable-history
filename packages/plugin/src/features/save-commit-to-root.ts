import { PREFIX } from '../config';
import { ICommit } from '../types';

export function saveCommitToRoot(commit: ICommit) {
  figma.root.setSharedPluginData(
    PREFIX,
    `${PREFIX}${commit.date}`,
    JSON.stringify({ ...commit, collaborators: [figma.currentUser] })
  );
}
