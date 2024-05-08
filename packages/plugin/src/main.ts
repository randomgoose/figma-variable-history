import { cloneObject, emit, on, showUI } from '@create-figma-plugin/utilities'
import { CommitHandler, ICommit, ImportLocalCommitsHandler, ImportVariablesHandler, RefreshHandler } from './types';
import { PREFIX } from './config';

function saveCommitToRoot(commit: ICommit) {
  figma.root.setPluginData(`${PREFIX}_${commit.date}`, JSON.stringify({ ...commit, collaborators: [figma.currentUser] }))
}

function getLocalCommits() {
  const keys = figma.root.getPluginDataKeys().filter(key => key.startsWith(PREFIX))
  const commits = keys.map(key => JSON.parse(figma.root.getPluginData(key))).sort((a, b) => b.date - a.date)
  return commits
}

async function emitData() {
  const variables = (await figma.variables.getLocalVariablesAsync()).map(v => cloneObject(v));
  const collections = (await figma.variables.getLocalVariableCollectionsAsync()).map(c => cloneObject(c))
  const commits = getLocalCommits();

  emit<ImportVariablesHandler>('IMPORT_VARIABLES', { variables, collections })
  emit<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', commits)
}

export default async function () {
  on<CommitHandler>('COMMIT', commit => { saveCommitToRoot(commit) })
  on<RefreshHandler>('REFRESH', emitData)

  showUI({ height: 480, width: 560 })
  await emitData()
}

