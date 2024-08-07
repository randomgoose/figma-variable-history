import { ICommit } from '../types';
import { commitBridge } from './CommitBridge';
import { Commit } from '../widget-components';
import { PLUGIN_DATA_KEY_PREFIX } from '../config';
import { figmaHelper } from '../utils/figma-helper';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { h } = figma.widget;

const PLUGIN_DATA_KEY_CHANGELOG_NODES = `${PLUGIN_DATA_KEY_PREFIX}CHANGELOG_NODES`;

type ChangelogNodesMap = {
  root: string;
} & Record<string, string>;

export async function generateChangeLog() {
  const commits: ICommit[] = commitBridge.getCommits();
  const nodeMapCache: ChangelogNodesMap =
    figmaHelper.getPluginData(PLUGIN_DATA_KEY_CHANGELOG_NODES) || {};

  // create changelog container if it's not exists
  let container: FrameNode = null as any;
  if (nodeMapCache.root) {
    container = (await figma.getNodeByIdAsync(nodeMapCache.root)) as any;
  }
  if (!container) {
    container = figma.createFrame();
    container.layoutMode = 'HORIZONTAL';
    container.fills = [];
    container.layoutSizingHorizontal = 'HUG';
    container.layoutSizingVertical = 'HUG';
    container.itemSpacing = 96;
    container.cornerRadius = 16;
    container.name = 'Container';
    nodeMapCache.root = container.id;
  }

  // Zoom to the container
  // figma.currentPage = container.parent?.type === 'PAGE' ? container.parent : figma.currentPage;
  await figma.setCurrentPageAsync(
    container.parent?.type === 'PAGE' ? container.parent : figma.currentPage
  );

  figma.viewport.scrollAndZoomIntoView([container]);

  const findIndexToInsert = (commitId: string) => {
    const childCommitIds = container.children.map((child) => {
      return Object.entries(nodeMapCache).find(([, nodeId]) => nodeId === child.id)?.[0];
    }) as string[];

    for (let index = 0; index < childCommitIds.length; index++) {
      const childCommitId = childCommitIds[index];
      const nextChildCommitId = childCommitIds[index + 1];
      // commit-id is a Date number
      if (commitId < childCommitId && (commitId > nextChildCommitId || !nextChildCommitId)) {
        return index + 1;
      }
    }

    return 0;
  };

  // create changelog for every commit
  await Promise.all(
    commits.map(async ({ id }, index) => {
      const node = await figma.getNodeByIdAsync(nodeMapCache[id]);

      if (!nodeMapCache[id] || !node) {
        const node = await figma.createNodeFromJSXAsync(<Commit commits={commits} index={index} />);
        container.insertChild(findIndexToInsert(id), node);
        nodeMapCache[id] = node.id;
      }
    })
  );

  // remove changelogs for useless commits
  await Promise.all(
    Object.entries(nodeMapCache).map(async ([commitId, nodeId]) => {
      if (commitId !== 'root' && !commits.find(({ id }) => id === commitId)) {
        (await figma.getNodeByIdAsync(nodeId))?.remove();
        delete nodeMapCache[commitId];
      }
    })
  );

  // update changelog node map
  figmaHelper.setPluginData(PLUGIN_DATA_KEY_CHANGELOG_NODES, nodeMapCache);

  return container;
}
