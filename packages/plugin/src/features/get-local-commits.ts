import { PREFIX } from "../config"

export function getLocalCommits() {
  const keys = figma.root.getSharedPluginDataKeys(PREFIX).filter(key => key.startsWith(PREFIX))
  const commits = keys
    .map(key => JSON.parse(figma.root.getSharedPluginData(PREFIX, key)))
    .filter(commit => commit)
    .sort((a, b) => b.date - a.date)
    
  return commits
}
