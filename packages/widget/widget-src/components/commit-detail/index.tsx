import { IChange, ICommit } from "../../types";
import { Button, colors } from 'fidget-ui'
import { compareVariables } from "../../utils/compare-variables";
import { Changes } from "../changes";
import { PREFIX } from "../../constants";
import { ChangeDetail } from "../change-detail";
import { styles } from "./styles";
import { IconArrowUturnLeftSolid, IconTrashSolid } from "fidget-ui/icons";

const { AutoLayout: Flex, Text, useSyncedState, waitForTask } = figma.widget

interface CommitDetailProps {
    commit: ICommit;
    lastCommit?: ICommit | null;
}

export function CommitDetail({ commit, lastCommit }: CommitDetailProps) {
    const [currentChange, setCurrentChange] = useSyncedState<IChange | null>(`${PREFIX}_current_change`, null)
    const [variables] = useSyncedState<Variable[]>(`${PREFIX}__variables`, [])
    const [page, setPage] = useSyncedState(`${PREFIX}__commit_detail_current_page`, 0)
    const [, setCommits] = useSyncedState<ICommit[]>(`${PREFIX}__commits`, [])

    console.log(commit.description)

    async function deleteCommitWithConfirmation(id: string) {
        waitForTask(new Promise<null>((resolve) => {
            figma.notify('Are you sure you want to delete this commit?', {
                timeout: Infinity,
                onDequeue: () => { figma.closePlugin() },
                button: {
                    text: 'Confirm',
                    action: () => {
                        figma.root.setPluginData(id, '')
                        setCommits(prev => prev.filter(c => c.id !== id))
                        setCurrentChange(null)
                        resolve(null)
                    }
                }
            })
        }))

    }

    async function restoreWithConfirmation() {
        waitForTask(new Promise<null>((resolve) => {
            figma.notify(`Are you sure you want to restore this version?`, {
                timeout: Infinity,
                onDequeue: () => { figma.closePlugin() },
                button: {
                    text: "Confirm",
                    action: () => {
                        // console.log(figma.variables.getLocalVariables().map(v => v.))
                        figma.variables.getLocalVariables().forEach(v => {
                            if (!commit.variables.find(_v => _v.id === v.id)) {
                                // v.remove()
                                v.name = v.name + `${commit.id}`
                            }
                        })

                        commit.variables.forEach(({ id, valuesByMode, name, description, codeSyntax, variableCollectionId, resolvedType, hiddenFromPublishing, scopes }) => {
                            const collection = figma.variables.getLocalVariableCollections().find(c => c.id === variableCollectionId);
                            const collectionId = collection ? collection.id : figma.variables.createVariableCollection(commit.collections.find(c => c.id === variableCollectionId)?.name || 'Untitled').id

                            const _v = figma.variables.getLocalVariables().find(v => v.id === id)
                                || figma.variables.getLocalVariables().find(v => v.name === name)
                                || figma.variables.createVariable(name, collectionId, resolvedType)
                            _v.name = name
                            _v.description = description
                            _v.hiddenFromPublishing = hiddenFromPublishing
                            _v.scopes = scopes

                            console.log(_v.name)

                            Object.entries(valuesByMode).forEach(([modeId, value]) => {
                                _v.setValueForMode(modeId, value)
                            })

                            codeSyntax.WEB && _v.setVariableCodeSyntax('WEB', codeSyntax.WEB)
                            codeSyntax.ANDROID && _v.setVariableCodeSyntax('WEB', codeSyntax.ANDROID)
                            codeSyntax.iOS && _v.setVariableCodeSyntax('WEB', codeSyntax.iOS)
                        })

                        resolve(null)
                    }
                }
            })
        }))
    }

    return (
        <Flex {...styles.container}>
            <Flex {...styles.header}>
                <Flex direction="vertical" width={'fill-parent'} spacing={4}>
                    <Text {...styles.summary}>{commit.summary}</Text>
                    <Text {...styles.description} width={'fill-parent'} fill={commit.description ? colors.neutral[500] : colors.neutral[400]}>{commit?.description ? commit.description : 'No description'}</Text>
                </Flex>
                <Button size="sm" variant="ghost" leftIcon={<IconArrowUturnLeftSolid />} onClick={async () => { await restoreWithConfirmation() }}>Restore</Button>
                <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<IconTrashSolid color={colors.red[500]} />} onClick={async () => { await deleteCommitWithConfirmation(commit.id) }}>Delete</Button>
            </Flex>

            <Flex {...styles.body}>
                <Changes
                    page={page}
                    setPage={setPage}
                    pageSize={16}
                    id="commits_changes"
                    currentChange={currentChange}
                    setCurrentChange={setCurrentChange}
                    changes={compareVariables(commit.variables, lastCommit?.variables || [])}
                />
                {currentChange ? <ChangeDetail showHeader={false} change={currentChange} variables={variables} /> : null}
            </Flex>
        </Flex>
    )
}