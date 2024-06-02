import { cloneObject } from "@create-figma-plugin/utilities";
import { saveCommitToRoot } from ".";
import { ICommit } from "../types";

export async function restore(commit: ICommit) {
    const { variables, collections } = commit

    // const localVariables = (await figma.variables.getLocalVariablesAsync()).map(v => cloneObject(v))
    // const localCollections = (await figma.variables.getLocalVariableCollectionsAsync()).map(v => cloneObject(v))
    // const timestamp = (new Date()).getTime()

    // localVariables.forEach((v) => {
    //     const _v = variables.find(variable => variable.id === v.id);

    //     if (_v) {
    //         v.name = _v.name
    //         v.description = _v.description
    //         v.hiddenFromPublishing = _v.hiddenFromPublishing

    //         Object.entries(_v.codeSyntax).forEach(([platform, value]) => {
    //             v.setVariableCodeSyntax(platform as any, value)
    //         })

    //         v.scopes = _v.scopes
    //         // _v.setVariableCodeSyntax()
    //         // _v.codeSyntax = v.codeSyntax

    //     }
    // })

    // localCollections.forEach((c) => {
    //     const _c = collections.find(collection => collection.id === c.id);

    //     if (_c) {
    //         c.name = _c.name
    //     }
    // })

    // const newCommit: ICommit = {
    //     id: timestamp.toString(),
    //     collaborators: figma.currentUser ? [figma.currentUser] : [],
    //     summary: `Restored commit ${commit.summary} (${commit.id})`,
    //     date: timestamp,
    //     variables: localVariables,
    //     collections: localCollections,
    // }

    // saveCommitToRoot(newCommit)
}