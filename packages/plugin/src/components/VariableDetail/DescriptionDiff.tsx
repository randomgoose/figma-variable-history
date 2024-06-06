import styles from '../../styles.css';
import { h } from "preact"
import ReactDiffViewer from 'react-diff-viewer';

export function DescriptionDiff({ current, prev }: { current: Variable; prev: Variable }) {
  return prev.description === current.description ? null : (
    <div className={styles.variableDetail__section}>
      <div className={styles.variableDetail__item} style={{ gridTemplateColumns: '1fr 3fr' }}>
        <h3 className={styles.variableDetail__sectionTitle} style={{ margin: 0, lineHeight: 1 }}>
          Description
        </h3>
        <ReactDiffViewer
          styles={{ contentText: { fontSize: 11 } }}
          oldValue={prev.description}
          newValue={current.description}
          showDiffOnly={true}
          hideLineNumbers
        />
        {/* {
                prev
                    ? <Fragment>
                        <div style={{ color: prev?.description ? 'var(--figma-color-text)' : 'var(--figma-color-text-disabled)' }}>{prev?.description || 'No description'}</div>
                        <div className={styles.variableDetail__itemArrow}>
                            <IconArrowRight16 />
                        </div>
                    </Fragment>
                    : null

            }
            <div >{current?.description}</div> */}
      </div>
    </div>
  );
}
