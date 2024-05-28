import { GenerateChangeLogHandler, ICommit, ImportLocalCommitsHandler, RefreshHandler, RestoreCommitHandler } from "../types";
import { h } from "preact";
import { parseDate } from "../features";
import styles from "../styles.css";
import { Content, Item, Portal, Root, Trigger } from "@radix-ui/react-context-menu";
import { useState } from "preact/hooks";
import { IconButton, IconStarFilled16 } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { getVariableChanges } from "../features";
import { VariableItem } from "./VariableItem";

export function Commits(props: { commits: ICommit[] }) {
    const [selected, setSelected] = useState('')
    const { commits } = props

    const index = commits.findIndex(c => c.id === selected)

    const { added, modified } = getVariableChanges({
        current: commits[index]?.variables,
        prev: commits[index + 1]?.variables
    })

    return <div className={styles.container} style={{ flexDirection: 'row' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.commits__header}>
                <h3 className={styles.title}>Commit History</h3>
                <IconButton onClick={() => emit<GenerateChangeLogHandler>("GENERATE_CHANGE_LOG")}>
                    <IconStarFilled16 />
                </IconButton>
            </div>
            <div style={{ height: '100%', overflow: 'auto' }}>
                <div>
                    {
                        commits.map(commit => {
                            const collaborator = commit.collaborators[0]

                            return <Root key={commit.id}>
                                <Trigger asChild>
                                    <div className={styles.commitItem} onClick={() => setSelected(commit.id)} style={{ background: commit.id === selected ? 'var(--figma-color-bg-selected)' : '' }}>
                                        <div className={styles.commitItem__icon} />

                                        <div className={styles.commitItem__content}>
                                            <div style={{ fontWeight: 500 }}>{commit.summary || 'Untitled commit'}</div>
                                            {
                                                collaborator
                                                    ? <div class={styles.commitItem__user}>
                                                        <img className={styles.commitItem__avatar} src={commit.collaborators[0]?.photoUrl || ''} />
                                                        {commit.collaborators[0]?.name}
                                                    </div>
                                                    : null
                                            }
                                            <div style={{ color: 'var(--figma-color-text-secondary)' }} className={''}>{parseDate(commit.date)}</div>
                                        </div>
                                    </div>
                                </Trigger>

                                <Portal>
                                    <Content className={styles.dropdown__content}>
                                        <Item className={styles.dropdown__item} onClick={() => { emit<RestoreCommitHandler>("RESTORE_COMMIT", commit.id) }}>Restore this commit</Item>
                                        <Item className={styles.dropdown__item}>Export variables</Item>
                                    </Content>
                                </Portal>
                            </Root>
                        })
                    }
                </div>
            </div>
        </div>

        {
            selected
                ? (
                    <div style={{ borderLeft: '1px solid var(--figma-color-border)', width: 400, flexShrink: 0, overflow: 'auto' }}>
                        {added.map(v => <VariableItem variable={v} key={v.id} type='Added' />)}
                        {modified.map(v => <VariableItem variable={v} key={v.id} type='Modified' />)}
                    </div>
                )
                : null}

    </div>
}