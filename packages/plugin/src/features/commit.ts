import { emit } from "@create-figma-plugin/utilities"
import { CommitHandler, ICommit } from "../types"
import { nanoid } from 'nanoid'

export function commit(data: Omit<ICommit, 'id' | 'date'>) {
    const timestamp = new Date().getTime()
    const _commit: ICommit = { id: nanoid(), date: timestamp, ...data }

    emit<CommitHandler>('COMMIT', _commit)
    return _commit
}