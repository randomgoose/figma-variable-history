import { colors, Button, TextField, Tabs, useGlobalConfig, Avatar, AvatarGroup, IconButton } from 'fidget-ui'
import * as _ from 'lodash'
import { cloneObject } from '@create-figma-plugin/utilities'
import { IChange, ICommit } from './types'
import { Commits } from './components/commits'
import { CommitDetail } from './components/commit-detail'
import { Changes } from './components/changes'
import { ChangeDetail } from './components/change-detail'
import { PREFIX } from './constants'
import deepEqual from 'deep-equal'
import { compareVariables } from './utils/compare-variables'
import { IconPlus, IconPlusSolid } from 'fidget-ui/icons'

const { widget } = figma
const { AutoLayout: Flex, useSyncedState, useEffect, Text } = widget

const styles: {
  container: AutoLayoutProps
} = {
  container: {
    minWidth: 720,
    padding: 24,
    fill: colors.white,
    cornerRadius: 16,
    direction: 'vertical'
  }
}

function Widget() {
  const [variables, setVariables] = useSyncedState<Variable[]>(`${PREFIX}__variables`, [])
  const [currentChange, setCurrentChange] = useSyncedState<IChange | null>(`${PREFIX}__currentChange`, null)
  const [commits, setCommits] = useSyncedState<ICommit[]>(`${PREFIX}__commits`, [])
  const [changes, setChanges] = useSyncedState<{ [key: string]: IChange }>(`${PREFIX}__changes`, {})

  useGlobalConfig({
    Button: {
      style: {
        sizes: {
          sm: {
            container: {
              maxHeight: 24
            },
            text: {
              fontSize: 11
            }
          }
        }
      }
    },
    Field: {
      style: {
        variants: {
          outline: {
            text: {
              fontSize: 11
            }
          }
        }
      }
    },
    Tag: {
      style: {
        sizes: {
          sm: {
            container: {
              maxHeight: 16
            },
            label: {
              fontSize: 11,
            }
          }
        }
      }
    }
  })

  useEffect(() => {
    const localVariables = figma.variables.getLocalVariables().map(v => cloneObject(v))

    if (!deepEqual(localVariables, variables)) {
      setVariables(localVariables)
    }

    const keys = figma.root.getSharedPluginDataKeys(PREFIX)
    const _commits = keys.map(key => JSON.parse(figma.root.getSharedPluginData(PREFIX, key))).sort((a, b) => b.date - a.date).reverse()

    console.log(_commits)

    if (commits.length !== _commits.length) {
      setCommits(_commits)
    }

    const lastCommit = _.last(_commits)

    const _changes = compareVariables(localVariables, lastCommit?.variables || [])

    if (!deepEqual(_changes, changes)) {
      setChanges(_changes)
      currentChange?.id && _changes[currentChange.id] && setCurrentChange(_changes[currentChange.id])
    }

  })

  function getLastCommit(commit: ICommit) {
    const id = commit.id;
    const index = commits.reverse().findIndex(c => c.id === id)

    if (index > 0) {
      return commits[index - 1]
    } else {
      return null
    }
  }

  // async function commit() {
  //   const variables = figma.variables.getLocalVariables().map(v => cloneObject(v))
  //   const collections = figma.variables.getLocalVariableCollections().map(c => cloneObject(c))
  //   const timestamp = new Date().getTime()

  //   const record: ICommit = {
  //     id: `${PREFIX}_${timestamp}`,
  //     summary,
  //     description,
  //     date: timestamp,
  //     variables,
  //     collections,
  //     collaborators: collaborators.length > 0 ? [...collaborators] : figma.currentUser ? [figma.currentUser] : [],
  //   }

  //   figma.root.setPluginData(`${PREFIX}_${timestamp}`, JSON.stringify(record))
  //   setSummary("")
  //   setDescription("")
  //   setCollaborators([])
  //   setCurrentChange(null)
  //   setChanges({})
  // }

  return (
    <Flex name='Container' {...styles.container}>
      {commits.map((commit, index) => <CommitDetail commit={commit} lastCommit={index - 1 >= 0 ? commits[index - 1] : undefined} />)}
      {/* <Flex direction='vertical' height={'fill-parent'}>
        <Flex height={'fill-parent'} fill={colors.white} cornerRadius={8} direction='vertical'>
          <Tabs
            activeKey={route}
            onChange={(key) => {
              setRoute(key as any);
              setCurrentChange(null)
            }}
            height={'fill-parent'}
            isFitted
            style={{
              variants: {
                line: {
                  tabLabel: { fontSize: 11, },
                  tabPanels: { padding: { vertical: 0, horizontal: 0 }, height: 'fill-parent' },
                  activeTabLabel: { fontSize: 11 }
                }
              }
            }}
            width={240}
            id='layout'
            items={[
              {
                key: 'changes',
                tab: numOfChanges > 0 ? `Changes (${numOfChanges})` : 'Changes',
                children:
                  <Flex direction='vertical' height={'fill-parent'} width={'fill-parent'}>
                    <Changes page={page} setPage={setPage} id='main_changes' changes={changes} lastCommit={_.last(commits)} setCurrentChange={setCurrentChange} currentChange={currentChange} />
                    <Flex direction='vertical' width={'fill-parent'} spacing={4} padding={{ horizontal: 8, top: 8, bottom: 4 }}>
                      <TextField placeholder='Summary (required)' size='sm' width={'fill-parent'} id='commit_message' value={summary} onTextEditEnd={e => { setSummary(e.characters) }} />
                      <TextField height={96} placeholder='Description' size='sm' width={'fill-parent'} id='commit_message' value={description} onTextEditEnd={e => { setDescription(e.characters) }} />
                      <Flex width={'fill-parent'} verticalAlignItems='center' spacing={4} height={28}>
                        <Text fontSize={11} width={'fill-parent'} fill={colors.neutral[500]}>Collaborators</Text>
                        <AvatarGroup size={20} stacked max={5}>
                          {...collaborators.map(user => <Avatar key={user.id || ''} src={user.photoUrl || ''} size={16} onClick={() => { figma.notify(user.name) }} />)}
                        </AvatarGroup>

                        <IconButton
                          size='sm'
                          variant='outline'
                          icon={<IconPlusSolid color={colors.neutral[500]} />}
                          maxWidth={20}
                          maxHeight={20}
                          cornerRadius={100}
                          onClick={() => {
                            if (collaborators.find(user => user.id === figma.currentUser?.id)) {

                            } else {
                              figma.currentUser && setCollaborators([...collaborators, figma.currentUser])
                            }
                          }}
                        />
                      </Flex>
                      <Button disabled={summary.length === 0 || Object.keys(changes).length === 0} size='sm' block onClick={async () => { await commit() }}>Commit</Button>
                    </Flex>
                  </Flex>
              },
              {
                key: 'history',
                tab: 'History',
                children: <Commits
                  commits={commits}
                  currentCommit={currentCommit}
                  setCurrentCommit={setCurrentCommit}
                  onClickCommit={() => { setCurrentChange(null) }}
                />
              }
            ]}
          />
        </Flex>
      </Flex>

      {
        route === 'changes'
          ? currentChange ? <ChangeDetail showHeader change={currentChange} variables={variables} /> : <Flex cornerRadius={8} verticalAlignItems='center' horizontalAlignItems={'center'} width={'fill-parent'} height={'fill-parent'} fill={colors.white}><Text fontSize={11} fill={colors.neutral[500]}>Select a change record to view.</Text></Flex>
          : currentCommit ? <CommitDetail commit={currentCommit} lastCommit={getLastCommit(currentCommit)} /> : <Flex cornerRadius={8} verticalAlignItems='center' horizontalAlignItems={'center'} width={'fill-parent'} height={'fill-parent'} fill={colors.white}><Text fontSize={11} fill={colors.neutral[500]}>Select a change record to view.</Text></Flex>
      } */}
    </Flex>
  )
}

widget.register(Widget)
