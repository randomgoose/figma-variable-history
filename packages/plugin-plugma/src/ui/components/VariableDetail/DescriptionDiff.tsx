import styles from '../../styles.module.css';
import * as Diff from 'diff';

export function DescriptionDiff({ current, prev }: { current: Variable; prev?: Variable }) {
  const content = prev
    ? Diff.diffChars(prev.description, current.description).map((part, index) =>
        part.added ? (
          <span key={index} style={{ color: 'var(--figma-color-text-success)' }}>
            {part.value}
          </span>
        ) : part.removed ? (
          <span
            key={index}
            style={{ color: 'var(--figma-color-text-danger)', textDecoration: 'line-through' }}
          >
            {part.value}
          </span>
        ) : (
          <span key={index}>{part.value}</span>
        )
      )
    : current.description;

  // const diff = Diff.diffChars(prev.description, current.description)

  return prev?.description === current.description ? null : (
    <div className={styles.variableDetail__section}>
      <div style={{ flexDirection: 'column' }}>
        <h3 className={styles.variableDetail__sectionTitle} style={{ margin: 0, lineHeight: 1 }}>
          Description
        </h3>

        <div
          style={{
            background: 'var(--figma-color-bg-secondary)',
            borderRadius: 6,
            padding: '8px 12px',
            marginTop: 8,
          }}
        >
          {content || (
            <span style={{ color: 'var(--figma-color-text-tertiary)' }}>No description</span>
          )}
        </div>
      </div>
    </div>
  );
}
