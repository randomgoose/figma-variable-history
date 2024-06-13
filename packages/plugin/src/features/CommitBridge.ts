import omit from 'lodash-es/omit';
import type { Delta } from 'jsondiffpatch';

import type { ICommit } from '../types';
import { jsonDiff, jsonPatch, jsonUnpatch } from '../utils/json-patch';
import { figmaHelper } from '../utils/figma-helper';
import { getVariableChanges } from '../utils/variable';

const PLUGIN_DATA_KEY_PREFIX = '__VARIABLE_HISTORY__';
const PLUGIN_DATA_KEY_HEAD = `${PLUGIN_DATA_KEY_PREFIX}HEAD`;
const PLUGIN_DATA_KEY_COMMITS = `${PLUGIN_DATA_KEY_PREFIX}COMMITS`;

type CommitInPluginData = Omit<ICommit, 'variables' | 'collections'> & {
  delta: { variables: Delta; collections: Delta };
};

export class CommitBridge {
  // eslint-disable-next-line no-use-before-define
  static instance: CommitBridge | null = null;

  static create() {
    if (!CommitBridge.instance) {
      CommitBridge.instance = new CommitBridge();
    }
    return CommitBridge.instance;
  }

  constructor(
    private pluginData: {
      head: ICommit | null;
      commits: CommitInPluginData[];
    } = {
      head: null,
      commits: [],
    }
  ) {
    this.getLocalPluginData();
  }

  private getLocalPluginData() {
    const [head, commits] = [
      figma.root.getSharedPluginData(PLUGIN_DATA_KEY_PREFIX, PLUGIN_DATA_KEY_HEAD),
      figma.root.getSharedPluginData(PLUGIN_DATA_KEY_PREFIX, PLUGIN_DATA_KEY_COMMITS),
    ].map((dataStr) => {
      if (!dataStr) return;
      try {
        return JSON.parse(dataStr);
      } catch (err) {
        console.warn('Plugin data is unable to parse\n', dataStr, `\nError:\n`, err);
      }
    });
    this.pluginData = { head: head || null, commits: commits || [] };
  }

  private setLocalPluginData(head: ICommit, commits: CommitInPluginData[]) {
    this.pluginData.head = head;
    this.pluginData.commits = commits;

    figma.root.setSharedPluginData(
      PLUGIN_DATA_KEY_PREFIX,
      PLUGIN_DATA_KEY_HEAD,
      JSON.stringify(this.pluginData.head)
    );
    figma.root.setSharedPluginData(
      PLUGIN_DATA_KEY_PREFIX,
      PLUGIN_DATA_KEY_COMMITS,
      JSON.stringify(this.pluginData.commits)
    );
  }

  private async syncLocalVariablesWithHead() {
    if (!this.pluginData.head) return;
    const { variables: headVariables } = this.pluginData.head;
    const localVariables = await figmaHelper.getLocalVariablesAsync();
    const { added, removed, modified } = getVariableChanges({
      prev: localVariables,
      current: headVariables,
    });

    await Promise.all([
      ...added.map((data) => figmaHelper.updateVariable({ data, createIfNotExists: true })),
      ...modified.map((data) => figmaHelper.updateVariable({ data, createIfNotExists: true })),
      ...removed.map((data) => figmaHelper.disableVariable(data.id)),
    ]);
  }

  private getCommitByIndex(
    index: number,
    baseCommitInfo?: { commit: ICommit; index: number }
  ): ICommit | null {
    if (!this.pluginData.head || !(index > -1)) return null;

    const { head, commits } = this.pluginData;
    const targetCommit = commits[index];
    const baseCommit = baseCommitInfo ? baseCommitInfo.commit : head;
    const baseIndex = baseCommitInfo ? baseCommitInfo.index : 0;

    const recoverJson = (type: 'variables' | 'collections') => {
      const deltas = commits
        .slice(...[baseIndex, index].sort((a, b) => a - b))
        .map(({ delta }) => delta[type]);

      return baseIndex < index
        ? jsonUnpatch(baseCommit[type] || [], deltas)
        : jsonPatch(baseCommit[type] || [], deltas.reverse());
    };

    return {
      ...omit(targetCommit, ['delta']),
      get variables() {
        return recoverJson('variables');
      },
      get collections() {
        return recoverJson('collections');
      },
    };
  }

  getCommitById(id: ICommit['id']): ICommit | null {
    if (!this.pluginData.head) return null;
    const { commits } = this.pluginData;
    return this.getCommitByIndex(commits.findIndex(({ id: _id }) => _id === id));
  }

  getCommits(): ICommit[] {
    let lastCommitInfo: { commit: ICommit; index: number } | null = null;
    return this.pluginData.commits
      .map((_, index) => {
        const commit = this.getCommitByIndex(index, lastCommitInfo || undefined);
        commit && (lastCommitInfo = { index, commit });
        return commit;
      })
      .filter(Boolean) as [];
  }

  commit(data: ICommit) {
    const commitInPluginData: CommitInPluginData = {
      ...omit(data, ['variables', 'collections']),
      collaborators: figma.currentUser ? [figma.currentUser] : [],
      delta: { variables: undefined, collections: undefined },
    };

    const { variables: headVariables = [], collections: headCollections = [] } =
      this.pluginData.head || {};
    commitInPluginData.delta.variables = jsonDiff(headVariables, data.variables);
    commitInPluginData.delta.collections = jsonDiff(headCollections, data.collections);

    // save updated data to figma.root
    this.setLocalPluginData(data, [commitInPluginData, ...this.pluginData.commits]);
  }

  compareCommits(baseCommit: ICommit['id'], targetCommit: ICommit['id']): Delta | null {
    const baseIndex = this.pluginData.commits.findIndex(({ id }) => id === baseCommit);
    const targetIndex = this.pluginData.commits.findIndex(({ id }) => id === targetCommit);

    if (baseIndex > -1 && targetIndex > -1 && baseIndex !== targetIndex) {
      let newCommitInfo: { commit: ICommit; index: number } | null = null;
      const [newCommit, oldCommit] = [baseIndex, targetIndex]
        .sort((a, b) => a - b)
        .map((commitIndex) => {
          const commit = this.getCommitByIndex(commitIndex, newCommitInfo || undefined);
          commit && (newCommitInfo = { commit, index: commitIndex });
          return commit as ICommit;
        });
      return baseIndex < targetIndex
        ? jsonDiff(newCommit, oldCommit)
        : jsonDiff(oldCommit, newCommit);
    }

    return null;
  }

  async revert() {
    // this.syncLocalVariablesWithHead();
  }

  async reset(commitId: string) {
    const targetCommitIndex = this.pluginData.commits.findIndex(({ id }) => id === commitId);
    const targetCommit = this.getCommitByIndex(targetCommitIndex);
    if (!targetCommit) return;
    this.setLocalPluginData(targetCommit, this.pluginData.commits.slice(targetCommitIndex));
    return this.syncLocalVariablesWithHead();
  }

  refresh() {
    this.getLocalPluginData();
  }
}

export const commitBridge = CommitBridge.create();
