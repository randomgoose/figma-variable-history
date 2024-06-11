import { groupBy } from 'lodash-es'
import { getVariableChanges } from './get-variable-changes';

export function getVariableChangesGroupedByCollection({ prev, current }: { prev?: Variable[]; current?: Variable[]; }) {
    const groupedCurrent = groupBy(current, d => d.variableCollectionId)
    const groupedPrev = groupBy(prev, d => d.variableCollectionId)


    return Object
        .fromEntries(Object.entries(groupedCurrent).map(([collectionId, variables]) => [collectionId, getVariableChanges({ prev: groupedPrev[collectionId] || [], current: variables })]))
}