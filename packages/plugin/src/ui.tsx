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
import { ImportLocalCommitsHandler, ImportVariablesHandler, RefreshHandler, SetExportModalContentHandler, SetResolvedVariableValueHandler, SetVariableAliasHandler } from './types'
import { VariableItem } from './components/VariableItem'
import { VariableDetail } from './components/VariableDetail'
import { commit, diffVariables, getVariableChanges } from './features'
import { Commits } from './components/Commits'
import styles from './styles.css'
import { useAppStore } from './store'

function Plugin() {
  const { variables, setVariables, collections, setCollections, commits, setCommits, setResolvedVariableValue, setVariableAlias, setExportModalContent, setExportModalOpen } = useAppStore()
  const [tab, setTab] = useState("Changes")
  const [summary, setSummary] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string>('')

  on<ImportVariablesHandler>('IMPORT_VARIABLES', ({ variables, collections }) => {
    setVariables(variables)
    setCollections(collections)
  })

  on<ImportLocalCommitsHandler>('IMPORT_LOCAL_COMMITS', (commits) => {
    setCommits(commits)
  })

  on<SetResolvedVariableValueHandler>("SET_RESOLVED_VARIABLE_VALUE", ({ id, modeId, value, resolvedType }) => {
    setResolvedVariableValue({ id, modeId, value, resolvedType })
  })

  on<SetVariableAliasHandler>("SET_VARIABLE_ALIAS", ({ id, name }) => {
    setVariableAlias({ id, name })
  })

  on<SetExportModalContentHandler>("SET_EXPORT_MODAL_CONTENT", (content) => {
    setExportModalOpen(true)
    setExportModalContent(content)
  })

  const lastCommit = commits[0]

  useEffect(() => {
    // Refresh the variables when the plugin is focused
    addEventListener('focus', () => emit<RefreshHandler>('REFRESH'))
  }, [])

  const { } = getVariableChanges({ prev: lastCommit ? lastCommit.variables : [], current: variables })


  const addedVariables = variables.filter(v => !lastCommit?.variables.find(vc => vc.id === v.id));
  const removedVariables = lastCommit?.variables.filter(v => !variables.find(vc => vc.id === v.id)) || []
  const modifiedVariables = variables.filter(v => lastCommit?.variables.find(vc => vc.id === v.id && Object.keys(diffVariables(v, vc)).length > 0))

  const disabled = addedVariables.length + modifiedVariables.length + removedVariables.length === 0

  const handleClick = useCallback(() => {
    if (!summary) {
      alert('Please provide a summary')
    } else {
      commit({ summary, description, variables, collections, collaborators: [] })
      setOpen(false)
      emit<RefreshHandler>('REFRESH')
    }

  }, [variables, collections, summary, description])

  return (
    <Tabs
      onValueChange={value => setTab(value)}
      options={[
        {
          value: 'Changes',
          children: <div className={styles.container} onClick={() => { emit("RESTORE_COMMIT") }}>
            <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--figma-color-border)' }}>
              <Modal open={open} title='Commit variable changes' onCloseButtonClick={() => setOpen(false)}>
                <div className={styles.commitForm}>
                  <Textbox width={240} value={summary} onChange={e => setSummary(e.currentTarget.value)} variant='border' placeholder='Summary' />
                  <TextboxMultiline onChange={e => setDescription(e.currentTarget.value)} value={description} variant='border' placeholder='Description (optional)' />
                  <Button onClick={handleClick}>Confirm</Button>
                </div>
              </Modal>

              <div style={{ height: '100%', overflow: 'auto', }}>
                {addedVariables.map(v => <VariableItem onClick={(id) => { setSelected(id) }} variable={v} key={v.id} type='Added' />)}
                {modifiedVariables.map(v => <VariableItem onClick={(id) => { setSelected(id) }} variable={v} key={v.id} type='Modified' />)}
              </div>

              <div className={styles.footer}>
                <div>{addedVariables.length + modifiedVariables.length + removedVariables.length} changes</div>
                <Button disabled={disabled} onClick={() => setOpen(true)}>Commit</Button>
              </div>
            </div>

            {selected ? <VariableDetail id={selected} /> : null}
          </div>
        },
        {
          value: 'Commits',
          children: <Commits commits={commits} />
        }
      ]}
      value={tab}
    />
  )
}

export default render(Plugin)
