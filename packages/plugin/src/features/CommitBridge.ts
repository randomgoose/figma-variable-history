import omit from 'lodash-es/omit';
import type { Delta } from 'jsondiffpatch';

import type { ICommit } from '../types';
import { jsonDiff, jsonUnpatch } from '../utils/json-patch';

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

  private setLocalPluginData() {
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

  private getCommitByIndex(index: number): ICommit | null {
    if (!this.pluginData.head || !(index > -1)) return null;

    const { head, commits } = this.pluginData;
    const targetCommit = commits[index];

    const recoverJson = (type: 'variables' | 'collections') => {
      const deltas = commits.slice(0, index).map(({ delta }) => delta);
      return jsonUnpatch(head[type] || [], deltas.map((delta) => delta[type]).filter(Boolean));
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
    return this.pluginData.commits
      .map((_, index) => this.getCommitByIndex(index))
      .filter(Boolean) as [];
  }

  commit(commit: ICommit) {
    const commitInPluginData: CommitInPluginData = {
      ...omit(commit, ['variables', 'collections']),
      collaborators: figma.currentUser ? [figma.currentUser] : [],
      delta: { variables: undefined, collections: undefined },
    };

    if (this.pluginData.head) {
      const { variables: headVariables, collections: headCollections } = this.pluginData.head;
      commitInPluginData.delta.variables = jsonDiff(headVariables, commit.variables);
      commitInPluginData.delta.collections = jsonDiff(headCollections, commit.collections);
    }

    this.pluginData.commits.unshift(commitInPluginData);
    this.pluginData.head = commit;

    // save updated data to figma.root
    this.setLocalPluginData();
  }

  compareCommits() {}

  compareWithLocal() {}

  revert() {}

  reset() {}

  refresh() {
    this.getLocalPluginData();
  }
}
