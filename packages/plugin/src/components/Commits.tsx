import { ICommit } from "../types";
import { h } from "preact";
import { parseDate } from "../utils";
import styles from "../styles.css";

export function Commits(props: { commits: ICommit[] }) {
    const { commits } = props

    return <div className={styles.container}>
        <h3 className={styles.title}>Commit History</h3>
        <div style={{ overflow: 'scroll', height: '100%' }}>
            <div>
                {
                    commits.map(commit => {
                        const collaborator = commit.collaborators[0]

                        return <div key={commit.id} className={styles.commitItem}>
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
                    })
                }
            </div>
        </div>
    </div>
}