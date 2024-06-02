import { getLocalCommits } from "./get-local-commits";

export function getLocalCommitById(commitId: string) {
    return getLocalCommits().find(c => c.id === commitId)
}