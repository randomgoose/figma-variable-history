import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Button, render, TextboxMultiline, Tabs, Textbox, Modal } from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { Fragment } from 'preact';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';
import { RefreshHandler } from './types';
import { VariableItem } from './components/VariableItem';
import { VariableDetail } from './components/VariableDetail';
import { commit, diffVariables, getVariableChanges } from './features';
import { Commits } from './components/Commits';
import { EmptyState } from './components';
import { AppContext, AppContextProvider } from './components/AppContext';

function Plugin() {
  const { variables, collections, commits } = useContext(AppContext);
  const [tab, setTab] = useState('Changes');
  const [summary, setSummary] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>('');

  const lastCommit = commits[0];

  useEffect(() => {
    // Refresh the variables when the plugin is focused
    addEventListener('focus', () => emit<RefreshHandler>('REFRESH'));
  }, []);

  const {} = getVariableChanges({
    prev: lastCommit ? lastCommit.variables : [],
    current: variables,
  });

  const addedVariables =
    variables.filter((v) => !lastCommit?.variables.find((vc) => vc.id === v.id)) || [];
  const removedVariables =
    lastCommit?.variables.filter((v) => !variables.find((vc) => vc.id === v.id)) || [];
  const modifiedVariables =
    variables.filter((v) =>
      lastCommit?.variables.find(
        (vc) => vc.id === v.id && Object.keys(diffVariables(v, vc)).length > 0
      )
    ) || [];
  const numOfChanges = addedVariables.length + modifiedVariables.length + removedVariables.length;

  const disabled = addedVariables.length + modifiedVariables.length + removedVariables.length === 0;

  const handleClick = useCallback(() => {
    if (!summary) {
      alert('Please provide a summary');
    } else {
      commit({ summary, description, variables, collections, collaborators: [] });
      setOpen(false);
      emit<RefreshHandler>('REFRESH');
    }
  }, [variables, collections, summary, description]);

  return (
    <Tabs
      onValueChange={(value) => setTab(value)}
      options={[
        {
          value: 'Changes',
          children: (
            <div
              className={styles.container}
              onClick={() => {
                emit('RESTORE_COMMIT');
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: '1px solid var(--figma-color-border)',
                }}
              >
                <Modal
                  open={open}
                  title="Commit variable changes"
                  onCloseButtonClick={() => setOpen(false)}
                >
                  <div className={styles.commitForm}>
                    <Textbox
                      width={240}
                      value={summary}
                      onChange={(e) => setSummary(e.currentTarget.value)}
                      variant="border"
                      placeholder="Summary"
                    />
                    <TextboxMultiline
                      onChange={(e) => setDescription(e.currentTarget.value)}
                      value={description}
                      variant="border"
                      placeholder="Description (optional)"
                    />
                    <Button onClick={handleClick}>Confirm</Button>
                  </div>
                </Modal>

                <div style={{ height: '100%', overflow: 'auto' }}>
                  {numOfChanges > 0 ? (
                    <Fragment>
                      {addedVariables.map((v) => (
                        <VariableItem
                          onClick={(id) => {
                            setSelected(id);
                          }}
                          variable={v}
                          key={v.id}
                          type="Added"
                        />
                      ))}
                      {modifiedVariables.map((v) => (
                        <VariableItem
                          onClick={(id) => {
                            setSelected(id);
                          }}
                          variable={v}
                          key={v.id}
                          type="Modified"
                        />
                      ))}
                    </Fragment>
                  ) : (
                    <EmptyState />
                  )}
                </div>

                <div className={styles.footer}>
                  <div>
                    {addedVariables.length + modifiedVariables.length + removedVariables.length}{' '}
                    changes
                  </div>
                  <Button disabled={disabled} onClick={() => setOpen(true)}>
                    Commit
                  </Button>
                </div>
              </div>

              {selected ? <VariableDetail id={selected} /> : null}
            </div>
          ),
        },
        {
          value: 'Commits',
          children: <Commits commits={commits} />,
        },
      ]}
      value={tab}
    />
  );
}

export function App() {
  return (
    <AppContextProvider>
      <Plugin />
    </AppContextProvider>
  );
}

export default render(Plugin);
