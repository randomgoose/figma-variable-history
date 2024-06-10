import { PLUGIN_DATA_KEY_PREFIX } from '../config';

export function getLocalCommits() {
  const keys = figma.root
    .getSharedPluginDataKeys(PLUGIN_DATA_KEY_PREFIX)
    .filter((key) => key.startsWith(PLUGIN_DATA_KEY_PREFIX));
  return keys
    .map((key) => JSON.parse(figma.root.getSharedPluginData(PLUGIN_DATA_KEY_PREFIX, key)))
    .filter((commit) => commit)
    .sort((a, b) => b.date - a.date);
}
