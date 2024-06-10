import { PLUGIN_DATA_KEY_PREFIX } from '../config';
import { ICommit } from '../types';

export function saveCommitToRoot(commit: ICommit) {
  figma.root.setSharedPluginData(
    PLUGIN_DATA_KEY_PREFIX,
    `${PLUGIN_DATA_KEY_PREFIX}${commit.date}`,
    JSON.stringify({ ...commit, collaborators: [figma.currentUser] })
  );
}
