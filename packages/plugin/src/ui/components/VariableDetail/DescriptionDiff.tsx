import styles from '../../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
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
      </div>
    </div>
  );
}
