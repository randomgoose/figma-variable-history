import { omit } from 'lodash-es';
import { jsonDiff } from '../json-patch';
import { PLUGIN_DATA_KEY_COMMIT_HEAD, PLUGIN_DATA_KEY_PREFIX } from '../../config';
import type { ICommitHead } from '../../types';

export function setLocalCommitHead(head: ICommitHead, prevHead: ICommitHead) {
  if (!head || typeof head !== 'object') return;

  const currentCommit = {
    ...omit(head, ['variables', 'collections']),
    delta: {
      variables: jsonDiff(prevHead.variables, head.variables),
      collections: jsonDiff(prevHead.collections, head.collections),
    },
  };

  figma.root.setSharedPluginData(
    PLUGIN_DATA_KEY_PREFIX,
    `${PLUGIN_DATA_KEY_PREFIX}${head.date}`,
    JSON.stringify(currentCommit)
  );

  figma.root.setSharedPluginData(
    PLUGIN_DATA_KEY_PREFIX,
    PLUGIN_DATA_KEY_COMMIT_HEAD,
    JSON.stringify(head)
  );
}
