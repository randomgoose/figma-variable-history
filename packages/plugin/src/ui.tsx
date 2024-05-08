import {
  Button,
  render,
  TextboxMultiline,
  Tabs,
  Textbox,
  Modal,
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { ICommit, ImportLocalCommitsHandler, ImportVariablesHandler, RefreshHandler } from './types'
import { Router, Route, } from 'preact-router'
import { createHashHistory } from 'history'
import { VariableItem } from './components/VariableItem'
import { VariableDetail } from './components/VariableDetail'
import { commit, diffVariables } from './features'
import { Commits } from './components/Commits'
import styles from './styles.css'
import { useAppStore } from './store'
import { CommitDetail } from './components/CommitDetail'

function Plugin() {
  const { variables, setVariables, collections, setCollections, commits, setCommits } = useAppStore()
  const [tab, setTab] = useState("Changes")
  const [summary, setSummary] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [open, setOpen] = useState(false)
  const history = createHashHistory()

  const lastCommit = commits[0]

  const addedVariables = variables.filter(v => !lastCommit?.variables.find(vc => vc.id === v.id));
  const removedVariables = lastCommit?.variables.filter(v => !variables.find(vc => vc.id === v.id)) || []
  const modifiedVariabels = variables.filter(v => lastCommit?.variables.find(vc => vc.id === v.id && Object.keys(diffVariables(v, vc)).length > 0))


  useEffect(() => {
    // Refresh the variables when the plugin is focused
    addEventListener('focus', () => emit<RefreshHandler>('REFRESH'))
  }, [])

  on<ImportVariablesHandler>('IMPORT_VARIABLES', ({ variables, collections }) => {
    setVariables(variables)
    setCollections(collections)
  })

  on<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', (commits) => {
    setCommits(commits)
  })

  const handleClick = useCallback(() => {
    if (!summary) {
      alert('Please provide a summary')
    } else {
      commit({ summary, description, variables, collections, collaborators: [] })
    }

  }, [variables, collections, summary, description])

  return (
    <Router history={history as any}>
      <div path='/' style={{ height: '100vh' }}>
        <Tabs
          onValueChange={value => setTab(value)}
          options={[
            {
              value: 'Changes',
              children: <div className={styles.container}>
                <Modal open={open} title='Commit variable changes' onCloseButtonClick={() => setOpen(false)}>
                  <div className={styles.commitForm}>
                    <Textbox width={240} value={summary} onChange={e => setSummary(e.currentTarget.value)} variant='border' placeholder='Summary' />
                    <TextboxMultiline onChange={e => setDescription(e.currentTarget.value)} value={description} variant='border' placeholder='Description (optional)' />
                    <Button onClick={handleClick}>Confirm</Button>
                  </div>
                </Modal>

                <div style={{ overflow: 'scroll', height: '100%' }}>
                  {addedVariables.map(v => <VariableItem variable={v} key={v.id} type='Added' />)}
                  {modifiedVariabels.map(v => <VariableItem variable={v} key={v.id} type='Modified' />)}
                </div>

                <div className={styles.footer}>
                  <div>{addedVariables.length + modifiedVariabels.length + removedVariables.length} changes</div>
                  <Button onClick={() => setOpen(true)}>Commit</Button>
                </div>
              </div>
            },
            {
              value: 'Commits',
              children: <Commits commits={commits} />
            }
          ]}
          value={tab}
        />
      </div>
      <Route path='/variable/:id' component={VariableDetail} />
      <Route path='/commit/:id' component={CommitDetail} />
    </Router >
  )
}

export default render(Plugin)
