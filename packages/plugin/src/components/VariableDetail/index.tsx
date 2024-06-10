import styles from '../../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Fragment, h } from 'preact';
import { useContext } from 'preact/hooks';
import { CodeSyntaxDiff } from './CodeSyntaxDiff';
import { DescriptionDiff } from './DescriptionDiff';
import { ValuesByModeDiff } from './ValuesByModeDiff';
import { VariableScopesDiff } from './VariableScopesDiff';
import { AppContext } from '../AppContext';

export function VariableDetail(props: any) {
  const { id } = props;
  const { variables, commits } = useContext(AppContext);

  const current = variables.find((v) => v.id === id);
  const prev: Variable | undefined = commits?.[0]?.variables.find((v) => v.id === id);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className={styles.variableDetail__header}>
        {/* Name */}
        <div>
          {current?.name}
          {/* {prev?.name} */}
        </div>
      </div>

      <div style={{ overflow: 'auto' }}>
        {current && prev ? (
          <Fragment>
            <ValuesByModeDiff current={current} prev={prev} />
            <DescriptionDiff current={current} prev={prev} />
            <CodeSyntaxDiff current={current} prev={prev} />
            <VariableScopesDiff current={current} prev={prev} />
          </Fragment>
        ) : null}
      </div>
    </div>
  );
}
