import { IconArrowRight16 } from '@create-figma-plugin/ui'
import { h } from 'preact'
import styles from '../../styles.css'

export function CodeSyntaxDiff({ current, prev }: { current: Variable, prev: Variable }) {

    return (current.codeSyntax.ANDROID === prev.codeSyntax.ANDROID && current.codeSyntax.iOS === prev.codeSyntax.iOS && current.codeSyntax.WEB === prev.codeSyntax.WEB) ? null : (
        <div className={styles.variableDetail__section}>
            <h3 className={styles.variableDetail__sectionTitle}>Code Syntax</h3>
            {
                current?.codeSyntax ?
                    Object.entries(current?.codeSyntax).map(([platform, value]) => {
                        const prevSyntax = prev?.codeSyntax[platform as CodeSyntaxPlatform]

                        return <div className={styles.variableDetail__item} key={platform}>
                            <div>{platform}</div>
                            <div style={{ color: prevSyntax ? 'var(--figma-color-text)' : 'var(--figma-color-text-disabled)' }}>{prevSyntax || 'No code syntax'}</div>
                            <div className={styles.variableDetail__itemArrow}>
                                <IconArrowRight16 />
                            </div>
                            <div>{value}</div>
                        </div>
                    }) : null
            }
        </div>
    )
}