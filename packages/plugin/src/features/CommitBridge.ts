import omit from 'lodash-es/omit';
import type { Delta } from 'jsondiffpatch';
import { emit } from '@create-figma-plugin/utilities';

import type {
  ICommit,
  ImportLocalCommitsHandler,
  ImportVariablesHandler,
  VariableChangeType,
} from '../types';
import { jsonDiff, jsonPatch, jsonUnpatch } from '../utils/json-patch';
import { figmaHelper } from '../utils/figma-helper';
import { getVariableChanges } from '../utils/variable';
import { updateObjectValues } from '../utils/object';
import { PLUGIN_DATA_KEY_PREFIX } from '../config';

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
    const head = figmaHelper.getPluginData(PLUGIN_DATA_KEY_HEAD);
    const commits = figmaHelper.getPluginData(PLUGIN_DATA_KEY_COMMITS);
    this.pluginData = { head: head || null, commits: commits || [] };
  }

  private setLocalPluginData(head: ICommit, commits: CommitInPluginData[]) {
    this.pluginData.head = head;
    this.pluginData.commits = commits;
    figmaHelper.setPluginData(PLUGIN_DATA_KEY_HEAD, this.pluginData.head);
    figmaHelper.setPluginData(PLUGIN_DATA_KEY_COMMITS, this.pluginData.commits);
  }

  private updateIdInLocalPluginData(idChangeMap: Record<string, string>) {
    if (!this.pluginData.head) return;
    if (Object.keys(idChangeMap).length) {
      const head = updateObjectValues(this.pluginData.head, (value) => idChangeMap[value] || value);
      const commits = updateObjectValues(
        this.pluginData.commits,
        (value) => idChangeMap[value] || value
      );
      this.setLocalPluginData(head, commits);
    }
  }

  private async setLocalVariables(targetVariables: Variable[]) {
    const localVariables = await figmaHelper.getLocalVariablesAsync();
    const { added, removed, modified } = getVariableChanges({
      prev: localVariables,
      current: targetVariables,
    });

    const idChangeMap: Record<string, string> = {};
    await Promise.all([
      ...added.concat(modified).map(async (data) => {
        const variable = await figmaHelper.updateVariable({ data, createIfNotExists: true });
        if (variable && variable.id !== data.id) {
          idChangeMap[data.id] = variable.id;
        }
      }),
      ...removed.map((data) => figmaHelper.disableVariable(data)),
    ]);

    this.updateIdInLocalPluginData(idChangeMap);
  }

  private async setLocalVariablesToCommit(commitId?: ICommit['id']) {
    const targetCommit = commitId ? this.getCommitById(commitId) : this.pluginData.head;
    if (!targetCommit) return;
    await this.setLocalVariables(targetCommit.variables);
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
      variables: recoverJson('variables'),
      collections: recoverJson('collections'),
      // TODO use get() to save memory
      // get variables() {
      //   return recoverJson('variables');
      // },
      // get collections() {
      //   return recoverJson('collections');
      // },
    };
  }

  // provide data necessary for ui.tsx
  async emitData() {
    const variables = await figmaHelper.getLocalVariablesAsync();
    const collections = await figmaHelper.getLocalVariableCollectionsAsync();
    const commits = this.getCommits();

    emit<ImportVariablesHandler>('IMPORT_VARIABLES', { variables, collections });
    emit<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', commits);
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

  async commit(data: ICommit) {
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
    await this.emitData();
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

  async revert(commitId: string) {
    const delta = this.pluginData.commits.find(({ id }) => id === commitId)?.delta;
    if (!delta || !this.pluginData.head) return;

    const localVariables = await figmaHelper.getLocalVariablesAsync();
    const newVariables = jsonUnpatch(localVariables, delta.variables);

    await this.setLocalVariables(newVariables);
    await this.emitData();
  }

  async revertVariable(variable: Variable, type: VariableChangeType) {
    if (type === 'added') {
      await figmaHelper.disableVariable(variable);
    } else {
      const idChangeMap: Record<string, string> = {};
      const newVariable = await figmaHelper.updateVariable({
        data: variable,
        createIfNotExists: true,
      });
      if (newVariable && newVariable.id !== variable.id) {
        idChangeMap[variable.id] = newVariable.id;
      }
      this.updateIdInLocalPluginData(idChangeMap);
    }
    await this.emitData();
  }

  async reset(commitId: string) {
    const targetCommitIndex = this.pluginData.commits.findIndex(({ id }) => id === commitId);
    const targetCommit = this.getCommitByIndex(targetCommitIndex);
    if (!targetCommit) return;
    this.setLocalPluginData(targetCommit, this.pluginData.commits.slice(targetCommitIndex));
    this.commit(targetCommit);

    // TODO
    // const timestamp = +new Date()

    // const newCommit: ICommit = {
    //   ...targetCommit,
    //   id: `${timestamp}`,
    //   summary: `[Restore] ${targetCommit.summary}`,
    //   description: '',
    //   date: timestamp
    // }

    await this.setLocalVariablesToCommit();
    await this.emitData();
  }

  refresh() {
    this.getLocalPluginData();
  }
}

export const commitBridge = CommitBridge.create();
