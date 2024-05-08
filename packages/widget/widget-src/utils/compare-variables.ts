import deepEqual from "deep-equal";
import { ICommit, ChangeType, IChange } from "../types";
import _ from "lodash";

function compareNames(old: Variable['name'], current: Variable['name']) {
    return old === current ? [current] : [current, old]
}

function compareValuesByMode(current: Variable['valuesByMode'], old: Variable['valuesByMode']) {
    return Object.fromEntries(Object.entries(current).map(([modeId, value]) => {
        if (!current[modeId]) {
            return [modeId, [undefined]]
        } else {
            // TODO: FIX FLOAT COLOR ISSUES
            if (deepEqual(value, old[modeId])) {
                return [modeId, [value]]
            } else {
                return [modeId, [old[modeId], value]]
            }
        }
    }))
}

export function compareVariables(variables: Variable[], oldVariables: Variable[]): { [key: string]: IChange } {
    let changes = {}

    variables.forEach((variable: Variable) => {
        const { id, name, variableCollectionId, description, valuesByMode, resolvedType } = variable

        const _v = oldVariables.find(v => v.id === id)

        if (!_v) {
            Object.assign(changes, {
                [id]: {
                    name: [name],
                    type: ChangeType.ADD,
                    ...Object.fromEntries(
                        Object
                            .entries(variable)
                            .map(([k, v]) => {
                                return k === 'valuesByMode' || k === 'codeSyntax'
                                    ? [k, Object.fromEntries(Object.entries(v).map(([_k, _v]) => [_k, [_v]]))]
                                    : [k, [v]]
                            }
                            )),
                    resolvedType,
                }
            })
        } else {
            let diffs: any = {}
            Object.assign(diffs, { id: [id], variableCollectionId: [variableCollectionId], resolvedType })
            Object.assign(diffs, { name: compareNames(name, _v.name) })
            Object.assign(diffs, { description: description === _v.description ? [description] : [description, _v.description] })
            Object.assign(diffs, { valuesByMode: compareValuesByMode(valuesByMode, _v.valuesByMode) })

            if (
                Object
                    .entries(diffs)
                    .filter(([key]) => ["name", "description", "valuesByMode"].includes(key))
                    .some(([, value]) => (_.isArray(value) && value.length > 1) || (_.isObject(value) && Object.values(value).some(v => _.isArray(v) && v.length > 1)))
                || Object.entries(diffs.valuesByMode).some(([, value]) => _.isArray(value) && value.length > 1)
            ) {
                Object.assign(changes, { [id]: { ...diffs, type: ChangeType.MODIFY } })
            }
        }
    })

    oldVariables.forEach(({ id, name, description, valuesByMode, variableCollectionId, resolvedType }) => {
        const _v = variables.find(v => v.id === id);

        if (!_v) {
            Object.assign(changes, {
                [id]: {
                    name: [name],
                    id: [id],
                    type: ChangeType.DELETE,
                    description: [description],
                    valuesByMode: Object.fromEntries(Object.entries(valuesByMode).map(([_k, _v]) => [_k, [_v]])),
                    variableCollectionId: [variableCollectionId],
                    resolvedType
                }
            })
        } else {
            // Object.assign()
        }
    })

    return changes
}

export function compareCommits(commit: ICommit, lastCommit: ICommit): { [key: string]: { name: string; type: ChangeType } } {
    let changes = {}

    commit.variables.forEach(({ id, name }) => {
        const _v = lastCommit.variables.find(v => v.id === id)

        if (!_v) {
            Object.assign(changes, { [id]: { name, type: 'ADD' } })
        } else {
            if (_v.name !== name) {
                Object.assign(changes, { [id]: { name, type: 'UPDATE' } })
            }
        }
    })
    return changes
}
