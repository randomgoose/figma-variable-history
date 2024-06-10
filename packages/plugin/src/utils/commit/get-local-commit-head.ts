import { PLUGIN_DATA_KEY_COMMIT_HEAD, PLUGIN_DATA_KEY_PREFIX } from '../../config';
import { ICommitHead } from '../../types';

export function getLocalCommitHead(): ICommitHead | null {
  const dataStr = figma.root.getSharedPluginData(
    PLUGIN_DATA_KEY_PREFIX,
    PLUGIN_DATA_KEY_COMMIT_HEAD
  );
  try {
    return JSON.parse(dataStr);
  } catch (e) {}
  return null;
}
